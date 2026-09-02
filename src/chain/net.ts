/**
 * The transport every chain read goes through.
 *
 * The app is a static file with no backend, so the only thing standing between
 * a visitor and the public Sui GraphQL endpoint is this module. That endpoint
 * is shared infrastructure with a rate limit, and PermaFrost is unusually
 * chatty for a page its size: one search fans out into three type sweeps, a
 * coin-metadata lookup per row, and — for a badge — one request per visitor of
 * somebody else's homepage. Left unmanaged, a single burst gets the viewer's
 * IP throttled and the product's entire claim ("you can check this yourself")
 * fails in front of them.
 *
 * Five behaviours, in the order a request meets them:
 *
 *   1. memo        identical query+variables inside the TTL never leaves the tab
 *   2. dedupe      identical query+variables in flight share one response
 *   3. breaker     after repeated hard failures, fail fast instead of piling on
 *   4. limiter     at most MAX_CONCURRENT in flight, spaced by MIN_GAP_MS
 *   5. retry       429/5xx/network back off with jitter and honour Retry-After
 *
 * None of this is security in the "keeps an attacker out" sense — a static
 * page cannot enforce anything on a caller who opens devtools. It is the other
 * half: being a well-behaved client so the shared endpoint stays available,
 * and degrading into a readable sentence instead of a wall of failures.
 */

/** In flight at once. The endpoint is shared; four is polite and still fast. */
const MAX_CONCURRENT = 4
/** Minimum spacing between request starts, so a burst arrives as a stream. */
const MIN_GAP_MS = 55
/** A request that has not answered by here is not going to. */
const TIMEOUT_MS = 20_000
/** Consecutive hard failures before the breaker opens. */
const BREAKER_THRESHOLD = 5
/** How long the breaker stays open before letting one probe through. */
const BREAKER_COOLDOWN_MS = 12_000
/** Ceiling on the memo table, so a long session cannot grow without bound. */
const MEMO_MAX = 240

export class ChainError extends Error {
  constructor(
    message: string,
    readonly detail?: unknown,
    /** True when trying again later is the right move. */
    readonly retryable = false,
  ) {
    super(message)
    this.name = 'ChainError'
  }
}

export class AbortError extends Error {
  constructor() {
    super('Aborted')
    this.name = 'AbortError'
  }
}

/* ------------------------------------------------------------------ limiter */

type Job = () => void
const queue: Job[] = []
let active = 0
let lastStart = 0

function pump() {
  if (active >= MAX_CONCURRENT || queue.length === 0) return
  const gap = MIN_GAP_MS - (Date.now() - lastStart)
  if (gap > 0) {
    setTimeout(pump, gap)
    return
  }
  const job = queue.shift()
  if (!job) return
  active++
  lastStart = Date.now()
  job()
}

/** Runs `fn` once the limiter has room for it. */
function limit<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push(() => {
      fn()
        .then(resolve, reject)
        .finally(() => {
          active--
          pump()
        })
    })
    pump()
  })
}

/* ------------------------------------------------------------------ breaker */

let consecutiveFailures = 0
let openedAt = 0

const breakerOpen = () =>
  consecutiveFailures >= BREAKER_THRESHOLD && Date.now() - openedAt < BREAKER_COOLDOWN_MS

function recordFailure() {
  consecutiveFailures++
  if (consecutiveFailures === BREAKER_THRESHOLD) openedAt = Date.now()
}
function recordSuccess() {
  consecutiveFailures = 0
  openedAt = 0
}

/** Exposed so the UI can say "the network is having a moment", not "error". */
export const networkDegraded = () => breakerOpen()

/* --------------------------------------------------------------------- memo */

type MemoEntry = { at: number; value: unknown }
const memo = new Map<string, MemoEntry>()
const inflight = new Map<string, Promise<unknown>>()

function memoGet(key: string, ttlMs: number): { hit: true; value: unknown } | { hit: false } {
  const e = memo.get(key)
  if (!e || Date.now() - e.at > ttlMs) return { hit: false }
  // Refresh recency so the eviction below drops genuinely cold entries.
  memo.delete(key)
  memo.set(key, e)
  return { hit: true, value: e.value }
}

function memoSet(key: string, value: unknown) {
  memo.set(key, { at: Date.now(), value })
  while (memo.size > MEMO_MAX) {
    const oldest = memo.keys().next().value
    if (oldest === undefined) break
    memo.delete(oldest)
  }
}

/** Drops every cached read. Called after a signed transaction lands. */
export function invalidateReads() {
  memo.clear()
}

/* -------------------------------------------------------------------- abort */

/**
 * Lets a caller walk away from a shared request without cancelling it for
 * everyone else. The underlying work runs to completion and lands in the memo,
 * so the next caller gets it for free instead of re-requesting.
 */
function abortable<T>(p: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return p
  if (signal.aborted) return Promise.reject(new AbortError())
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(new AbortError())
    signal.addEventListener('abort', onAbort, { once: true })
    p.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort))
  })
}

/* -------------------------------------------------------------------- retry */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Full jitter: every client that got throttled at the same instant must not
 * come back at the same instant, or the second wave throttles them again.
 */
const backoffMs = (attempt: number, retryAfterMs?: number) => {
  const base = Math.min(8_000, 400 * 2 ** attempt)
  return Math.max(retryAfterMs ?? 0, Math.round(base * (0.5 + Math.random() * 0.5)))
}

function retryAfterOf(res: Response): number | undefined {
  const h = res.headers.get('retry-after')
  if (!h) return undefined
  const secs = Number(h)
  if (Number.isFinite(secs)) return Math.min(30_000, secs * 1000)
  const at = Date.parse(h)
  return Number.isFinite(at) ? Math.min(30_000, Math.max(0, at - Date.now())) : undefined
}

/* ------------------------------------------------------------------ request */

export type PostOpts = {
  signal?: AbortSignal
  /** How long an identical request may be served from memory. 0 disables. */
  cacheMs?: number
  /** Attempts after the first. Reads default to 2; use 0 where speed wins. */
  retries?: number
}

type GqlBody<T> = { data?: T; errors?: { message: string }[] }

/**
 * POST a GraphQL document with every guard above applied.
 *
 * `credentials: 'omit'` and a fixed header set are deliberate: this endpoint is
 * public and unauthenticated, and a browser that silently attaches a cookie to
 * a third-party API is how a page ends up sending something it never meant to.
 * Nothing this app reads needs identity, so no identity is offered.
 */
export async function post<T>(
  url: string,
  query: string,
  variables: Record<string, unknown>,
  opts: PostOpts = {},
): Promise<T> {
  const { signal, cacheMs = 0, retries = 2 } = opts
  const key = `${query} ${JSON.stringify(variables)}`

  if (cacheMs > 0) {
    const hit = memoGet(key, cacheMs)
    if (hit.hit) return hit.value as T
  }

  const sharedExisting = inflight.get(key)
  if (sharedExisting) return abortable(sharedExisting as Promise<T>, signal)

  const shared = runGuarded<T>(url, query, variables, retries, cacheMs, key)

  inflight.set(key, shared)
  void shared.catch(() => {}).finally(() => {
    if (inflight.get(key) === shared) inflight.delete(key)
  })

  return abortable(shared, signal)
}

async function runGuarded<T>(
  url: string,
  query: string,
  variables: Record<string, unknown>,
  retries: number,
  cacheMs: number,
  key: string,
): Promise<T> {
  let lastError: ChainError | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (breakerOpen()) {
      throw new ChainError(
        'Sui is not answering right now. Give it a few seconds and try again.',
        undefined,
        true,
      )
    }

    try {
      const value = await limit(() => once<T>(url, query, variables))
      recordSuccess()
      if (cacheMs > 0) memoSet(key, value)
      return value
    } catch (e) {
      const err = e instanceof ChainError ? e : new ChainError('Chain read failed.', e, false)
      lastError = err
      // A schema or validation error is our bug, not the network's — it must
      // not push the breaker towards opening.
      if (err.retryable) recordFailure()
      if (!err.retryable || attempt === retries) throw err
      const ra = (err.detail as { retryAfterMs?: number } | undefined)?.retryAfterMs
      await sleep(backoffMs(attempt, ra))
    }
  }

  throw lastError ?? new ChainError('Chain read failed.')
}

/** One attempt, with its own timeout and its own abort controller. */
async function once<T>(
  url: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  // Our own controller: one caller walking away must not cancel a request
  // other callers are still waiting on.
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: ac.signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      mode: 'cors',
      cache: 'no-store',
    })
  } catch (cause) {
    throw new ChainError('Could not reach the Sui network.', cause, true)
  } finally {
    clearTimeout(timer)
  }

  if (res.status === 429) {
    throw new ChainError(
      'Sui is rate limiting this browser. Backing off and retrying.',
      { retryAfterMs: retryAfterOf(res) },
      true,
    )
  }
  if (res.status >= 500) {
    throw new ChainError(`Sui GraphQL is unavailable (HTTP ${res.status}).`, undefined, true)
  }
  if (!res.ok) throw new ChainError(`Sui GraphQL returned HTTP ${res.status}.`, undefined, false)

  const body = (await res.json()) as GqlBody<T>
  if (body.errors?.length) {
    throw new ChainError(body.errors.map((e) => e.message).join('; '), body.errors, false)
  }
  if (!body.data) throw new ChainError('Sui GraphQL returned an empty response.')
  return body.data
}
