import { render } from 'preact'
import '@/theme.css'
import '@/app/app.css'
import { Frozen } from '@/ice/Frozen'
import type { Frost } from '@/chain/frost'

/**
 * Dev-only gallery: every visual state side by side, driven by synthetic data.
 *
 * This exists so the tone can be judged without hunting for a real lock in each
 * phase on mainnet. It is not part of either production build — `vite build`
 * only ever takes index.html or badge.html as its input.
 */
const DAY = 24 * 3600e3
const now = Date.now()

const base: Frost = {
  kind: 'lock',
  id: '0xdemo',
  phase: 'melting',
  progress: 0,
  released: 0,
  lockedAtMs: now - 100 * DAY,
  unlockMs: now + 300 * DAY,
  creator: '0xaaa',
  beneficiary: '0xbbb',
  innerType: '0x2::coin::Coin<0x2::sui::SUI>',
  nowMs: now,
  decimals: 9,
  symbol: 'SUI',
}

const CASES: { title: string; note: string; frost: Frost }[] = [
  {
    title: 'Sealed · just locked',
    note: 'Block full, walrus riding high, snow falling.',
    frost: { ...base, progress: 0.02 },
  },
  {
    title: 'Melting · 40% elapsed',
    note: 'Block shrinking, walrus sinks with the surface, puddle grows.',
    frost: { ...base, progress: 0.4 },
  },
  {
    title: 'Vesting · 65% released',
    note: 'Drips falling — for a vault the melt IS the vested share.',
    frost: {
      ...base,
      kind: 'vault',
      progress: 0.65,
      released: 0.65,
      totalLocked: 1_000_000n,
      claimed: 250_000n,
      claimable: 400_000n,
    },
  },
  {
    title: 'Cracked · cliff reached',
    note: 'Cracks snap in and the walrus slides off. The one loud moment.',
    frost: { ...base, phase: 'cracked', progress: 1, released: 1, unlockMs: now - DAY },
  },
  {
    title: 'Thawed · fully claimed',
    note: 'Puddle only. Reads as over, not as broken.',
    frost: { ...base, phase: 'thawed', progress: 1, released: 1, unlockMs: now - 40 * DAY },
  },
  {
    title: 'Long freeze · 2y+ earns the scarf',
    note: 'Costume is the only thing that varies with term length.',
    frost: { ...base, progress: 0.3, lockedAtMs: now - 200 * DAY, unlockMs: now + 900 * DAY },
  },
  {
    title: 'Short freeze · 30d gets the shades',
    note: 'A month is a holiday, not a winter.',
    frost: { ...base, progress: 0.5, lockedAtMs: now - 15 * DAY, unlockMs: now + 15 * DAY },
  },
  {
    title: 'No mascot',
    note: 'The fallback if Epoch wants the sober version. Same melt system.',
    frost: { ...base, progress: 0.55 },
  },
]

function States() {
  return (
    <div class="wrap">
      <h1 class="hero">Ice states</h1>
      <p class="lede">
        Every phase of the visual, on synthetic data. Toggle your OS "reduce motion"
        setting to check the static fallback.
      </p>
      <div class="cols">
        {CASES.map((c, i) => (
          <section class="panel" key={c.title}>
            <div class="stage" style="margin:0 0 12px">
              <Frozen frost={c.frost} size={150} mascot={i !== CASES.length - 1} />
              <div class="verdict">
                <b>{c.title}</b>
                <p class="muted small">{c.note}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

render(<States />, document.getElementById('app')!)
