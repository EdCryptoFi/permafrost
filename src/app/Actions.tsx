import { useState } from 'preact/hooks'
import type { Frost } from '@/chain/frost'
import { availableAction, buildClaimLock, buildClaimVesting, buildExtend } from '@/chain/tx'
import type { useWallet } from '@/wallet/useWallet'
import { fmtDate } from '@/format'

const DAY = 24 * 3600e3

/** Give the indexer a few chances to catch up before we trust what it says. */
async function refreshWithBackoff(onDone: () => void) {
  for (const wait of [1200, 2000, 3000]) {
    await new Promise((r) => setTimeout(r, wait))
    onDone()
  }
}

/**
 * The write path. Kept narrow on purpose: everything offered here either
 * strengthens a lock (extend) or moves already-vested value to the person the
 * contract says it belongs to (claim). There is no action in this app that can
 * weaken somebody's guarantee.
 */
export function Actions({
  frost,
  wallet,
  onDone,
}: {
  frost: Frost
  wallet: ReturnType<typeof useWallet>
  onDone: () => void
}) {
  const [days, setDays] = useState(90)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const action = availableAction(frost, wallet.address)
  if (!action) return <NotYours frost={frost} connected={!!wallet.address} />

  const run = async (build: () => ReturnType<typeof buildExtend>) => {
    setMsg(null)
    try {
      const res = await wallet.signAndExecute(build())
      setMsg({ kind: 'ok', text: `Done — ${res.digest.slice(0, 12)}… refreshing` })
      // The transaction is final on Sui before GraphQL has indexed it. Reading
      // straight away shows the OLD values, which reads as "it failed" to the
      // person who just signed. Retry a few times instead of guessing a delay.
      void refreshWithBackoff(onDone)
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Transaction failed.' })
    }
  }

  const newUnlock = frost.unlockMs + days * DAY

  return (
    <section class="panel accent">
      {action === 'extend' && (
        <>
          <h2>Freeze it for longer</h2>
          <p class="muted">
            The contract only accepts a later date, so this can strengthen your proof
            but never weaken it. New unlock: <b>{fmtDate(newUnlock)}</b>.
          </p>
          <div class="row">
            <div class="seg">
              {[30, 90, 180, 365].map((d) => (
                <button key={d} class={days === d ? 'on' : ''} onClick={() => setDays(d)}>
                  +{d}d
                </button>
              ))}
            </div>
            <button class="btn" disabled={wallet.busy} onClick={() => void run(() => buildExtend(frost, newUnlock))}>
              {wallet.busy ? 'Signing…' : 'Extend lock'}
            </button>
          </div>
        </>
      )}

      {action === 'claim' && (
        <>
          <h2>Ready to withdraw</h2>
          <p class="muted">The term elapsed on {fmtDate(frost.unlockMs)}. The object is yours to take.</p>
          <button class="btn" disabled={wallet.busy} onClick={() => void run(() => buildClaimLock(frost))}>
            {wallet.busy ? 'Signing…' : 'Claim object'}
          </button>
        </>
      )}

      {action === 'claim-vesting' && (
        <>
          <h2>Vested and claimable</h2>
          <p class="muted">This is computed with the contract's own curve, so it matches to the base unit.</p>
          <button class="btn" disabled={wallet.busy} onClick={() => void run(() => buildClaimVesting(frost))}>
            {wallet.busy ? 'Signing…' : 'Claim vested tokens'}
          </button>
        </>
      )}

      {msg && <p class={msg.kind === 'ok' ? 'ok' : 'err'}>{msg.text}</p>}
    </section>
  )
}

function NotYours({ frost, connected }: { frost: Frost; connected: boolean }) {
  if (!connected) {
    return (
      <section class="panel muted small">
        Connect the beneficiary wallet to extend this lock or claim from it.
      </section>
    )
  }
  if (frost.phase === 'thawed') return null
  return (
    <section class="panel muted small">
      This wallet is not the beneficiary of this {frost.kind === 'lock' ? 'lock' : 'vault'},
      so there is nothing for it to sign. Anyone can still verify and embed it.
    </section>
  )
}
