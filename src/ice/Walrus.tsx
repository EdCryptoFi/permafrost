import type { Character } from './character'

/**
 * Glacia, the walrus who sits on the proof.
 *
 * Drawn as layered SVG rather than built in a 3D engine. The reference
 * composition assembles her from Three.js primitives, which costs ~624 KB —
 * four times the entire application — for one decorative animal, inside a
 * budget where the whole site has to collapse into a single Walrus blob and
 * the embeddable badge has to stay under 40 KB gzipped on somebody else's
 * homepage. Radial gradients, an occlusion pass, fur strokes and a specular
 * highlight buy the same read for about 6 KB, animate on the compositor, and
 * scale from a 34px pill to a 1200px share card without a second asset.
 *
 * `detail` is the honest answer to "maximum detail": at 34px the fur strokes,
 * pores and breath vapour turn into grey noise, so below the threshold she
 * drops them rather than shipping mush. Same character, drawn for the size.
 */
export function Walrus({
  character,
  detail = true,
}: {
  character: Character
  detail?: boolean
}) {
  const c = character
  const wide = c.mood === 'alarmed'
  const shut = c.mood === 'asleep'

  return (
    <g class={`walrus is-${c.mood}`}>
      <defs>
        {/* Light sits front-left and slightly above, so the mass darkens to
            the lower right and the head catches a rim on the upper left. */}
        <radialGradient id="pf-hide" cx="34%" cy="24%" r="84%">
          <stop offset="0%" stop-color="#cfdcea" />
          <stop offset="46%" stop-color="#93a5bb" />
          <stop offset="100%" stop-color="#4e5f74" />
        </radialGradient>
        <radialGradient id="pf-belly" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#e4edf7" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#e4edf7" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="pf-head" cx="32%" cy="22%" r="80%">
          <stop offset="0%" stop-color="#dde7f2" />
          <stop offset="50%" stop-color="#a2b3c7" />
          <stop offset="100%" stop-color="#63748a" />
        </radialGradient>
        <radialGradient id="pf-muzzle" cx="38%" cy="26%" r="78%">
          <stop offset="0%" stop-color="#f4f8fc" />
          <stop offset="64%" stop-color="#c3d0dd" />
          <stop offset="100%" stop-color="#93a3b5" />
        </radialGradient>
        <linearGradient id="pf-tusk" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="62%" stop-color="#eef3f8" />
          <stop offset="100%" stop-color="#b9c6d3" />
        </linearGradient>
        <radialGradient id="pf-nose" cx="34%" cy="26%" r="76%">
          <stop offset="0%" stop-color="#6b7c8f" />
          <stop offset="100%" stop-color="#33414f" />
        </radialGradient>
      </defs>

      <g class="walrus-body">
        {/* Contact shadow. Without it she floats a pixel above her own ice. */}
        <ellipse cx="43" cy="39.6" rx="19.8" ry="3.4" fill="#0e2033" opacity="0.45" />

        {/* Tail flipper, behind the mass so it reads as far side. */}
        <path
          class="walrus-tail"
          d="M60.5 34.5 Q69 33 71.5 36.6 Q68.5 39.6 60.8 38.4 Z"
          fill="#4f6076"
        />

        {/* The mass resting on the ice — wide and low. */}
        <ellipse cx="43" cy="33.4" rx="18.6" ry="7.6" fill="url(#pf-hide)" />
        <ellipse cx="43" cy="34.6" rx="14" ry="5.4" fill="url(#pf-belly)" />
        {/* Rim light along the top edge. */}
        <ellipse cx="41.6" cy="30.4" rx="15.4" ry="4.3" fill="#dfeaf6" opacity="0.26" />

        {detail && (
          <g class="walrus-fur" stroke="#5c6d82" stroke-width="0.34" stroke-linecap="round" opacity="0.5">
            <path d="M31 31.6 q1.6 1.3 0.5 2.9" />
            <path d="M35.4 30.4 q1.7 1.4 0.6 3.1" />
            <path d="M50.6 30.6 q1.7 1.4 0.5 3.1" />
            <path d="M55 31.8 q1.6 1.3 0.4 2.9" />
            <path d="M46 36.6 q1.5 1.2 0.4 2.6" />
            <path d="M39 36.8 q1.5 1.2 0.4 2.6" />
          </g>
        )}

        {/* Front flippers. Tucked under the mass and angled forward rather
            than splayed straight out: splayed, the two ellipses plus the body
            drew one continuous wide disc and she read as a saucer with a face
            on it. Overlapping the silhouette is what makes them limbs. */}
        <g class="walrus-flipper-l" transform="rotate(-14 31 37)">
          <ellipse cx="31" cy="37.4" rx="5.6" ry="2.4" fill="#59697d" />
          <ellipse cx="30.6" cy="36.8" rx="3.9" ry="1.2" fill="#8496ab" opacity="0.6" />
          {detail && (
            <g stroke="#3b4957" stroke-width="0.3" opacity="0.75">
              <path d="M27.4 37.8 L31 38" />
              <path d="M28 38.5 L31.4 38.3" />
            </g>
          )}
        </g>
        <g class="walrus-flipper-r" transform="rotate(14 55 37)">
          <ellipse cx="55" cy="37.4" rx="5.6" ry="2.4" fill="#59697d" />
          <ellipse cx="55.4" cy="36.8" rx="3.9" ry="1.2" fill="#8496ab" opacity="0.6" />
          {detail && (
            <g stroke="#3b4957" stroke-width="0.3" opacity="0.75">
              <path d="M55 38 L58.6 37.8" />
              <path d="M54.6 38.3 L58 38.5" />
            </g>
          )}
        </g>

        {/* Head. */}
        <ellipse cx="43" cy="24.3" rx="10.6" ry="9.1" fill="url(#pf-head)" />
        {/* Occlusion where the head meets the body. */}
        <ellipse cx="43" cy="31.3" rx="9.7" ry="3.3" fill="#556678" opacity="0.36" />
        {/* Specular. */}
        <ellipse
          cx="38.4"
          cy="19.4"
          rx="3.2"
          ry="2.1"
          fill="#ffffff"
          opacity="0.32"
          transform="rotate(-22 38.4 19.4)"
        />
        {detail && (
          <>
            {/* Ear folds — tiny, but their absence is what made her read as a seal. */}
            <path d="M33.4 21.4 q-1.5 0.6 -1.3 2.1 q1.1 -0.5 1.6 -1.2 Z" fill="#7b8ca1" />
            <path d="M52.6 21.4 q1.5 0.6 1.3 2.1 q-1.1 -0.5 -1.6 -1.2 Z" fill="#7b8ca1" />
          </>
        )}

        {/* Snow settled on a head that has not moved in a year. */}
        {c.snowcap && (
          <path
            d="M34.2 19.6 Q37 15.6 43 15.2 Q49 15.6 51.8 19.6 Q47 17.6 43 17.5 Q39 17.6 34.2 19.6 Z"
            fill="#eaf5ff"
            opacity="0.92"
          />
        )}

        {c.beanie && (
          <g class="walrus-beanie">
            <path d="M33.2 20.4 Q34.4 12.6 43 12.2 Q51.6 12.6 52.8 20.4 Z" fill="#1f6fb2" />
            <rect x="32.6" y="19.8" width="20.8" height="3.1" rx="1.4" fill="#2f8ad4" />
            <circle cx="43" cy="11.4" r="2.1" fill="#eaf5ff" />
            <path d="M36.4 14.2 Q43 12.4 49.6 14.2" stroke="#2f8ad4" stroke-width="1" fill="none" />
          </g>
        )}

        {/* Brows carry most of the expression; the eyes only confirm it. */}
        {detail && (
          <g class="walrus-brow" stroke="#5f7086" stroke-width="0.9" stroke-linecap="round" fill="none">
            <path d={wide ? 'M36.2 17.9 L40.4 17.2' : 'M36.4 18.6 L40.4 18.2'} />
            <path d={wide ? 'M49.8 17.9 L45.6 17.2' : 'M49.6 18.6 L45.6 18.2'} />
          </g>
        )}

        {/* Eyes. An iris and a catchlight, not a dot: a flat black circle has
            no direction, and a character who cannot look at anything cannot
            look worried when the cliff lands. */}
        <Eye cx={38.9} cy={21.5} wide={wide} shut={shut} detail={detail} />
        <Eye cx={47.1} cy={21.5} wide={wide} shut={shut} detail={detail} />

        {/* Two lenses and a bridge, never one bar: a single dark rectangle
            across the eyes reads as a bandit mask, not as sunglasses. */}
        {c.shades && (
          <g class="walrus-shades">
            <rect x="36" y="19.6" width="5.8" height="3.8" rx="1.8" fill="#111f2d" />
            <rect x="44.2" y="19.6" width="5.8" height="3.8" rx="1.8" fill="#111f2d" />
            <path d="M41.8 21 L44.2 21" stroke="#111f2d" stroke-width="1.2" />
            <path d="M36 21 L33.2 20.2" stroke="#111f2d" stroke-width="0.9" />
            <path d="M50 21 L52.8 20.2" stroke="#111f2d" stroke-width="0.9" />
            <rect x="36.8" y="20.2" width="2.3" height="1.4" rx="0.7" fill="#6fb6de" opacity="0.9" />
            <rect x="45" y="20.2" width="2.3" height="1.4" rx="0.7" fill="#6fb6de" opacity="0.9" />
          </g>
        )}

        {/* Muzzle: two overlapping jowls rather than one oval. A single
            ellipse reads as a snout on a sphere; the seam down the middle is
            what makes it a walrus. */}
        <ellipse cx="39.7" cy="28.9" rx="4.9" ry="4.8" fill="url(#pf-muzzle)" />
        <ellipse cx="46.3" cy="28.9" rx="4.9" ry="4.8" fill="url(#pf-muzzle)" />
        <ellipse cx="43" cy="28.7" rx="6.4" ry="4.4" fill="url(#pf-muzzle)" />
        {detail && (
          <path
            d="M43 27.6 L43 31.4"
            stroke="#a9b8c8"
            stroke-width="0.4"
            opacity="0.55"
            stroke-linecap="round"
          />
        )}
        {detail && (
          <g fill="#98a8ba" opacity="0.55">
            <circle cx="39.6" cy="28.2" r="0.28" />
            <circle cx="38.6" cy="29.6" r="0.28" />
            <circle cx="40.2" cy="30.4" r="0.28" />
            <circle cx="46.4" cy="28.2" r="0.28" />
            <circle cx="47.4" cy="29.6" r="0.28" />
            <circle cx="45.8" cy="30.4" r="0.28" />
          </g>
        )}
        {/* Nose, with a wet highlight — the single cue that sells "animal". */}
        <ellipse cx="43" cy="26.5" rx="1.7" ry="1.25" fill="url(#pf-nose)" />
        <ellipse cx="42.5" cy="26.1" rx="0.6" ry="0.4" fill="#ffffff" opacity="0.6" />
        {/* Mouth, under the muzzle: a small open O when alarmed. */}
        {wide ? (
          <ellipse cx="43" cy="31.4" rx="1.5" ry="1.1" fill="#3a4856" />
        ) : (
          <path
            d="M40.6 31 Q43 32.3 45.4 31"
            stroke="#7d8ea2"
            stroke-width="0.6"
            fill="none"
            stroke-linecap="round"
          />
        )}

        {/* Whiskers. Three per side, each on its own delay, so the row ripples
            instead of flapping as one rigid comb. */}
        <g class="walrus-whiskers" stroke="#6e7f93" stroke-width="0.5" stroke-linecap="round">
          <path class="wk" d="M37.6 28.2 L31.8 26.8" />
          <path class="wk" d="M37.4 29.6 L31.4 29.4" />
          {detail && <path class="wk" d="M37.8 31 L32.4 32" />}
          <path class="wk" d="M48.4 28.2 L54.2 26.8" />
          <path class="wk" d="M48.6 29.6 L54.6 29.4" />
          {detail && <path class="wk" d="M48.2 31 L53.6 32" />}
        </g>

        {/* Tusks. Tapered to a point and curved slightly outward: two
            straight slabs of the same width read as a bib, not as ivory.
            One is chipped — a walrus who has been doing this a while. */}
        <g class="walrus-tusks">
          <path d="M40.6 30.6 Q40.2 34.6 39.3 38.4 L40.9 38.4 Q41.4 34.4 41.7 30.6 Z" fill="url(#pf-tusk)" />
          <path d="M45.4 30.6 Q45.8 34.6 46.7 38.4 L45.1 38.4 Q44.6 34.4 44.3 30.6 Z" fill="url(#pf-tusk)" />
          {detail && (
            <>
              <path d="M41.1 31.4 Q40.8 34.6 40.2 37.4" stroke="#ffffff" stroke-width="0.35" fill="none" opacity="0.9" />
              <path d="M44.9 31.4 Q45.2 34.6 45.8 37.4" stroke="#ffffff" stroke-width="0.35" fill="none" opacity="0.55" />
              {/* the chip */}
              <path d="M46.7 38.4 L45.9 37.1 L46.4 37 Z" fill="#0c1a28" opacity="0.4" />
            </>
          )}
        </g>

        {c.scarf && (
          <g class="walrus-scarf">
            <path d="M32.4 31.4 Q43 35.4 53.6 31.4 L53.6 34.4 Q43 38.4 32.4 34.4 Z" fill="#d0402f" />
            <path d="M32.4 31.4 Q43 35.4 53.6 31.4 L53.6 32.6 Q43 36.6 32.4 32.6 Z" fill="#e8624f" opacity="0.75" />
            <path class="walrus-tassel" d="M50.6 33.8 L54.6 40 L51 40.6 L49 34.6 Z" fill="#a93226" />
            {detail && (
              <g stroke="#a93226" stroke-width="0.5" opacity="0.8">
                <path d="M36.2 32.6 L36.6 35.6" />
                <path d="M43 34.4 L43 37.4" />
                <path d="M49.6 32.8 L49.2 35.6" />
              </g>
            )}
          </g>
        )}

        {/* Breath. It is below freezing on that block; if she is alive and it
            is cold, the air in front of her nose has to show it. */}
        {detail && c.breath && (
          <g class="walrus-breath" fill="#e6f4ff">
            <circle class="bp" cx="43" cy="27.6" r="1.1" />
            <circle class="bp" cx="43" cy="27.6" r="0.85" />
          </g>
        )}

        {/* Zs, only while she is genuinely out. */}
        {detail && c.zzz && (
          <g
            class="walrus-zzz"
            fill="#d8f2fd"
            font-family="monospace"
            font-weight="700"
          >
            <text class="z1" x="53" y="17" font-size="5">z</text>
            <text class="z2" x="57" y="12.4" font-size="4">z</text>
            <text class="z3" x="60.4" y="8.6" font-size="3">z</text>
          </g>
        )}
      </g>
    </g>
  )
}

/**
 * One eye.
 *
 * The lid is a rounded rect scaled from its top edge, so a blink closes
 * downward like a lid rather than shrinking like a dot — the difference
 * between "asleep" and "glitched".
 */
function Eye({
  cx,
  cy,
  wide,
  shut,
  detail,
}: {
  cx: number
  cy: number
  wide: boolean
  shut: boolean
  detail: boolean
}) {
  const r = wide ? 2.1 : 1.7
  return (
    <g class={`walrus-eye ${shut ? 'is-shut' : ''}`}>
      <circle cx={cx} cy={cy} r={r} fill="#101a24" />
      {detail && <circle cx={cx} cy={cy} r={r * 0.62} fill="#24506e" />}
      <circle class="walrus-pupil" cx={cx} cy={cy} r={r * 0.36} fill="#050b12" />
      <circle cx={cx + 0.35 * r} cy={cy - 0.42 * r} r={r * 0.3} fill="#ffffff" opacity="0.95" />
      {detail && (
        <circle cx={cx - 0.5 * r} cy={cy + 0.5 * r} r={r * 0.16} fill="#ffffff" opacity="0.45" />
      )}
      <rect
        class="walrus-lid"
        x={cx - r - 0.3}
        y={cy - r - 0.3}
        width={r * 2 + 0.6}
        height={r * 2 + 0.6}
        rx={r}
        fill="#9fb0c4"
      />
    </g>
  )
}
