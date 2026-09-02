import { type Frost, assetLabel, msLeft } from '@/chain/frost'
import { EXPLORER } from '@/chain/constants'
import { fmtAsset, fmtCountdown, fmtDate, pct, shortAddr } from '@/format'
import { useTick } from '@/useTick'

export function Details({ frost }: { frost: Frost }) {
  const elapsed = useTick(1000, frost.phase === 'melting')
  const left = msLeft(frost, elapsed)
  const unit = (v: bigint) => fmtAsset(v, frost.decimals, frost.symbol)

  const rows: [string, preact.ComponentChildren][] = [
    [
      'Kind',
      frost.kind === 'lock'
        ? 'Object lock (cliff)'
        : frost.kind === 'multi'
          ? 'Multi-beneficiary vesting'
          : 'Vesting vault',
    ],
    ['Frozen asset', <span class="mono">{assetLabel(frost)}</span>],
    ['Locked at', fmtDate(frost.lockedAtMs)],
    ['Unlocks', fmtDate(frost.unlockMs)],
    ['Time left', left > 0 ? fmtCountdown(left) : '—'],
    ['Term elapsed', pct(frost.progress)],
    ['Creator', <Addr a={frost.creator} />],
  ]

  if (frost.beneficiary) rows.push(['Beneficiary', <Addr a={frost.beneficiary} />])

  if (frost.totalLocked !== undefined) {
    rows.push(['Total locked', <span class="mono">{unit(frost.totalLocked)}</span>])
    rows.push(['Claimed', <span class="mono">{unit(frost.claimed ?? 0n)}</span>])
    rows.push(['Vested', pct(frost.released)])
    if ((frost.claimable ?? 0n) > 0n) {
      rows.push(['Claimable now', <span class="mono hot">{unit(frost.claimable!)}</span>])
    }
  }

  if (frost.cliffBps) {
    rows.push(['Cliff', `${frost.cliffBps / 100}% at ${fmtDate(frost.cliffTsMs ?? 0)}`])
  }

  return (
    <section class="panel">
      <h2>On-chain record</h2>
      <dl class="facts">
        {rows.map(([k, v]) => (
          <div class="fact" key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      {frost.beneficiaries && frost.beneficiaries.length > 0 && (
        <>
          <h3>Beneficiaries</h3>
          <dl class="facts">
            {frost.beneficiaries.map((b) => (
              <div class="fact" key={b.address}>
                <dt>
                  <Addr a={b.address} />
                </dt>
                <dd class="mono">{b.shareBps / 100}%</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      <a class="btn ghost" href={EXPLORER(frost.id)} target="_blank" rel="noopener noreferrer">
        Verify on Suiscan ↗
      </a>
    </section>
  )
}

const Addr = ({ a }: { a: string }) => (
  <a class="mono" href={EXPLORER(a)} target="_blank" rel="noopener noreferrer">
    {shortAddr(a)}
  </a>
)
