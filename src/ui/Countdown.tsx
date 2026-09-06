import { msLeft, urgencyOf, type Frost } from '@/chain/frost'
import { fmtCountdown } from '@/format'
import { useTick } from '@/useTick'

/**
 * A countdown that actually counts.
 *
 * Everywhere a lock appeared it showed a date, and a date makes the reader do
 * the arithmetic — on the one surface built so they would not have to. This
 * ticks from the chain clock the frost carries, so it can never disagree with
 * the state beside it, and it goes to seconds in the last hour because that is
 * when a second is worth showing.
 */
export function Countdown({
  frost,
  class: cls = '',
  showState = false,
}: {
  frost: Frost
  class?: string
  showState?: boolean
}) {
  const running = frost.phase === 'melting'
  const elapsed = useTick(1000, running)
  const left = msLeft(frost, elapsed)

  if (!running || left <= 0) {
    return (
      <span class={`countdown is-done ${cls}`}>
        {frost.phase === 'thawed' ? 'claimed' : 'unlocked'}
      </span>
    )
  }

  const urgency = urgencyOf(frost, elapsed)
  // Under an hour, seconds stop being noise and start being the point.
  const text = left < 3600e3 ? fineGrained(left) : fmtCountdown(left)

  return (
    <span class={`countdown is-${urgency} ${cls}`}>
      <span class="countdown-value mono">{text}</span>
      <span class="countdown-unit">left</span>
      {showState && urgency !== 'none' && (
        <span class="countdown-flag">
          {urgency === 'imminent' ? 'this week' : 'soon'}
        </span>
      )}
    </span>
  )
}

function fineGrained(ms: number): string {
  const s = Math.floor(ms / 1000)
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}
