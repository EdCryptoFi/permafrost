import { useEffect, useState } from 'preact/hooks'
import { resolveEpochName } from '@/chain/names'
import { StepHead } from '@/ui/PageHead'
import { AquaTag, AquaBlob } from '@/ui/AquaIcons'
import { gql } from '@/chain/graphql'
import { NAMES, EXPLORER } from '@/chain/constants'
import { buildUpdateBlob } from '@/chain/tx'
import { ConnectButton } from '@/ui/ConnectButton'
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
  /**
   * What the name points at on chain, right now.
   *
   * Without this the console could only offer what its own bundle remembered,
   * and a bundle is a snapshot: sign what it suggests and you may be
   * re-pointing a name at the blob it is already on. That fails as a success —
   * a signature, a digest, and nothing changed. Reading the chain makes the
   * no-op visible before it costs gas.
   */
  const [onChain, setOnChain] = useState<string | null | undefined>(undefined)
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

/**
 * What a Walrus blob id actually looks like: 256 bits, base64url, no padding.
 *
 * The contract accepts any string up to 256 characters, and the form used to
 * accept the same. That is the wrong place to be permissive: a typo'd or
 * half-pasted id is signed, costs gas, and leaves the name pointing at
 * nothing — the site is simply gone until another transaction fixes it, and
 * the failure is silent because the chain did exactly what it was told.
 */
const BLOB_ID = /^[A-Za-z0-9_-]{40,50}$/

  const selected = caps?.find((c) => c.id === capId)
  useEffect(() => {
    setOnChain(undefined)
    if (!selected) return
    const ac = new AbortController()
    resolveEpochName(selected.name, ac.signal)
      .then((r) => !ac.signal.aborted && setOnChain(r?.blobId ?? null))
      .catch(() => !ac.signal.aborted && setOnChain(null))
    return () => ac.abort()
  }, [selected?.name])

  const blob = blobId.trim()
  const blobShaped = BLOB_ID.test(blob)
  const valid = Boolean(capId) && blobShaped

  const submit = async () => {
    setMsg(null)
    try {
      const res = await wallet.signAndExecute(buildUpdateBlob(capId, blob))
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
        <>
          <p class="muted small">Connect the wallet that owns the names.</p>
          <div class="row">
            <ConnectButton wallet={wallet} />
          </div>
        </>
      ) : caps === null ? (
        <p class="muted small">Looking for your names…</p>
      ) : caps.length === 0 ? (
        <p class="muted small">This wallet holds no .epoch NameCap.</p>
      ) : (
        <>
          <StepHead n={1} title="Name" art={AquaTag} />
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

          <StepHead n={2} title="Blob id" art={AquaBlob} />
          {(() => {
            const cap = caps.find((c) => c.id === capId)
            const s = cap ? suggestedBlobFor(cap.name) : undefined
            if (!s) return null
            const matches = blob === s.blobId
            return (
              <>
                <p class={matches ? 'ok' : 'muted small'}>
                  {matches
                    ? `matches the published ${cap!.name} build — ${s.bytes.toLocaleString('en-US')} bytes, ${s.publishedAt}`
                    : `latest published build for ${cap!.name} is ${s.blobId}`}
                </p>
                <p class="muted small">
                  {onChain === undefined
                    ? 'reading what this name points at…'
                    : onChain === null
                      ? 'this name has no blob set yet'
                      : `on chain now: ${onChain}`}
                </p>
                {onChain != null && blob === onChain && (
                  <p class="err small">
                    That is the blob this name already points at. Signing would cost gas
                    and change nothing — which looks exactly like success, so it is worth
                    saying before you do it rather than after.
                  </p>
                )}
              </>
            )
          })()}
          <input
            class="mono"
            placeholder="blob id printed by publish.mjs"
            value={blobId}
            onInput={(e) => setBlobId(e.currentTarget.value)}
          />
          {blob.length > 0 && !blobShaped && (
            <p class="err small">
              That is not a Walrus blob id. They are 43 characters of letters, digits,
              <code> - </code> and <code>_</code> — check what <code>publish:all</code>
              printed, and that the whole value was pasted.
            </p>
          )}

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
