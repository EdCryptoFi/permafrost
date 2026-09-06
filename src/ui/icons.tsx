/**
 * The icon set.
 *
 * One grid (24), one stroke weight (1.75), round caps and joins, no fills.
 * Drawn rather than fetched: an icon font would be a second network request in
 * a page that must collapse into one file, and emoji render differently on
 * every platform — which is the wrong property for a mark that appears inside
 * a proof.
 *
 * Every icon inherits `currentColor`, so a button changing state recolours its
 * icon with no extra rule.
 */
type IconProps = { size?: number; class?: string }

const base = (size: number, cls?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 1.75,
  'stroke-linecap': 'round' as const,
  'stroke-linejoin': 'round' as const,
  class: cls,
  'aria-hidden': true,
})

/** Six-point crystal. The mark, and the verb for freezing. */
export const IconFrost = ({ size = 18, class: c }: IconProps) => (
  <svg {...base(size, c)}>
    <path d="M12 2.75v18.5M4 7.25l16 9.5M20 7.25l-16 9.5" />
    <path d="M12 6.4l2.3-2.3M12 6.4L9.7 4.1M12 17.6l2.3 2.3M12 17.6l-2.3 2.3" />
    <path d="M7.1 9.4l-3.1-.5M7.1 14.6l-3.1.5M16.9 9.4l3.1-.5M16.9 14.6l3.1.5" />
  </svg>
)

/** A sealed block. Verification, the resting state. */
export const IconBlock = ({ size = 18, class: c }: IconProps) => (
  <svg {...base(size, c)}>
    <path d="M6.5 6.5h11l1.5 11h-14z" />
    <path d="M6.9 10.2h10.2" stroke-dasharray="2.5 2" />
    <path d="M12 13v4" />
  </svg>
)

/** Cracked block. The term has elapsed. */
export const IconCrack = ({ size = 18, class: c }: IconProps) => (
  <svg {...base(size, c)}>
    <path d="M6.5 6.5h11l1.5 11h-14z" />
    <path d="M12 6.5l-1.6 5 2.9 3.2-1.6 3.8" />
  </svg>
)

/** Hollow lattice. A lock holding nothing. */
export const IconHollow = ({ size = 18, class: c }: IconProps) => (
  <svg {...base(size, c)}>
    <path d="M6.5 6.5h11l1.5 11h-14z" stroke-dasharray="3 2.4" />
    <path d="M9.5 10.5l5 5M14.5 10.5l-5 5" />
  </svg>
)

/** Hourglass. Time running out on a lock. */
export const IconExpiring = ({ size = 18, class: c }: IconProps) => (
  <svg {...base(size, c)}>
    <path d="M7 3.5h10M7 20.5h10" />
    <path d="M8 3.5v3.2c0 2 4 3.6 4 5.3 0 1.7-4 3.3-4 5.3v3.2" />
    <path d="M16 3.5v3.2c0 2-4 3.6-4 5.3 0 1.7 4 3.3 4 5.3v3.2" />
  </svg>
)


/** Brackets. The embeddable artefact. */
export const IconEmbed = ({ size = 18, class: c }: IconProps) => (
  <svg {...base(size, c)}>
    <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4" />
    <path d="M13.2 5.5l-2.4 13" />
  </svg>
)


/** Question in a ring. Help. */
export const IconGuide = ({ size = 16, class: c }: IconProps) => (
  <svg {...base(size, c)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.7 9.4a2.4 2.4 0 1 1 2.9 2.4c-.5.1-.8.6-.8 1.1v.5" />
    <path d="M12 16.6h.01" />
  </svg>
)

/** A coin, edge on. */
export const IconCoin = ({ size = 16, class: c }: IconProps) => (
  <svg {...base(size, c)}>
    <circle cx="12" cy="12" r="7.5" />
    <path d="M12 8v8M10 10h3a1.6 1.6 0 0 1 0 3.2h-2.6a1.6 1.6 0 0 0 0 3.2H14" />
  </svg>
)

/** An isometric object. Anything that is not a coin. */
export const IconObject = ({ size = 16, class: c }: IconProps) => (
  <svg {...base(size, c)}>
    <path d="m12 3.5 8 4.3v8.4l-8 4.3-8-4.3V7.8z" />
    <path d="m4 7.8 8 4.3 8-4.3M12 12.1v8.4" />
  </svg>
)

