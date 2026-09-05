import { gql } from './graphql'
import { resolveCoinInfo } from './coins'
import { innerTypeOf, normalizeType, shortType } from './frost'

/**
 * The objects a wallet can actually freeze.
 *
 * `object_lock::lock<T>` requires `T: key + store`, and GraphQL reports
 * abilities per type — so we filter to exactly what the contract will accept
 * instead of letting someone pick something that aborts on signing.
 */

export type OwnedObject = {
  id: string
  type: string
  /** Ticker for coins, Move struct name otherwise. */
  label: string
  /** Present for coins only. */
  balance?: bigint
  decimals?: number | null
  symbol?: string | null
  isCoin: boolean
}

const QUERY = `
  query Owned($address: SuiAddress!, $first: Int!, $after: String) {
    address(address: $address) {
      objects(first: $first, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          address
          contents { json type { repr abilities } }
        }
      }
    }
  }
`

type Resp = {
  address: {
    objects: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null }
      nodes: {
        address: string
        contents: { json: unknown; type: { repr: string; abilities: string[] } } | null
      }[]
    }
  } | null
}

// normalizeType lowercases, so a case-sensitive `Coin<` never matched: every
// coin in the wallet came back tagged "object", with no balance and no sort.
const isCoinType = (repr: string) => /::coin::coin</.test(normalizeType(repr))

export async function listLockable(
  owner: string,
  signal?: AbortSignal,
): Promise<OwnedObject[]> {
  const out: OwnedObject[] = []
  let after: string | null = null

  for (let page = 0; page < 24; page++) {
    const d: Resp = await gql<Resp>(QUERY, { address: owner, first: 50, after }, signal)
    const conn = d.address?.objects
    if (!conn) break

    for (const n of conn.nodes) {
      const c = n.contents
      if (!c) continue
      const ab = c.type.abilities ?? []
      // The contract's own bound. Anything else would abort on signing.
      if (!ab.includes('KEY') || !ab.includes('STORE')) continue

      const repr = c.type.repr
      const coin = isCoinType(repr)
      // A NameCap's whole identity is the name it carries. Labelling four of
      // them "NameCap" makes them indistinguishable, and the filter useless
      // for the one thing someone is most likely to come here looking for.
      const named = (c.json as { name?: string })?.name
      const isNameCap = /::walrus_names::namecap$/i.test(normalizeType(repr))
      const balance = coin
        ? BigInt(((c.json as { balance?: string })?.balance ?? '0'))
        : undefined

      out.push({
        id: n.address,
        type: repr,
        label: isNameCap && named ? `${named}.epoch` : shortType(repr),
        balance,
        isCoin: coin,
      })
    }

    if (!conn.pageInfo.hasNextPage) break
    after = conn.pageInfo.endCursor
    if (!after) break
  }

  // Attach tickers so the picker says "1,230,000 EPT", not "TEMPLATE".
  await Promise.all(
    out.map(async (o) => {
      if (!o.isCoin) return
      const info = await resolveCoinInfo(innerTypeOf(o.type), signal).catch(() => null)
      o.decimals = info?.decimals ?? null
      o.symbol = info?.symbol ?? null
      if (info?.symbol) o.label = info.symbol
    }),
  )

  // Non-coins first: an LP position, a NameCap or an NFT is the deliberate
  // thing someone came here to lock, while coins are the long tail. Within
  // coins, biggest balance first. Sorting by bigint through Number() would
  // overflow, so compare the bigints directly.
  return out.sort((a, b) => {
    if (a.isCoin !== b.isCoin) return a.isCoin ? 1 : -1
    if (a.isCoin && b.isCoin) {
      const d = (b.balance ?? 0n) - (a.balance ?? 0n)
      return d > 0n ? 1 : d < 0n ? -1 : 0
    }
    return a.label.localeCompare(b.label)
  })
}
