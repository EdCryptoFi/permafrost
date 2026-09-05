import { gql, fetchChainNowMs } from './graphql'
import {
  MULTI_VAULT_TYPE,
  OBJECT_LOCK,
  OBJECT_LOCK_TYPE,
  VESTING,
  VESTING_VAULT_TYPE,
} from './constants'
import { typeMatches, type Frost } from './frost'
import { resolveEpochName, normalizeName } from './names'
import { parseAny, resolveMany, withCoinInfoAll } from './resolve'

/**
 * Discovery.
 *
 * The verifier used to demand an object id, which nobody has memorised — you
 * had to go dig through an explorer before this app was of any use. These
 * queries let someone arrive with what they actually know: their own address,
 * or the token they care about.
 */

const PAGE = 50

/** How the input was interpreted, so the UI can explain what it just did. */
export type SearchKind = 'object' | 'creator' | 'coin' | 'name' | 'none'

export type SearchResult = {
  kind: SearchKind
  /** Echo of what we searched for, for the results header. */
  term: string
  frosts: Frost[]
  /** Set when the term resolved through the Epoch registry. */
  resolved?: { name: string; owner: string }
}

const OBJECTS_BY_TYPE = `
  query ByType($type: String!, $first: Int!, $after: String) {
    objects(first: $first, after: $after, filter: { type: $type }) {
      pageInfo { hasNextPage endCursor }
      nodes {
        address
        asMoveObject { contents { json type { repr } } }
      }
    }
  }
`

type ByTypeResp = {
  objects: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
    nodes: {
      address: string
      asMoveObject: { contents: { json: unknown; type: { repr: string } } | null } | null
    }[]
  }
}

/** Every live object of one Epoch type. The dataset is small; we page anyway. */
async function allOfType(type: string, nowMs: number, viewer: string | null, signal?: AbortSignal) {
  const out: Frost[] = []
  let after: string | null = null

  for (let guard = 0; guard < 10; guard++) {
    const d: ByTypeResp = await gql<ByTypeResp>(
      OBJECTS_BY_TYPE,
      { type, first: PAGE, after },
      signal,
      // A type sweep is the heaviest read in the app and the same three run on
      // every landing visit. Half a minute of memo turns a re-search into zero
      // requests without ever showing a lock that has since been claimed.
      { cacheMs: 30_000 },
    )
    for (const n of d.objects.nodes) {
      const c = n.asMoveObject?.contents
      if (!c) continue
      const f = parseAny(n.address, c.type.repr, c.json, nowMs, viewer)
      if (f) out.push(f)
    }
    if (!d.objects.pageInfo.hasNextPage) break
    after = d.objects.pageInfo.endCursor
    if (!after) break
  }
  return out
}

const EVENTS_BY_SENDER = `
  query BySender($type: String!, $sender: SuiAddress!) {
    events(last: 50, filter: { type: $type, sender: $sender }) {
      nodes { contents { json } }
    }
  }
`

type EventsResp = { events: { nodes: { contents: { json: Record<string, string> } }[] } }

async function idsFromEvents(type: string, sender: string, key: string, signal?: AbortSignal) {
  const d = await gql<EventsResp>(EVENTS_BY_SENDER, { type, sender }, signal, {
    cacheMs: 20_000,
  })
  const ids = new Set<string>()
  for (const n of d.events.nodes) {
    const id = n.contents.json[key]
    if (id) ids.add(id)
  }
  return [...ids]
}

/** Everything a given address created — locks and vaults alike. */
export async function findByCreator(
  address: string,
  nowMs: number,
  viewer: string | null,
  signal?: AbortSignal,
): Promise<Frost[]> {
  const [lockIds, vaultIds] = await Promise.all([
    idsFromEvents(
      `${OBJECT_LOCK.TYPE_PKG}::${OBJECT_LOCK.MODULE}::ObjectLocked`,
      address,
      'lock_id',
      signal,
    ).catch(() => []),
    idsFromEvents(
      `${VESTING.TYPE_PKG}::${VESTING.MODULE}::VaultCreated`,
      address,
      'vault_id',
      signal,
    ).catch(() => []),
  ])

  const ids = [...lockIds, ...vaultIds]
  if (ids.length === 0) return []

  return resolveMany(ids, nowMs, viewer, signal)
}

/**
 * Everything frozen of a given coin/asset type.
 *
 * The GraphQL type filter cannot express "ObjectLock of anything containing X",
 * so we pull the Epoch types (a small set) and match the inner type here. If
 * Epoch ever gets thousands of locks this needs a real index.
 */
export async function findByCoinType(
  needle: string,
  nowMs: number,
  viewer: string | null,
  signal?: AbortSignal,
): Promise<Frost[]> {
  const groups = await Promise.all([
    allOfType(OBJECT_LOCK_TYPE, nowMs, viewer, signal).catch(() => []),
    allOfType(VESTING_VAULT_TYPE, nowMs, viewer, signal).catch(() => []),
    allOfType(MULTI_VAULT_TYPE, nowMs, viewer, signal).catch(() => []),
  ])
  const hits = groups.flat().filter((f) => typeMatches(f.innerType, needle))
  return withCoinInfoAll(hits, signal)
}

const isAddressish = (s: string) => /^0x[0-9a-fA-F]{1,64}$/.test(s)

/**
 * One input, three meanings.
 *
 * An object id and a wallet address are the same shape on Sui, so we try the
 * object first and fall back to treating it as a creator. That ordering means
 * pasting a lock id never accidentally runs an expensive creator sweep.
 */
export async function smartSearch(
  raw: string,
  viewer: string | null,
  signal?: AbortSignal,
): Promise<SearchResult> {
  const term = raw.trim()
  if (!term) return { kind: 'none', term, frosts: [] }

  const nowMs = await fetchChainNowMs(signal)

  if (term.includes('::')) {
    return { kind: 'coin', term, frosts: await findByCoinType(term, nowMs, viewer, signal) }
  }

  if (isAddressish(term)) {
    const [direct] = await resolveMany([term], nowMs, viewer, signal)
    if (direct) return { kind: 'object', term, frosts: [direct] }

    const owned = await findByCreator(term, nowMs, viewer, signal)
    if (owned.length > 0) return { kind: 'creator', term, frosts: owned }
    return { kind: 'object', term, frosts: [] }
  }

  // A .epoch name, or a bare word that turns out to be one. This app is built
  // on Epoch Names and hosted under one; not resolving them was the gap that
  // sent someone typing their own site's name into a coin-symbol search.
  if (normalizeName(term)) {
    const rec = await resolveEpochName(term, signal).catch(() => null)
    if (rec) {
      return {
        kind: 'name',
        term,
        resolved: { name: rec.name, owner: rec.owner },
        frosts: await findByCreator(rec.owner, nowMs, viewer, signal),
      }
    }
  }

  // Otherwise a bare word is almost always a coin symbol ("SUI", "EPT").
  if (/^[A-Za-z][A-Za-z0-9_]{1,32}$/.test(term)) {
    return { kind: 'coin', term, frosts: await findByCoinType(term, nowMs, viewer, signal) }
  }

  return { kind: 'none', term, frosts: [] }
}

/**
 * Everything Epoch currently holds, freshest first, still-frozen before thawed.
 *
 * Powers the landing page. Hardcoding example ids would rot the moment those
 * locks get claimed — the front page would show three dead exhibits forever —
 * so we ask the chain what is interesting right now and keep a curated list
 * only as a fallback.
 */
export async function listShowcase(
  nowMs: number,
  signal?: AbortSignal,
): Promise<Frost[]> {
  const groups = await Promise.all([
    allOfType(OBJECT_LOCK_TYPE, nowMs, null, signal).catch(() => []),
    allOfType(VESTING_VAULT_TYPE, nowMs, null, signal).catch(() => []),
    allOfType(MULTI_VAULT_TYPE, nowMs, null, signal).catch(() => []),
  ])

  // Still-frozen first, and among those the ones that actually hold something.
  // Ranking by recency alone put an empty lock at the top of the landing page:
  // the first thing a visitor met was a proof with nothing under it, which is
  // the one exhibit that argues against the product.
  const holdsSomething = (f: Frost) =>
    (f.lockedAmount ?? f.totalLocked ?? 0n) > 0n || f.lockedAmount === undefined

  const rank = (f: Frost) => {
    const phase = f.phase === 'melting' ? 0 : f.phase === 'cracked' ? 2 : 4
    return phase + (holdsSomething(f) ? 0 : 1)
  }

  const all = groups.flat().sort((a, b) => rank(a) - rank(b) || b.lockedAtMs - a.lockedAtMs)

  return withCoinInfoAll(all.slice(0, 6), signal)
}
