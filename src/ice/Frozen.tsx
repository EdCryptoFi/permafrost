import type { Frost } from '@/chain/frost'
import { IceBlock } from './IceBlock'
import { Walrus } from './Walrus'
import { characterFor } from './character'
import './ice.css'

export type FrozenProps = {
  frost: Frost
  /** Rendered width in px. The scene scales as one unit. */
  size?: number
  mascot?: boolean
  snow?: boolean
  /** Force the detailed pass on or off. Defaults to a size threshold. */
  detail?: boolean
}

/**
 * The whole visual, driven entirely by one `Frost`.
 *
 * The rule that keeps this honest: nothing here accepts a caption, a label or
 * any free text. It can only draw what the chain returned, which is why an
 * embedder cannot make it claim something untrue — the same reason the badge
 * is worth putting on a homepage in the first place.
 */
export function Frozen({ frost, size = 120, mascot = true, snow = true, detail }: FrozenProps) {
  // For an object lock nothing is released until the cliff, so the block still
  // has to visibly shrink as the term runs — otherwise a year of waiting looks
  // identical to day one. But it must never empty on elapsed time alone: an
  // unclaimed lock whose date has passed is CRACKED, not gone, and a picture
  // of bare ground under a set of cracks says the item left when it did not.
  // So elapsed time melts it most of the way and only a real claim finishes it.
  const melted =
    frost.kind === 'lock'
      ? frost.phase === 'thawed'
        ? 1
        : Math.min(frost.progress, 0.82)
      : frost.released
  const surfaceDrop = 34 * Math.min(1, Math.max(0, melted))

  // Below ~60px the mascot stops being a walrus and becomes a grey blob, so
  // she bows out and a clean block carries the meaning instead. The threshold
  // sits under the badge card's 68px on purpose: that variant offers a
  // "Mascot" toggle, and a toggle that never changes anything is a bug.
  const showMascot = mascot && size >= 60 && frost.phase !== 'absent'
  // Fur strokes, pores and breath vapour are noise under ~110px.
  const fine = detail ?? size >= 110
  const character = characterFor(frost)

  return (
    <svg
      class={`frost is-${frost.phase} mood-${character.mood}`}
      width={size}
      height={size * (88 / 86)}
      viewBox="0 0 86 88"
      role="img"
      aria-label={ariaFor(frost)}
    >
      {snow && frost.phase !== 'thawed' && (
        <g fill="var(--ice-100)" opacity="0.7">
          <circle class="frost-snow" cx="24" cy="10" r="0.9" />
          <circle class="frost-snow" cx="44" cy="6" r="0.7" />
          <circle class="frost-snow" cx="62" cy="12" r="0.85" />
          {fine && <circle class="frost-snow" cx="34" cy="4" r="0.6" />}
          {fine && <circle class="frost-snow" cx="54" cy="9" r="0.5" />}
        </g>
      )}

      <IceBlock melted={melted} elapsed={frost.progress} phase={frost.phase} detail={fine} />

      {showMascot && (
        <g transform={`translate(0 ${surfaceDrop})`}>
          <Walrus character={character} detail={fine} />
        </g>
      )}
    </svg>
  )
}

function ariaFor(f: Frost): string {
  switch (f.phase) {
    case 'absent':
      return 'No Epoch lock found at this address'
    case 'thawed':
      return 'Lock fully claimed'
    case 'cracked':
      return 'Lock has reached its unlock date'
    default:
      return `Locked on Epoch, ${Math.round(f.progress * 100)} percent of the term elapsed`
  }
}
