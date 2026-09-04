import { type Frost, assetLabel, msLeft } from '@/chain/frost'
import { EXPLORER } from '@/chain/constants'
import { fmtAsset, fmtCountdown, fmtDate, pct } from '@/format'
import { isHollow } from '@/chain/frost'
import { useTick } from '@/useTick'

export function Details({ frost }: { frost: Frost }) {
  const elapsed = useTick(1000, frost.phase === 'melting')
  const left = msLeft(frost, elapsed)
  const unit = (v: bigint) => fmtAsset(v, frost.decimals, frost.symbol)

  const rows: [string, preact.ComponentChildren][] = [
    ['Lock id', <Addr a={frost.id} />],
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
  rows.push(['Frozen item type', <span class="mono addr">{frost.innerType}</span>])

  // An object lock of a coin has an amount, and it is the number that decides
  // whether this proof means anything at all.
  if (frost.lockedAmount !== undefined) {
    rows.push([
      'Amount frozen',
      <span class={frost.lockedAmount === 0n ? 'mono empty' : 'mono'}>
        {unit(frost.lockedAmount)}
      </span>,
    ])
  }

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

      {isHollow(frost) && (
        <p class="hollow">
          This lock is real, but it holds nothing: the coin inside has a balance of
          zero. The date below is true and the object cannot be cancelled — there
          is simply no value under it.
        </p>
      )}
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

/**
 * Addresses render in full, never elided.
 *
 * A truncated address is something a reader has to take on trust, which is
 * the exact opposite of what this page is for. They wrap instead of being
 * cut, and each one links to the explorer so the claim can be checked
 * somewhere that is not us.
 */
const Addr = ({ a }: { a: string }) => (
  <a class="mono addr" href={EXPLORER(a)} target="_blank" rel="noopener noreferrer" title={a}>
    {a}
  </a>
)
