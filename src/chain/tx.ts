import { Transaction } from '@mysten/sui/transactions'
import { CLOCK_ID, NAMES, OBJECT_LOCK, VESTING } from './constants'
import type { Frost } from './frost'

/**
 * Transaction builders.
 *
 * Note every target uses `CALL_PKG` (the latest published package) while the
 * type arguments carry the ORIGIN-package type strings we parsed off-chain.
 * That asymmetry is correct on Sui and is the thing most integrations get
 * wrong after a package upgrade.
 */

/** Lock any `key + store` object until `unlockMs` for `beneficiary`. */
export function buildLock(args: {
  itemId: string
  itemType: string
  unlockMs: number
  beneficiary: string
}) {
  const tx = new Transaction()
  tx.moveCall({
    target: `${OBJECT_LOCK.CALL_PKG}::${OBJECT_LOCK.MODULE}::lock`,
    typeArguments: [args.itemType],
    arguments: [
      tx.object(args.itemId),
      tx.pure.u64(BigInt(args.unlockMs)),
      tx.pure.address(args.beneficiary),
      tx.object(CLOCK_ID),
    ],
  })
  return tx
}

/**
 * Push the unlock date further out. The contract only ever accepts a strictly
 * later timestamp and only from the beneficiary, so this can never weaken a
 * lock — which is what makes "extend" safe to expose to anyone.
 */
export function buildExtend(frost: Frost, newUnlockMs: number) {
  const tx = new Transaction()
  tx.moveCall({
    target: `${OBJECT_LOCK.CALL_PKG}::${OBJECT_LOCK.MODULE}::extend`,
    typeArguments: [frost.innerType],
    arguments: [tx.object(frost.id), tx.pure.u64(BigInt(newUnlockMs))],
  })
  return tx
}

export function buildClaimLock(frost: Frost) {
  const tx = new Transaction()
  tx.moveCall({
    target: `${OBJECT_LOCK.CALL_PKG}::${OBJECT_LOCK.MODULE}::claim`,
    typeArguments: [frost.innerType],
    arguments: [tx.object(frost.id), tx.object(CLOCK_ID)],
  })
  return tx
}

export function buildClaimVesting(frost: Frost) {
  const fn = frost.kind === 'multi' ? 'claim_multi' : 'claim'
  const tx = new Transaction()
  tx.moveCall({
    target: `${VESTING.CALL_PKG}::${VESTING.MODULE}::${fn}`,
    typeArguments: [frost.innerType],
    arguments: [tx.object(frost.id), tx.object(CLOCK_ID)],
  })
  return tx
}

/** Which write action, if any, this viewer can take on this frost right now. */
export function availableAction(
  frost: Frost,
  viewer: string | null,
): 'extend' | 'claim' | 'claim-vesting' | null {
  if (!viewer) return null
  if (frost.kind === 'lock') {
    if (frost.beneficiary !== viewer) return null
    if (frost.phase === 'thawed') return null
    return frost.phase === 'cracked' ? 'claim' : 'extend'
  }
  if ((frost.claimable ?? 0n) > 0n) {
    const mine =
      frost.kind === 'multi'
        ? frost.beneficiaries?.some((b) => b.address === viewer)
        : frost.beneficiary === viewer
    if (mine) return 'claim-vesting'
  }
  return null
}

/**
 * Point a `.epoch` name at a new Walrus blob.
 *
 * Argument order is `(registry, cap, blob)` — taken from the Move source, not
 * guessed. Only the NameCap holder can call it, which is why deploying happens
 * in the browser with the owning wallet rather than through an exported key.
 */
export function buildUpdateBlob(nameCapId: string, blobId: string) {
  const tx = new Transaction()
  tx.moveCall({
    target: `${NAMES.CALL_PKG}::${NAMES.MODULE}::update_blob`,
    arguments: [tx.object(NAMES.REGISTRY), tx.object(nameCapId), tx.pure.string(blobId)],
  })
  return tx
}
