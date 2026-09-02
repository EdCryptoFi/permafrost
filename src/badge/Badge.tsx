import { useCallback, useEffect, useState } from 'preact/hooks'
import { resolveFrost } from '@/chain/resolve'
import { msLeft, type Frost } from '@/chain/frost'
import { swr, serialize, deserialize } from '@/chain/cache'
import { Frozen } from '@/ice/Frozen'
import { fmtCountdown, fmtDate, pct } from '@/format'
import { EXPLORER } from '@/chain/constants'
import { useTick, useCrossing } from '@/useTick'
import './badge.css'

export type BadgeOpts = {
  id: string
  variant: 'pill' | 'card'
  mascot: boolean
  locale?: string
}

/** Locks move once a year; a minute of staleness is invisible and saves a request. */
const FRESH_MS = 60_000

export function Badge({ opts }: { opts: BadgeOpts }) {
  const [frost, setFrost] = useState<Frost | null>(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    try {
      const hit = await swr<unknown>(
        `frost:${opts.id}`,
        async () => serialize(await resolveFrost(opts.id)),
        { freshMs: FRESH_MS, onUpdate: (v) => setFrost(deserialize<Frost>(v)) },
      )
      setFrost(deserialize<Frost>(hit.value))
      setFailed(false)
    } catch {
      // Only a cold miss with no cached copy reaches here.
      setFailed(true)
    }
  }, [opts.id])

  useEffect(() => {
    void load()
  }, [load])

  // Tick only while something is actually counting down.
  const counting = frost?.phase === 'melting'
  const elapsed = useTick(1000, counting)
  // Refetch the moment the term elapses, so the badge flips on its own.
  useCrossing(frost ? frost.unlockMs : 0, load)

  // Tell the embedding page how tall we are; without it every integration
  // ends up with a scrollbar inside the iframe.
  useEffect(() => {
    const report = () =>
      parent.postMessage(
        {
          source: 'permafrost',
          type: 'resize',
          height: document.documentElement.scrollHeight,
          width: document.documentElement.scrollWidth,
        },
        '*',
      )
    report()
    const ro = new ResizeObserver(report)
    ro.observe(document.documentElement)
    return () => ro.disconnect()
  }, [frost, failed])

  if (failed) return <Shell state="error">Could not reach Sui</Shell>
  if (!frost) return <Shell state="loading">Checking the chain…</Shell>
  if (frost.phase === 'absent') return <Shell state="absent">No Epoch lock found</Shell>

  const left = msLeft(frost, elapsed)
  // Derive the label from the same clock as the countdown, so the two can
  // never contradict each other mid-page.
  const past = left <= 0
  const label =
    frost.phase === 'thawed' ? 'Unlocked & claimed' : past ? 'Unlocked' : 'Locked on Epoch'
  const detail =
    frost.phase === 'thawed'
      ? `was locked until ${fmtDate(frost.unlockMs, opts.locale)}`
      : past
        ? `since ${fmtDate(frost.unlockMs, opts.locale)}`
        : `until ${fmtDate(frost.unlockMs, opts.locale)}`

  return (
    <a
      class={`pf pf-${opts.variant} is-${frost.phase}`}
      href={EXPLORER(frost.id)}
      target="_blank"
      rel="noopener noreferrer"
      title={`${label} — ${detail}`}
    >
      <Frozen
        frost={frost}
        size={opts.variant === 'card' ? 68 : 34}
        mascot={opts.mascot}
        snow={false}
      />
      <span class="pf-text">
        <span class="pf-label">
          <span aria-hidden="true">{past || frost.phase === 'thawed' ? '🔓' : '🔒'}</span> {label}
        </span>
        <span class="pf-detail mono">{detail}</span>
        {opts.variant === 'card' && !past && (
          <span class="pf-sub mono">
            {fmtCountdown(left)} left · {pct(frost.progress)} elapsed
          </span>
        )}
      </span>
    </a>
  )
}

function Shell({ state, children }: { state: string; children: preact.ComponentChildren }) {
  return (
    <span class={`pf pf-pill is-${state}`}>
      <span class="pf-dot" />
      <span class="pf-text">
        <span class="pf-label">{children}</span>
      </span>
    </span>
  )
}
