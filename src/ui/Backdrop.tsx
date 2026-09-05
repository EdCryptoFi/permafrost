import type { Frost } from '@/chain/frost'
import './backdrop.css'

/**
 * The room the page is standing in.
 *
 * A single flat dark canvas made every view of this app feel like the same
 * screen with different text on it — you could not tell, at a glance, whether
 * you were reading a proof, making one, or shipping the site. Each scene below
 * is a different environment, and which one you are in is itself information:
 * the backdrop turns cold and still when a lock is frozen, cracks into amber
 * when the term elapses, and goes to water when everything has been claimed.
 *
 * Built out of gradients and transforms only. No canvas loop, no particle
 * system, no requestAnimationFrame — six composited layers that the GPU can
 * animate while the main thread is busy parsing a GraphQL response, in a page
 * that has to collapse into one self-contained HTML file. Everything here is
 * `aria-hidden` and `pointer-events: none`: it can never come between a reader
 * and the data, and a screen reader never hears about the weather.
 */
export type Scene = 'aurora' | 'frozen' | 'crack' | 'thaw' | 'blizzard' | 'blueprint'

/** The scene a given view and lock imply. One place, so nothing contradicts. */
export function sceneFor(
  view: 'verify' | 'new' | 'deploy' | 'guide',
  frost: Frost | null,
): Scene {
  if (view === 'new') return 'blizzard'
  if (view === 'deploy') return 'blueprint'
  // The guide is reading, not doing: keep the backdrop calm behind it.
  if (view === 'guide') return 'aurora'
  if (!frost) return 'aurora'
  switch (frost.phase) {
    case 'thawed':
      return 'thaw'
    case 'cracked':
      return 'crack'
    case 'absent':
      return 'aurora'
    default:
      return 'frozen'
  }
}

export function Backdrop({ scene }: { scene: Scene }) {
  return (
    <div class={`bd bd-${scene}`} aria-hidden="true">
      <div class="bd-sky" />
      <div class="bd-aurora" />
      <div class="bd-aurora bd-aurora-2" />
      <div class="bd-stars" />
      <div class="bd-fall" />
      <div class="bd-grid" />
      <div class="bd-horizon" />
      <div class="bd-vignette" />
    </div>
  )
}
