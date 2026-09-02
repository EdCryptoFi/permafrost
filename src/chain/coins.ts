import { gql, metaCacheMs } from './graphql'
import { innerTypeOf, normalizeType } from './frost'

/**
 * Coin metadata (decimals + ticker).
 *
 * Without this the app renders raw base units: the live EPT vault would read
 * "1230000000000" instead of "1,230,000 EPT", and it would call the asset
 * TEMPLATE (the Move struct name) rather than EPT (the ticker). A proof badge
 * showing a thirteen-digit number with no unit is worse than no badge.
 */

export type CoinInfo = { decimals: number; symbol: string; name?: string }

const QUERY = `
  query Meta($coinType: String!) {
    coinMetadata(coinType: $coinType) { decimals symbol name }
  }
`

// Metadata never changes, so a process-lifetime cache is enough and keeps a
// results list from firing the same lookup once per row.
const cache = new Map<string, CoinInfo | null>()
const inflight = new Map<string, Promise<CoinInfo | null>>()

/**
 * The coin type behind a frozen asset.
 *  - vesting vault: `VestingVault<T>` -> T is already the coin type
 *  - object lock of coins: `ObjectLock<Coin<T>>` -> unwrap to T
 *  - object lock of an NFT/LP: no coin type, metadata lookup returns null
 */
export function coinTypeOf(innerType: string): string[] {
  const candidates = [innerType]
  if (/::coin::Coin</.test(normalizeType(innerType))) {
    candidates.unshift(innerTypeOf(innerType))
  }
  return candidates
}

async function lookupOne(coinType: string, signal?: AbortSignal): Promise<CoinInfo | null> {
  if (cache.has(coinType)) return cache.get(coinType)!
  const existing = inflight.get(coinType)
  if (existing) return existing

  const p = gql<{ coinMetadata: CoinInfo | null }>(QUERY, { coinType }, signal, {
    cacheMs: metaCacheMs,
    retries: 1,
  })
    .then((d) => d.coinMetadata ?? null)
    .catch(() => null)
    .then((v) => {
      cache.set(coinType, v)
      inflight.delete(coinType)
      return v
    })

  inflight.set(coinType, p)
  return p
}

/** Best-effort metadata for whatever is frozen. Null for NFTs and LP objects. */
export async function resolveCoinInfo(
  innerType: string,
  signal?: AbortSignal,
): Promise<CoinInfo | null> {
  for (const candidate of coinTypeOf(innerType)) {
    const info = await lookupOne(candidate, signal)
    if (info) return info
  }
  return null
}
