import type { FrostPhase } from '@/chain/frost'

/**
 * The block.
 *
 * `melted` (0..1) is the only input that decides how much ice is left, so the
 * picture and the number are the same fact drawn twice and can never disagree.
 * Everything else here is grain: bubbles suspended at the depth they froze at,
 * a rime crust on the surface, refracted light through the face, and a puddle
 * that grows out of whatever left the block.
 *
 * Every id is namespaced `pf-`: this SVG renders inside an iframe on other
 * people's pages, and a bare `id="ice"` would let their document's gradient
 * win the lookup and repaint our proof in their colours.
 */
export function IceBlock({
  melted,
  elapsed,
  phase,
  detail = true,
}: {
  melted: number
  /** Term elapsed 0..1. Drawn as a rime line when it outruns the melt. */
  elapsed: number
  phase: FrostPhase
  detail?: boolean
}) {
  const m = Math.min(1, Math.max(0, melted))
  const top = 40
  const bottom = 74
  const height = bottom - top
  const surfaceY = top + height * m
  const face = 'M22 40 L64 40 L68 74 L18 74 Z'

  return (
    <g class="frost-block">
      <defs>
        <linearGradient id="pf-ice" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stop-color="var(--ice-300)" stop-opacity="0.96" />
          <stop offset="48%" stop-color="var(--ice-500)" stop-opacity="0.86" />
          <stop offset="100%" stop-color="var(--ice-900)" stop-opacity="0.96" />
        </linearGradient>
        <linearGradient id="pf-caustic" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="45%" stop-color="#ffffff" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
        <clipPath id="pf-clip">
          {/* Slightly trapezoid so it reads as a carved block, not a rectangle. */}
          <path d={face} />
        </clipPath>
      </defs>

      {/* Ghost of the original block. Without it an emptied block reads as a
          hollow glass box rather than as ice that is gone. */}
      <path d={face} fill="var(--ice-900)" opacity="0.22" />

      <g clip-path="url(#pf-clip)">
        {/* remaining ice: top edge is the melt line */}
        <rect x="14" y={surfaceY} width="60" height={bottom - surfaceY + 2} fill="url(#pf-ice)" />

        {detail && m < 0.97 && (
          <>
            {/* Air trapped when it froze. They sit at fixed depths, so as the
                surface drops they surface one by one — the cheapest possible
                signal that this is a volume and not a filled rectangle. */}
            <g class="frost-bubbles" fill="var(--ice-100)">
              <circle cx="31" cy="52" r="1.1" opacity="0.4" />
              <circle cx="52" cy="49" r="0.8" opacity="0.32" />
              <circle cx="38" cy="63" r="0.7" opacity="0.36" />
              <circle cx="58" cy="61" r="1" opacity="0.3" />
              <circle cx="45" cy="68" r="0.6" opacity="0.34" />
            </g>
            {/* Light bending through the face. */}
            <rect
              class="frost-caustic"
              x="10"
              y="34"
              width="26"
              height="52"
              fill="url(#pf-caustic)"
              transform="rotate(14 43 58)"
            />
          </>
        )}

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

        {/* Rime crust riding the melt line, so the surface has a thickness. */}
        {m < 0.97 && (
          <rect x="14" y={surfaceY - 0.9} width="60" height="1.8" fill="var(--ice-100)" opacity="0.45" />
        )}
      </g>

      {/* Rime line: a vault with a 100% cliff releases nothing until the day it
          releases everything, so the block would sit visually frozen for months
          and read as broken. This marks how much of the term has elapsed
          without ever claiming that something melted. */}
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

      {/* Silhouette outline stays put, so you can see how much is gone. */}
      <path d={face} fill="none" stroke="var(--ice-300)" stroke-opacity="0.42" stroke-width="0.8" />

      {/* Frost crystals growing on the outside of the face. */}
      {detail && phase !== 'thawed' && (
        <g class="frost-crystals" stroke="var(--ice-100)" stroke-width="0.4" opacity="0.55" fill="none">
          <path d="M25 44 l2 1.6 M27 45.6 l-1.4 1.4 M27 45.6 l1.8 -0.6" />
          <path d="M61 47 l-2 1.4 M59 48.4 l1.2 1.4 M59 48.4 l-1.8 -0.4" />
          <path d="M23 66 l2.2 1.2 M25.2 67.2 l-1 1.6" />
        </g>
      )}

      {/* Cliff cracks — invisible until the term elapses, then they snap in. */}
      <g class="frost-crack" stroke="var(--ice-100)" stroke-width="1.1" stroke-linecap="round" fill="none">
        <path d="M43 40 L40 51 L46 58 L42 74" />
        <path d="M40 51 L24 54" />
        <path d="M46 58 L64 55" />
        <path d="M33 40 L36 49" />
        <path d="M46 58 L52 70" />
      </g>

      {/* Vesting drips. */}
      {phase === 'melting' && m > 0.02 && m < 0.99 && (
        <g fill="var(--water)" opacity="0.85">
          <ellipse class="frost-drip" cx="30" cy={bottom + 1} rx="1.3" ry="1.9" />
          <ellipse class="frost-drip" cx="43" cy={bottom + 1} rx="1.1" ry="1.7" />
          <ellipse class="frost-drip" cx="56" cy={bottom + 1} rx="1.3" ry="1.9" />
        </g>
      )}

      {/* Puddle underneath, growing with the melt. */}
      <ellipse
        class="frost-puddle"
        cx="43"
        cy="77"
        rx={10 + 20 * m}
        ry={1.6 + 1.6 * m}
        fill="var(--water)"
        opacity={0.15 + 0.5 * m}
      />
      {detail && m > 0.35 && (
        <ellipse
          class="frost-ripple"
          cx="43"
          cy="77"
          rx={6 + 14 * m}
          ry={1 + 1.1 * m}
          fill="none"
          stroke="var(--ice-100)"
          stroke-width="0.4"
          opacity="0.35"
        />
      )}

      {/* Fully claimed: the water is all that is left, and something lives in
          it now. A puddle alone read as a rendering failure. */}
      {detail && phase === 'thawed' && (
        <g class="frost-fish">
          <ellipse cx="33" cy="76.4" rx="2.2" ry="1.1" fill="var(--ice-300)" opacity="0.85" />
          <path d="M35 76.4 L36.6 75.4 L36.6 77.4 Z" fill="var(--ice-300)" opacity="0.85" />
          <circle cx="32" cy="76.1" r="0.28" fill="#07131f" />
        </g>
      )}
    </g>
  )
}
