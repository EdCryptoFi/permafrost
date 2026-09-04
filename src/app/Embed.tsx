import { useState } from 'preact/hooks'
import type { Frost } from '@/chain/frost'

/**
 * Where the badge build is published.
 *
 * Two different URLs on purpose:
 *
 *   `previewSrc` is what the iframe on THIS page loads. It stays same-origin
 *   whenever it can, so the preview works on every deployment (a freshly
 *   registered .epoch still serves its starter template, which 404s here and
 *   made the preview look broken) and so the app never has to allow a
 *   third-party frame in its own content policy.
 *
 *   `publicSrc` is what gets copied. It must be the address that will still be
 *   serving this badge tomorrow — never whatever dev server happens to be
 *   running, which would ship a dead embed onto somebody's site.
 */
const BADGE_ORIGIN = import.meta.env.VITE_BADGE_ORIGIN || location.origin

/** Dev serves the badge at /badge.html; the built site serves it at /badge/. */
const BADGE_PATH = import.meta.env.VITE_BADGE_ORIGIN
  ? '/'
  : import.meta.env.DEV
    ? '/badge.html'
    : '/badge/'

/** Overridable so a Walrus deployment can point at its own .epoch name. */
/**
 * What the copy button hands out.
 *
 * `${location.origin}/badge/` is right for a host that serves directories, and
 * wrong for the primary target: every path on a .epoch name serves that name's
 * single blob, so permafrost.epochsui.com/badge/ returns the APP — the whole
 * site nested inside a 260x48 iframe. The badge lives under its own name, so
 * that name is the default, and VITE_PUBLIC_BADGE_URL overrides it for mirrors.
 */
const PUBLIC_BADGE =
  import.meta.env.VITE_PUBLIC_BADGE_URL || 'https://frostbadge.epochsui.com/'

/**
 * Ids come from the chain, but this one is about to be pasted into a string
 * that becomes HTML on somebody else's page. Validate at the boundary rather
 * than reasoning about how it got here — that reasoning is what rots.
 */
const safeId = (id: string) => (/^0x[0-9a-fA-F]{1,64}$/.test(id) ? id : '')

export function Embed({ frost }: { frost: Frost }) {
  const [variant, setVariant] = useState<'pill' | 'card'>('pill')
  const [mascot, setMascot] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const id = safeId(frost.id)
  const query = `?id=${id}&variant=${variant}${mascot ? '' : '&mascot=0'}`
  const src = `${BADGE_ORIGIN}${BADGE_PATH}${query}`
  const dims = variant === 'card' ? { w: 300, h: 96 } : { w: 260, h: 48 }

  const publicSrc = `${PUBLIC_BADGE}${query}`

  const iframe =
    `<iframe src="${publicSrc}"\n` +
    `        width="${dims.w}" height="${dims.h}" frameborder="0"\n` +
    `        scrolling="no" loading="lazy" title="Locked on Epoch"></iframe>`

  // Some hosts ship a restrictive frame-src CSP and will block the iframe.
  // Nothing we can do from our side, so ship the fallback in the same panel.
  const fallback = `<a href="https://suiscan.xyz/mainnet/object/${id}" rel="noopener">🔒 Locked on Epoch</a>`

  const copy = async (text: string, which: string) => {
    try {
      // `navigator.clipboard` is undefined outside a secure context, and an
      // unhandled rejection here leaves the button looking like it worked.
      await navigator.clipboard.writeText(text)
      setCopied(which)
    } catch {
      setCopied('failed')
    }
    setTimeout(() => setCopied(null), 1800)
  }

  return (
    <section class="panel">
      <h2>Embed this proof</h2>
      <p class="muted">
        Paste it on your site. The date is read from Sui on every page load — you
        cannot edit what it says, which is exactly why a visitor can trust it.
      </p>

      <div class="row">
        <div class="seg">
          <button class={variant === 'pill' ? 'on' : ''} onClick={() => setVariant('pill')}>
            Pill
          </button>
          <button class={variant === 'card' ? 'on' : ''} onClick={() => setVariant('card')}>
            Card
          </button>
        </div>
        <label class="check">
          <input type="checkbox" checked={mascot} onChange={(e) => setMascot(e.currentTarget.checked)} />
          Mascot
        </label>
      </div>

      <div class="preview">
        <iframe
          src={src}
          width={dims.w}
          height={dims.h}
          frameborder="0"
          scrolling="no"
          title="Badge preview"
          referrerpolicy="no-referrer"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        />
      </div>

      <pre class="code mono">{iframe}</pre>
      <button class="btn" onClick={() => void copy(iframe, 'iframe')}>
        {copied === 'iframe' ? 'Copied' : copied === 'failed' ? 'Select it manually' : 'Copy embed code'}
      </button>

      <details class="fold">
        <summary>Blocked by your site's CSP?</summary>
        <p class="muted">
          If your page sets a strict <code>frame-src</code>, the iframe will not render.
          Use the text fallback and it still links to the on-chain proof.
        </p>
        <pre class="code mono">{fallback}</pre>
        <button class="btn ghost" onClick={() => void copy(fallback, 'fallback')}>
          {copied === 'fallback' ? 'Copied' : 'Copy fallback'}
        </button>
      </details>
    </section>
  )
}
