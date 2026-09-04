import { useEffect, useState } from 'preact/hooks'
import { fetchChainNowMs } from '@/chain/graphql'
import { listShowcase } from '@/chain/search'
import { resolveMany } from '@/chain/resolve'
import { assetLabel, isHollow, msLeft, type Frost } from '@/chain/frost'
import { Frozen } from '@/ice/Frozen'
import { fmtAsset, fmtCountdown, fmtDate } from '@/format'
import { useTick } from '@/useTick'
import { InternalLink } from '@/ui/InternalLink'

/**
 * The landing state.
 *
 * It used to be a bare search box asking for an object id nobody has
 * memorised, which meant every visitor bounced before seeing the product.
 * Now the page arrives already showing a real lock, read live from mainnet:
 * no click, no typing, no explaining.
 */

/** Only used if the chain sweep fails — the page must never be empty. */
const FALLBACK = [
  '0x35e369ce6067fe1e28e8246389793b67089618455ccd5a93fb1f4c44b4d298d8',
  '0x85af3277a7b710da223341b6ef85303721186524f1d98dd1961382604f4fdb55',
  '0x653cdb6285add1c2d76c7fc093d10b9c02218f53adf6f52b4dec388f9dd90771',
]

export function Landing({ onPick }: { onPick: (id: string) => void }) {
  const [items, setItems] = useState<Frost[] | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      try {
        const now = await fetchChainNowMs(ac.signal)
        const live = await listShowcase(now, ac.signal)
        setItems(live.length > 0 ? live : await resolveMany(FALLBACK, now, null, ac.signal))
      } catch {
        setItems([])
      }
    })()
    return () => ac.abort()
  }, [])

  if (items === null) return <div class="hero-skel" />
  if (items.length === 0) return null

  const [hero, ...rest] = items as [Frost, ...Frost[]]

  return (
    <>
      <InternalLink class="hero-stage" id={hero.id} onPick={onPick} title={`Inspect ${hero.id}`}>
        <Frozen frost={hero} size={190} />
        <HeroCopy frost={hero} />
      </InternalLink>

      {rest.length > 0 && (
        <section class="examples">
          <h2 class="eyebrow">Everything else Epoch is holding</h2>
          <div class="ex-grid">
            {rest.slice(0, 3).map((f) => (
              <InternalLink class="ex" key={f.id} id={f.id} onPick={onPick}>
                <Frozen frost={f} size={64} snow={false} />
                <span class="ex-body">
                  <b class="mono">{assetLabel(f)}</b>
                  <span class="muted small">
                    {f.kind === 'lock' ? 'object lock' : 'vesting vault'}
                  </span>
                  <span class="ex-meta mono">
                    {f.phase === 'melting' ? `unlocks ${fmtDate(f.unlockMs)}` : f.phase}
                  </span>
                </span>
              </InternalLink>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function HeroCopy({ frost }: { frost: Frost }) {
  const elapsed = useTick(1000, frost.phase === 'melting')
  const left = msLeft(frost, elapsed)

  return (
    <span class="hero-copy">
      <span class="eyebrow">Live on Sui mainnet, right now</span>
      <b class="hero-amount">
        {frost.totalLocked !== undefined
          ? fmtAsset(frost.totalLocked, frost.decimals, frost.symbol)
          : frost.lockedAmount !== undefined
            ? fmtAsset(frost.lockedAmount, frost.decimals, frost.symbol)
            : assetLabel(frost)}
      </b>
      {isHollow(frost) && <span class="hollow-tag">holds nothing</span>}
      <span class="hero-line">
        {left > 0 ? (
          <>
            still frozen · unlocks in <span class="mono">{fmtCountdown(left)}</span>
          </>
        ) : frost.phase === 'thawed' ? (
          <>fully claimed · was locked until {fmtDate(frost.unlockMs)}</>
        ) : (
          <>unlocked since {fmtDate(frost.unlockMs)}</>
        )}
      </span>
      <span class="hero-cta">Inspect this lock →</span>
    </span>
  )
}
