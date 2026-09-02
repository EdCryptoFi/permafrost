import { useState } from 'preact/hooks'
import type { Frost } from '@/chain/frost'

/**
 * Where the badge build is published.
 *
 * In dev the production name may not be pointing at our blob yet (a freshly
 * registered .epoch still serves its starter template, which 404s here), so
 * the preview would render an empty box and look broken. Fall back to this
 * same dev server, which serves /badge.html from the second entry point.
 */
const BADGE_ORIGIN =
  import.meta.env.VITE_BADGE_ORIGIN ??
  (import.meta.env.DEV ? location.origin : 'https://frostbadge.epochsui.com')

/** The dev server serves the badge at /badge.html; production serves it at /. */
const BADGE_PATH = import.meta.env.DEV && !import.meta.env.VITE_BADGE_ORIGIN ? '/badge.html' : '/'

export function Embed({ frost }: { frost: Frost }) {
  const [variant, setVariant] = useState<'pill' | 'card'>('pill')
  const [mascot, setMascot] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const src = `${BADGE_ORIGIN}${BADGE_PATH}?id=${frost.id}&variant=${variant}${mascot ? '' : '&mascot=0'}`
  const dims = variant === 'card' ? { w: 300, h: 96 } : { w: 260, h: 48 }

  // What gets copied is always the public URL — never whatever the dev
  // server happens to be, which would ship a broken embed to someone's site.
  const publicSrc =
    `https://frostbadge.epochsui.com/?id=${frost.id}&variant=${variant}${mascot ? '' : '&mascot=0'}`

  const iframe =
    `<iframe src="${publicSrc}"\n` +
    `        width="${dims.w}" height="${dims.h}" frameborder="0"\n` +
    `        scrolling="no" loading="lazy" title="Locked on Epoch"></iframe>`

  // Some hosts ship a restrictive frame-src CSP and will block the iframe.
  // Nothing we can do from our side, so ship the fallback in the same panel.
  const fallback = `<a href="https://suiscan.xyz/mainnet/object/${frost.id}">🔒 Locked on Epoch</a>`

  const copy = async (text: string, which: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 1600)
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
        />
      </div>

      <pre class="code mono">{iframe}</pre>
      <button class="btn" onClick={() => copy(iframe, 'iframe')}>
        {copied === 'iframe' ? 'Copied' : 'Copy embed code'}
      </button>

      <details class="fold">
        <summary>Blocked by your site's CSP?</summary>
        <p class="muted">
          If your page sets a strict <code>frame-src</code>, the iframe will not render.
          Use the text fallback and it still links to the on-chain proof.
        </p>
        <pre class="code mono">{fallback}</pre>
        <button class="btn ghost" onClick={() => copy(fallback, 'fallback')}>
          {copied === 'fallback' ? 'Copied' : 'Copy fallback'}
        </button>
      </details>
    </section>
  )
}
