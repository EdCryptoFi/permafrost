import { gql } from './graphql'
import { NAMES } from './constants'

/**
 * Resolving `.epoch` names.
 *
 * PermaFrost is built on Epoch Names and hosted under one, and until now it
 * could not look one up: typing "permafrost" sent the app hunting for a coin
 * with that ticker. A name is the one identifier a person actually remembers,
 * so it belongs in the search box alongside addresses and object ids.
 *
 * The registry keeps its records in a Move Table, whose entries are dynamic
 * fields keyed by `0x1::string::String`. Reading one means BCS-encoding the
 * name — a ULEB128 length followed by the raw bytes — and asking for that
 * field by name.
 */

export type NameRecord = {
  name: string
  owner: string
  /** The Walrus blob the name currently points at. "pending" until deployed. */
  blobId: string
}

/** BCS for `std::string::String`: ULEB128 length, then the UTF-8 bytes. */
function bcsString(s: string): string {
  const bytes = new TextEncoder().encode(s)
  const len: number[] = []
  let n = bytes.length
  do {
    let byte = n & 0x7f
    n >>>= 7
    if (n > 0) byte |= 0x80
    len.push(byte)
  } while (n > 0)

  const all = new Uint8Array(len.length + bytes.length)
  all.set(len, 0)
  all.set(bytes, len.length)

  let bin = ''
  for (const b of all) bin += String.fromCharCode(b)
  return btoa(bin)
}

/** Accepts "permafrost", "permafrost.epoch" or "PermaFrost". */
export function normalizeName(input: string): string | null {
  const raw = input.trim().toLowerCase().replace(/\.epoch$/, '')
  // Same shape the contract enforces: 3-63 chars, and never all digits.
  if (!/^[a-z0-9-]{3,63}$/.test(raw)) return null
  if (/^[0-9]+$/.test(raw)) return null
  return raw
}

const REGISTRY_QUERY = `
  query Reg($address: SuiAddress!) {
    object(address: $address) { asMoveObject { contents { json } } }
  }
`

const FIELD_QUERY = `
  query Rec($table: SuiAddress!, $bcs: Base64!) {
    address(address: $table) {
      dynamicField(name: { type: "0x1::string::String", bcs: $bcs }) {
        value { ... on MoveValue { json } }
      }
    }
  }
`

/**
 * The records Table lives inside the Registry, so its id has to be read rather
 * than hardcoded — a migration would move it, and a stale constant would make
 * every name silently stop resolving.
 */
let tableIdPromise: Promise<string | null> | null = null

function recordsTableId(signal?: AbortSignal): Promise<string | null> {
  if (!tableIdPromise) {
    tableIdPromise = gql<{ object: { asMoveObject: { contents: { json: unknown } } | null } | null }>(
      REGISTRY_QUERY,
      { address: NAMES.REGISTRY },
      signal,
    )
      .then((d) => {
        const json = d.object?.asMoveObject?.contents.json as
          | { records?: { id?: string } }
          | undefined
        return json?.records?.id ?? null
      })
      .catch(() => {
        tableIdPromise = null // let a later attempt retry
        return null
      })
  }
  return tableIdPromise
}

export async function resolveEpochName(
  input: string,
  signal?: AbortSignal,
): Promise<NameRecord | null> {
  const name = normalizeName(input)
  if (!name) return null

  const table = await recordsTableId(signal)
  if (!table) return null

  const d = await gql<{
    address: { dynamicField: { value: { json: { owner?: string; blob_id?: string } } | null } | null } | null
  }>(FIELD_QUERY, { table, bcs: bcsString(name) }, signal).catch(() => null)

  const json = d?.address?.dynamicField?.value?.json
  if (!json?.owner) return null

  return { name, owner: json.owner, blobId: json.blob_id ?? '' }
}
