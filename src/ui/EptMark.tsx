/**
 * The Epoch mark, drawn.
 *
 * $EPT's own icon is an hourglass of blue water inside a ring that is itself
 * liquid — the same motif this app already uses for a lock with time left in
 * it, which is not a coincidence: they are both about the same idea.
 *
 * It is redrawn here rather than embedded. The published icon is a 1.4 MB PNG
 * on a black field: too heavy for a page that has to fit in one Walrus blob,
 * and unusable on the light appearance, where a black square would sit in the
 * middle of a grey desktop. Vector also lets the ring actually fill as the app
 * loads, which is the whole job it does on the startup screen.
 *
 * `progress` (0..1) fills the ring and drops the sand. At 0 it is an outline;
 * at 1 the ring is closed and the glass has run through.
 */
export function EptMark({
  size = 128,
  progress = 1,
  title,
}: {
  size?: number
  progress?: number
  title?: string
}) {
  const p = Math.max(0, Math.min(1, progress))
  // The ring is drawn as one stroked circle whose dash carries the fill.
  const R = 54
  const C = 2 * Math.PI * R
  const top = 26 * (1 - p)
  const bot = 24 * p

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
    >
      <defs>
        <linearGradient id="em-ring" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stop-color="#dff2ff" />
          <stop offset="45%" stop-color="#4aa8f0" />
          <stop offset="100%" stop-color="#1e6fc0" />
        </linearGradient>
        <linearGradient id="em-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8fd4ff" />
          <stop offset="100%" stop-color="#1b7fd4" />
        </linearGradient>
        <linearGradient id="em-glass" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#a8d8f5" stop-opacity="0.35" />
        </linearGradient>
        <filter id="em-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* The upper bulb, so its water can be clipped to a level. */}
        <clipPath id="em-upper">
          <path d="M36 24 H92 L64 63 Z" />
        </clipPath>
        <clipPath id="em-lower">
          <path d="M64 65 L92 104 H36 Z" />
        </clipPath>
      </defs>

      <g filter="url(#em-glow)">
        {/* The ring, open at the sides the way the mark is. */}
        <circle
          cx="64" cy="64" r={R}
          fill="none" stroke="url(#em-ring)" stroke-width="6" stroke-linecap="round"
          stroke-dasharray={`${C * 0.42} ${C * 0.08}`}
          stroke-dashoffset={-C * 0.04}
          opacity="0.3"
        />
        <circle
          cx="64" cy="64" r={R}
          fill="none" stroke="url(#em-ring)" stroke-width="6" stroke-linecap="round"
          stroke-dasharray={`${C * 0.42 * p} ${C}`}
          stroke-dashoffset={-C * 0.04}
        />
        <circle
          cx="64" cy="64" r={R}
          fill="none" stroke="url(#em-ring)" stroke-width="6" stroke-linecap="round"
          stroke-dasharray={`${C * 0.42 * p} ${C}`}
          stroke-dashoffset={-C * 0.54}
        />
        {/* The two beads the mark carries where the ring breaks. */}
        <circle cx="9.6" cy="64" r="3.4" fill="url(#em-ring)" />
        <circle cx="118.4" cy="64" r="3.4" fill="url(#em-ring)" />
      </g>

      {/* The glass */}
      <path d="M36 24 H92 L64 63 Z" fill="url(#em-glass)" stroke="#8fd0f5" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M64 65 L92 104 H36 Z" fill="url(#em-glass)" stroke="#8fd0f5" stroke-width="2.2" stroke-linejoin="round" />

      {/* The water it still has to spend, and the water it has spent. */}
      <g clip-path="url(#em-upper)">
        <rect x="32" y={63 - top} width="64" height={top + 2} fill="url(#em-water)" />
      </g>
      <g clip-path="url(#em-lower)">
        <rect x="32" y={104 - bot} width="64" height={bot + 2} fill="url(#em-water)" />
      </g>

      {/* The drop at the waist, which is what makes it read as running. */}
      <circle cx="64" cy="64" r="4.6" fill="url(#em-water)" />
      <circle cx="62.4" cy="62.4" r="1.5" fill="#ffffff" opacity="0.75" />
    </svg>
  )
}
