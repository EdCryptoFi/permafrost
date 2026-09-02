/** Shortens 0xabc…def for display while keeping both ends verifiable. */
export function shortAddr(a: string, lead = 6, tail = 4) {
  if (!a) return ''
  return a.length <= lead + tail + 2 ? a : `${a.slice(0, lead)}…${a.slice(-tail)}`
}

export function fmtDate(ms: number, locale?: string) {
  if (!ms) return '—'
  return new Date(ms).toLocaleDateString(locale ?? undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const UNITS: [number, string][] = [
  [365 * 24 * 3600e3, 'y'],
  [24 * 3600e3, 'd'],
  [3600e3, 'h'],
  [60e3, 'm'],
]

/** "1y 24d" — two units max, which is all anyone reads on a badge. */
export function fmtCountdown(msLeft: number): string {
  if (msLeft <= 0) return 'unlocked'
  const parts: string[] = []
  let rest = msLeft
  for (const [size, label] of UNITS) {
    const n = Math.floor(rest / size)
    if (n > 0) {
      parts.push(`${n}${label}`)
      rest -= n * size
    }
    if (parts.length === 2) break
  }
  return parts.length ? parts.join(' ') : '<1m'
}

/**
 * Base units -> human amount.
 *
 * `decimals` comes from CoinMetadata. When it is genuinely unknown (an NFT or
 * LP position has no metadata) we show the raw figure rather than guessing a
 * scale — inventing a decimal place on a proof-of-lock badge is worse than
 * showing an ugly number.
 */
export function fmtAmount(raw: bigint, decimals: number | null | undefined): string {
  if (decimals === null || decimals === undefined) return raw.toString()
  const d = BigInt(10) ** BigInt(decimals)
  const whole = raw / d
  const frac = raw % d
  if (frac === 0n) return whole.toLocaleString('en-US')
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '').slice(0, 4)
  return `${whole.toLocaleString('en-US')}.${fracStr}`
}

export const pct = (x: number) => `${Math.round(x * 100)}%`

/** Amount plus ticker, e.g. "1,230,000 EPT". Falls back to bare digits. */
export function fmtAsset(
  raw: bigint,
  decimals: number | null | undefined,
  symbol: string | null | undefined,
): string {
  const n = fmtAmount(raw, decimals)
  return symbol ? `${n} ${symbol}` : n
}
