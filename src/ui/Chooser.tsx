import { AquaVerify, AquaFreeze, AquaDeploy } from './AquaIcons'

/**
 * The three things this app does, as three objects you click.
 *
 * The landing used to open on a search field, which asks a question most
 * visitors cannot answer yet — you need an address in hand before a text box
 * is any use. The startup screen now hands over to this instead: the whole
 * product stated as three icons, in the order somebody meets them.
 *
 * Verify is first and largest in weight because it is the only one that needs
 * no wallet, no money and no decision.
 */

type Dest = 'verify' | 'new' | 'deploy'

const TILES: {
  id: Dest
  label: string
  blurb: string
  cta: string
  icon: typeof AquaVerify
  amber?: boolean
}[] = [
  {
    id: 'verify',
    label: 'Verify',
    blurb: 'Look up any lock on Epoch and read what it actually holds.',
    cta: 'Verify a lock',
    icon: AquaVerify,
  },
  {
    id: 'new',
    label: 'Freeze',
    blurb: 'Lock something of your own. No fee, and nobody can undo it.',
    cta: 'Create a lock',
    icon: AquaFreeze,
  },
  {
    id: 'deploy',
    label: 'Deploy',
    blurb: 'Publish this site to Walrus and point a .epoch name at it.',
    cta: 'Deploy to Walrus',
    icon: AquaDeploy,
    // The one action here that is not cold, in the one gel that is not blue.
    amber: true,
  },
]

export function Chooser({ onGo }: { onGo: (v: Dest) => void }) {
  return (
    <nav class="chooser" aria-label="What this app does">
      {TILES.map((t) => (
        <a
          key={t.id}
          class="tile"
          href={t.id === 'verify' ? '?' : `?view=${t.id}`}
          onClick={(e) => {
            // Modified clicks and middle clicks belong to the browser: this is
            // a real link to a real address, and stealing that would make the
            // one page somebody wants to open in a tab the one they cannot.
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
            e.preventDefault()
            onGo(t.id)
          }}
        >
          <t.icon size={92} />
          <b>{t.label}</b>
          <span class="muted small">{t.blurb}</span>
          <span class={`btn tile-cta${t.amber ? ' amber' : ''}`}>{t.cta}</span>
        </a>
      ))}
    </nav>
  )
}
