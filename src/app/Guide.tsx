import { InternalLink } from '@/ui/InternalLink'
import { IconBlock, IconCrack, IconExpiring, IconHollow, IconFrost, IconEmbed } from '@/ui/icons'

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
        <h2>Why a screenshot is not proof</h2>
        <div class="versus">
          <div class="versus-side is-bad">
            <span class="versus-tag">A screenshot</span>
            <ul>
              <li>Forged in thirty seconds with the browser's own inspector</li>
              <li>Still looks convincing months after the lock expired</li>
              <li>Says whatever the person posting it wants it to say</li>
              <li>Proves nothing about the chain</li>
            </ul>
          </div>
          <div class="versus-side is-good">
            <span class="versus-tag">This badge</span>
            <ul>
              <li>Read from Sui on every page load</li>
              <li>Changes by itself when the term elapses</li>
              <li>The site holding it cannot edit a character</li>
              <li>Every value links back to the object it came from</li>
            </ul>
          </div>
        </div>
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
        <div class="legend">
          <div class="legend-row">
            <span class="legend-icon"><IconBlock size={20} /></span>
            <div>
              <b>Solid block</b>
              <span class="muted small">Locked, and the term is running.</span>
            </div>
          </div>
          <div class="legend-row">
            <span class="legend-icon"><IconFrost size={20} /></span>
            <div>
              <b>Melting, dripping</b>
              <span class="muted small">
                A vesting vault releasing. The melt is the vested share — not an
                illustration of it, the same number drawn.
              </span>
            </div>
          </div>
          <div class="legend-row">
            <span class="legend-icon"><IconExpiring size={20} /></span>
            <div>
              <b class="is-ember">Unlocking soon · unlocks this week</b>
              <span class="muted small">
                Under 30 days left, then under 7. A lock expiring next week protects
                almost nothing, and a date alone makes you do the arithmetic. The badge
                turns amber and says so.
              </span>
            </div>
          </div>
          <div class="legend-row">
            <span class="legend-icon"><IconCrack size={20} /></span>
            <div>
              <b>Cracked open</b>
              <span class="muted small">The unlock date passed. The beneficiary can withdraw.</span>
            </div>
          </div>
          <div class="legend-row">
            <span class="legend-icon"><IconHollow size={20} /></span>
            <div>
              <b class="is-lava">Locked — but empty</b>
              <span class="muted small">
                A real, uncancellable lock holding a balance of zero. The contract behaves
                perfectly; there is simply nothing underneath.
              </span>
            </div>
          </div>
          <div class="legend-row">
            <span class="legend-icon"><IconEmbed size={20} /></span>
            <div>
              <b>A puddle</b>
              <span class="muted small">Everything was claimed. Nothing is left to verify.</span>
            </div>
          </div>
        </div>
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

      <section class="panel">
        <h2>Things the guide used to leave out</h2>
        <dl class="facts">
          <div class="fact">
            <dt>The countdown</dt>
            <dd>
              Every lock shows time remaining, ticking, and it counts from the chain's
              clock rather than yours — so the number can never disagree with the state
              beside it. Under an hour it goes to seconds.
            </dd>
          </div>
          <div class="fact">
            <dt>Two appearances</dt>
            <dd>
              Graphite and Aqua, switched by the two lozenges in the header. The choice
              is yours and it is remembered.
            </dd>
          </div>
          <div class="fact">
            <dt>A badge for a light page</dt>
            <dd>
              The badge cannot know what page it lands on, so you tell it: tick
              <span class="mono"> Light page </span> when you copy the snippet, and it
              adds <span class="mono">&amp;appearance=aqua</span>.
            </dd>
          </div>
          <div class="fact">
            <dt>Copying an identifier</dt>
            <dd>
              Every address, object id and Move type has a copy button. They are shown in
              full, never shortened — an address you cannot read end to end is not
              something you can check.
            </dd>
          </div>
        </dl>
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
