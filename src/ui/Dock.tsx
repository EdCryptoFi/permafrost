import { AquaVerify, AquaFreeze, AquaDeploy, AquaGuide } from './AquaIcons'
import { EptMark } from './EptMark'

/**
 * The Dock.
 *
 * It carries the same five destinations as the nav, which is deliberate
 * duplication: on a Mac the Dock and the menu bar always overlapped, and the
 * point of the Dock was that the thing you want is one throw of the mouse
 * away at the bottom of the screen rather than a read of a word at the top.
 *
 * It is the app's real navigation on a phone, where the header wraps to three
 * lines and the nav is the row you have to scroll back up to reach.
 */

type Dest = 'verify' | 'new' | 'deploy' | 'ept' | 'guide'

const ITEMS: { id: Dest; label: string; art?: (p: { size?: number }) => preact.JSX.Element }[] = [
  { id: 'verify', label: 'Verify', art: AquaVerify },
  { id: 'new', label: 'Freeze', art: AquaFreeze },
  { id: 'deploy', label: 'Deploy', art: AquaDeploy },
  { id: 'ept', label: 'EPT' },
  { id: 'guide', label: 'Guide', art: AquaGuide },
]

export function Dock({ view, onGo }: { view: string; onGo: (v: Dest) => void }) {
  return (
    <nav class="dock" aria-label="Dock">
      <span class="dock-tray">
        {ITEMS.map((it) => (
          <a
            key={it.id}
            class={`dock-item${view === it.id ? ' on' : ''}`}
            href={it.id === 'verify' ? '?' : `?view=${it.id}`}
            aria-current={view === it.id ? 'page' : undefined}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
              e.preventDefault()
              onGo(it.id)
            }}
          >
            <span class="dock-art">
              {it.art ? <it.art size={38} /> : <EptMark size={38} />}
            </span>
            <span class="dock-label">{it.label}</span>
          </a>
        ))}
      </span>
    </nav>
  )
}
