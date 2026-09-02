/**
 * Tiny stale-while-revalidate cache for badge reads.
 *
 * A badge lives on somebody else's homepage: every visitor they get is a
 * GraphQL request from us. Without this, a site with real traffic gets rate
 * limited and starts showing "Could not reach Sui" to its own customers —
 * and then removes the badge. Serving a slightly stale lock (the data moves
 * once a year) is strictly better than serving an error.
 */

const NS = 'permafrost:v1:'

export type Cached<T> = { value: T; storedAt: number; stale: boolean }

function read<T>(key: string): { value: T; storedAt: number } | null {
  try {
    const raw = sessionStorage.getItem(NS + key)
    if (!raw) return null
    return JSON.parse(raw) as { value: T; storedAt: number }
  } catch {
    // Private mode, disabled storage, or corrupt entry — all non-fatal.
    return null
  }
}

function write<T>(key: string, value: T) {
  try {
    sessionStorage.setItem(NS + key, JSON.stringify({ value, storedAt: Date.now() }))
  } catch {
    /* storage full or blocked; the network path still works */
  }
}

/**
 * Returns cached data immediately when fresh. When stale it still returns the
 * old value but revalidates in the background, so the badge paints instantly
 * and corrects itself a moment later.
 */
export async function swr<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts: { freshMs: number; onUpdate?: (v: T) => void },
): Promise<Cached<T>> {
  const hit = read<T>(key)
  const age = hit ? Date.now() - hit.storedAt : Infinity

  if (hit && age < opts.freshMs) {
    return { value: hit.value, storedAt: hit.storedAt, stale: false }
  }

  if (hit) {
    // Serve stale, refresh behind the scenes.
    void fetcher()
      .then((fresh) => {
        write(key, fresh)
        opts.onUpdate?.(fresh)
      })
      .catch(() => {})
    return { value: hit.value, storedAt: hit.storedAt, stale: true }
  }

  const fresh = await fetcher()
  write(key, fresh)
  return { value: fresh, storedAt: Date.now(), stale: false }
}

/** bigint does not survive JSON, so frosts round-trip through strings. */
export const serialize = (v: unknown) =>
  JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === 'bigint' ? `${x}#bigint` : x)))

export const deserialize = <T,>(v: unknown): T =>
  JSON.parse(JSON.stringify(v), (_k, x) =>
    typeof x === 'string' && x.endsWith('#bigint') ? BigInt(x.slice(0, -7)) : x,
  ) as T
