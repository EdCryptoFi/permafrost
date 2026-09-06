import type { ComponentChildren } from 'preact'

/**
 * The window.
 *
 * Mac OS X put everything inside one, and the frame is not decoration: it is
 * what separates the application from the desktop behind it. Without it the
 * cloth background and the content sit in the same plane, and the page reads
 * as a poster with text on it rather than as software running somewhere.
 *
 * The three lights are drawn but inert. They are the strongest single signal
 * that this is a Mac window, and wiring them to close or minimise a page that
 * is not a window would be a worse lie than leaving them still — so they carry
 * no hover affordance and no title, and a screen reader is not told about
 * them at all.
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
        <span class="mw-title">{title}</span>
        {/* Balances the lights so the title sits optically centred. */}
        <span class="mw-pad" aria-hidden="true" />
      </div>
      <div class="mw-body">{children}</div>
    </div>
  )
}
