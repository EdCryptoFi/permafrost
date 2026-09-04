import { useEffect, useState } from 'preact/hooks'
import { gql } from '@/chain/graphql'
import { NAMES, EXPLORER } from '@/chain/constants'
import { buildUpdateBlob } from '@/chain/tx'
import { suggestedBlobFor } from '@/chain/published'
import type { useWallet } from '@/wallet/useWallet'


/**
 * Deploy console.
 *
 * `update_blob` needs the NameCap, which lives in the browser wallet that
 * registered the name. Doing this from the CLI would mean exporting a private
 * key out of that wallet — a worse trade than shipping one small screen.
 */

type NameCap = { id: string; name: string }

const CAPS_QUERY = `
  query Caps($owner: SuiAddress!, $type: String!) {
    address(address: $owner) {
      objects(first: 50, filter: { type: $type }) {
        nodes { address contents { json } }
      }
    }
  }
`

export function Deploy({
  wallet,
  onCancel,
}: {
  wallet: ReturnType<typeof useWallet>
  onCancel: () => void
}) {
  const [caps, setCaps] = useState<NameCap[] | null>(null)
  const [capId, setCapId] = useState('')
  const [blobId, setBlobId] = useState('')
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (!wallet.address) return
    const ac = new AbortController()
    gql<{ address: { objects: { nodes: { address: string; contents: { json: { name?: string } } }[] } } | null }>(
      CAPS_QUERY,
      { owner: wallet.address, type: `${NAMES.TYPE_PKG}::${NAMES.MODULE}::NameCap` },
      ac.signal,
    )
      .then((d) =>
        setCaps(
          (d.address?.objects.nodes ?? []).map((n) => ({
            id: n.address,
            name: n.contents.json?.name ?? '(unnamed)',
          })),
        ),
      )
      .catch(() => setCaps([]))
    return () => ac.abort()
  }, [wallet.address])

  const valid = capId && blobId.trim().length > 0 && blobId.trim().length <= 256

  const submit = async () => {
    setMsg(null)
    try {
      const res = await wallet.signAndExecute(buildUpdateBlob(capId, blobId.trim()))
      setMsg({ kind: 'ok', text: `Pointed — ${res.digest.slice(0, 14)}…` })
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Transaction failed.' })
    }
  }

  return (
    <section class="panel accent">
      <h2>Deploy</h2>
      <p class="muted">
        One command builds both bundles, publishes them to Walrus, reads each one back to confirm it stored byte for byte, and records the ids here. Then pick a name below and sign.
      </p>
      <pre class="code mono">{`npm run publish:all   # builds, publishes, verifies, records the ids`}</pre>

      {!wallet.address ? (
        <p class="muted small">Connect the wallet that owns the names.</p>
      ) : caps === null ? (
        <p class="muted small">Looking for your names…</p>
      ) : caps.length === 0 ? (
        <p class="muted small">This wallet holds no .epoch NameCap.</p>
      ) : (
        <>
          <h3>Name</h3>
          <div class="pick-list">
            {caps.map((c) => (
              <button
                class={`pick ${capId === c.id ? 'on' : ''}`}
                key={c.id}
                onClick={() => {
                  setCapId(c.id)
                  const s = suggestedBlobFor(c.name)
                  if (s) setBlobId(s.blobId)
                }}
              >
                <span class="pick-main">
                  <b class="mono">{c.name}.epoch</b>
                  <span class="muted small mono addr">{c.id}</span>
                </span>
              </button>
            ))}
          </div>

          <h3>Blob id</h3>
          {(() => {
            const cap = caps.find((c) => c.id === capId)
            const s = cap ? suggestedBlobFor(cap.name) : undefined
            if (!s) return null
            const matches = blobId.trim() === s.blobId
            return (
              <p class={matches ? 'ok' : 'muted small'}>
                {matches
                  ? `matches the published ${cap!.name} build — ${s.bytes.toLocaleString('en-US')} bytes, ${s.publishedAt}`
                  : `latest published build for ${cap!.name} is ${s.blobId}`}
              </p>
            )
          })()}
          <input
            class="mono"
            placeholder="blob id printed by publish.mjs"
            value={blobId}
            onInput={(e) => setBlobId(e.currentTarget.value)}
          />

          <div class="row">
            <button class="btn" disabled={!valid || wallet.busy} onClick={() => void submit()}>
              {wallet.busy ? 'Signing…' : 'Point name at blob'}
            </button>
            <button class="btn ghost" onClick={onCancel}>
              Done
            </button>
          </div>
          {msg && (
            <p class={msg.kind === 'ok' ? 'ok' : 'err'}>
              {msg.text}{' '}
              {msg.kind === 'ok' && capId && (
                <a href={EXPLORER(capId)} target="_blank" rel="noopener noreferrer">
                  view ↗
                </a>
              )}
            </p>
          )}
        </>
      )}
    </section>
  )
}
