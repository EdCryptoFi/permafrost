import { useEffect, useState } from 'preact/hooks'
import { fetchGateway, gatewayOpen, gatewayClosedReason, type Gateway } from '@/chain/gateway'
import { EPT_GATEWAY, VESTING } from '@/chain/constants'
import { fmtAmount, fmtAsset } from '@/format'
import { CopyAddr } from '@/ui/CopyAddr'

/**
 * The EPT burn page.
 *
 * Epoch's gateway contract carries two lifetime counters and a comment saying
 * what they are for — "for the public utility page". Nothing was reading them.
 *
 * Everything here is a chain read. This page takes no cut of anything and
 * could not: it is a static file, and the burn happens between a wallet and a
 * contract that has never heard of it.
 */
export function Ept() {
  const [gw, setGw] = useState<Gateway | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading')

  useEffect(() => {
    const ac = new AbortController()
    fetchGateway(ac.signal)
      .then((g) => {
        if (ac.signal.aborted) return
        setGw(g)
        setState(g ? 'ready' : 'failed')
      })
      .catch(() => {
        if (!ac.signal.aborted) setState('failed')
      })
    return () => ac.abort()
  }, [])

  if (state === 'loading') {
    return (
      <section class="panel">
        <h2>Paid in EPT, burned on-chain</h2>
        <p class="muted">Reading the gateway…</p>
      </section>
    )
  }

  if (state === 'failed' || !gw) {
    return (
      <section class="panel">
        <h2>Paid in EPT, burned on-chain</h2>
        <p class="muted">
          The gateway could not be read just now. Nothing is wrong with the contract as
          far as this page knows — it simply did not answer.
        </p>
        <CopyAddr value={EPT_GATEWAY.OBJECT} label="the gateway" />
      </section>
    )
  }

  const sym = gw.coin?.symbol ?? 'EPT'
  const dec = gw.coin?.decimals ?? 6
  const open = gatewayOpen(gw)
  const closed = gatewayClosedReason(gw)

  return (
    <section class="panel">
      <h2>Paid in EPT, burned on-chain</h2>
      <p class="muted">
        A vesting vault on Epoch costs {fmtAmount(gw.suiFee, 9)} SUI, paid to the
        protocol treasury. There is a second way: hand the gateway{' '}
        {fmtAsset(gw.eptFee, dec, sym)} instead, and the contract sends it to{' '}
        <code>0x0</code> inside the same transaction. Burned by the code, not by a
        promise to burn it later.
      </p>

      <div class="burn">
        <div class="burn-big">
          <b class="mono">{fmtAsset(gw.eptBurned, dec, sym)}</b>
          <span class="muted small">burned through this gateway, lifetime</span>
        </div>
        <div class="burn-stats">
          <Stat label="vaults paid in EPT" value={String(gw.vaultsCreated)} />
          <Stat label="current fee" value={fmtAsset(gw.eptFee, dec, sym)} />
          <Stat label="the same vault in SUI" value={`${fmtAmount(gw.suiFee, 9)} SUI`} />
        </div>
      </div>

      <h3>Can it be used right now?</h3>
      {open ? (
        <p class="gate-status">
          <span class="ok-tag">open</span> The gateway pays the SUI fee out of a float
          it holds, and that float covers{' '}
          <b>
            {gw.vaultsAffordable} more {gw.vaultsAffordable === 1 ? 'vault' : 'vaults'}
          </b>
          .
        </p>
      ) : (
        <p class="gate-status">
          <span class="hollow-tag">closed</span> {closed}
        </p>
      )}
      <p class="muted small">
        This is worth stating because it is invisible from anywhere else. When the float
        runs out the EPT path stops working, and the only sign is a Move abort code in a
        failed transaction. Topping it up is permissionless — <code>fund</code> takes
        SUI from anyone — and the fees paid through the gateway land back in the vesting
        treasury, so the arrangement recycles rather than being spent down.
      </p>

      <h3>What the gateway cannot do</h3>
      <p class="muted">
        It never holds anyone's tokens. It calls Epoch's existing{' '}
        <code>create_vault</code>, so a vault made this way is byte-identical to one
        paid for in SUI — same <code>creator</code>, same events, nothing downstream can
        tell them apart. The only asset it keeps is the SUI float, and the only address
        that can withdraw that is the admin's.
      </p>

      <h3>Read it yourself</h3>
      <p class="muted small">
        Every number above is one of these two objects. Nothing here is reported by us.
      </p>
      <dl class="facts">
        <div class="fact">
          <dt>Gateway</dt>
          <dd>
            <CopyAddr value={EPT_GATEWAY.OBJECT} label="the gateway" />
          </dd>
        </div>
        <div class="fact">
          <dt>Vesting treasury</dt>
          <dd>
            <CopyAddr value={VESTING.TREASURY} label="the treasury" />
          </dd>
        </div>
      </dl>

      <p class="muted small">
        PermaFrost takes no part of this and could not: it is a static file, and the
        burn happens between a wallet and a contract that has never heard of it.
      </p>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div class="stat">
      <b class="mono">{value}</b>
      <span class="muted small">{label}</span>
    </div>
  )
}
