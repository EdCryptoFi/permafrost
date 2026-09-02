import type { Frost } from '@/chain/frost'
import { IceBlock } from './IceBlock'
import { Walrus } from './Walrus'
import './ice.css'

export type FrozenProps = {
  frost: Frost
  /** Rendered width in px. The scene scales as one unit. */
  size?: number
  mascot?: boolean
  snow?: boolean
}

/**
 * The whole visual, driven entirely by one `Frost`.
 *
 * The rule that keeps this honest: nothing here accepts a caption, a label or
 * any free text. It can only draw what the chain returned, which is why an
 * embedder cannot make it claim something untrue.
 */
export function Frozen({ frost, size = 120, mascot = true, snow = true }: FrozenProps) {
  // For an object lock nothing is released until the cliff, so the block should
  // still visibly shrink as time passes: use elapsed progress. For vesting the
  // released share IS the melt, so the picture matches the claimable number.
  const melted = frost.kind === 'lock' ? frost.progress : frost.released
  const surfaceDrop = 34 * Math.min(1, Math.max(0, melted))

  // Below ~60px the mascot stops being a walrus and becomes a grey blob, so
  // she bows out and a clean block carries the meaning instead. The threshold
  // sits under the badge card's 68px on purpose: that variant offers a
  // "Mascot" toggle, and a toggle that never changes anything is a bug.
  const showMascot = mascot && size >= 60

  return (
    <svg
      class={`frost is-${frost.phase}`}
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
        </g>
      )}

      <IceBlock melted={melted} elapsed={frost.progress} phase={frost.phase} />

      {showMascot && (
        <g transform={`translate(0 ${surfaceDrop})`}>
          <Walrus scarf={isLongFreeze(frost)} shades={isShortFreeze(frost)} />
        </g>
      )}
    </svg>
  )
}

const YEAR = 365 * 24 * 3600e3

/** Two years or more frozen earns the scarf. */
function isLongFreeze(f: Frost) {
  return f.phase !== 'thawed' && f.unlockMs - f.lockedAtMs >= 2 * YEAR
}
/** A 30-day lock is a holiday, not a winter. */
function isShortFreeze(f: Frost) {
  const d = f.unlockMs - f.lockedAtMs
  return f.phase !== 'thawed' && d > 0 && d <= 45 * 24 * 3600e3
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
