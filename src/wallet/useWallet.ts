import { useCallback, useEffect, useState } from 'preact/hooks'
import { getWallets, type Wallet, type WalletAccount } from '@mysten/wallet-standard'
import type { Transaction } from '@mysten/sui/transactions'

const CHAIN = 'sui:mainnet' as const

/**
 * Wallet Standard is a handshake: the page announces itself and extensions
 * answer by registering. `getWallets()` is what performs that announcement,
 * and it is memoised, so calling it here — at module load, before the first
 * render — means an extension injected at document_start finds us ready.
 * Doing it inside an effect ran it after first paint, which is late.
 */
const REGISTRY = getWallets()
const LAST_WALLET_KEY = 'permafrost:wallet'

type SignFeature = {
  signAndExecuteTransaction: (input: {
    transaction: Transaction
    account: WalletAccount
    chain: string
  }) => Promise<{ digest: string }>
}

function supportsSui(w: Wallet) {
  return (
    'sui:signAndExecuteTransaction' in w.features &&
    w.chains.some((c) => c === CHAIN)
  )
}

/**
 * A deliberately small wallet layer.
 *
 * @mysten/dapp-kit would give this for free, but it drags React Query and Radix
 * into a bundle that has to collapse into one HTML file. Wallet Standard is the
 * same protocol underneath, so this costs ~80 lines and saves ~250 KB.
 */
export function useWallet() {
  const [wallets, setWallets] = useState<Wallet[]>(() => REGISTRY.get().filter(supportsSui))
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [account, setAccount] = useState<WalletAccount | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const sync = () => setWallets(REGISTRY.get().filter(supportsSui))
    sync()
    const offReg = REGISTRY.on('register', sync)
    const offUnreg = REGISTRY.on('unregister', sync)
    return () => {
      offReg()
      offUnreg()
    }
  }, [])

  // Reconnect silently to whatever they used last, so a page refresh in the
  // middle of a demo does not drop the session.
  useEffect(() => {
    if (wallet || wallets.length === 0) return
    const last = localStorage.getItem(LAST_WALLET_KEY)
    const found = wallets.find((w) => w.name === last)
    if (!found) return
    const accounts = found.accounts
    if (accounts.length > 0) {
      setWallet(found)
      setAccount(accounts[0]!)
    }
  }, [wallets, wallet])

  // Switching account in the wallet must move the app with it: `availableAction`
  // decides who can sign from this address, and a stale one offers buttons that
  // are guaranteed to fail.
  useEffect(() => {
    if (!wallet) return
    const events = wallet.features['standard:events'] as
      | { on: (e: 'change', cb: (p: { accounts?: readonly WalletAccount[] }) => void) => () => void }
      | undefined
    if (!events) return
    return events.on('change', ({ accounts }) => {
      if (!accounts) return
      const next = accounts[0] ?? null
      setAccount(next)
      if (!next) setWallet(null)
    })
  }, [wallet])

  const connect = useCallback(async (w: Wallet) => {
    setBusy(true)
    try {
      const feature = w.features['standard:connect'] as
        | { connect: () => Promise<{ accounts: readonly WalletAccount[] }> }
        | undefined
      const res = await feature?.connect()
      const acc = res?.accounts[0] ?? w.accounts[0]
      if (!acc) throw new Error('Wallet returned no account.')
      setWallet(w)
      setAccount(acc)
      localStorage.setItem(LAST_WALLET_KEY, w.name)
    } finally {
      setBusy(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    const feature = wallet?.features['standard:disconnect'] as
      | { disconnect: () => Promise<void> }
      | undefined
    await feature?.disconnect?.().catch(() => {})
    setWallet(null)
    setAccount(null)
    localStorage.removeItem(LAST_WALLET_KEY)
  }, [wallet])

  // A wallet parked on testnet signs happily and then fails deep inside the
  // node with an opaque error. Detect it up front and say so in words.
  const wrongNetwork =
    !!account && account.chains.length > 0 && !account.chains.some((c) => c === CHAIN)

  const signAndExecute = useCallback(
    async (transaction: Transaction) => {
      if (!wallet || !account) throw new Error('Connect a wallet first.')
      if (wrongNetwork) {
        throw new Error('This wallet is not on Sui mainnet. Switch networks and try again.')
      }
      const feature = wallet.features['sui:signAndExecuteTransaction'] as SignFeature
      setBusy(true)
      try {
        return await feature.signAndExecuteTransaction({ transaction, account, chain: CHAIN })
      } finally {
        setBusy(false)
      }
    },
    [wallet, account, wrongNetwork],
  )

  return {
    wallets,
    wallet,
    account,
    address: account?.address ?? null,
    busy,
    wrongNetwork,
    connect,
    disconnect,
    signAndExecute,
  }
}
