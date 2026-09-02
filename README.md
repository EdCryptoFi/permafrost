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
5. **A deploy console** (`?view=deploy`). `update_blob` needs the NameCap held in
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
badge     28.8 KB  gzip   11.3 KB
app      125.0 KB  gzip   40.5 KB
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
