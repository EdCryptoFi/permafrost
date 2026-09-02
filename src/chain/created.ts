import { createdOfType, fetchChainNowMs, invalidateReads } from './graphql'
import { OBJECT_LOCK_TYPE } from './constants'
import { resolveFrost } from './resolve'
import { findByCreator } from './search'
import type { Frost } from './frost'

/**
 * Turn "you signed something" into "here is the thing you made".
 *
 * A Wallet Standard `signAndExecuteTransaction` resolves with a digest and
 * nothing else, so before this the app could only say "Frozen." and drop the
 * person back on the landing page — with no link to the lock they had just
 * paid gas for and nothing to show anybody. Everything downstream (the detail
 * view, the embed snippet, the share card) needs the object id.
 *
 * Sui finalises a transaction before the indexer can answer questions about
 * it, so this polls rather than reading once: an empty answer at t+0 is
 * normal, not a failure. Two independent routes, because they fail
 * differently:
 *
 *   1. the transaction's own effects — exact, but only once indexed
 *   2. a sweep of what this address has created — slower and broader, but it
 *      works even if effects for that digest never become queryable
 */
const ATTEMPTS = [900, 1400, 2200, 3200, 4500]

export async function awaitCreatedLock(
  digest: string,
  creator: string,
  signal?: AbortSignal,
): Promise<Frost | null> {
  // Anything memoised about this address is now a lie.
  invalidateReads()

  for (const wait of ATTEMPTS) {
    if (signal?.aborted) return null
    await new Promise((r) => setTimeout(r, wait))

    const ids = await createdOfType(digest, OBJECT_LOCK_TYPE, signal).catch(() => [])
    const id = ids[0]
    if (id) {
      const frost = await resolveFrost(id, creator, signal).catch(() => null)
      if (frost && frost.phase !== 'absent') return frost
    }
  }

  // Effects never showed up. Fall back to "the newest lock this address made",
  // which is the same answer by a slower road.
  try {
    const nowMs = await fetchChainNowMs(signal)
    const mine = await findByCreator(creator, nowMs, creator, signal)
    const newest = mine
      .filter((f) => f.kind === 'lock')
      .sort((a, b) => b.lockedAtMs - a.lockedAtMs)[0]
    return newest ?? null
  } catch {
    return null
  }
}
