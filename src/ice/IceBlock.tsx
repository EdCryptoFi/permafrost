import type { FrostPhase } from '@/chain/frost'

/**
 * The block itself. `melted` (0..1) is the only input that matters: it drives
 * the fill height, so the picture and the number can never disagree.
 */
export function IceBlock({
  melted,
  elapsed,
  phase,
}: {
  melted: number
  /** Term elapsed 0..1. Drawn as a rime line when it outruns the melt. */
  elapsed: number
  phase: FrostPhase
}) {
  const m = Math.min(1, Math.max(0, melted))
  const top = 40
  const bottom = 74
  const height = bottom - top
  const surfaceY = top + height * m

  return (
    <g class="frost-block">
      <defs>
        <linearGradient id="pf-ice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--ice-300)" stop-opacity="0.95" />
          <stop offset="55%" stop-color="var(--ice-500)" stop-opacity="0.85" />
          <stop offset="100%" stop-color="var(--ice-900)" stop-opacity="0.95" />
        </linearGradient>
        <clipPath id="pf-clip">
          {/* Slightly trapezoid so it reads as a carved block, not a rectangle. */}
          <path d="M22 40 L64 40 L68 74 L18 74 Z" />
        </clipPath>
      </defs>

      {/*
        Ghost of the original block. Without it an emptied block reads as a
        hollow glass box rather than as ice that is gone.
      */}
      <path d="M22 40 L64 40 L68 74 L18 74 Z" fill="var(--ice-900)" opacity="0.22" />

      {/* remaining ice: a rect clipped to the block silhouette, top edge = melt line */}
      <g clip-path="url(#pf-clip)">
        <rect x="14" y={surfaceY} width="60" height={bottom - surfaceY + 2} fill="url(#pf-ice)" />
        <rect
          class="frost-shimmer"
          x="29.5"
          y={surfaceY + 4}
          width="5.5"
          height={Math.max(0, bottom - surfaceY - 8)}
          rx="2.75"
          fill="var(--ice-100)"
          opacity="0.2"
        />
      </g>

      {/*
        Rime line: a vault with a 100% cliff releases nothing until the day it
        releases everything, so the block would sit visually frozen for months
        and read as broken. This marks how much of the term has elapsed without
        ever claiming that something melted.
      */}
      {phase === 'melting' && elapsed > melted + 0.02 && (
        <line
          x1="21"
          x2="65"
          y1={top + height * elapsed}
          y2={top + height * elapsed}
          stroke="var(--ice-100)"
          stroke-width="0.8"
          stroke-dasharray="3 2.5"
          opacity="0.5"
        />
      )}

      {/* silhouette outline stays put, so you can see how much is gone */}
      <path
        d="M22 40 L64 40 L68 74 L18 74 Z"
        fill="none"
        stroke="var(--ice-300)"
        stroke-opacity="0.4"
        stroke-width="0.8"
      />

      {/* cliff cracks */}
      <g
        class="frost-crack"
        stroke="var(--ice-100)"
        stroke-width="1.1"
        stroke-linecap="round"
        fill="none"
      >
        <path d="M43 40 L40 51 L46 58 L42 74" />
        <path d="M40 51 L24 54" />
        <path d="M46 58 L64 55" />
        <path d="M33 40 L36 49" />
      </g>

      {/* vesting drips */}
      {phase === 'melting' && m > 0.02 && m < 0.99 && (
        <g fill="var(--water)" opacity="0.85">
          <ellipse class="frost-drip" cx="30" cy={bottom + 1} rx="1.3" ry="1.9" />
          <ellipse class="frost-drip" cx="43" cy={bottom + 1} rx="1.1" ry="1.7" />
          <ellipse class="frost-drip" cx="56" cy={bottom + 1} rx="1.3" ry="1.9" />
        </g>
      )}

      {/* puddle underneath, growing with the melt */}
      <ellipse
        class="frost-puddle"
        cx="43"
        cy="77"
        rx={10 + 20 * m}
        ry={1.6 + 1.6 * m}
        fill="var(--water)"
        opacity={0.15 + 0.5 * m}
      />
    </g>
  )
}
