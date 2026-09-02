/**
 * Freeze a live scene into something an `<img>` can render.
 *
 * The ice SVG on the page is alive: its colours come from CSS custom
 * properties on `:root`, and half its elements are parked at `opacity: 0` or
 * `scaleY(0)` waiting for a keyframe. Serialise it as-is and drop it into a
 * data URL and you get a picture with no stylesheet attached — every variable
 * resolves to nothing, every animated element renders at its raw attribute
 * value, and the walrus comes out as a grey lump with her eyelids shut over
 * her eyes and her cracks drawn on a block that has not cracked.
 *
 * So the card does not screenshot the scene. It takes a clone, resolves every
 * variable against the live computed style, and pins each animated element at
 * the frame that matches this lock's actual phase. What comes out is the same
 * drawing the visitor is looking at, held still.
 */
import type { Frost } from '@/chain/frost'

/**
 * Pull `var(--x)` / `var(--x, fallback)` down to a literal value.
 *
 * The substitution happens inside XML attribute values, so anything the
 * variable expands to has to survive being one. `--mono` resolves to a font
 * stack that begins `"JetBrains Mono", ...` — dropping that in raw closes the
 * attribute early and the whole document stops being well-formed, which is
 * exactly how this silently produced a blank frame instead of a walrus.
 */
function resolveVars(svg: string): string {
  const style = getComputedStyle(document.documentElement)
  return svg.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (_m, name: string, fb?: string) => {
    const v = style.getPropertyValue(name).trim() || (fb ?? '').trim() || 'currentColor'
    return v.replace(/"/g, "'").replace(/&/g, '&amp;').replace(/</g, '&lt;')
  })
}

/** Elements the stylesheet normally animates, pinned to the right frame. */
function pin(root: SVGElement, frost: Frost) {
  const all = (sel: string) => Array.from(root.querySelectorAll<SVGElement>(sel))

  // Eyelids are scaled to zero by the blink keyframes. With no stylesheet they
  // render at full height, which closes her eyes permanently.
  for (const lid of all('.walrus-lid')) lid.remove()

  // Cracks are drawn with a dash offset that the keyframes pull to zero.
  const cracked = frost.phase === 'cracked' || frost.phase === 'thawed'
  for (const c of all('.frost-crack')) {
    c.setAttribute('opacity', cracked ? '1' : '0')
    c.setAttribute('stroke-dashoffset', '0')
  }

  // She has slid off the block in both of those phases.
  if (cracked) {
    for (const w of all('.walrus')) {
      w.setAttribute('transform', 'translate(17 23) scale(0.72) rotate(12 43 30)')
    }
  }

  // Everything else that starts invisible and is revealed by a keyframe.
  for (const d of all('.frost-drip')) d.setAttribute('opacity', '0.85')
  for (const b of all('.walrus-breath .bp')) b.setAttribute('opacity', '0.3')
  for (const z of all('.walrus-zzz text')) z.setAttribute('opacity', '0.75')
  for (const s of all('.frost-snow')) s.setAttribute('opacity', '0.8')
}

/**
 * A standalone SVG string for `frost`'s scene, taken from the node already on
 * the page so the card can never drift from what the visitor was shown.
 */
const RASTER_W = 640

export function freezeScene(source: SVGSVGElement, frost: Frost): string {
  const clone = source.cloneNode(true) as SVGSVGElement
  pin(clone, frost)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  // Chrome rasterises an SVG image at its intrinsic size and then scales the
  // bitmap, so the on-page size (240px) would land on the card as a soft
  // upscale. Give the clone the size it will actually be drawn at.
  clone.setAttribute('width', String(RASTER_W))
  clone.setAttribute('height', String(Math.round(RASTER_W * (88 / 86))))

  const out = resolveVars(new XMLSerializer().serializeToString(clone))

  // A malformed document fails to decode with no error worth the name, so
  // check it here where the cause is still in reach.
  const err = new DOMParser().parseFromString(out, 'image/svg+xml').querySelector('parsererror')
  if (err) throw new Error('Scene did not serialise to well-formed SVG.')
  return out
}

/** Decode an SVG string into something `drawImage` accepts. */
export function svgToImage(svg: string): Promise<HTMLImageElement> {
  // A data URL rather than a blob URL: blob URLs inherit the document origin,
  // and some engines still taint a canvas drawn from one, which would make
  // `toBlob` throw exactly where the share button needs it not to.
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'sync'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not rasterise the scene.'))
    img.src = url
  })
}
