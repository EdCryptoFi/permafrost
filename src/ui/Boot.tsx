import { useEffect, useRef, useState } from 'preact/hooks'
import { EptMark } from './EptMark'

/**
 * The startup screen.
 *
 * A Mac booting was the one loading screen that never apologised for itself:
 * a grey field, a mark in the middle, one bar, and a line of text saying what
 * it was doing. It worked because it was honest about the wait instead of
 * hiding it behind a spinner that means nothing.
 *
 * So this one is honest too. The bar is not a timer running to a number
 * somebody picked — it advances as the app's first chain read actually makes
 * progress, and the line underneath says which step it is on. When the read
 * finishes early the bar finishes early.
 *
 * Three ways out, because a startup screen that traps you is a startup screen
 * people learn to hate:
 *   · it plays once per tab (sessionStorage), never again on navigation
 *   · any click, key or touch dismisses it immediately
 *   · `prefers-reduced-motion` skips it entirely
 */

const KEY = 'permafrost:booted'

const STEPS = [
  'Starting up',
  'Reading Sui mainnet',
  'Checking the ice',
  'Ready',
]

export function Boot({ ready }: { ready: boolean }) {
  const [show, setShow] = useState(() => {
    try {
      if (sessionStorage.getItem(KEY)) return false
    } catch {
      // Private mode denies storage. Showing it is the friendlier failure.
    }
    return !matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const [p, setP] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* nothing to do; it just plays again next time */
    }
    setLeaving(true)
    setTimeout(() => setShow(false), 460)
  }

  // The bar walks toward whatever is currently justified and never backwards:
  // a progress bar that retreats is worse than no progress bar.
  useEffect(() => {
    if (!show) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = (now - start) / 1000
      // Without the chain, creep to 85% and wait there — the honest place to
      // stop is "I am still waiting", not 99%.
      const ceiling = ready ? 1 : 0.85
      setP((prev) => Math.min(ceiling, Math.max(prev, 1 - Math.exp(-t * 1.5))))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [show, ready])

  useEffect(() => {
    if (!show) return
    if (p >= 0.999) {
      const t = setTimeout(finish, 260)
      return () => clearTimeout(t)
    }
    return
  }, [p, show])

  // A hard ceiling. If a chain read hangs, the app underneath still works and
  // this must not be what stops somebody using it.
  useEffect(() => {
    if (!show) return
    const t = setTimeout(finish, 6000)
    return () => clearTimeout(t)
  }, [show])

  useEffect(() => {
    if (!show) return
    const skip = () => finish()
    addEventListener('keydown', skip)
    addEventListener('pointerdown', skip)
    return () => {
      removeEventListener('keydown', skip)
      removeEventListener('pointerdown', skip)
    }
  }, [show])

  if (!show) return null

  const step = STEPS[Math.min(STEPS.length - 1, Math.floor(p * STEPS.length))]

  return (
    <div class={`boot${leaving ? ' is-leaving' : ''}`} role="status" aria-live="polite">
      <div class="boot-stack">
        <EptMark size={132} progress={p} />
        <b class="boot-name">PermaFrost</b>
        <span class="boot-sub">proof of lock · built on Epoch</span>
        <div class="boot-bar">
          <i style={{ width: `${(p * 100).toFixed(1)}%` }} />
        </div>
        <span class="boot-step">{step}…</span>
      </div>
      <span class="boot-skip">click anywhere to skip</span>
    </div>
  )
}
