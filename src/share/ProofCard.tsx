import { useEffect, useRef, useState } from 'preact/hooks'
import type { Frost } from '@/chain/frost'
import { assetLabel, msLeft } from '@/chain/frost'
import { fmtAsset, fmtCountdown, fmtDate } from '@/format'
import { Frozen } from '@/ice/Frozen'
import { freezeScene } from './svg'
import { CARD_H, CARD_W, SKINS, cardBlob, paintCard, type Skin } from './card'
import './share.css'

/**
 * Share the proof, not a screenshot of it.
 *
 * The moment somebody finishes locking their LP, the next thing they want is
 * to tell people — and the only artefact the market had for that was a
 * screenshot, the exact forgeable object this whole product exists to replace.
 * So the card carries the lock id and a URL that re-reads Sui, which makes it
 * the rare social image that can be checked instead of believed. It is a
 * poster for a proof, never the proof itself, and the wording on it says so.
 *
 * Three ways out, because platforms disagree about images:
 *   - native share sheet with the file attached (mobile, and Safari desktop)
 *   - copy the PNG to the clipboard (Chromium; paste straight into the post)
 *   - download, then attach it by hand (works everywhere, including nowhere)
 * The X button opens an intent with the text and link filled in. No platform
 * lets a web page attach an image to a post on the user's behalf, so the UI
 * says that plainly rather than pretending and losing the image silently.
 */
export function ProofCard({
  frost,
  onClose,
  celebrate = false,
}: {
  frost: Frost
  onClose: () => void
  celebrate?: boolean
}) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [skin, setSkin] = useState<Skin>('chaos')
  const [png, setPng] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [text, setText] = useState(() => defaultText(frost))

  const verifyUrl = `${location.origin}${location.pathname}?id=${frost.id}`

  useEffect(() => {
    let alive = true
    const svg = sceneRef.current?.querySelector('svg')
    if (!svg) return
    setPng(null)
    setFailed(false)
    ;(async () => {
      try {
        const canvas = await paintCard({
          frost,
          skin,
          sceneSvg: freezeScene(svg as SVGSVGElement, frost),
          verifyUrl,
        })
        const b = await cardBlob(canvas)
        if (!alive) return
        setBlob(b)
        setPng(canvas.toDataURL('image/png'))
      } catch {
        if (alive) setFailed(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [frost.id, frost.nowMs, skin])

  // Escape closes, and focus is trapped to the dialog while it is open — a
  // modal you cannot leave with the keyboard is a modal that locks people out.
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, a[href], textarea, input, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const flash = (m: string) => {
    setNote(m)
    setTimeout(() => setNote(null), 2200)
  }

  const download = () => {
    if (!png) return
    const a = document.createElement('a')
    a.href = png
    a.download = `permafrost-${frost.id.slice(0, 10)}.png`
    a.click()
    flash('Saved. Attach it to the post.')
  }

  const copyImage = async () => {
    if (!blob) return
    try {
      // Feature-detected rather than assumed: Firefox has no ClipboardItem for
      // images, and an await on a missing constructor throws a stack trace at
      // someone who just wanted to share a lock.
      const Item = (window as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem
      if (!Item || !navigator.clipboard?.write) throw new Error('unsupported')
      await navigator.clipboard.write([new Item({ 'image/png': blob })])
      flash('Image copied — paste it into the post.')
    } catch {
      flash('This browser will not copy images. Use Download.')
    }
  }

  const nativeShare = async () => {
    if (!blob) return
    const file = new File([blob], `permafrost-${frost.id.slice(0, 10)}.png`, {
      type: 'image/png',
    })
    const data: ShareData = { title: 'Locked on Epoch', text, url: verifyUrl, files: [file] }
    try {
      if (navigator.canShare?.(data) && navigator.share) {
        await navigator.share(data)
        return
      }
      throw new Error('unsupported')
    } catch (e) {
      // A cancelled share sheet is not a failure worth shouting about.
      if (e instanceof DOMException && e.name === 'AbortError') return
      flash('No share sheet here. Copy or download the image instead.')
    }
  }

  const postToX = () => {
    const url = new URL('https://twitter.com/intent/tweet')
    url.searchParams.set('text', text)
    url.searchParams.set('url', verifyUrl)
    // `noopener` matters on an intent window: without it the opened tab keeps
    // a handle on this one through `window.opener`.
    window.open(url.toString(), '_blank', 'noopener,noreferrer')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl)
      flash('Link copied.')
    } catch {
      flash('Clipboard blocked. The link is in the address bar.')
    }
  }

  const canNativeShare = typeof navigator.canShare === 'function'

  return (
    <div
      class="sheet-scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        class="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Share this proof"
        ref={dialogRef}
      >
        {/* The scene the card is painted from. Off-screen rather than
            display:none — a hidden subtree has no layout, and an SVG with no
            layout serialises to a blank square. */}
        <div class="sheet-source" ref={sceneRef} aria-hidden="true">
          <Frozen frost={frost} size={240} detail />
        </div>

        <header class="sheet-head">
          <h2>{celebrate ? 'Frozen. Now show it.' : 'Share this proof'}</h2>
          <button class="sheet-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        {celebrate && (
          <p class="muted small">
            The lock is live on Sui. This card is a poster for it — the link on the card
            re-reads the chain, so anyone who follows it sees the truth rather than your
            claim about it.
          </p>
        )}

        <div class="sheet-preview">
          {failed ? (
            <p class="err">Could not render the card in this browser.</p>
          ) : png ? (
            <img
              src={png}
              width={CARD_W}
              height={CARD_H}
              alt={`Proof card: ${assetLabel(frost)} locked on Epoch`}
            />
          ) : (
            <div class="sheet-skel" />
          )}
        </div>

        <div class="row">
          <div class="seg">
            {SKINS.map((s) => (
              <button key={s.id} class={skin === s.id ? 'on' : ''} onClick={() => setSkin(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <label class="sheet-label" for="pf-post">
          What the post says
        </label>
        <textarea
          id="pf-post"
          class="sheet-text mono"
          rows={4}
          value={text}
          onInput={(e) => setText(e.currentTarget.value)}
        />

        <div class="row sheet-actions">
          <button class="btn" disabled={!png} onClick={postToX}>
            Post on X
          </button>
          {canNativeShare && (
            <button class="btn ghost" disabled={!blob} onClick={() => void nativeShare()}>
              Share…
            </button>
          )}
          <button class="btn ghost" disabled={!blob} onClick={() => void copyImage()}>
            Copy image
          </button>
          <button class="btn ghost" disabled={!png} onClick={download}>
            Download PNG
          </button>
          <button class="btn ghost" onClick={() => void copyLink()}>
            Copy link
          </button>
        </div>

        <p class="muted small">
          X cannot accept an image from a web page automatically. Copy or download the card
          first, then attach it — the post already carries the link that proves it.
        </p>

        {note && <p class="ok">{note}</p>}
      </div>
    </div>
  )
}

/**
 * The default post.
 *
 * Written as a claim a reader can immediately falsify — the amount, the date
 * and a link that re-reads the chain — because "trust me, it's locked" is the
 * genre this product is trying to kill.
 */
function defaultText(f: Frost): string {
  const amount =
    f.totalLocked !== undefined
      ? fmtAsset(f.totalLocked, f.decimals, f.symbol)
      : assetLabel(f)
  const left = msLeft(f)

  if (f.phase === 'thawed') {
    return `${amount} was locked on Epoch until ${fmtDate(f.unlockMs)} — and here is the full record, straight from Sui.`
  }
  if (left <= 0) {
    return `${amount} was frozen on Epoch until ${fmtDate(f.unlockMs)}. The term has elapsed. Read it from the chain yourself:`
  }
  return `❄ ${amount} frozen on Epoch until ${fmtDate(f.unlockMs)} — ${fmtCountdown(left)} to go.

Not a screenshot. This reads Sui mainnet live, so check it yourself:`
}
