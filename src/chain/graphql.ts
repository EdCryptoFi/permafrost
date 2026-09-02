/**
 * Minimal Sui GraphQL client.
 *
 * The public fullnodes shut JSON-RPC down (it now answers -32601 with
 * "migrate to gRPC or GraphQL"), so `sui_getObject` / `suix_queryEvents`
 * are dead ends. Everything here goes through GraphQL.
 *
 * Hand-rolled rather than pulling a client library: this has to fit in a
 * single HTML blob, and the badge build in particular has a tiny budget.
 *
 * Every request goes through `net.post`, which rate limits, de-duplicates,
 * caches, retries and circuit-breaks — see `net.ts` for why a page with no
 * backend has to do all of that itself.
 */
import { GRAPHQL_URL } from './constants'
import { post, type PostOpts } from './net'

export { ChainError, AbortError, networkDegraded, invalidateReads } from './net'

/** Object contents move only when someone signs; a minute of memo is free. */
const OBJECT_TTL = 60_000
/** Coin metadata is immutable in practice. */
const META_TTL = 30 * 60_000
/** The clock is the one read that must not be served stale for long. */
const CLOCK_TTL = 10_000

export async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  signal?: AbortSignal,
  opts: Omit<PostOpts, 'signal'> = {},
): Promise<T> {
  return post<T>(GRAPHQL_URL, query, variables, { ...opts, signal })
}

/**
 * Reads Move contents as JSON, plus the concrete type string.
 * `json` gives us the struct fields already decoded, which is exactly what
 * the verifier needs and saves shipping a BCS schema for every generic.
 */
export const OBJECT_QUERY = `
  query Obj($address: SuiAddress!) {
    object(address: $address) {
      address
      version
      asMoveObject {
        contents {
          json
          type { repr }
        }
      }
    }
  }
`

export type MoveObject = {
  address: string
  version: number
  type: string
  json: Record<string, unknown>
}

type RawObject = {
  object: {
    address: string
    version: number
    asMoveObject: { contents: { json: unknown; type: { repr: string } } | null } | null
  } | null
}

export async function fetchObject(
  address: string,
  signal?: AbortSignal,
): Promise<MoveObject | null> {
  const data = await gql<RawObject>(OBJECT_QUERY, { address }, signal, { cacheMs: OBJECT_TTL })
  const contents = data.object?.asMoveObject?.contents
  if (!contents) return null
  return {
    address: data.object!.address,
    version: data.object!.version,
    type: contents.type.repr,
    json: contents.json as Record<string, unknown>,
  }
}

/**
 * Many objects, one request.
 *
 * The old code fetched a results page by firing one `object(address:)` query
 * per row. A project with twelve locks meant twelve round trips before the
 * list could paint, and twelve chances to be rate limited. `multiGetObjects`
 * takes the whole key set at once, so a search costs a request, not a burst.
 */
export const OBJECTS_QUERY = `
  query Objs($keys: [ObjectKey!]!) {
    multiGetObjects(keys: $keys) {
      address
      version
      asMoveObject {
        contents {
          json
          type { repr }
        }
      }
    }
  }
`

type RawObjects = {
  multiGetObjects: ({
    address: string
    version: number
    asMoveObject: { contents: { json: unknown; type: { repr: string } } | null } | null
  } | null)[]
}

/** The endpoint caps the key list; 25 keeps us well inside it. */
const BATCH = 25

export async function fetchObjects(
  addresses: string[],
  signal?: AbortSignal,
): Promise<MoveObject[]> {
  const out: MoveObject[] = []
  for (let i = 0; i < addresses.length; i += BATCH) {
    const keys = addresses.slice(i, i + BATCH).map((address) => ({ address }))
    const d = await gql<RawObjects>(OBJECTS_QUERY, { keys }, signal, { cacheMs: OBJECT_TTL })
    for (const n of d.multiGetObjects ?? []) {
      const c = n?.asMoveObject?.contents
      if (!n || !c) continue
      out.push({
        address: n.address,
        version: n.version,
        type: c.type.repr,
        json: c.json as Record<string, unknown>,
      })
    }
  }
  return out
}

/** The chain's own clock, so countdowns never trust the viewer's system time. */
export const CHECKPOINT_QUERY = `
  query Now { checkpoint { timestamp } }
`

export async function fetchChainNowMs(signal?: AbortSignal): Promise<number> {
  try {
    const d = await gql<{ checkpoint: { timestamp: string } | null }>(
      CHECKPOINT_QUERY,
      {},
      signal,
      { cacheMs: CLOCK_TTL, retries: 1 },
    )
    const ts = d.checkpoint?.timestamp
    if (ts) return new Date(ts).getTime()
  } catch {
    /* fall through to local clock */
  }
  return Date.now()
}

export const metaCacheMs = META_TTL

/**
 * The object a freeze just created.
 *
 * A wallet returns a digest, not an object id, so without this the app could
 * tell someone "signed" and nothing else — no link, no card, no proof of the
 * proof they just made. Reading the effects gives the exact `ObjectLock` id
 * that transaction produced, which is what the share card is built from.
 *
 * The transaction is final on Sui before the indexer has it, so callers poll:
 * `null` here means "not indexed yet", not "did not happen".
 */
export const EFFECTS_QUERY = `
  query Fx($digest: String!) {
    transactionEffects(digest: $digest) {
      status
      objectChanges(first: 30) {
        nodes {
          address
          idCreated
          outputState { asMoveObject { contents { type { repr } } } }
        }
      }
    }
  }
`

type EffectsResp = {
  transactionEffects: {
    status: string
    objectChanges: {
      nodes: {
        address: string
        idCreated: boolean | null
        outputState: { asMoveObject: { contents: { type: { repr: string } } | null } | null } | null
      }[]
    }
  } | null
}

/** Ids created by `digest` whose type starts with `typePrefix`. */
export async function createdOfType(
  digest: string,
  typePrefix: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const d = await gql<EffectsResp>(EFFECTS_QUERY, { digest }, signal, { retries: 0 })
  const fx = d.transactionEffects
  if (!fx || fx.status !== 'SUCCESS') return []
  return fx.objectChanges.nodes
    .filter((n) => n.idCreated)
    .filter((n) => n.outputState?.asMoveObject?.contents?.type.repr.startsWith(typePrefix))
    .map((n) => n.address)
}
