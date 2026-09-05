import { useState } from 'preact/hooks'
import type { useWallet } from '@/wallet/useWallet'

/**
 * Connect, wherever connecting is what the screen needs.
 *
 * The deploy and freeze panels both told people to connect a wallet while
 * offering nothing to click — the only affordance sat in the far corner of
 * the header. An instruction with no control next to it is a dead end, so
 * the control now goes wherever the instruction does.
 */
export function ConnectButton({
  wallet,
  class: cls = 'btn',
}: {
  wallet: ReturnType<typeof useWallet>
  class?: string
}) {
  const [open, setOpen] = useState(false)

  if (wallet.address) return null

  if (wallet.wallets.length === 0) {
    return (
      <p class="muted small">
        No Sui wallet detected in this browser. Install one — Sui Wallet, Suiet, Slush — then
        reload this page.
      </p>
    )
  }

  // One wallet is the common case, and a menu to choose from one is friction.
  if (wallet.wallets.length === 1) {
    const only = wallet.wallets[0]!
    return (
      <button class={cls} disabled={wallet.busy} onClick={() => void wallet.connect(only)}>
        {wallet.busy ? 'Connecting…' : `Connect ${only.name}`}
      </button>
    )
  }

  return (
    <div class="dropdown">
      <button class={cls} onClick={() => setOpen(!open)} disabled={wallet.busy}>
        {wallet.busy ? 'Connecting…' : 'Connect wallet'}
      </button>
      {open && (
        <ul class="menu">
          {wallet.wallets.map((w) => (
            <li key={w.name}>
              <button
                onClick={() => {
                  setOpen(false)
                  void wallet.connect(w)
                }}
              >
                {w.icon && <img src={w.icon} alt="" width="16" height="16" />}
                {w.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
