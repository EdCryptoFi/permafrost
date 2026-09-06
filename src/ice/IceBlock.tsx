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

/* 2:1 isometric, in the 86x88 space the component has always occupied.
   Every vertex is rounded: real ice has no sharp corners, it melts its own
   edges first, and a hard vertex is what made this read as a diagram. */
const TOP =
  'M43 17 Q44.6 17 45.4 17.5 L70 31 Q71.4 31.8 71.4 32.6 Q71.4 33.4 70 34.2 ' +
  'L45.4 47.5 Q44.6 48 43 48 Q41.4 48 40.6 47.5 L16 34.2 Q14.6 33.4 14.6 32.6 ' +
  'Q14.6 31.8 16 31 L40.6 17.5 Q41.4 17 43 17 Z'
const LEFT =
  'M14.6 33.4 Q14.6 32.6 16 33.4 L40.6 47.5 Q42 48.3 42 49.6 L42 75.6 ' +
  'Q42 77.2 41 77.2 Q40 77.2 39 76.4 L16 63.2 Q14.6 62.4 14.6 61 Z'
const RIGHT =
  'M71.4 33.4 Q71.4 32.6 70 33.4 L45.4 47.5 Q44 48.3 44 49.6 L44 75.6 ' +
  'Q44 77.2 45 77.2 Q46 77.2 47 76.4 L70 63.2 Q71.4 62.4 71.4 61 Z'
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
        <linearGradient id="pf-top" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="40%" stop-color="var(--ice-100)" />
          <stop offset="100%" stop-color="var(--ice-300)" />
        </linearGradient>
        <linearGradient id="pf-left" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stop-color="var(--ice-100)" stop-opacity="0.95" />
          <stop offset="45%" stop-color="var(--ice-300)" stop-opacity="0.85" />
          <stop offset="100%" stop-color="var(--ice-500)" stop-opacity="0.9" />
        </linearGradient>
        <linearGradient id="pf-right" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stop-color="var(--ice-300)" stop-opacity="0.8" />
          <stop offset="100%" stop-color="var(--ice-700)" stop-opacity="0.9" />
        </linearGradient>
        <clipPath id="pf-body">
          <path d={BODY} />
        </clipPath>
        <filter id="pf-frost" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="4" seed="7" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.86  0 0 0 0 0.94  0 0 0 0 1  0 0 0 0.5 0"
          />
        </filter>
        <filter id="pf-soften" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
      </defs>

      {/* The cavity: what the block would occupy, so an emptied one is a
          hollow rather than a hole. */}
      <path d={LEFT} fill="var(--ice-900)" opacity="0.3" />
      <path d={RIGHT} fill="var(--ice-900)" opacity="0.2" />


      {/* The remaining ice, translucent so the contents read through it. */}
      {!empty && (
        <g clip-path="url(#pf-body)">
          <rect
            x="10"
            y={surfaceY}
            width="66"
            height={BODY_BOT - surfaceY + 2}
            fill="url(#pf-left)"
            opacity="0.8"
          />
          <path d={RIGHT} fill="url(#pf-right)" opacity="0.78" />
          {/* a thin wash over the whole face, so even the window is ice */}
          <rect
            x="10"
            y={surfaceY}
            width="66"
            height={BODY_BOT - surfaceY + 2}
            fill="var(--ice-300)"
            opacity="0.16"
          />
          {/* light travelling down inside the body */}
          {/* trapped air, scattering the light in patches */}
          {detail && (
            <rect
              x="10"
              y={surfaceY}
              width="66"
              height={BODY_BOT - surfaceY + 2}
              filter="url(#pf-frost)"
              opacity="0.75"
              style="mix-blend-mode:screen"
            />
          )}
          {detail && (
            <path
              class="frost-shimmer"
              d="M22 42 Q27 44 30 48 L30 68 Q26 66 22 62 Z"
              fill="#ffffff"
              opacity="0.2"
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

      {hourglass && !empty && (
        <g clip-path="url(#pf-body)">
          <g transform="translate(0 29)" opacity="0.62" filter="url(#pf-soften)">
            <Hourglass {...hourglass} />
          </g>
          {/* the tint the ice adds to whatever is under it */}
          <path d={BODY} fill="var(--ice-300)" opacity="0.1" />
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
      <g fill="none" stroke="var(--ice-100)" stroke-width="1.2" stroke-linejoin="round"
         stroke-linecap="round" opacity="0.5">
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
