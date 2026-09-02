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
    locale: q.get('locale') ?? undefined,
  }
}

const root = document.getElementById('app')!
const opts = readOpts()

if (!opts) {
  root.innerHTML =
    '<span style="font:12px system-ui;color:#8aa0b2">PermaFrost badge: pass ?id=&lt;lock object id&gt;</span>'
} else {
  render(<Badge opts={opts} />, root)
}
