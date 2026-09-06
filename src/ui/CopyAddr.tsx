import { useState } from 'preact/hooks'
import { EXPLORER } from '@/chain/constants'

/**
 * A full identifier, linked and copyable.
 *
 * Showing the whole address was half the job: a 66-character hex string is
 * something you check by pasting it somewhere else, and selecting it by hand
 * out of a wrapped block is the kind of friction that makes people give up and
 * take the page's word for it — which is the one outcome this product exists
 * to prevent.
 */
export function CopyAddr({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard blocked. The value is on screen in full; nothing is lost.
    }
  }

  return (
    <span class="copyaddr">
      <a class="mono addr" href={EXPLORER(value)} target="_blank" rel="noopener noreferrer">
        {value}
      </a>
      <button
        class="copyaddr-btn"
        onClick={copy}
        title={copied ? 'Copied' : `Copy ${label ?? 'this'}`}
        aria-label={copied ? 'Copied' : `Copy ${label ?? 'value'}`}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12.5 10 17.5 19 7" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="11" height="11" rx="1.5" />
            <path d="M15 5.5H5.5a1.5 1.5 0 0 0-1.5 1.5V16" />
          </svg>
        )}
      </button>
    </span>
  )
}
