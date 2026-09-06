import { useEffect, useState } from 'preact/hooks'

/**
 * Graphite or Aqua.
 *
 * Mac OS X shipped two appearances and let you pick; this is the same choice.
 * Graphite is the default because the product is read at night by people
 * checking a lock before they commit money, and the blue desktop is the one
 * you switch to because you want it.
 *
 * The choice is written to the root element before first paint (see index.html)
 * so the page never flashes the wrong appearance, and remembered per browser.
 */
export type Appearance = 'graphite' | 'aqua'

const KEY = 'permafrost:appearance'

export function readAppearance(): Appearance {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'aqua' || v === 'graphite') return v
  } catch {
    /* private mode, blocked storage — the default is fine */
  }
  return 'graphite'
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Appearance>(readAppearance)

  useEffect(() => {
    document.documentElement.dataset.appearance = mode
    try {
      localStorage.setItem(KEY, mode)
    } catch {
      /* nothing to do; the page still honours the choice for this visit */
    }
  }, [mode])

  const next = mode === 'graphite' ? 'aqua' : 'graphite'

  return (
    <button
      class="appearance"
      onClick={() => setMode(next)}
      title={`Switch to ${next === 'aqua' ? 'Aqua' : 'Graphite'} appearance`}
      aria-label={`Switch to ${next === 'aqua' ? 'Aqua' : 'Graphite'} appearance`}
    >
      <span class={`appearance-dot is-graphite${mode === 'graphite' ? ' on' : ''}`} />
      <span class={`appearance-dot is-aqua${mode === 'aqua' ? ' on' : ''}`} />
    </button>
  )
}
