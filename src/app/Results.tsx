import type { Frost } from '@/chain/frost'
import { assetLabel } from '@/chain/frost'
import type { SearchKind } from '@/chain/search'
import { Frozen } from '@/ice/Frozen'
import { fmtDate, shortAddr } from '@/format'

/**
 * Multi-result view. A project with five locked LP positions is the normal
 * case, not the exception, so a search that finds many has to show them all
 * rather than silently picking one.
 */
export function Results({
  kind,
  term,
  frosts,
  onPick,
}: {
  kind: SearchKind
  term: string
  frosts: Frost[]
  onPick: (id: string) => void
}) {
  const still = frosts.filter((f) => f.phase === 'melting').length

  return (
    <section class="panel">
      <h2>
        {frosts.length} {frosts.length === 1 ? 'result' : 'results'}{' '}
        {kind === 'creator' ? (
          <>created by <span class="mono">{shortAddr(term)}</span></>
        ) : kind === 'coin' ? (
          <>matching <span class="mono">{term}</span></>
        ) : null}
      </h2>
      <p class="muted small">
        {still > 0
          ? `${still} still frozen.`
          : 'Nothing here is still frozen — every term has elapsed.'}
      </p>

      <div class="res-list">
        {frosts.map((f) => (
          <button class="res" key={f.id} onClick={() => onPick(f.id)}>
            <Frozen frost={f} size={54} snow={false} mascot={false} />
            <span class="res-body">
              <b class="mono">{assetLabel(f)}</b>
              <span class="muted small">
                {f.kind === 'lock' ? 'object lock' : 'vesting vault'} ·{' '}
                {f.phase === 'melting' ? `unlocks ${fmtDate(f.unlockMs)}` : f.phase}
              </span>
            </span>
            <span class="res-go" aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </section>
  )
}
