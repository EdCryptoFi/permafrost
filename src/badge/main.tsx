import { render } from 'preact'
import '@/theme.css'
import { Badge, type BadgeOpts } from './Badge'
import { isSuiObjectId } from '@/chain/resolve'

/**
 * Badge entry point.
 *
 * Every Epoch Names path serves the same blob (verified: `/`, `/badge` and
 * `/x/y.html` all return byte-identical responses), so the query string is the
 * only routing we get — and the only routing we need.
 *
 *   <iframe src="https://permafrost-badge.epochsui.com/?id=0x…&variant=pill">
 */
function readOpts(): BadgeOpts | null {
  const q = new URLSearchParams(location.search)
  const id = (q.get('id') ?? q.get('lock') ?? q.get('badge') ?? '').trim()
  if (!isSuiObjectId(id)) return null
  return {
    id,
    variant: q.get('variant') === 'card' ? 'card' : 'pill',
    mascot: q.get('mascot') !== '0',
    // Every one of these comes from a URL an embedder wrote, so each is
    // validated rather than trusted. `locale` in particular reaches
    // `toLocaleDateString`, which throws a RangeError on anything that is not
    // a well-formed tag — `?locale=x` would take the badge down on somebody
    // else's homepage, which is the one place it must never fail.
    locale: validLocale(q.get('locale')),
  }
}

const LOCALE_RE = /^[A-Za-z]{2,8}(-[A-Za-z0-9]{2,8})*$/
function validLocale(v: string | null): string | undefined {
  if (!v || !LOCALE_RE.test(v)) return undefined
  try {
    new Intl.DateTimeFormat(v)
    return v
  } catch {
    return undefined
  }
}

/**
 * The badge cannot know what page it lands on, so the embedder tells it.
 * `&appearance=aqua` for a light host; graphite otherwise, which is what a
 * dark page and most DEX widgets want.
 */
{
  const a = new URLSearchParams(location.search).get('appearance')
  document.documentElement.dataset.appearance = a === 'aqua' ? 'aqua' : 'graphite'
  // Deliberately NOT setting `color-scheme`. A frame whose canvas is
  // transparent composites onto the host page — but only while nothing has
  // declared a scheme. Declare one and the browser paints its base colour
  // underneath instead: white for light, near-black for dark. Both were tried
  // here, and both are a card the host did not ask for.
}

const root = document.getElementById('app')!
const opts = readOpts()

if (!opts) {
  // Built as a node rather than assigned as HTML: this file is the entry point
  // for a document that renders inside other people's pages, and "no string
  // ever becomes markup here" is a property worth being able to grep for.
  const hint = document.createElement('span')
  hint.style.cssText = 'font:12px system-ui;color:#8aa0b2'
  hint.textContent = 'PermaFrost badge: pass ?id=<lock object id>'
  root.replaceChildren(hint)
} else {
  render(<Badge opts={opts} />, root)
}

/**
 * Tell the host how big this badge actually is.
 *
 * An iframe cannot size itself, and the badge has no fixed size to hardcode:
 * a pill holding "1,230,000 EPT" is 63px tall, one saying "Checking the
 * chain…" is 30px, and the width follows the ticker. Guessing a box for it
 * clips the amount off the bottom on somebody else's homepage — the one place
 * this must never happen.
 *
 * So it measures itself and says so. Hosts that listen (our own embed panel)
 * fit the frame to the badge; hosts that don't are unaffected, which is why
 * this is a message and not a demand.
 */
if (window.parent !== window) {
  const post = () => {
    const r = document.body.getBoundingClientRect()
    if (!r.width || !r.height) return
    // '*' rather than an origin: the whole point is to work on pages whose
    // address we cannot know. Nothing here is secret — it is two integers
    // about a public badge — and the receiver validates before believing it.
    window.parent.postMessage(
      { source: 'permafrost-badge', w: Math.ceil(r.width), h: Math.ceil(r.height) },
      '*',
    )
  }
  new ResizeObserver(post).observe(document.body)
  addEventListener('load', post)
}
