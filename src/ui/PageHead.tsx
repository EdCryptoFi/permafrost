import type { ComponentChildren } from 'preact'
import { AquaVerify, AquaFreeze, AquaDeploy, AquaGuide } from './AquaIcons'
import { EptMark } from './EptMark'

/**
 * The header of a page that does one thing.
 *
 * Mac OS X put a large icon beside the title of every pane that meant
 * business — preferences, the installer, setup. It was not decoration: the
 * icon is what tells you which room you walked into before you have read a
 * word, and it is the same object you clicked to get here, so arriving is
 * confirmed rather than merely assumed.
 *
 * That is the whole rule this follows. The icon on a page is the icon on the
 * tile that opens it. If those ever drift apart the header starts lying about
 * where you are.
 */

const ART = {
  verify: AquaVerify,
  new: AquaFreeze,
  deploy: AquaDeploy,
  guide: AquaGuide,
} as const

export type HeadKind = keyof typeof ART | 'ept'

export function PageHead({
  kind,
  title,
  children,
}: {
  kind: HeadKind
  title: string
  children?: ComponentChildren
}) {
  return (
    <div class="pagehead">
      <div class="pagehead-art" aria-hidden="true">
        {kind === 'ept' ? <EptMark size={92} /> : <ArtFor kind={kind} />}
      </div>
      <div class="pagehead-copy">
        <h1>{title}</h1>
        {children && <p class="lede">{children}</p>}
      </div>
    </div>
  )
}

function ArtFor({ kind }: { kind: keyof typeof ART }) {
  const Art = ART[kind]
  return <Art size={92} />
}

/**
 * A numbered step with the object it is about beside it.
 *
 * The forms in this app are numbered lists of decisions, and a number alone
 * gives no clue what the decision is until you read the heading. The icon
 * gets there first.
 */
export function StepHead({
  n,
  title,
  art: Art,
}: {
  n: number
  title: string
  art: (p: { size?: number; title?: string }) => preact.JSX.Element
}) {
  return (
    <h3 class="stephead">
      <span class="stephead-art" aria-hidden="true">
        <Art size={40} />
      </span>
      <span>
        {n} · {title}
      </span>
    </h3>
  )
}
