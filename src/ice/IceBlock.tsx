import type { FrostPhase } from '@/chain/frost'
import { Hourglass } from './Hourglass'

/**
 * The block, as a solid.
 *
 * It used to be a flat trapezoid, which at any size read as a screen rather
 * than as a thing with mass. Three faces on a 2:1 isometric read as a cube
 * the moment you see them, and a cube can contain something — which is the
 * point, because the hourglass now sits INSIDE it. The time is encased, not
 * standing beside the ice.
 *
 * `melted` is still the only input that decides the fill, so the picture and
 * the figure beside it cannot disagree.
 */

/* 2:1 isometric, in the 86x88 space the component has always occupied. */
const TOP = 'M43 16 L72 32 L43 48 L14 32 Z'
const LEFT = 'M14 32 L43 48 L43 78 L14 62 Z'
const RIGHT = 'M72 32 L43 48 L43 78 L72 62 Z'
const BODY = `${LEFT} ${RIGHT}`

/** The body spans y 48 (top of the fill) to 78 (base). */
const BODY_TOP = 48
const BODY_BOT = 78

export function IceBlock({
  melted,
  elapsed,
  phase,
  detail = true,
  hourglass,
}: {
  melted: number
  /** Term elapsed 0..1. Drawn as a rime line when it outruns the melt. */
  elapsed: number
  phase: FrostPhase
  /** Fine passes are noise below ~110px. */
  detail?: boolean
  /** What the ice is holding. Rendered behind the front faces. */
  hourglass?: { progress: number; running: boolean; tone: 'frost' | 'warn' | 'spent' }
}) {
  const m = Math.min(1, Math.max(0, melted))
  const surfaceY = BODY_TOP + (BODY_BOT - BODY_TOP) * m
  const empty = phase === 'thawed' || m > 0.985

  return (
    <g class="frost-block">
      <defs>
        <linearGradient id="pf-top" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="var(--ice-100)" />
          <stop offset="55%" stop-color="var(--ice-300)" />
          <stop offset="100%" stop-color="var(--ice-500)" />
        </linearGradient>
        <linearGradient id="pf-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--ice-300)" stop-opacity="0.75" />
          <stop offset="100%" stop-color="var(--ice-900)" />
        </linearGradient>
        <linearGradient id="pf-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--ice-700)" />
          <stop offset="100%" stop-color="var(--ice-900)" />
        </linearGradient>
        <clipPath id="pf-body">
          <path d={BODY} />
        </clipPath>
      </defs>

      {/* The cavity: what the block would occupy, so an emptied one is a
          hollow rather than a hole. */}
      <path d={LEFT} fill="var(--ice-900)" opacity="0.3" />
      <path d={RIGHT} fill="var(--ice-900)" opacity="0.2" />

      {/* What the ice is holding, seen through it: dimmed and cooled, drawn
          before the faces so the front glass sits over it. */}
      {hourglass && !empty && (
        <g clip-path="url(#pf-body)">
          {/* A dark chamber behind it, so the glass has something to read
              against instead of the cavity's own blue. */}
          <path d={BODY} fill="#0b1420" opacity="0.55" />
          <g transform="translate(0 34.5)">
            <Hourglass {...hourglass} />
          </g>
        </g>
      )}

      {/* The remaining ice, translucent so the contents read through it. */}
      {!empty && (
        <g clip-path="url(#pf-body)">
          <rect
            x="10"
            y={surfaceY}
            width="66"
            height={BODY_BOT - surfaceY + 2}
            fill="url(#pf-left)"
            opacity="0.4"
          />
          <path d={RIGHT} fill="url(#pf-right)" opacity="0.3" />
          {/* light travelling down inside the body */}
          {detail && (
            <path
              class="frost-shimmer"
              d="M22 40 L31 45 L31 68 L22 63 Z"
              fill="var(--ice-100)"
              opacity="0.18"
            />
          )}
        </g>
      )}

      {/* The lid rides the fill: drawn at the top, a half-melted block looks
          untouched. */}
      {!empty && (
        <g transform={`translate(0 ${surfaceY - BODY_TOP})`}>
          <path d={TOP} fill="url(#pf-top)" opacity="0.9" />
          <path d="M43 19 L64 31 L52 38 L31 26 Z" fill="var(--ice-100)" opacity="0.45" />
          <path d={TOP} fill="none" stroke="var(--ice-100)" stroke-width="1" opacity="0.8" />
        </g>
      )}

      {/* Rime line: a vault with a 100% cliff releases nothing until the day
          it releases everything, so without this the block sits still for
          months and reads as broken. */}
      {phase === 'melting' && elapsed > m + 0.02 && (
        <line
          x1="17"
          x2="69"
          y1={BODY_TOP + (BODY_BOT - BODY_TOP) * elapsed}
          y2={BODY_TOP + (BODY_BOT - BODY_TOP) * elapsed}
          stroke="var(--ice-100)"
          stroke-width="0.9"
          stroke-dasharray="3 2.5"
          opacity="0.55"
        />
      )}

      {/* Silhouette stays whole, so what is gone reads as absence. */}
      <g fill="none" stroke="var(--ice-300)" stroke-width="1.1" stroke-linejoin="round" opacity="0.75">
        <path d={TOP} />
        <path d={LEFT} />
        <path d={RIGHT} />
      </g>

      <g class="frost-crack" stroke="var(--ice-100)" stroke-width="1.3" stroke-linecap="round" fill="none">
        <path d="M43 48 L36 58 L45 66 L40 78" />
        <path d="M36 58 L18 54" />
        <path d="M45 66 L68 60" />
      </g>

      {phase === 'melting' && m > 0.02 && m < 0.99 && (
        <g fill="var(--water)" opacity="0.85">
          <ellipse class="frost-drip" cx="28" cy={BODY_BOT + 1} rx="1.3" ry="1.9" />
          <ellipse class="frost-drip" cx="43" cy={BODY_BOT + 3} rx="1.1" ry="1.7" />
          <ellipse class="frost-drip" cx="58" cy={BODY_BOT + 1} rx="1.3" ry="1.9" />
        </g>
      )}

      <ellipse
        class="frost-puddle"
        cx="43"
        cy="80"
        rx={14 + 20 * m}
        ry={2 + 1.8 * m}
        fill="var(--water)"
        opacity={0.18 + 0.5 * m}
      />
    </g>
  )
}
