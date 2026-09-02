/**
 * On-chain addresses for the Epoch protocol on Sui mainnet.
 *
 * IMPORTANT — origin vs. latest package id.
 * On Sui, an upgraded package keeps its *type* identity at the ORIGIN package id
 * while calls must target the LATEST one. So:
 *   - filter/parse object types with `*_TYPE_PKG`
 *   - build MoveCall targets with `*_CALL_PKG`
 * Mixing these up is the classic "type not found" / "function not found" bug.
 */

/** Verified live. `sui-mainnet.mystenlabs.com/graphql` resets the connection. */
export const GRAPHQL_URL = 'https://graphql.mainnet.sui.io/graphql'

/** Sui system Clock, required by every time-aware entry point. */
export const CLOCK_ID = '0x6'

export const OBJECT_LOCK = {
  /** v1 — defines ObjectLock<T>, never changes. Use for type strings. */
  TYPE_PKG: '0xe0f23402fae139961a3d5ffa99d054a7821b82295eb5988957053f0c9a4dd14d',
  /** v2 — current. UpgradeCap destroyed 29 Aug 2026, so this is final. */
  CALL_PKG: '0x0267556b54173e71b4eefce7c2466770fa52842d0b4242dae49f023022636e89',
  MODULE: 'object_lock',
} as const

export const VESTING = {
  TYPE_PKG: '0x848cb7edf8b5f7650b3188dec459394472c8ccf206a031497bf55fe40c165da2',
  CALL_PKG: '0x848cb7edf8b5f7650b3188dec459394472c8ccf206a031497bf55fe40c165da2',
  MODULE: 'vesting',
} as const

export const NAMES = {
  TYPE_PKG: '0x5dd1fb9f784129f0815c8e54ed917ad698401c0900ebeb1525f37fac98a94dda',
  CALL_PKG: '0xc868bfcfc7aeee0fc3938b632fce15856882092554d1068ce4cdddbd7b23fcd8',
  MODULE: 'walrus_names',
  REGISTRY: '0xa6d9e91daa40dbff259838c9f5bd6448d8f08e9b2a3da02c5d4d3c88ce5666d1',
  TREASURY: '0xb3c54987a9f45aa194ebcbaee979fc8654c2deeb7e5824a61ce2faff41573436',
} as const

/** `ObjectLock<T>` for any T — used as a StructType filter in GraphQL. */
export const OBJECT_LOCK_TYPE = `${OBJECT_LOCK.TYPE_PKG}::${OBJECT_LOCK.MODULE}::ObjectLock`
export const VESTING_VAULT_TYPE = `${VESTING.TYPE_PKG}::${VESTING.MODULE}::VestingVault`
export const MULTI_VAULT_TYPE = `${VESTING.TYPE_PKG}::${VESTING.MODULE}::MultiVestingVault`

/** Basis points denominator used throughout the vesting contract. */
export const BPS_BASE = 10_000n

export const EXPLORER = (id: string) => `https://suiscan.xyz/mainnet/object/${id}`
export const EPOCH_LOCKER_URL = 'https://epochsui.com'
