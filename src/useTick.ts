import { useEffect, useState } from 'preact/hooks'

/**
 * Milliseconds elapsed since mount, so a countdown actually counts down.
 *
 * Nothing in the app used to tick: a badge left open in a tab kept showing
 * "locked" straight through the unlock moment until someone reloaded — exactly
 * when being right matters most.
 *
 * The timer pauses while the tab is hidden and resyncs on return, so an embed
 * sitting in a background tab costs nothing.
 */
export function useTick(periodMs = 1000, enabled = true): number {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const start = Date.now()
    let timer: ReturnType<typeof setInterval> | undefined

    const sync = () => setElapsed(Date.now() - start)

    const run = () => {
      stop()
      if (document.visibilityState === 'hidden') return
      sync()
      timer = setInterval(sync, periodMs)
    }
    const stop = () => {
      if (timer) clearInterval(timer)
      timer = undefined
    }

    run()
    document.addEventListener('visibilitychange', run)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', run)
    }
  }, [periodMs, enabled])

  return elapsed
}

/**
 * Fires once when a deadline passes while the page is open, so the view can
 * refetch exactly at the cliff instead of waiting for a reload.
 */
export function useCrossing(deadlineMs: number, onCross: () => void) {
  useEffect(() => {
    const delay = deadlineMs - Date.now()
    if (delay <= 0 || delay > 2 ** 31 - 1) return
    const t = setTimeout(onCross, delay + 1500)
    return () => clearTimeout(t)
  }, [deadlineMs, onCross])
}
