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
