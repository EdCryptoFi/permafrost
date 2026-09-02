# PermaFrost

**Public proof-of-lock for [Epoch](https://epochsui.com) on Sui.**
Frozen liquidity you can actually verify — and a badge you cannot fake.

Built for the Epoch September Build Contest (dApp track).

---

## The problem

When a project locks its LP, the proof it shows the market is a screenshot or an
explorer link. Screenshots are forgeable in 30 seconds. Explorer links go
unread. And a Twitter post saying "liquidity locked" stays up long after the
lock expired.

Epoch's `object-lock` package was written with the answer in the doc comment —
*"Locks are SHARED objects: anyone can look one up on-chain and verify the item,
the unlock date and the beneficiary. Proof-of-lock by construction."*

The contract was there. The thing that lets a non-developer act on it was not.

## What this is

0. **Live at [permafrost-epoch.vercel.app](https://permafrost-epoch.vercel.app).**

1. **A verifier with discovery.** One input, three meanings: paste a **project
   address** and get every lock and vault it created; paste a **coin type or
   symbol** (`0x2::sui::SUI`, or just `SUI`) and get everything frozen of that
   asset; paste a **lock id** and go straight to it. A connected wallet also gets
   a one-click "show everything I locked".
2. **An embeddable badge.** A live pill for the project's own site. The date is
   read from Sui on every page load, so the site owner cannot edit what it
   claims. If the lock expires, the badge changes by itself.
3. **Create a lock.** Pick anything the wallet holds that the contract accepts
   (`key + store`, filtered against the chain's own ability data — coins, LP
   positions, NFTs), set a date, sign. This closes the loop: freeze here, prove
   here, embed anywhere.
4. **A narrow write path.** Extend a lock, claim an unlocked object, claim vested
   tokens. Every action either strengthens a guarantee or moves value to the
   party the contract already designates. Nothing here can weaken a lock.
5. **A share card.** The moment a lock exists, the thing its owner wants to do
   next is tell people — and the only artefact the market had for that was a
   screenshot, which is exactly the forgeable object this product replaces. So
   freezing something ends in a 1200x630 card painted from the same `Frost` the
   page is rendering, carrying the lock id and a URL that re-reads Sui. The
   picture travels; the proof stays checkable. Post to X, native share sheet,
   clipboard, or download.
6. **A deploy console** (`?view=deploy`). `update_blob` needs the NameCap held in
   a browser wallet; doing it from the CLI would mean exporting that key.

## The ice

One metaphor covers both Epoch products, because "frozen liquidity" is already
how the market talks:

| chain state | what you see |
| --- | --- |
| locked, term running | solid block, walrus asleep on top |
| vesting in progress | block drips into the puddle — the melt *is* the vested share |
| cliff reached | the block cracks and the walrus slides off |
| fully claimed | a puddle |
| not an Epoch lock | nothing frozen, stated plainly |

The picture is derived from the same numbers as the text, so the two can never
disagree. `Frozen` accepts no captions or labels — it can only draw what the
chain returned, which is why an embedder cannot make it say something untrue.

## Running it

```bash
npm install
npm run dev          # the verifier
npm run dev:badge    # the badge in isolation
# then open /states.html for every visual state on synthetic data
```

```bash
npm run build        # both single-file bundles
npm run size         # bundle budget check
```

Current output:

```
badge      52.1 KB  gzip   18.3 KB   (budget 40 KB)
app       199.2 KB  gzip   62.1 KB   (budget 220 KB)
```

## Why it is built this way

**One HTML file per name.** Epoch Names stores a single `blob_id` per record, so
a site is exactly one Walrus blob. `vite-plugin-singlefile` collapses each build
into one self-contained document — no code splitting, no external assets.

**Two names, two bundles.** The badge renders inside an iframe on other people's
pages, so it gets its own build with `__BADGE_ONLY__` set. The wallet and
transaction layers tree-shake out completely (verified: zero occurrences of
`signAndExecuteTransaction`, `getWallets` or `moveCall` in the badge output).

**Preact + Wallet Standard, not dapp-kit.** dapp-kit would pull React, Radix and
React Query into a file that has to fit in one blob. Wallet Standard is the same
protocol underneath, at ~80 lines and ~250 KB less.

**GraphQL, not JSON-RPC.** The public Sui fullnodes now answer `sui_getObject`
with `-32601 "JSON-RPC has been deprecated"`. Everything reads through
`sui-mainnet.mystenlabs.com/graphql`.

**Origin vs. latest package id.** Types are parsed against the *origin* package
(`0xe0f2…` for object-lock) while MoveCalls target the *latest* (`0x0267…`).
See `src/chain/constants.ts` — mixing these up is the classic post-upgrade bug.

**Amounts carry their unit.** `CoinMetadata` gives decimals and the ticker. The
Move struct name is not the ticker — the live EPT vault's struct is literally
called `TEMPLATE` — so the UI resolves the symbol rather than printing the type.

**One clock.** Every `Frost` carries the chain timestamp it was computed against
and all countdowns derive from it. Mixing in `Date.now()` lets a viewer with a
skewed clock see a badge that says "locked" above a timer that says "unlocked".

**The badge caches.** It lives on someone else's homepage, so every visitor they
get is a request from us. Stale-while-revalidate in `sessionStorage` means a
network blip serves the last good answer instead of an error on their front page.

**Type strings are normalised before comparison.** Sui reports type addresses
zero-padded to 32 bytes (`0x0000…0002::sui::SUI`) while everyone types `0x2::sui::SUI`.
Comparing them raw silently never matches — `normalizeType` in `src/chain/frost.ts`
pads both ends first.

**The vesting curve is a line-for-line port.** `computeVestedTotal` mirrors
`vesting::compute_vested_total` including integer truncation order. If it drifts
even by a base unit, the badge becomes a liar, which defeats the product.

## Layout

```
src/chain/     constants, GraphQL client, parsers, tx builders
src/ice/       the melt system — IceBlock, Walrus, Frozen
src/badge/     the embed build
src/app/       verifier, details, actions, embed generator
src/wallet/    Wallet Standard hook
src/dev/       states gallery (never shipped)
scripts/       Walrus publish + bundle budget
```

## Deploying

```bash
npm run build
node scripts/publish.mjs dist/badge/badge.html    # -> blob id
node scripts/publish.mjs dist/app/index.html      # -> blob id
```

Then point each `.epoch` name at its blob via
`walrus_names::update_blob(name_cap, registry, blob_id)`.

## Not affiliated

PermaFrost reads Epoch's public mainnet packages. It holds no keys, has no
backend, and stores nothing off-chain.

---

## The character

Glacia is not decoration with a random costume. Every prop she wears is a
reading of the same chain data the numbers come from, derived in one pure
function (`src/ice/character.ts`) so the badge on somebody else's homepage and
the hero on ours cannot drift apart:

| chain fact | what she does |
| --- | --- |
| term under 82% elapsed | asleep, breathing fog, Zs |
| 82–97% elapsed | awake, unbothered |
| over 97% elapsed | watching the clock, shorter breath |
| unlock reached | wide eyes, tusks up, slides off the block |
| fully claimed | floating in the water, delighted |
| term ≥ 2 years | scarf |
| term ≥ 5 years | scarf and beanie |
| term ≤ 45 days | sunglasses — a month is a holiday, not a winter |
| ≥ 1 year and 25% elapsed | snow settled on her head |

**Why SVG and not a framework.** The reference composition builds her from
Three.js primitives, which costs ~624 KB — four times the entire application —
for one decorative animal, inside a budget where the site must collapse into a
single Walrus blob and the badge has to stay small on somebody else's homepage.
Layered SVG with gradients, an occlusion pass and fur strokes buys the same
read for about 6 KB, animates on the compositor, and scales from a 34 px pill
to a 1200 px share card with no second asset. Below 110 px the fine pass
(pores, fur, breath) drops out rather than shipping grey mush.

## Backdrops

Which room you are standing in is itself information. `src/ui/Backdrop.tsx`
switches one stack of composited layers by view and by lock phase — aurora on
the landing, cold and still for a frozen lock, amber shards when the term
elapses, water once everything is claimed, a magenta blizzard while you are
freezing something, a blueprint grid in the deploy console. No canvas loop and
no particle system: gradients and transforms the GPU can animate while the main
thread parses a GraphQL response, and all of it inert under
`prefers-reduced-motion`.

## Talking to the chain politely

`src/chain/net.ts` is the only way anything reaches Sui. A static page with no
backend is the sole thing standing between a visitor and a shared public
endpoint with a rate limit, and PermaFrost is chatty for its size: one search
fans out into three type sweeps, and a badge is one request per visitor of
somebody else's homepage. Every call passes, in order:

1. **memo** — identical query+variables inside a TTL never leaves the tab
2. **dedupe** — identical query+variables in flight share one response
3. **breaker** — after 5 hard failures, fail fast for 12s instead of piling on
4. **limiter** — 4 concurrent, spaced 55 ms apart, 20 s timeout each
5. **retry** — 429/5xx/network back off with full jitter and honour `Retry-After`

Aborting one caller never cancels a request other callers are waiting on: the
shared work runs to completion and lands in the memo.

Two schema changes cut the request count outright. `multiGetObjects` reads a
whole results page in one round trip (it used to be one request per row, which
is also one throttling opportunity per row), and coin metadata is resolved once
per distinct type per list rather than once per row.

## Frontend security

There are no keys in this repository and none at runtime — every hex string in
`src/chain/constants.ts` is a public mainnet package id. The app holds nothing,
stores nothing off-chain, and has no backend to compromise. What is left is the
browser surface:

- **CSP**, as a header on Vercel and as a `<meta>` in the document so the copy
  served from a Walrus gateway (which sets no headers) is covered too. The
  tightest directive is `connect-src`: exactly one host. Anything that ever
  tried to send a wallet address elsewhere would simply not connect.
- **`frame-ancestors 'none'`** on the app, `*` on the badge — the badge exists
  to be embedded, the verifier does not, and clickjacking a page with a
  transaction button is the obvious attack.
- No `innerHTML`, no `dangerouslySetInnerHTML`, no `eval` anywhere in `src/`.
  The one place that built markup from a string now builds a node.
- Every value an embedder controls is validated at the boundary: the lock id
  against a hex pattern, and `locale` against a tag grammar *and*
  `Intl.DateTimeFormat` — `?locale=x` used to throw a `RangeError` and take the
  badge down on the embedder's own homepage.
- The badge posts only its own dimensions to `parent`, and registers no
  `message` listener at all, so an embedding page can measure it and nothing else.
- `credentials: 'omit'` and `referrerPolicy: 'no-referrer'` on every chain read.
- Every `target="_blank"` carries `rel="noopener noreferrer"`, including the
  X intent window.
- A beneficiary address that is well-formed but shorter than 32 bytes is
  flagged before signing. Sui accepts it and the lock would be permanent.
