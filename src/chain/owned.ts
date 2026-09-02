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

const isCoinType = (repr: string) => /::coin::Coin</.test(normalizeType(repr))

export async function listLockable(
  owner: string,
  signal?: AbortSignal,
): Promise<OwnedObject[]> {
  const out: OwnedObject[] = []
  let after: string | null = null

  for (let page = 0; page < 5; page++) {
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
      const balance = coin
        ? BigInt(((c.json as { balance?: string })?.balance ?? '0'))
        : undefined

      out.push({
        id: n.address,
        type: repr,
        label: shortType(repr),
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

  // Biggest coin balances first, then everything else — the LP position or NFT
  // someone wants to lock is usually easier to find by name than by scrolling.
  return out.sort((a, b) => {
    if (a.isCoin !== b.isCoin) return a.isCoin ? -1 : 1
    if (a.isCoin && b.isCoin) return Number((b.balance ?? 0n) - (a.balance ?? 0n))
    return a.label.localeCompare(b.label)
  })
}
