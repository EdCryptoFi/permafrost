/**
 * The hourglass that sits on the block.
 *
 * It replaces the mascot, and it earns the place the mascot did not: the sand
 * is the number. The top bulb holds what is left of the term and the bottom
 * holds what has run, so the object on the ice is a second reading of the same
 * fact rather than a character standing beside it.
 *
 * Flat vector, no raster, no motion of its own beyond the falling grain —
 * it has to survive being scaled into a badge and inlined into one HTML file.
 */
export function Hourglass({
  /** 0..1 of the term elapsed. Drives the sand. */
  progress,
  /** Sand stops falling once there is nothing left to run. */
  running = true,
  tone = 'frost',
}: {
  progress: number
  running?: boolean
  tone?: 'frost' | 'warn' | 'spent'
}) {
  const p = Math.min(1, Math.max(0, progress))

  const SAND = { frost: '#7cc4ff', warn: '#f0ab27', spent: '#94a1b2' }[tone]
  const SAND_HI = { frost: '#cfe9ff', warn: '#ffd98a', spent: '#c3ccd8' }[tone]

  // The bulbs are triangles meeting at a neck. Top drains from its base
  // upward, bottom piles from its base downward.
  const topFill = 8 * (1 - p)
  const botFill = 7 * p

  return (
    <g class="hourglass">
      <defs>
        <linearGradient id="hg-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
          <stop offset="45%" stop-color="#cfe4f5" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#5d7690" stop-opacity="0.3" />
        </linearGradient>
        <clipPath id="hg-top">
          <path d="M33 17 L53 17 L43.6 28 Z" />
        </clipPath>
        <clipPath id="hg-bot">
          <path d="M43.6 29 L53 40 L33 40 Z" />
        </clipPath>
      </defs>

      {/* frame: two caps and the posts between them */}
      <rect x="30.5" y="14.5" width="25" height="2.6" rx="1.3" fill="#8c9aad" />
      <rect x="30.5" y="39.6" width="25" height="2.6" rx="1.3" fill="#8c9aad" />
      <rect x="31.6" y="15" width="1.6" height="26.5" rx="0.8" fill="#6d7a8b" />
      <rect x="52.8" y="15" width="1.6" height="26.5" rx="0.8" fill="#6d7a8b" />

      {/* glass */}
      <path d="M33 17 L53 17 L43.6 28 L53 40 L33 40 L43.4 28 Z" fill="url(#hg-glass)" />

      {/* the sand: what is left, and what has run */}
      <g clip-path="url(#hg-top)">
        <rect x="30" y={28 - topFill} width="27" height={topFill + 0.5} fill={SAND} />
        <rect x="30" y={28 - topFill} width="27" height="0.9" fill={SAND_HI} />
      </g>
      <g clip-path="url(#hg-bot)">
        <rect x="30" y={40 - botFill} width="27" height={botFill + 0.5} fill={SAND} />
        <rect x="30" y={40 - botFill} width="27" height="0.9" fill={SAND_HI} />
      </g>

      {/* the grain in the neck, only while the term is actually running */}
      {running && p > 0.01 && p < 0.99 && (
        <rect class="hourglass-grain" x="43.1" y="28" width="1" height="8" fill={SAND} rx="0.5" />
      )}

      {/* outline last, so it sits over the sand */}
      <path
        d="M33 17 L53 17 L43.6 28 L53 40 L33 40 L43.4 28 Z"
        fill="none"
        stroke="#b9c9da"
        stroke-width="1.1"
        stroke-linejoin="round"
        opacity="0.9"
      />
    </g>
  )
}
