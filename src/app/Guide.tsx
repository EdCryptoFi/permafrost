import { InternalLink } from '@/ui/InternalLink'

/**
 * The guide.
 *
 * Everything here describes behaviour that exists — no roadmap, no "coming
 * soon". If a sentence in this file stops being true, the file is the bug.
 */

const EXAMPLE_FULL = '0xee72005ed5e5470c66acb08075b39ed8e4945355019b3022e56a2a9d8e0e60a9'
const EXAMPLE_EMPTY = '0xf63d5c606b3af6665e174ebbb268b78b9da51f76d3bb17144ca98308505a8c77'

export function Guide({
  onPick,
  onGo,
}: {
  onPick: (id: string) => void
  onGo: (view: 'new' | 'deploy') => void
}) {
  return (
    <>
      <section class="panel">
        <h2>What this is</h2>
        <p class="muted">
          When a project locks its liquidity, the proof it usually shows is a screenshot. A
          screenshot is forgeable in thirty seconds, and it keeps looking convincing long after
          the lock has expired. PermaFrost reads the lock from Sui instead, and hands the project
          a badge for its own site whose text the project cannot edit — the date, the amount and
          the state all come from the chain on every page load.
        </p>
        <p class="muted">
          It has no backend and stores nothing. The page you are reading is a single file on
          Walrus; every number on it was fetched from the chain by your own browser.
        </p>
      </section>

      <section class="panel">
        <h2>1 · Verify something</h2>
        <p class="muted">The search box takes four different things and works out which is which:</p>
        <dl class="facts">
          <div class="fact">
            <dt>A .epoch name</dt>
            <dd class="mono">permafrost.epoch</dd>
          </div>
          <div class="fact">
            <dt>A project's address</dt>
            <dd class="mono">0x474bfe…</dd>
          </div>
          <div class="fact">
            <dt>A lock or vault id</dt>
            <dd class="mono">0xee7200…</dd>
          </div>
          <div class="fact">
            <dt>A coin type or ticker</dt>
            <dd class="mono">0x2::sui::SUI · SUI</dd>
          </div>
        </dl>
        <p class="muted small">
          A name or an address returns everything that party has locked. An id opens that one
          lock. A ticker returns everything frozen of that asset, whoever locked it.
        </p>
      </section>

      <section class="panel">
        <h2>2 · Read the ice</h2>
        <p class="muted">
          The picture is drawn from the same numbers as the table, so the two can never disagree.
          It accepts no caption and no label — it can only draw what the chain returned.
        </p>
        <dl class="facts">
          <div class="fact">
            <dt>Solid block</dt>
            <dd>Locked. The term is running.</dd>
          </div>
          <div class="fact">
            <dt>Melting, dripping</dt>
            <dd>A vesting vault releasing. The melt is the vested share.</dd>
          </div>
          <div class="fact">
            <dt>Dashed rime line</dt>
            <dd>Time elapsed, when nothing has been released yet.</dd>
          </div>
          <div class="fact">
            <dt>Cracked open</dt>
            <dd>The unlock date passed. The beneficiary can withdraw.</dd>
          </div>
          <div class="fact">
            <dt>A puddle</dt>
            <dd>Everything was claimed. Nothing is left.</dd>
          </div>
          <div class="fact">
            <dt>Amber, "but empty"</dt>
            <dd>A real lock holding a balance of zero.</dd>
          </div>
        </dl>
        <p class="muted small">
          That last one matters. A lock of an empty coin is still a lock, and without the amount
          it looks exactly like one holding a fortune. Compare{' '}
          <InternalLink id={EXAMPLE_FULL} onPick={onPick} class="inline-link">
            a full lock
          </InternalLink>{' '}
          with{' '}
          <InternalLink id={EXAMPLE_EMPTY} onPick={onPick} class="inline-link">
            an empty one
          </InternalLink>
          .
        </p>
      </section>

      <section class="panel">
        <h2>3 · Embed the badge</h2>
        <p class="muted">
          Open any lock and copy the snippet. It is an iframe pointing at{' '}
          <span class="mono">frostbadge.epochsui.com</span>, so the badge is served from its own
          address and reads the chain itself. Nothing about it passes through the site hosting it.
        </p>
        <dl class="facts">
          <div class="fact">
            <dt>Pill</dt>
            <dd class="mono">260 × 48</dd>
          </div>
          <div class="fact">
            <dt>Card</dt>
            <dd class="mono">300 × 96</dd>
          </div>
        </dl>
        <p class="muted small">
          If the badge stops being true — the term elapses, the tokens are claimed — it changes on
          its own, on every site that embedded it, without anyone touching anything.
        </p>
      </section>

      <section class="panel accent">
        <h2>4 · Freeze something</h2>
        <p class="muted">
          Pick anything the wallet holds that the contract accepts — coins, LP positions, NFTs,
          even a .epoch name. Set a date, sign once. The lock becomes a shared object: anyone can
          look it up, and nobody can cancel it or pull the date forward. Not you, not Epoch.
        </p>
        <p class="muted small">
          The only change anyone can make afterwards is the beneficiary pushing the date{' '}
          <em>further out</em>. That is why extending is offered and shortening is not.
        </p>
        <div class="row">
          <button class="btn" onClick={() => onGo('new')}>
            Freeze something
          </button>
        </div>
      </section>

      <section class="panel">
        <h2>Underneath</h2>
        <dl class="facts">
          <div class="fact">
            <dt>Object locks</dt>
            <dd class="mono">epoch_object_lock::object_lock</dd>
          </div>
          <div class="fact">
            <dt>Vesting vaults</dt>
            <dd class="mono">vesting_service::vesting</dd>
          </div>
          <div class="fact">
            <dt>Names</dt>
            <dd class="mono">walrus_names::walrus_names</dd>
          </div>
          <div class="fact">
            <dt>Reads</dt>
            <dd class="mono">Sui GraphQL, from your browser</dd>
          </div>
          <div class="fact">
            <dt>Hosting</dt>
            <dd class="mono">one Walrus blob per name</dd>
          </div>
        </dl>
        <p class="muted small">
          The vesting figures are computed with a line-for-line port of the contract's own curve,
          so what is shown here matches what the contract will pay, to the base unit.
        </p>
      </section>
    </>
  )
}
