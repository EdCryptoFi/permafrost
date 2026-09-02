/**
 * Ransom-note headline.
 *
 * The design system's rule: a headline is never one string — it is a manual
 * assembly of cut-out words that each pick their own face, tilt and fill.
 *
 * The variant per word is derived from a hash of the word and its position,
 * NOT from Math.random(). A random pick would reshuffle on every state change
 * (a countdown ticks once a second), and a headline that twitches every second
 * is unreadable.
 */

/**
 * The cut-out pattern.
 *
 * Position-driven rather than hash-driven: hashing the words alone left this
 * particular headline with no solid-fill cutouts at all, and the system calls
 * for roughly a third of the words to sit on a block of colour. Cycling a
 * curated sequence guarantees the mix and the alternation whatever the copy
 * says, while staying perfectly stable across re-renders.
 *
 * Slots 1 and 3 are the solid fills (yellow, pink) — 2 of every 6 words.
 */
const PATTERN = [0, 1, 2, 4, 3, 5]

function variantFor(word: string, index: number): number {
  // The hash only breaks ties on repeated runs, so two identical words in a
  // row never come out looking pasted from the same cutout.
  let h = 0
  for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) | 0
  const slot = (index + (Math.abs(h) % 2)) % PATTERN.length
  return PATTERN[slot] ?? 0
}

export function Ransom({ text, class: cls = '' }: { text: string; class?: string }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <span class={`ransom ${cls}`}>
      {words.map((w, i) => (
        <span class={`ransom-w v${variantFor(w, i)}`} key={`${w}-${i}`}>
          {w}
        </span>
      ))}
    </span>
  )
}
