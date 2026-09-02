/**
 * Minimal Sui GraphQL client.
 *
 * The public fullnodes shut JSON-RPC down (it now answers -32601 with
 * "migrate to gRPC or GraphQL"), so `sui_getObject` / `suix_queryEvents`
 * are dead ends. Everything here goes through GraphQL.
 *
 * Hand-rolled rather than pulling a client library: this has to fit in a
 * single HTML blob, and the badge build in particular has a tiny budget.
 */
import { GRAPHQL_URL } from './constants'

export class ChainError extends Error {
  constructor(message: string, readonly detail?: unknown) {
    super(message)
    this.name = 'ChainError'
  }
}

type GqlResponse<T> = { data?: T; errors?: { message: string }[] }

export async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  signal?: AbortSignal,
): Promise<T> {
  let res: Response
  try {
    res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal,
    })
  } catch (cause) {
    throw new ChainError('Could not reach the Sui network.', cause)
  }

  if (!res.ok) throw new ChainError(`Sui GraphQL returned HTTP ${res.status}.`)

  const body = (await res.json()) as GqlResponse<T>
  if (body.errors?.length) {
    throw new ChainError(body.errors.map((e) => e.message).join('; '), body.errors)
  }
  if (!body.data) throw new ChainError('Sui GraphQL returned an empty response.')
  return body.data
}

/**
 * Reads one object's Move contents as JSON, plus its concrete type string.
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

export type RawObject = {
  object: {
    address: string
    version: number
    asMoveObject: {
      contents: { json: unknown; type: { repr: string } } | null
    } | null
  } | null
}

export async function fetchObject(address: string, signal?: AbortSignal) {
  const data = await gql<RawObject>(OBJECT_QUERY, { address }, signal)
  const contents = data.object?.asMoveObject?.contents
  if (!contents) return null
  return {
    address: data.object!.address,
    version: data.object!.version,
    type: contents.type.repr,
    json: contents.json as Record<string, unknown>,
  }
}

/** The chain's own clock, so countdowns never trust the viewer's system time. */
export const CHECKPOINT_QUERY = `
  query Now { checkpoint { timestamp } }
`

export async function fetchChainNowMs(signal?: AbortSignal): Promise<number> {
  try {
    const d = await gql<{ checkpoint: { timestamp: string } | null }>(
      CHECKPOINT_QUERY, {}, signal,
    )
    const ts = d.checkpoint?.timestamp
    if (ts) return new Date(ts).getTime()
  } catch {
    /* fall through to local clock */
  }
  return Date.now()
}
