import { fetchObject } from './graphql'
import { BPS_BASE, MULTI_VAULT_TYPE, VESTING_VAULT_TYPE } from './constants'
import { type Frost, innerTypeOf, ratio } from './frost'

/**
 * Direct port of `vesting::compute_vested_total`.
 *
 * Kept line-for-line faithful to the Move source (including the integer
 * truncation order) so the number shown here is the number the contract
 * will hand over. Any drift and the badge becomes a liar, which defeats
 * the entire point of the product.
 */
export function computeVestedTotal(
  totalLocked: bigint,
  cliffTsMs: bigint,
  cliffBps: bigint,
  linearStartMs: bigint,
  linearEndMs: bigint,
  nowMs: bigint,
): bigint {
  let vested = 0n

  const cliffAmount = (totalLocked * cliffBps) / BPS_BASE

  if (cliffAmount > 0n && cliffTsMs > 0n && nowMs >= cliffTsMs) {
    vested += cliffAmount
  }

  const linearAmount = totalLocked - cliffAmount
  if (linearAmount > 0n) {
    const start = linearStartMs
    const end = linearEndMs

    if (start === end) {
      if (nowMs >= start) vested += linearAmount
    } else if (nowMs >= end) {
      vested += linearAmount
    } else if (nowMs > start) {
      const elapsed = nowMs - start
      const duration = end - start
      vested += (linearAmount * elapsed) / duration
    }
  }

  return vested > totalLocked ? totalLocked : vested
}

type VaultJson = {
  creator: string
  beneficiary: string
  total_locked: string
  claimed: string
  cliff_ts_ms: string
  cliff_bps: string
  linear_start_ms: string
  linear_end_ms: string
  created_at_ms: string
}

type MultiVaultJson = Omit<VaultJson, 'beneficiary' | 'claimed'> & {
  shares: { contents: { key: string; value: string }[] }
  claimed: { contents: { key: string; value: string }[] }
}

export function isVaultType(repr: string) {
  return repr.startsWith(VESTING_VAULT_TYPE)
}
export function isMultiVaultType(repr: string) {
  return repr.startsWith(MULTI_VAULT_TYPE)
}

/** The moment nothing more will ever vest — what the countdown targets. */
function fullyVestedAt(cliffTsMs: number, linearEndMs: number) {
  return Math.max(cliffTsMs, linearEndMs)
}

function phaseOf(released: number, remaining: bigint): Frost['phase'] {
  if (remaining === 0n) return 'thawed'
  if (released >= 1) return 'cracked'
  return 'melting'
}

export function parseVault(address: string, repr: string, json: unknown, nowMs: number): Frost {
  const j = json as VaultJson
  const totalLocked = BigInt(j.total_locked)
  const claimed = BigInt(j.claimed)
  const cliffTsMs = Number(j.cliff_ts_ms)
  const linearEndMs = Number(j.linear_end_ms)
  const linearStartMs = Number(j.linear_start_ms)
  const createdAtMs = Number(j.created_at_ms)

  const vested = computeVestedTotal(
    totalLocked,
    BigInt(j.cliff_ts_ms),
    BigInt(j.cliff_bps),
    BigInt(j.linear_start_ms),
    BigInt(j.linear_end_ms),
    BigInt(nowMs),
  )
  const claimable = vested > claimed ? vested - claimed : 0n
  const unlockMs = fullyVestedAt(cliffTsMs, linearEndMs)
  const released = totalLocked === 0n ? 1 : Number((vested * 10000n) / totalLocked) / 10000

  return {
    kind: 'vault',
    id: address,
    phase: phaseOf(released, totalLocked - claimed),
    progress: ratio(createdAtMs, unlockMs, nowMs),
    released,
    lockedAtMs: createdAtMs,
    unlockMs,
    creator: j.creator,
    beneficiary: j.beneficiary,
    innerType: innerTypeOf(repr),
    totalLocked,
    claimed,
    claimable,
    cliffBps: Number(j.cliff_bps),
    cliffTsMs,
    linearStartMs,
    linearEndMs,
    nowMs,
  }
}

export function parseMultiVault(
  address: string,
  repr: string,
  json: unknown,
  nowMs: number,
  viewer?: string | null,
): Frost {
  const j = json as MultiVaultJson
  const totalLocked = BigInt(j.total_locked)
  const cliffTsMs = Number(j.cliff_ts_ms)
  const linearEndMs = Number(j.linear_end_ms)
  const linearStartMs = Number(j.linear_start_ms)
  const createdAtMs = Number(j.created_at_ms)

  const claimedByAddr = new Map<string, bigint>()
  for (const e of j.claimed?.contents ?? []) claimedByAddr.set(e.key, BigInt(e.value))

  const beneficiaries = (j.shares?.contents ?? []).map((e) => ({
    address: e.key,
    shareBps: Number(e.value),
    claimed: claimedByAddr.get(e.key) ?? 0n,
  }))

  const vested = computeVestedTotal(
    totalLocked,
    BigInt(j.cliff_ts_ms),
    BigInt(j.cliff_bps),
    BigInt(j.linear_start_ms),
    BigInt(j.linear_end_ms),
    BigInt(nowMs),
  )
  const totalClaimed = beneficiaries.reduce((a, b) => a + b.claimed, 0n)
  const unlockMs = fullyVestedAt(cliffTsMs, linearEndMs)
  const released = totalLocked === 0n ? 1 : Number((vested * 10000n) / totalLocked) / 10000

  // Mirrors `claimable_multi`: each share vests proportionally out of the pool.
  let claimable = 0n
  if (viewer) {
    const mine = beneficiaries.find((b) => b.address === viewer)
    if (mine) {
      const myVested = (vested * BigInt(mine.shareBps)) / BPS_BASE
      claimable = myVested > mine.claimed ? myVested - mine.claimed : 0n
    }
  }

  return {
    kind: 'multi',
    id: address,
    phase: phaseOf(released, totalLocked - totalClaimed),
    progress: ratio(createdAtMs, unlockMs, nowMs),
    released,
    lockedAtMs: createdAtMs,
    unlockMs,
    creator: j.creator,
    beneficiary: viewer ?? null,
    innerType: innerTypeOf(repr),
    totalLocked,
    claimed: totalClaimed,
    claimable,
    cliffBps: Number(j.cliff_bps),
    cliffTsMs,
    linearStartMs,
    linearEndMs,
    beneficiaries,
    nowMs,
  }
}

export async function loadVault(
  address: string,
  nowMs: number,
  viewer?: string | null,
  signal?: AbortSignal,
) {
  const obj = await fetchObject(address, signal)
  if (!obj) return null
  if (isVaultType(obj.type)) return parseVault(obj.address, obj.type, obj.json, nowMs)
  if (isMultiVaultType(obj.type)) {
    return parseMultiVault(obj.address, obj.type, obj.json, nowMs, viewer)
  }
  return null
}
