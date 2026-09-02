import { useEffect, useMemo, useState } from 'preact/hooks'
import { listLockable, type OwnedObject } from '@/chain/owned'
import { buildLock } from '@/chain/tx'
import type { useWallet } from '@/wallet/useWallet'
import { fmtAsset, fmtDate } from '@/format'

const DAY = 24 * 3600e3
const PRESETS = [
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: '6 months', days: 182 },
  { label: '1 year', days: 365 },
  { label: '2 years', days: 730 },
]

/**
 * Create a lock.
 *
 * This is the half of the loop that was missing: without it a visitor could
 * verify somebody else's lock but never make one, so the product depended
 * entirely on locks created elsewhere — of which the whole network has nine.
 */
export function Create({
  wallet,
  onCreated,
  onCancel,
}: {
  wallet: ReturnType<typeof useWallet>
  onCreated: (digest: string) => void
  onCancel: () => void
}) {
  const [objects, setObjects] = useState<OwnedObject[] | null>(null)
  const [filter, setFilter] = useState('')
  const [picked, setPicked] = useState<OwnedObject | null>(null)
  const [days, setDays] = useState(365)
  const [custom, setCustom] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (!wallet.address) return
    const ac = new AbortController()
    setObjects(null)
    listLockable(wallet.address, ac.signal)
      .then(setObjects)
      .catch(() => setObjects([]))
    return () => ac.abort()
  }, [wallet.address])

  const unlockMs = useMemo(() => {
    if (custom) {
      const t = new Date(custom + 'T12:00:00').getTime()
      return Number.isNaN(t) ? 0 : t
    }
    return Date.now() + days * DAY
  }, [custom, days])

  const shown = (objects ?? []).filter((o) =>
    filter ? (o.label + o.type).toLowerCase().includes(filter.toLowerCase()) : true,
  )

  const target = beneficiary.trim() || wallet.address || ''
  const valid = picked && unlockMs > Date.now() && /^0x[0-9a-fA-F]{1,64}$/.test(target)

  const submit = async () => {
    if (!picked || !valid) return
    setMsg(null)
    try {
      const res = await wallet.signAndExecute(
        buildLock({
          itemId: picked.id,
          itemType: picked.type,
          unlockMs,
          beneficiary: target,
        }),
      )
      setMsg({ kind: 'ok', text: 'Frozen.' })
      onCreated(res.digest)
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Transaction failed.' })
    }
  }

  if (!wallet.address) {
    return (
      <section class="panel accent">
        <h2>Freeze something</h2>
        <p class="muted">Connect the wallet holding what you want to lock.</p>
        <button class="btn ghost" onClick={onCancel}>
          ← Back
        </button>
      </section>
    )
  }

  return (
    <section class="panel accent">
      <h2>Freeze something</h2>
      <p class="muted">
        Locks are shared objects: once signed, nobody — not you, not Epoch — can cancel it or
        pull the date forward. Only the beneficiary can push it further out.
      </p>

      <h3>1 · What to freeze</h3>
      {objects === null ? (
        <p class="muted small">Reading your wallet…</p>
      ) : objects.length === 0 ? (
        <p class="muted small">
          Nothing in this wallet can be locked. The contract needs an object with{' '}
          <code>key + store</code> — coins, LP positions and most NFTs qualify.
        </p>
      ) : (
        <>
          <input
            class="filter mono"
            placeholder="filter by name or type"
            value={filter}
            onInput={(e) => setFilter(e.currentTarget.value)}
          />
          <div class="pick-list">
            {shown.slice(0, 40).map((o) => (
              <button
                class={`pick ${picked?.id === o.id ? 'on' : ''}`}
                key={o.id}
                onClick={() => setPicked(o)}
              >
                <span class="pick-main">
                  <b>
                    {o.isCoin && o.balance !== undefined
                      ? fmtAsset(o.balance, o.decimals, o.symbol ?? o.label)
                      : o.label}
                  </b>
                  <span class="muted small mono addr">{o.id}</span>
                </span>
                <span class="muted small">{o.isCoin ? 'coin' : 'object'}</span>
              </button>
            ))}
            {shown.length === 0 && <p class="muted small">Nothing matches that filter.</p>}
          </div>
        </>
      )}

      <h3>2 · Until when</h3>
      <div class="row">
        <div class="seg">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              class={!custom && days === p.days ? 'on' : ''}
              onClick={() => {
                setCustom('')
                setDays(p.days)
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          type="date"
          class="mono"
          value={custom}
          onInput={(e) => setCustom(e.currentTarget.value)}
        />
      </div>
      <p class="muted small">Unlocks {unlockMs ? fmtDate(unlockMs) : '—'}</p>

      <h3>3 · Who can claim it</h3>
      <input
        class="mono"
        placeholder={wallet.address}
        value={beneficiary}
        onInput={(e) => setBeneficiary(e.currentTarget.value)}
      />
      <p class="muted small">
        Leave blank to lock it for yourself. A wrong address here cannot be undone.
      </p>

      <div class="row">
        <button class="btn" disabled={!valid || wallet.busy} onClick={() => void submit()}>
          {wallet.busy ? 'Signing…' : 'Freeze it'}
        </button>
        <button class="btn ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {msg && <p class={msg.kind === 'ok' ? 'ok' : 'err'}>{msg.text}</p>}
    </section>
  )
}
