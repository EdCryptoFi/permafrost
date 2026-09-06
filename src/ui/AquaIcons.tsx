/**
 * Aqua icons.
 *
 * Mac OS X icons were photographs of objects that do not exist: a real light
 * source above and slightly in front, a specular highlight riding the top
 * third, a saturated body gradient, a dark rim where the form turns away, and
 * a soft contact shadow underneath. None of that is decoration — it is the
 * whole reason a 2001 icon reads as a thing you could pick up.
 *
 * So every icon here is built the same way, in this order:
 *   1. a contact shadow on the ground
 *   2. the body, lit top-to-bottom
 *   3. the rim, darker than anything in the body
 *   4. the specular cap, an ellipse clipped to the top of the form
 *
 * Gradient ids are prefixed per icon: three of these render side by side, and
 * SVG defs are global to the document — two `#body` would silently take each
 * other's fill.
 */

type IconProps = { size?: number; title?: string }

/** Verify: a magnifier. Chrome ring, cold glass, one arc of sun on the rim. */
export function AquaVerify({ size = 96, title }: IconProps) {
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
        <radialGradient id="av-glass" cx="38%" cy="30%" r="78%">
          <stop offset="0%" stop-color="#f2fbff" stop-opacity="0.96" />
          <stop offset="52%" stop-color="#a9dcf7" stop-opacity="0.72" />
          <stop offset="100%" stop-color="#3f8fc4" stop-opacity="0.82" />
        </radialGradient>
        <linearGradient id="av-chrome" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="18%" stop-color="#e3ecf4" />
          <stop offset="46%" stop-color="#8fa2b4" />
          <stop offset="58%" stop-color="#dfe8f0" />
          <stop offset="100%" stop-color="#71859a" />
        </linearGradient>
        <linearGradient id="av-grip" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stop-color="#e8eef5" />
          <stop offset="34%" stop-color="#9fb0c2" />
          <stop offset="70%" stop-color="#5f7386" />
          <stop offset="100%" stop-color="#8ea0b2" />
        </linearGradient>
        <linearGradient id="av-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
        {/* The cap is an ellipse cut to the glass, not drawn on top of it:
            a highlight that spills past the rim reads as a sticker. */}
        <clipPath id="av-clip">
          <circle cx="54" cy="52" r="30" />
        </clipPath>
      </defs>

      <ellipse cx="64" cy="116" rx="34" ry="6" fill="#0b1c34" opacity="0.22" />

      <rect
        x="72" y="72" width="17" height="44" rx="8.5"
        transform="rotate(-45 80.5 94)"
        fill="url(#av-grip)" stroke="#4b5d70" stroke-width="1.4"
      />

      <circle cx="54" cy="52" r="35" fill="url(#av-chrome)" stroke="#5a6c80" stroke-width="1.6" />
      <circle cx="54" cy="52" r="30" fill="url(#av-glass)" />
      <circle cx="54" cy="52" r="30" fill="none" stroke="#2c5f86" stroke-width="1.2" opacity="0.55" />

      <g clip-path="url(#av-clip)">
        <ellipse cx="52" cy="32" rx="24" ry="14" fill="url(#av-cap)" />
      </g>
      {/* The light that survives all the way round the bottom of a lens. */}
      <path
        d="M32 64 A 26 26 0 0 0 76 68"
        fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.4"
      />
    </svg>
  )
}

/** Freeze: the block, lit as an object rather than drawn as a diagram. */
export function AquaFreeze({ size = 96, title }: IconProps) {
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
        <linearGradient id="af-top" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="55%" stop-color="#e2f4ff" />
          <stop offset="100%" stop-color="#b6e0f7" />
        </linearGradient>
        <linearGradient id="af-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a9d6f0" />
          <stop offset="100%" stop-color="#5b9ec9" />
        </linearGradient>
        <linearGradient id="af-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8dc3e6" />
          <stop offset="100%" stop-color="#3d7ba8" />
        </linearGradient>
        <linearGradient id="af-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.92" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx="64" cy="114" rx="36" ry="7" fill="#0b1c34" opacity="0.22" />

      {/* left */}
      <path d="M20 44 L64 68 L64 116 L20 92 Z" fill="url(#af-left)" stroke="#2f6c96" stroke-width="1.3" stroke-linejoin="round" />
      {/* right */}
      <path d="M108 44 L64 68 L64 116 L108 92 Z" fill="url(#af-right)" stroke="#2f6c96" stroke-width="1.3" stroke-linejoin="round" />
      {/* top */}
      <path d="M64 20 L108 44 L64 68 L20 44 Z" fill="url(#af-top)" stroke="#5ea3cc" stroke-width="1.3" stroke-linejoin="round" />
      {/* the sun on the top face */}
      <path d="M64 26 L98 44 L64 62 L30 44 Z" fill="url(#af-cap)" opacity="0.75" />
      {/* the one bright edge, where the two lit faces meet */}
      <path d="M64 68 L64 116" stroke="#ffffff" stroke-width="1.6" opacity="0.35" />
    </svg>
  )
}

/** Deploy: a world with something going up to it. */
export function AquaDeploy({ size = 96, title }: IconProps) {
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
        <radialGradient id="ad-globe" cx="34%" cy="26%" r="82%">
          <stop offset="0%" stop-color="#bfe6ff" />
          <stop offset="42%" stop-color="#4ca0dc" />
          <stop offset="100%" stop-color="#123f6d" />
        </radialGradient>
        <linearGradient id="ad-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="ad-arrow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="46%" stop-color="#d8f0c4" />
          <stop offset="100%" stop-color="#4f9c34" />
        </linearGradient>
        <clipPath id="ad-clip">
          <circle cx="60" cy="60" r="40" />
        </clipPath>
      </defs>

      <ellipse cx="62" cy="115" rx="33" ry="6" fill="#0b1c34" opacity="0.22" />

      <circle cx="60" cy="60" r="40" fill="url(#ad-globe)" stroke="#0d3357" stroke-width="1.5" />
      <g clip-path="url(#ad-clip)" opacity="0.5" stroke="#dff2ff" fill="none" stroke-width="1.3">
        <ellipse cx="60" cy="60" rx="40" ry="16" />
        <ellipse cx="60" cy="60" rx="40" ry="31" />
        <ellipse cx="60" cy="60" rx="15" ry="40" />
        <ellipse cx="60" cy="60" rx="31" ry="40" />
        <path d="M20 60 H100" />
      </g>
      <g clip-path="url(#ad-clip)">
        <ellipse cx="52" cy="34" rx="30" ry="17" fill="url(#ad-cap)" />
      </g>

      {/* Going up, and out of the disc — the point is that it leaves here. */}
      <g transform="translate(84 84)">
        <circle cx="14" cy="14" r="20" fill="#0b1c34" opacity="0.2" />
        <circle cx="13" cy="13" r="19" fill="url(#ad-arrow)" stroke="#2f6f1c" stroke-width="1.4" />
        <path
          d="M13 5 L22 15 H17 V22 H9 V15 H4 Z"
          fill="#ffffff" stroke="#2f6f1c" stroke-width="1.1" stroke-linejoin="round"
        />
      </g>
    </svg>
  )
}

/** Guide: the help book. Aqua's was a book because a manual was a book. */
export function AquaGuide({ size = 96, title }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" role={title ? 'img' : 'presentation'} aria-label={title} aria-hidden={title ? undefined : 'true'}>
      <defs>
        <linearGradient id="ag-cover" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stop-color="#7fc0ee" />
          <stop offset="42%" stop-color="#2f7fc4" />
          <stop offset="100%" stop-color="#154f83" />
        </linearGradient>
        <linearGradient id="ag-page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#d3dde7" />
        </linearGradient>
        <linearGradient id="ag-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="64" cy="112" rx="36" ry="6" fill="#0b1c34" opacity="0.22" />
      <path d="M26 24 h58 a14 14 0 0 1 14 14 v62 a14 14 0 0 0 -14 -14 h-58 z" fill="url(#ag-page)" stroke="#8d9dae" stroke-width="1.3" stroke-linejoin="round" />
      <path d="M22 20 h56 a12 12 0 0 1 12 12 v60 a12 12 0 0 0 -12 -12 h-56 z" fill="url(#ag-cover)" stroke="#123f6d" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M28 26 h50 a8 8 0 0 1 8 8 v14 h-66 z" fill="url(#ag-cap)" />
      {/* The ribbon, which is what says this one is being read. */}
      <path d="M66 20 v42 l-8 -7 -8 7 v-42 z" fill="#e9b03a" stroke="#8a6412" stroke-width="1.2" stroke-linejoin="round" />
    </svg>
  )
}

/** What to freeze: a stack of coins, gold because Aqua's were. */
export function AquaCoins({ size = 96, title }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" role={title ? 'img' : 'presentation'} aria-label={title} aria-hidden={title ? undefined : 'true'}>
      <defs>
        <linearGradient id="ac-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f4cf6a" />
          <stop offset="100%" stop-color="#a97b16" />
        </linearGradient>
        <radialGradient id="ac-face" cx="36%" cy="30%" r="76%">
          <stop offset="0%" stop-color="#fff3cd" />
          <stop offset="55%" stop-color="#efc45f" />
          <stop offset="100%" stop-color="#c9971f" />
        </radialGradient>
      </defs>
      <ellipse cx="64" cy="114" rx="34" ry="6" fill="#0b1c34" opacity="0.22" />
      {[76, 60, 44].map((y) => (
        <g key={y}>
          <path d={`M24 ${y} a40 15 0 0 0 80 0 v12 a40 15 0 0 1 -80 0 z`} fill="url(#ac-edge)" stroke="#7d5a0c" stroke-width="1.2" />
          <ellipse cx="64" cy={y} rx="40" ry="15" fill="url(#ac-face)" stroke="#7d5a0c" stroke-width="1.2" />
        </g>
      ))}
      <ellipse cx="55" cy="39" rx="20" ry="6" fill="#ffffff" opacity="0.5" />
    </svg>
  )
}

/** Until when: the calendar, torn off at today. */
export function AquaCalendar({ size = 96, title }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" role={title ? 'img' : 'presentation'} aria-label={title} aria-hidden={title ? undefined : 'true'}>
      <defs>
        <linearGradient id="ak-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff8a7a" />
          <stop offset="48%" stop-color="#d93b28" />
          <stop offset="100%" stop-color="#9d2416" />
        </linearGradient>
        <linearGradient id="ak-page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#ccd6e0" />
        </linearGradient>
      </defs>
      <ellipse cx="64" cy="114" rx="34" ry="6" fill="#0b1c34" opacity="0.22" />
      <rect x="22" y="24" width="84" height="84" rx="12" fill="url(#ak-page)" stroke="#7f8fa0" stroke-width="1.5" />
      <path d="M22 36 a12 12 0 0 1 12 -12 h60 a12 12 0 0 1 12 12 v14 h-84 z" fill="url(#ak-head)" stroke="#8c2113" stroke-width="1.3" />
      <path d="M28 28 h72 v10 h-72 z" fill="#ffffff" opacity="0.32" />
      <g fill="#5d6c7c">
        <rect x="34" y="62" width="14" height="12" rx="2.5" />
        <rect x="57" y="62" width="14" height="12" rx="2.5" />
        <rect x="80" y="62" width="14" height="12" rx="2.5" />
        <rect x="34" y="82" width="14" height="12" rx="2.5" />
      </g>
      <rect x="57" y="82" width="14" height="12" rx="2.5" fill="#2f7fc4" />
    </svg>
  )
}

/** Who can claim it: a key, which is the only thing a beneficiary really is. */
export function AquaKey({ size = 96, title }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" role={title ? 'img' : 'presentation'} aria-label={title} aria-hidden={title ? undefined : 'true'}>
      <defs>
        <linearGradient id="ay-metal" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="26%" stop-color="#f0d68f" />
          <stop offset="60%" stop-color="#c79c2c" />
          <stop offset="100%" stop-color="#8d6a10" />
        </linearGradient>
      </defs>
      <ellipse cx="64" cy="112" rx="32" ry="6" fill="#0b1c34" opacity="0.22" />
      <g fill="url(#ay-metal)" stroke="none">
        <circle cx="44" cy="48" r="24" stroke="#7a5a0e" stroke-width="1.6" />
        <circle cx="44" cy="48" r="10" fill="#2a3440" />
        <path d="M60 56 L100 96 l-8 8 -8 -8 -6 6 -8 -8 -6 6 -14 -14 z" stroke="#7a5a0e" stroke-width="1.6" stroke-linejoin="round" />
      </g>
      <path d="M30 36 a24 24 0 0 1 22 -10" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.6" />
    </svg>
  )
}

/** The name a site answers to. */
export function AquaTag({ size = 96, title }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" role={title ? 'img' : 'presentation'} aria-label={title} aria-hidden={title ? undefined : 'true'}>
      <defs>
        <linearGradient id="at-body" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stop-color="#a9e0f7" />
          <stop offset="46%" stop-color="#3d95cf" />
          <stop offset="100%" stop-color="#16537f" />
        </linearGradient>
      </defs>
      <ellipse cx="64" cy="112" rx="32" ry="6" fill="#0b1c34" opacity="0.22" />
      <path d="M20 62 L62 20 h40 a6 6 0 0 1 6 6 v40 L66 108 a6 6 0 0 1 -8 0 L20 70 a6 6 0 0 1 0 -8 z"
        fill="url(#at-body)" stroke="#0f3f63" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M30 60 L64 26 h34 v10 L64 70 z" fill="#ffffff" opacity="0.3" />
      <circle cx="88" cy="40" r="9" fill="#e8f6ff" stroke="#0f3f63" stroke-width="1.5" />
    </svg>
  )
}

/** The blob a name points at. */
export function AquaBlob({ size = 96, title }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" role={title ? 'img' : 'presentation'} aria-label={title} aria-hidden={title ? undefined : 'true'}>
      <defs>
        <linearGradient id="ab-page" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#c9d5e0" />
        </linearGradient>
      </defs>
      <ellipse cx="64" cy="114" rx="30" ry="6" fill="#0b1c34" opacity="0.22" />
      <path d="M32 16 h44 l22 22 v70 a6 6 0 0 1 -6 6 H32 a6 6 0 0 1 -6 -6 V22 a6 6 0 0 1 6 -6 z"
        fill="url(#ab-page)" stroke="#7f8fa0" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M76 16 l22 22 h-22 z" fill="#9fb0c2" stroke="#7f8fa0" stroke-width="1.4" stroke-linejoin="round" />
      <g fill="#2f7fc4" opacity="0.85">
        <rect x="38" y="56" width="3" height="30" /><rect x="44" y="56" width="6" height="30" />
        <rect x="53" y="56" width="3" height="30" /><rect x="59" y="56" width="8" height="30" />
        <rect x="70" y="56" width="3" height="30" /><rect x="76" y="56" width="5" height="30" />
        <rect x="84" y="56" width="3" height="30" />
      </g>
    </svg>
  )
}
