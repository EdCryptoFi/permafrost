import type { Frost } from '@/chain/frost'
import './backdrop.css'

/**
 * The room the page is standing in — now one effect instead of four.
 *
 * What used to be here: a six-layer CSS scene system, a fullscreen WebGL
 * field, and a set of drifting caustics, all running at once behind the same
 * text. Each was defensible alone; together they were four weather systems in
 * one room, and every change to one meant guessing at the composite.
 *
 * All of it is replaced by the nexacore background, which on inspection is not
 * a canvas or a shader at all: a very wide radial bloom hung off the top edge,
 * and a diagonal wash falling away from it. That is the whole thing, and the
 * reason it works anywhere is that it has no content of its own. It is light
 * entering a room rather than a picture pinned behind the words.
 *
 * The one thing worth keeping from the old system is kept: which room you are
 * in is information. A frozen lock, a term that has elapsed and a vault that
 * has been emptied are three different states, and the page said so before you
 * read a word. So the effect is single but its two hues answer to the scene —
 * same bloom, same wash, different temperature.
 *
 * Every scene is rendered and cross-fades on opacity. Gradients cannot
 * interpolate between one another, so a single element swapping its
 * `background-image` would cut rather than dissolve.
 */
export type Scene = 'aurora' | 'frozen' | 'crack' | 'thaw' | 'blizzard' | 'blueprint'

const SCENES: Scene[] = ['aurora', 'frozen', 'crack', 'thaw', 'blizzard', 'blueprint']

/** The scene a given view and lock imply. One place, so nothing contradicts. */
export function sceneFor(
  view: 'verify' | 'new' | 'deploy' | 'ept' | 'guide',
  frost: Frost | null,
): Scene {
  if (view === 'new') return 'blizzard'
  if (view === 'deploy') return 'blueprint'
  if (view === 'guide') return 'aurora'
  // A burn is the one thing here that is not cold.
  if (view === 'ept') return 'crack'
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
    <div class="bg" aria-hidden="true">
      {SCENES.map((s) => (
        <i key={s} class={`bg-${s}${s === scene ? ' on' : ''}`} />
      ))}
    </div>
  )
}
