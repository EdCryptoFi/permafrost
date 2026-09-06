import { useEffect, useRef, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'

/**
 * The window.
 *
 * Mac OS X put everything inside one, and the frame is not decoration: it is
 * what separates the application from the desktop behind it. Without it the
 * cloth background and the content sit in the same plane, and the page reads
 * as a poster with text on it rather than as software running somewhere.
 *
 * It opens the way one did. A window on that system never simply existed —
 * it arrived, scaling up from slightly small and settling, which is the whole
 * reason the desktop felt like a place rather than a page. That is one CSS
 * animation on mount, and it runs once: re-running it on every view change
 * would turn navigation into a flinch.
 *
 * The three lights are drawn but inert. They are the strongest single signal
 * that this is a Mac window, and wiring them to close or minimise a page that
 * is not a window would be a worse lie than leaving them still — so they
 * carry no hover affordance, and a screen reader is not told about them.
 */
export function MacWindow({
  title,
  children,
}: {
  title: string
  children: ComponentChildren
}) {
  return (
    <div class="mw">
      <div class="mw-bar">
        <span class="mw-lights" aria-hidden="true">
          <i class="mw-red" />
          <i class="mw-amber" />
          <i class="mw-green" />
        </span>
        <Typed class="mw-title" text={title} />
        {/* Balances the lights so the title sits optically centred. */}
        <span class="mw-pad" aria-hidden="true" />
      </div>
      <div class="mw-body">{children}</div>
    </div>
  )
}

/**
 * A title that is typed rather than printed.
 *
 * The full string is always in the DOM as the element's accessible name, and
 * only the visible span is animated — so a screen reader reads the title once,
 * whole, instead of announcing it growing one character at a time.
 *
 * It types once per distinct string. Retyping the same title because a parent
 * re-rendered would make the window look like it was being reopened.
 */
function Typed({ text, class: cls }: { text: string; class?: string }) {
  const [n, setN] = useState(() =>
    matchMedia('(prefers-reduced-motion: reduce)').matches ? text.length : 0,
  )
  const typed = useRef<string | null>(null)

  useEffect(() => {
    if (typed.current === text) return
    typed.current = text
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(text.length)
      return
    }
    setN(0)
    // Roughly 34ms a character, after the window has finished arriving. Fast
    // enough that nobody waits for it, slow enough to read as typing.
    let i = 0
    const start = setTimeout(function tick() {
      i += 1
      setN(i)
      if (i < text.length) timer = setTimeout(tick, 34)
    }, 420)
    let timer: ReturnType<typeof setTimeout> | undefined
    return () => {
      clearTimeout(start)
      if (timer) clearTimeout(timer)
    }
  }, [text])

  const done = n >= text.length
  return (
    <span class={cls} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      {!done && <i class="caret" aria-hidden="true" />}
    </span>
  )
}
