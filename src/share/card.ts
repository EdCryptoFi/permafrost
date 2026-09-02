import type { Frost } from '@/chain/frost'
import { assetLabel, msLeft } from '@/chain/frost'
import { fmtAsset, fmtCountdown, fmtDate, pct } from '@/format'
import { svgToImage } from './svg'

/**
 * The proof card.
 *
 * The gap this closes: someone locks their LP, and the thing they actually
 * want to do next is tell people. Until now the only shareable artefact was a
 * screenshot — which is precisely the forgeable object PermaFrost exists to
 * replace. So the card is drawn from the same `Frost` the page is rendering,
 * and every number on it is stamped with the lock id and a URL that re-reads
 * the chain. The picture travels; the proof stays checkable.
 *
 * Painted on a 2D canvas rather than assembled in the DOM and rasterised.
 * `html2canvas` and friends are 200 KB+ and reimplement layout badly; this
 * page has to collapse into a single Walrus blob. Canvas also gets us the
 * exact 1200x630 that X, Discord and Telegram crop to, with no surprises.
 */

export const CARD_W = 1200
export const CARD_H = 630

export type Skin = 'chaos' | 'arctic' | 'blueprint'

export const SKINS: { id: Skin; label: string }[] = [
  { id: 'chaos', label: 'Arctic Chaos' },
  { id: 'arctic', label: 'Deep Freeze' },
  { id: 'blueprint', label: 'Blueprint' },
]

type Palette = {
  bg: string
  ink: string
  dim: string
  hot: string
  cold: string
  warn: string
  panel: string
  glow: [string, string]
}

const PALETTES: Record<Skin, Palette> = {
  chaos: {
    bg: '#040d1a',
    ink: '#e8eef6',
    dim: '#8ea3bd',
    hot: '#ff00ff',
    cold: '#29b6f6',
    warn: '#ffff00',
    panel: 'rgba(10, 21, 36, 0.82)',
    glow: ['rgba(255,0,255,0.34)', 'rgba(41,182,246,0.30)'],
  },
  arctic: {
    bg: '#02101d',
    ink: '#eaf5ff',
    dim: '#8fb2cc',
    hot: '#4db8e8',
    cold: '#9adcf5',
    warn: '#d8f2fd',
    panel: 'rgba(6, 26, 44, 0.84)',
    glow: ['rgba(77,184,232,0.36)', 'rgba(168,85,247,0.22)'],
  },
  blueprint: {
    bg: '#02121f',
    ink: '#d9f2ff',
    dim: '#79a6c2',
    hot: '#29b6f6',
    cold: '#29b6f6',
    warn: '#ffff00',
    panel: 'rgba(3, 22, 38, 0.86)',
    glow: ['rgba(41,182,246,0.28)', 'rgba(41,182,246,0.16)'],
  },
}

const DISPLAY = '"Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'

/* ------------------------------------------------------------ primitives */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * One cut-out word: a rotated block of colour with the word sitting on it.
 * The headline is never a single string — that is the whole visual argument
 * of the brand, and it has to survive into the thing people actually see.
 */
function cutout(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: { size: number; fill: string; ink: string; tilt: number; outline?: string },
): number {
  const { size, fill, ink, tilt, outline } = opts
  ctx.save()
  ctx.font = `800 ${size}px ${DISPLAY}`
  const w = ctx.measureText(text).width
  const padX = size * 0.14
  const padY = size * 0.16
  const boxW = w + padX * 2
  const boxH = size + padY * 2

  ctx.translate(x + boxW / 2, y + boxH / 2)
  ctx.rotate((tilt * Math.PI) / 180)
  ctx.translate(-boxW / 2, -boxH / 2)

  if (fill !== 'none') {
    ctx.fillStyle = fill
    ctx.fillRect(0, 0, boxW, boxH)
  }
  if (outline) {
    ctx.strokeStyle = outline
    ctx.lineWidth = 3
    ctx.strokeRect(1.5, 1.5, boxW - 3, boxH - 3)
  }
  ctx.fillStyle = ink
  ctx.textBaseline = 'middle'
  ctx.fillText(text, padX, boxH / 2 + size * 0.03)
  ctx.restore()
  return boxW
}

/** Small uppercase mono strip — the app's `.eyebrow`, at card scale. */
function strip(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  bg: string,
  ink: string,
  size = 15,
) {
  ctx.save()
  ctx.font = `800 ${size}px ${MONO}`
  const w = ctx.measureText(text).width
  ctx.fillStyle = bg
  ctx.fillRect(x, y, w + 18, size + 12)
  ctx.fillStyle = ink
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + 9, y + (size + 12) / 2 + 1)
  ctx.restore()
  return w + 18
}

/* --------------------------------------------------------------- backdrop */

function paintBackdrop(ctx: CanvasRenderingContext2D, p: Palette, skin: Skin) {
  ctx.fillStyle = p.bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Two soft light sources, the same two the page's backdrop uses.
  const a = ctx.createRadialGradient(210, -60, 20, 210, -60, 620)
  a.addColorStop(0, p.glow[0])
  a.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = a
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  const b = ctx.createRadialGradient(980, 40, 20, 980, 40, 640)
  b.addColorStop(0, p.glow[1])
  b.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = b
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  if (skin === 'blueprint') {
    ctx.save()
    ctx.strokeStyle = 'rgba(41,182,246,0.16)'
    ctx.lineWidth = 1
    for (let x = 0; x <= CARD_W; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, CARD_H)
      ctx.stroke()
    }
    for (let y = 0; y <= CARD_H; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(CARD_W, y + 0.5)
      ctx.stroke()
    }
    ctx.restore()
  } else {
    // Halftone: a dot grid that fades out to the right, so the left column
    // reads as printed paper and the artwork side stays clean.
    ctx.save()
    ctx.fillStyle = skin === 'chaos' ? 'rgba(255,0,255,0.10)' : 'rgba(154,220,245,0.09)'
    for (let y = 24; y < CARD_H; y += 16) {
      for (let x = 24; x < 760; x += 16) {
        const r = 1.5 * (1 - x / 900)
        if (r <= 0.15) continue
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.restore()
  }

  // Vignette, so the crop never has a bright edge fighting the subject.
  const v = ctx.createRadialGradient(CARD_W / 2, CARD_H / 2, 180, CARD_W / 2, CARD_H / 2, 780)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(0,0,0,0.55)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, CARD_W, CARD_H)
}

/* ------------------------------------------------------------- the words */

/** Two scraps, so the verdict lands the way the site's headline lands. */
function verdictWords(f: Frost): [string, string] {
  switch (f.phase) {
    case 'thawed':
      return ['FULLY', 'CLAIMED']
    case 'cracked':
      return ['TERM', 'ELAPSED']
    case 'absent':
      return ['NOT', 'LOCKED']
    default:
      return ['STILL', 'FROZEN']
  }
}

/** The one line under the verdict that carries the actual claim. */
function headline(f: Frost): string {
  const left = msLeft(f)
  if (f.phase === 'thawed') return `was locked until ${fmtDate(f.unlockMs)}`
  if (left <= 0) return `unlocked since ${fmtDate(f.unlockMs)}`
  return `unlocks ${fmtDate(f.unlockMs)} · ${fmtCountdown(left)} left`
}

/* ------------------------------------------------------------------ paint */

export type CardInput = {
  frost: Frost
  skin: Skin
  /** Serialised, already-static scene SVG. */
  sceneSvg: string
  /** Where a reader can re-check this. */
  verifyUrl: string
}

export async function paintCard(input: CardInput): Promise<HTMLCanvasElement> {
  const { frost, skin, sceneSvg, verifyUrl } = input
  const p = PALETTES[skin]

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is unavailable in this browser.')

  // Without this the first paint uses fallback metrics and the cut-out boxes
  // are sized for a font that is not the one that ends up drawn.
  await document.fonts?.ready?.catch?.(() => {})

  paintBackdrop(ctx, p, skin)
  ctx.textBaseline = 'alphabetic'

  /* header ---------------------------------------------------------- */
  ctx.font = `800 40px ${DISPLAY}`
  ctx.fillStyle = p.hot
  ctx.fillText('PERMAFROST', 56, 88)
  ctx.font = `800 14px ${MONO}`
  ctx.fillStyle = p.dim
  ctx.fillText('PROOF OF LOCK · EPOCH ON SUI', 58, 112)

  strip(ctx, 'READ LIVE FROM SUI MAINNET', 830, 66, p.cold, '#000', 14)

  // The double rule from the site header.
  ctx.fillStyle = p.cold
  ctx.fillRect(56, 134, CARD_W - 112, 2)
  ctx.fillStyle = p.warn
  ctx.fillRect(56, 136, CARD_W - 112, 3)

  /* verdict --------------------------------------------------------- */
  const [w1, w2] = verdictWords(frost)
  const vy = 178
  const used = cutout(ctx, w1, 56, vy, {
    size: 64,
    fill: 'none',
    ink: p.ink,
    tilt: -2.5,
    outline: p.cold,
  })
  cutout(ctx, w2, 56 + used + 16, vy - 6, {
    size: 76,
    fill: frost.phase === 'cracked' ? p.warn : p.hot,
    ink: '#000',
    tilt: 1.6,
  })

  /* the number ------------------------------------------------------ */
  const amount =
    frost.totalLocked !== undefined
      ? fmtAsset(frost.totalLocked, frost.decimals, frost.symbol)
      : assetLabel(frost)

  // Long tickers and eighteen-decimal balances both happen; shrink to fit
  // rather than letting the number run under the artwork.
  let amountSize = 58
  ctx.font = `800 ${amountSize}px ${MONO}`
  while (ctx.measureText(amount).width > 620 && amountSize > 24) {
    amountSize -= 2
    ctx.font = `800 ${amountSize}px ${MONO}`
  }
  const amountY = 296
  // The verdict already owns yellow when a term has elapsed; two yellow slabs
  // stacked read as one shape and the number stops being the second thing you
  // see. Hand the amount the other accent in that case.
  ctx.fillStyle = frost.phase === 'cracked' ? p.cold : p.warn
  ctx.fillRect(56, amountY, ctx.measureText(amount).width + 26, amountSize + 18)
  ctx.fillStyle = '#000'
  ctx.fillText(amount, 69, amountY + amountSize + 1)

  ctx.font = `600 21px ${MONO}`
  ctx.fillStyle = p.ink
  ctx.fillText(headline(frost), 58, amountY + amountSize + 52)

  /* progress -------------------------------------------------------- */
  const barY = amountY + amountSize + 74
  const barW = 620
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  ctx.fillRect(56, barY, barW, 10)
  ctx.fillStyle = p.cold
  ctx.fillRect(56, barY, barW * Math.min(1, Math.max(0, frost.progress)), 10)
  ctx.font = `800 13px ${MONO}`
  ctx.fillStyle = p.dim
  ctx.fillText(`${pct(frost.progress)} OF TERM ELAPSED`, 56, barY + 28)

  /* facts ----------------------------------------------------------- */
  const facts: [string, string][] = [
    ['KIND', frost.kind === 'lock' ? 'OBJECT LOCK (CLIFF)' : frost.kind === 'multi' ? 'MULTI VESTING' : 'VESTING VAULT'],
    ['ASSET', assetLabel(frost).toUpperCase()],
    ['LOCK ID', frost.id],
  ]
  let fy = barY + 60
  for (const [k, v] of facts) {
    ctx.font = `800 13px ${MONO}`
    ctx.fillStyle = p.dim
    ctx.fillText(k, 56, fy)
    ctx.font = `500 15px ${MONO}`
    ctx.fillStyle = p.cold
    // Ids are 66 characters; the card is not a place to make someone squint,
    // but it is also not a place to truncate the only thing that proves this.
    // Full id, smaller, on its own line.
    const maxW = 640
    let s = 15
    while (ctx.measureText(v).width > maxW && s > 9) {
      s -= 1
      ctx.font = `500 ${s}px ${MONO}`
    }
    ctx.fillText(v, 132, fy)
    fy += 25
  }

  /* footer ---------------------------------------------------------- */
  ctx.fillStyle = p.cold
  ctx.fillRect(56, CARD_H - 74, 700, 2)
  ctx.font = `800 16px ${MONO}`
  ctx.fillStyle = p.hot
  ctx.fillText('VERIFY IT YOURSELF →', 56, CARD_H - 38)
  ctx.font = `500 16px ${MONO}`
  ctx.fillStyle = p.ink
  const label = verifyUrl.replace(/^https?:\/\//, '')
  let us = 16
  while (ctx.measureText(label).width > 700 && us > 10) {
    us -= 1
    ctx.font = `500 ${us}px ${MONO}`
  }
  ctx.fillText(label, 258, CARD_H - 38)

  /* the scene ------------------------------------------------------- */
  const frameX = 796
  const frameY = 176
  const frameW = 348
  const frameH = 356

  ctx.fillStyle = p.hot
  ctx.fillRect(frameX + 10, frameY + 10, frameW, frameH)
  ctx.fillStyle = p.panel
  ctx.fillRect(frameX, frameY, frameW, frameH)
  ctx.strokeStyle = p.cold
  ctx.lineWidth = 2
  ctx.strokeRect(frameX + 1, frameY + 1, frameW - 2, frameH - 2)

  try {
    const img = await svgToImage(sceneSvg)
    const pad = 26
    const box = Math.min(frameW, frameH) - pad * 2
    ctx.drawImage(
      img,
      frameX + (frameW - box) / 2,
      frameY + (frameH - box) / 2,
      box,
      box * (88 / 86),
    )
  } catch {
    // A card without the walrus is still a valid proof card. Losing the
    // artwork must never lose the numbers.
  }

  // Scanlines over the frame, so it reads as the same CRT the site uses.
  ctx.save()
  roundRect(ctx, frameX, frameY, frameW, frameH, 0)
  ctx.clip()
  ctx.fillStyle = 'rgba(0,0,0,0.30)'
  for (let y = frameY; y < frameY + frameH; y += 3) ctx.fillRect(frameX, y, frameW, 1)
  ctx.restore()

  // Corner decal.
  ctx.save()
  ctx.translate(frameX + frameW - 6, frameY - 14)
  ctx.rotate((-6 * Math.PI) / 180)
  strip(ctx, 'NOT A SCREENSHOT', -190, 0, p.warn, '#000', 14)
  ctx.restore()

  return canvas
}

/** Canvas -> PNG blob. */
export function cardBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not encode the card.'))),
      'image/png',
    )
  })
}
