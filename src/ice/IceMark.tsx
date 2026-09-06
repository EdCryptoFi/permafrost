import type { Frost } from '@/chain/frost'
import { isHollow, urgencyOf } from '@/chain/frost'

/**
 * The static mark.
 *
 * `Frozen` is the animated instrument: it breathes, drips, cracks and carries
 * the walrus, and it belongs on a page somebody is reading. This is the other
 * thing — one still isometric block, no animation, no mascot — for the places
 * where the illustration is a label rather than a scene: a results row, a
 * card, a legend.
 *
 * It reads the same `Frost` and obeys the same rule: the fill level is the
 * number, so the picture cannot disagree with the figure beside it. What it
 * drops is motion, not honesty.
 *
 * Isometric because a flat trapezoid at 40px reads as a bucket; three faces
 * at 2:1 read as a solid the moment you see them.
 */

/** 2:1 isometric, 64 units square. */
const TOP = 'M32 6 L58 20 L32 34 L6 20 Z'
const LEFT = 'M6 20 L32 34 L32 58 L6 44 Z'
const RIGHT = 'M58 20 L32 34 L32 58 L58 44 Z'

type Tone = { top: string; left: string; right: string; edge: string }

const TONES: Record<string, Tone> = {
  frozen: { top: '#7df4ff', left: '#1a6ea8', right: '#0d3f63', edge: '#dbfcff' },
  expiring: { top: '#ffd486', left: '#b06c10', right: '#6d4208', edge: '#ffe6b8' },
  cracked: { top: '#9fb2c4', left: '#4a5a6b', right: '#2c3744', edge: '#c8d6e4' },
  thawed: { top: '#5b6b7c', left: '#33404e', right: '#1e2833', edge: '#6f8091' },
  hollow: { top: '#e8590c', left: '#9a3412', right: '#5c1f0a', edge: '#ff7518' },
}

function toneFor(f: Frost): keyof typeof TONES {
  if (isHollow(f)) return 'hollow'
  if (f.phase === 'thawed') return 'thawed'
  if (f.phase === 'cracked') return 'cracked'
  if (urgencyOf(f) !== 'none') return 'expiring'
  return 'frozen'
}

export function IceMark({ frost, size = 44 }: { frost: Frost; size?: number }) {
  const kind = toneFor(frost)
  const t = TONES[kind]!
  const uid = `im-${frost.id.slice(2, 8)}-${kind}`

  // How much is left. Vesting melts by what it released; an object lock is
  // cliff-only, so it stays whole until the term elapses.
  const gone = frost.kind === 'lock' ? (frost.phase === 'melting' ? 0 : 1) : frost.released
  const remain = Math.max(0, Math.min(1, 1 - gone))
  // 34 is the top face, 58 the base: the fill line rides between them.
  const fillTop = 34 + (58 - 34) * (1 - remain)

  const empty = kind === 'thawed' || remain <= 0.02

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={label(kind)}
      style="flex-shrink:0"
    >
      <defs>
        <clipPath id={uid}>
          <path d={`${LEFT} ${RIGHT}`} />
        </clipPath>
        {/* Light enters upper-left, so the lid brightens toward it and each
            side face falls away from it. */}
        <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color={t.edge} />
          <stop offset="55%" stop-color={t.top} />
          <stop offset="100%" stop-color={t.left} />
        </linearGradient>
        <linearGradient id={`${uid}-left`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color={t.top} stop-opacity="0.55" />
          <stop offset="45%" stop-color={t.left} />
          <stop offset="100%" stop-color={t.right} />
        </linearGradient>
        <linearGradient id={`${uid}-right`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color={t.left} />
          <stop offset="100%" stop-color={t.right} />
        </linearGradient>
      </defs>

      {/* the hollow it would occupy, so an emptied block is a cavity and not a hole */}
      <path d={LEFT} fill={t.right} opacity="0.22" />
      <path d={RIGHT} fill={t.right} opacity="0.14" />

      {!empty && (
        <g clip-path={`url(#${uid})`}>
          <rect x="0" y={fillTop} width="64" height="64" fill={`url(#${uid}-left)`} />
          <path d={RIGHT} fill={`url(#${uid}-right)`} opacity="0.9" />
          {/* Light travelling through the body rather than sitting on it. */}
          <path d="M18 30 L26 34 L26 52 L18 48 Z" fill={t.edge} opacity="0.14" />
        </g>
      )}

      {/* The lid rides the fill. Drawing it at the top left a 40%-full block
          looking untouched — the one thing this mark exists to show. */}
      {!empty && (
        <g transform={`translate(0 ${fillTop - 34})`}>
          <path d={TOP} fill={`url(#${uid}-top)`} />
          {/* The specular. Ice reflects; a flat lid reads as card stock. */}
          <path d="M32 9 L50 19 L38 25 L20 15 Z" fill={t.edge} opacity="0.5" />
          <path d="M32 9 L41 14 L34 17.5 L25 12.5 Z" fill="#ffffff" opacity="0.35" />
          <path d={TOP} fill="none" stroke={t.edge} stroke-width="1.4" stroke-linejoin="round" />
        </g>
      )}

      {/* silhouette stays whole, so what is gone is visible as absence */}
      <g fill="none" stroke={t.edge} stroke-width="1.4" stroke-linejoin="round" opacity="0.85">
        <path d={TOP} />
        <path d={LEFT} />
        <path d={RIGHT} />
      </g>

      {kind === 'cracked' && (
        <g fill="none" stroke={t.edge} stroke-width="1.6" stroke-linecap="round">
          <path d="M32 34 L26 42 L33 48 L29 58" />
          <path d="M26 42 L14 40" />
          <path d="M33 48 L48 44" />
        </g>
      )}

      {kind === 'hollow' && (
        <g fill="none" stroke={t.edge} stroke-width="1.6" stroke-linecap="round">
          <path d="M20 28 L44 44" />
          <path d="M44 28 L20 44" />
        </g>
      )}

      {/* Nothing left but what it turned into. Bright enough to read as a
          puddle rather than as a rendering that failed. */}
      {kind === 'thawed' && (
        <g>
          <ellipse cx="32" cy="53" rx="23" ry="6" fill="#0d9488" opacity="0.55" />
          <ellipse cx="32" cy="52" rx="15" ry="3.6" fill="#38bdf8" opacity="0.4" />
        </g>
      )}
    </svg>
  )
}

function label(kind: string): string {
  switch (kind) {
    case 'hollow':
      return 'Lock holding nothing'
    case 'thawed':
      return 'Fully claimed'
    case 'cracked':
      return 'Term elapsed'
    case 'expiring':
      return 'Unlocking soon'
    default:
      return 'Frozen'
  }
}
