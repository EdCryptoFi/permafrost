import { fetchObject, fetchChainNowMs } from './graphql'
import { isObjectLockType, parseLock } from './locks'
import { isMultiVaultType, isVaultType, parseMultiVault, parseVault } from './vesting'
import { ABSENT, type Frost } from './frost'
import { resolveCoinInfo } from './coins'

/**
 * Turns a raw Move object into a `Frost`, or null if it is none of the three
 * Epoch shapes. Kept separate from the fetching so search results (which
 * already hold the contents) do not re-request every object.
 */
export function parseAny(
  address: string,
  repr: string,
  json: unknown,
  nowMs: number,
  viewer?: string | null,
): Frost | null {
  if (isObjectLockType(repr)) return parseLock(address, repr, json, nowMs)
  if (isVaultType(repr)) return parseVault(address, repr, json, nowMs)
  if (isMultiVaultType(repr)) return parseMultiVault(address, repr, json, nowMs, viewer)
  return null
}

/**
 * Enriches a frost with the ticker and decimals of whatever is frozen.
 * Failures are non-fatal: an NFT lock simply has no coin metadata, and a
 * metadata outage should never stop a lock from being verified.
 */
export async function withCoinInfo(frost: Frost, signal?: AbortSignal): Promise<Frost> {
  if (!frost.innerType) return frost
  const info = await resolveCoinInfo(frost.innerType, signal).catch(() => null)
  return { ...frost, decimals: info?.decimals ?? null, symbol: info?.symbol ?? null }
}

/** Batch lookup sharing one clock read. */
export async function resolveMany(
  addresses: string[],
  nowMs: number,
  viewer?: string | null,
  signal?: AbortSignal,
): Promise<Frost[]> {
  const results = await Promise.all(
    addresses.map(async (a) => {
      const obj = await fetchObject(a, signal).catch(() => null)
      if (!obj) return null
      const parsed = parseAny(obj.address, obj.type, obj.json, nowMs, viewer)
      return parsed ? withCoinInfo(parsed, signal) : null
    }),
  )
  return results.filter((f): f is Frost => f !== null)
}

/**
 * One entry point for a single object id. Anything that is not an Epoch lock
 * or vault comes back as `absent` rather than an error, because "this address
 * is not locked with Epoch" is a legitimate answer to show a visitor.
 */
export async function resolveFrost(
  address: string,
  viewer?: string | null,
  signal?: AbortSignal,
): Promise<Frost> {
  const nowMs = await fetchChainNowMs(signal)
  const obj = await fetchObject(address, signal)
  if (!obj) return { ...ABSENT, id: address, nowMs }
  const parsed = parseAny(obj.address, obj.type, obj.json, nowMs, viewer)
  if (!parsed) return { ...ABSENT, id: address, nowMs }
  return withCoinInfo(parsed, signal)
}

export const isSuiObjectId = (s: string) => /^0x[0-9a-fA-F]{1,64}$/.test(s.trim())
