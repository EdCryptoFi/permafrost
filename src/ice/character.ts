import type { Frost } from '@/chain/frost'

/**
 * Who the walrus is at this exact moment on this exact lock.
 *
 * The mascot is not decoration with a random costume — every prop below is a
 * reading of the same chain data the numbers come from, so the picture cannot
 * say something the record does not. She wears a scarf because the term really
 * is measured in years. She wakes up because the cliff really is close. If the
 * two ever disagreed, the honest half of this product would be the text and
 * the picture would be marketing, which is the thing PermaFrost exists to
 * argue against.
 *
 * Keeping the derivation in one pure function also means the badge on
 * somebody else's homepage and the hero on ours cannot drift apart.
 */

export type Mood =
  /** Long way to go. Out cold, snoring. */
  | 'asleep'
  /** Term running, nothing imminent. Eyes half open, unbothered. */
  | 'chill'
  /** The cliff is close enough to care about. Awake and watching the clock. */
  | 'watching'
  /** It cracked. Wide eyes, tusks up, sliding. */
  | 'alarmed'
  /** Nothing left but water. Floating in it, delighted. */
  | 'swimming'
  /** Nothing here to guard. */
  | 'gone'

export type Character = {
  mood: Mood
  /** Two years or more frozen earns the scarf. */
  scarf: boolean
  /** Five years is a different climate. */
  beanie: boolean
  /** A 30-day lock is a holiday, not a winter. */
  shades: boolean
  /** Snow settles on anything that has not moved in a long time. */
  snowcap: boolean
  /** Sleeping walruses get Zs. */
  zzz: boolean
  /** Breath fogs while the block is still cold. */
  breath: boolean
}

const DAY = 24 * 3600e3
const YEAR = 365 * DAY

export function characterFor(f: Frost): Character {
  const term = Math.max(0, f.unlockMs - f.lockedAtMs)
  const long = term >= 2 * YEAR
  const epic = term >= 5 * YEAR
  const short = term > 0 && term <= 45 * DAY

  const mood: Mood =
    f.phase === 'absent'
      ? 'gone'
      : f.phase === 'thawed'
        ? 'swimming'
        : f.phase === 'cracked'
          ? 'alarmed'
          : f.progress >= 0.97
            ? 'watching'
            : f.progress >= 0.82
              ? 'chill'
              : 'asleep'

  const frozen = mood === 'asleep' || mood === 'chill' || mood === 'watching'

  return {
    mood,
    scarf: frozen && long,
    beanie: frozen && epic,
    shades: frozen && short,
    snowcap: frozen && term >= YEAR && f.progress > 0.25,
    zzz: mood === 'asleep',
    breath: frozen,
  }
}
