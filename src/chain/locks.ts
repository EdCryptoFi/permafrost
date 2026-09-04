import { fetchObject } from './graphql'
import { OBJECT_LOCK_TYPE } from './constants'
import { type Frost, innerTypeOf, ratio } from './frost'

type LockJson = {
  id: string
  /**
   * `Option<T>` decodes to the value, or null once claimed. When the locked
   * item is a Coin, the decoded value carries its `balance`.
   */
  item: { balance?: string } | null
  unlock_ms: string
  beneficiary: string
  creator: string
  locked_at_ms: string
}

export function isObjectLockType(repr: string): boolean {
  return repr.startsWith(OBJECT_LOCK_TYPE)
}

export function parseLock(address: string, repr: string, json: unknown, nowMs: number): Frost {
  const j = json as LockJson
  const unlockMs = Number(j.unlock_ms)
  const lockedAtMs = Number(j.locked_at_ms)
  const claimed = j.item === null || j.item === undefined
  const unlocked = nowMs >= unlockMs

  // The balance was in the object all along and went unread, so a lock of an
  // empty coin looked exactly like a lock of a million. Read it.
  const rawBalance = j.item?.balance
  const lockedAmount = rawBalance === undefined ? undefined : BigInt(rawBalance)

  // Object locks are cliff-only: the item is indivisible, so nothing is
  // released until unlock_ms and then all of it is.
  const phase: Frost['phase'] = claimed ? 'thawed' : unlocked ? 'cracked' : 'melting'

  return {
    kind: 'lock',
    id: address,
    phase,
    progress: ratio(lockedAtMs, unlockMs, nowMs),
    released: unlocked ? 1 : 0,
    lockedAtMs,
    unlockMs,
    creator: j.creator,
    beneficiary: j.beneficiary,
    innerType: innerTypeOf(repr),
    nowMs,
    lockedAmount,
  }
}

export async function loadLock(address: string, nowMs: number, signal?: AbortSignal) {
  const obj = await fetchObject(address, signal)
  if (!obj || !isObjectLockType(obj.type)) return null
  return parseLock(obj.address, obj.type, obj.json, nowMs)
}
