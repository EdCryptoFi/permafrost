/**
 * The mascot, reclining so she reads as an animal lying ON the ice rather
 * than a head poking out of a bucket.
 *
 * Shaded with gradients instead of a 3D engine: the reference builds this
 * from Three.js primitives, which costs 624 KB — four times the entire app,
 * for one decorative animal, inside a budget where everything must collapse
 * into a single Walrus blob. Radial gradients, an occlusion shadow and a
 * specular highlight buy the same read for about 2 KB.
 */
export function Walrus({ scarf = false, shades = false }: { scarf?: boolean; shades?: boolean }) {
  return (
    <g class="walrus">
      <defs>
        {/* Light sits front-left and slightly above, so the body darkens to
            the lower right and the head catches a rim on the upper left. */}
        <radialGradient id="pf-hide" cx="34%" cy="26%" r="82%">
          <stop offset="0%" stop-color="#c2d0e0" />
          <stop offset="52%" stop-color="#93a5bb" />
          <stop offset="100%" stop-color="#5d6e84" />
        </radialGradient>
        <radialGradient id="pf-head" cx="33%" cy="24%" r="78%">
          <stop offset="0%" stop-color="#d5e0ec" />
          <stop offset="55%" stop-color="#a2b3c7" />
          <stop offset="100%" stop-color="#6c7d92" />
        </radialGradient>
        <radialGradient id="pf-muzzle" cx="38%" cy="28%" r="76%">
          <stop offset="0%" stop-color="#eef3f8" />
          <stop offset="70%" stop-color="#c3d0dd" />
          <stop offset="100%" stop-color="#9aa9ba" />
        </radialGradient>
        <linearGradient id="pf-tusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#c9d4de" />
        </linearGradient>
      </defs>

      <g class="walrus-body">
        {/* contact shadow on the ice */}
        <ellipse cx="43" cy="39.4" rx="19.5" ry="3.4" fill="#1c3348" opacity="0.42" />

        {/* the mass resting on the ice — wide and low */}
        <ellipse cx="43" cy="33.5" rx="18.5" ry="7.5" fill="url(#pf-hide)" />
        {/* rim light along the top edge */}
        <ellipse cx="42" cy="30.6" rx="15.5" ry="4.4" fill="#d9e6f2" opacity="0.24" />

        {/* flippers, splayed out on the surface */}
        <ellipse cx="27.5" cy="38" rx="6.5" ry="2.6" fill="#63758b" />
        <ellipse cx="58.5" cy="38" rx="6.5" ry="2.6" fill="#63758b" />
        <ellipse cx="27" cy="37.4" rx="4.6" ry="1.4" fill="#8496ab" opacity="0.7" />
        <ellipse cx="58" cy="37.4" rx="4.6" ry="1.4" fill="#8496ab" opacity="0.7" />

        {/* head */}
        <ellipse cx="43" cy="24.5" rx="10.5" ry="9" fill="url(#pf-head)" />
        {/* occlusion where the head meets the body */}
        <ellipse cx="43" cy="31.4" rx="9.6" ry="3.2" fill="#5d6e84" opacity="0.34" />
        {/* specular */}
        <ellipse cx="38.6" cy="19.8" rx="3.1" ry="2.1" fill="#ffffff" opacity="0.3" transform="rotate(-22 38.6 19.8)" />

        {/* muzzle + nose */}
        <ellipse cx="43" cy="29" rx="7.4" ry="5" fill="url(#pf-muzzle)" />
        <ellipse cx="43" cy="26.6" rx="1.5" ry="1.1" fill="#4a5a6b" />

        {/* tusks */}
        <path d="M40.3 30.6 L39.4 37.4 L41.3 37.4 L41.6 30.6 Z" fill="url(#pf-tusk)" />
        <path d="M45.7 30.6 L46.6 37.4 L44.7 37.4 L44.4 30.6 Z" fill="url(#pf-tusk)" />

        {/* whiskers */}
        <g class="walrus-whisker" stroke="#6e7f93" stroke-width="0.55" stroke-linecap="round">
          <path d="M37.8 28.8 L32.6 27.8" />
          <path d="M37.8 30.4 L32.8 30.8" />
          <path d="M48.2 28.8 L53.4 27.8" />
          <path d="M48.2 30.4 L53.2 30.8" />
        </g>

        {/* eyes */}
        <g>
          <circle cx="38.9" cy="21.6" r="1.6" fill="#1d2731" />
          <circle class="walrus-pupil" cx="39.25" cy="21.2" r="0.6" fill="#fff" />
          <rect class="walrus-lid" x="37.3" y="20" width="3.2" height="3.2" rx="1.6" fill="#a2b3c7" />
        </g>
        <g>
          <circle cx="47.1" cy="21.6" r="1.6" fill="#1d2731" />
          <circle class="walrus-pupil" cx="47.45" cy="21.2" r="0.6" fill="#fff" />
          <rect class="walrus-lid" x="45.5" y="20" width="3.2" height="3.2" rx="1.6" fill="#a2b3c7" />
        </g>

        {/* Two lenses and a bridge, not one bar: a single dark rectangle across
            the eyes reads as a bandit mask rather than as sunglasses. */}
        {shades && (
          <g>
            <rect x="36.2" y="19.9" width="5.6" height="3.6" rx="1.7" fill="#12202e" />
            <rect x="44.2" y="19.9" width="5.6" height="3.6" rx="1.7" fill="#12202e" />
            <path d="M41.8 21.2 L44.2 21.2" stroke="#12202e" stroke-width="1.1" />
            <rect x="37" y="20.5" width="2.2" height="1.4" rx="0.7" fill="#5f9ec4" opacity="0.9" />
            <rect x="45" y="20.5" width="2.2" height="1.4" rx="0.7" fill="#5f9ec4" opacity="0.9" />
          </g>
        )}

        {scarf && (
          <g>
            <path d="M32.6 31.6 Q43 35.4 53.4 31.6 L53.4 34.4 Q43 38.2 32.6 34.4 Z" fill="#d0402f" />
            <path d="M32.6 31.6 Q43 35.4 53.4 31.6 L53.4 32.6 Q43 36.4 32.6 32.6 Z" fill="#e8624f" opacity="0.75" />
            <path d="M50.6 33.8 L54.2 39.6 L50.8 40.2 L49 34.6 Z" fill="#a93226" />
          </g>
        )}
      </g>
    </g>
  )
}
