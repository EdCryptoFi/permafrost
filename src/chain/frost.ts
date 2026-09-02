/**
 * The shared vocabulary between chain data and the ice visual.
 *
 * Both products map onto one metaphor:
 *   object-lock  -> a solid block that cracks all at once at the cliff
 *   vesting      -> a block that drips into the glass as it vests
 * so `Frost` is the only thing the renderer ever sees.
 */

export type FrostPhase =
  /** Locked, nothing vested yet, unlock far away. */
  | 'sealed'
  /** Time is running / tokens are vesting. */
  | 'melting'
  /** Unlock reached, still unclaimed — the block has cracked open. */
  | 'cracked'
  /** Fully claimed, nothing left. Just a puddle. */
  | 'thawed'
  /** Nothing found at that address. */
  | 'absent'

export type FrostKind = 'lock' | 'vault' | 'multi'

export type Frost = {
  kind: FrostKind
  id: string
  phase: FrostPhase
  /** 0..1 of the freeze window elapsed. Drives how far the block has melted. */
  progress: number
  /** 0..1 actually released. For object locks this is 0 or 1 (cliff only). */
  released: number
  lockedAtMs: number
  unlockMs: number
  creator: string
  beneficiary: string | null
  /** Concrete Move type of what is frozen. */
  innerType: string
  /** Vesting only. Raw base units. */
  totalLocked?: bigint
  claimed?: bigint
  claimable?: bigint
  /** Vesting only: a cliff releases this share in one step. */
  cliffBps?: number
  cliffTsMs?: number
  linearStartMs?: number
  linearEndMs?: number
  /** Multi-vault only. */
  beneficiaries?: { address: string; shareBps: number; claimed: bigint }[]
  /**
   * The chain timestamp this snapshot was computed against.
   *
   * Every countdown must be derived from this, never from `Date.now()`: the
   * phase comes from chain time, so a viewer with a skewed clock would
   * otherwise see a badge that says "locked" above a timer that says
   * "unlocked". One clock, one story.
   */
  nowMs: number
  /** Filled in after the fact by `withCoinInfo`. Null for NFTs and LP objects. */
  decimals?: number | null
  symbol?: string | null
}

export const ABSENT: Frost = {
  kind: 'lock',
  id: '',
  phase: 'absent',
  progress: 0,
  released: 0,
  lockedAtMs: 0,
  unlockMs: 0,
  creator: '',
  beneficiary: null,
  innerType: '',
  nowMs: 0,
}

/**
 * Milliseconds left, measured from the chain clock this snapshot carries and
 * advanced by however long the page has been open since.
 */
export function msLeft(f: Frost, elapsedMs = 0): number {
  return f.unlockMs - (f.nowMs + elapsedMs)
}

/** Clamp helper — chain timestamps can be sloppy relative to `now`. */
export function ratio(from: number, to: number, now: number): number {
  if (to <= from) return now >= to ? 1 : 0
  const r = (now - from) / (to - from)
  return r < 0 ? 0 : r > 1 ? 1 : r
}

/** Pulls `T` out of `pkg::mod::ObjectLock<T>`. */
export function innerTypeOf(repr: string): string {
  const open = repr.indexOf('<')
  if (open < 0) return repr
  return repr.slice(open + 1, repr.lastIndexOf('>'))
}

/** `0x2::coin::Coin<0xabc::ept::EPT>` -> `EPT`, for compact display. */
export function shortType(repr: string): string {
  const inner = repr.includes('<') ? innerTypeOf(repr) : repr
  const parts = inner.split('::')
  const last = parts[parts.length - 1] ?? inner
  return last.replace(/>+$/, '')
}

/**
 * Sui reports type addresses zero-padded to 32 bytes
 * (`0x0000…0002::sui::SUI`) but everybody types the short form (`0x2::sui::SUI`).
 * Comparing the two raw strings silently never matches, so normalise both ends
 * before any type comparison.
 */
export function normalizeType(repr: string): string {
  return repr
    .toLowerCase()
    .replace(/0x0*([0-9a-f]+)/g, (_m, hex: string) => '0x' + hex.padStart(64, '0'))
}

/** Does this concrete type match what the user typed? */
export function typeMatches(innerType: string, needle: string): boolean {
  const n = needle.trim()
  if (!n) return false
  if (n.includes('::')) return normalizeType(innerType).includes(normalizeType(n))
  // Bare symbol, e.g. "SUI" or "TEMPLATE".
  return shortType(innerType).toLowerCase() === n.toLowerCase()
}

/**
 * What to call the frozen asset.
 *
 * `shortType` returns the Move struct name, which is often not the ticker —
 * the live EPT vault's struct is literally called TEMPLATE. Prefer the
 * CoinMetadata symbol whenever we managed to resolve one.
 */
export function assetLabel(f: Frost): string {
  return f.symbol ?? shortType(f.innerType)
}
