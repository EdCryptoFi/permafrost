import type { ComponentChildren } from 'preact'

/**
 * A real anchor that also navigates in-app.
 *
 * These used to be <button>s, which meant nothing on the page could be
 * copied, opened in a new tab, middle-clicked, or shared — in a product whose
 * entire claim is "verify this yourself", that was the wrong element. An
 * anchor with a genuine href gives all of that back; the click handler only
 * takes over for plain left-clicks so modifier-clicks keep working.
 */
export function InternalLink({
  id,
  onPick,
  class: cls,
  children,
  title,
}: {
  id: string
  onPick: (id: string) => void
  class?: string
  children: ComponentChildren
  title?: string
}) {
  return (
    <a
      class={cls}
      href={`?id=${id}`}
      title={title}
      onClick={(e) => {
        // Let the browser handle new-tab, new-window and download intents.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        onPick(id)
      }}
    >
      {children}
    </a>
  )
}
