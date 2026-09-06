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
