import { useCallback, useEffect, useState } from 'preact/hooks'
import { resolveFrost } from '@/chain/resolve'
import { smartSearch, type SearchResult } from '@/chain/search'
import type { Frost } from '@/chain/frost'
import { Frozen } from '@/ice/Frozen'
import { Details } from './Details'
import { Embed } from './Embed'
import { Actions } from './Actions'
import { Landing } from './Landing'
import { Create } from './Create'
import { Deploy } from './Deploy'
import { Guide } from './Guide'
import { Results } from './Results'
import { useWallet } from '@/wallet/useWallet'
import { shortAddr } from '@/format'
import { HeroTitle } from '@/ui/HeroTitle'
import { Backdrop, sceneFor } from '@/ui/Backdrop'
import { ProofCard } from '@/share/ProofCard'
import './app.css'

type Status = 'idle' | 'loading' | 'ready' | 'error'

/**
 * Views live in the query string: one Walrus blob means one document, so there
 * are no server routes to hang a second page off. Deep links still work, which
 * matters because every badge click lands on `?id=`.
 */
type View = 'verify' | 'new' | 'deploy' | 'guide'

const viewFromUrl = (): View => {
  const v = new URLSearchParams(location.search).get('view')
  return v === 'new' || v === 'deploy' || v === 'guide' ? v : 'verify'
}

export function App() {
  const wallet = useWallet()
  const [query, setQuery] = useState(
    () => new URLSearchParams(location.search).get('q') ?? new URLSearchParams(location.search).get('id') ?? '',
  )
  const [result, setResult] = useState<SearchResult | null>(null)
  const [selected, setSelected] = useState<Frost | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [view, setView] = useState<View>(viewFromUrl)
  /** The lock whose share card is open, and whether we just made it. */
  const [share, setShare] = useState<{ frost: Frost; celebrate: boolean } | null>(null)

  const go = (next: View) => {
    const url = new URL(location.href)
    if (next === 'verify') url.searchParams.delete('view')
    else url.searchParams.set('view', next)
    history.replaceState(null, '', url)
    setView(next)
  }

  const setUrl = (key: 'q' | 'id', value: string) => {
    const url = new URL(location.href)
    url.searchParams.delete('q')
    url.searchParams.delete('id')
    url.searchParams.set(key, value)
    history.replaceState(null, '', url)
  }

  /** Open one frost in the detail view. */
  const pick = useCallback(
    async (id: string) => {
      setStatus('loading')
      try {
        const f = await resolveFrost(id, wallet.address)
        setSelected(f)
        setStatus('ready')
        setUrl('id', id)
        scrollTo({ top: 0, behavior: 'smooth' })
      } catch (e) {
        setStatus('error')
        setError(e instanceof Error ? e.message : 'Lookup failed.')
      }
    },
    [wallet.address],
  )

  const search = useCallback(
    async (raw: string) => {
      const term = raw.trim()
      if (!term) return
      setStatus('loading')
      setError('')
      setSelected(null)
      setResult(null)
      try {
        const res = await smartSearch(term, wallet.address)

        if (res.kind === 'none') {
          setStatus('error')
          setError('Try a .epoch name, a project address, a lock id, or a coin type like 0x2::sui::SUI.')
          return
        }
        if (res.frosts.length === 1) {
          setSelected(res.frosts[0]!)
          setStatus('ready')
          setUrl('id', res.frosts[0]!.id)
          return
        }
        setResult(res)
        setStatus('ready')
        setUrl('q', term)
      } catch (e) {
        setStatus('error')
        setError(e instanceof Error ? e.message : 'Search failed.')
      }
    },
    [wallet.address],
  )

  // Deep link: every badge click and shared link lands here.
  useEffect(() => {
    if (query) void search(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * A read that has been going for a while.
   *
   * The transport retries with backoff, which is right — but it means a bad
   * moment on the public endpoint can take the better part of ten seconds to
   * resolve, and a button that has said "Reading chain…" for nine of them is
   * indistinguishable from a page that has died. Saying what is happening
   * costs nothing and keeps people from reloading into a fresh cold start.
   */
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    if (status !== 'loading') {
      setSlow(false)
      return
    }
    const t = setTimeout(() => setSlow(true), 3500)
    return () => clearTimeout(t)
  }, [status])

  const nothingFound = status === 'ready' && !selected && result?.frosts.length === 0

  const scene = sceneFor(view, view === 'verify' ? selected : null)

  return (
    <>
      <Backdrop scene={scene} />
      <div class="wrap">
      <header class="head">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true">❄</span>
          <div>
            <b class="glitch" data-text="PermaFrost">PermaFrost</b>
            <small>proof of lock · epoch on sui</small>
          </div>
        </div>
        <nav class="nav">
          {(['verify', 'new', 'deploy'] as View[]).map((v) => (
            <a
              key={v}
              class={view === v ? 'on' : ''}
              href={v === 'verify' ? '?' : `?view=${v}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
                e.preventDefault()
                go(v)
              }}
            >
              {v === 'verify' ? 'Verify' : v === 'new' ? 'Freeze' : 'Deploy'}
            </a>
          ))}
        </nav>
        <a
          class={`guide-link${view === 'guide' ? ' on' : ''}`}
          href="?view=guide"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
            e.preventDefault()
            go('guide')
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.6 9.2a2.6 2.6 0 1 1 3.3 2.5c-.6.2-.9.7-.9 1.3v.5" />
            <path d="M12 16.8h.01" />
          </svg>
          Guide
        </a>
        <WalletButton wallet={wallet} />
      </header>
      <div class="rule" />

      <Stickers view={view} frost={view === 'verify' ? selected : null} />

      {/* The full ransom-note headline is the landing page's argument. Once
          somebody is reading a specific lock, or filling in a form, it is a
          poster in the way — so it stands down to one line and the copy
          underneath starts describing the thing they are actually doing. */}
      {view === 'verify' && status === 'idle' && !selected ? (
        <HeroTitle />
      ) : (
        <h1 class="hero-mini">
          {view === 'new'
            ? 'Freeze something.'
            : view === 'deploy'
              ? 'Ship the blob.'
              : view === 'guide'
                ? 'How it works.'
                : 'Read it from the chain.'}
        </h1>
      )}
      <p class="lede">
        {view === 'new'
          ? 'Pick anything this wallet holds that the contract accepts, set a date, sign once. Locks are shared objects — after that, anybody can verify it and nobody can undo it.'
          : view === 'deploy'
            ? 'Publish each build to Walrus, then point a .epoch name at the blob it returns. The NameCap never leaves your wallet.'
            : view === 'guide'
              ? 'Every step, and what each part of the picture means. Nothing here is a roadmap — it all works right now.'
              : "Paste a project's address and see everything it has locked with Epoch — LP positions, vesting vaults, the lot. Then embed a badge that reads the chain live, so nobody has to take your word for it."}
      </p>

      {view === 'verify' && (
      <form
        class="search"
        onSubmit={(e) => {
          e.preventDefault()
          void search(query)
        }}
      >
        <input
          class="mono"
          value={query}
          onInput={(e) => setQuery(e.currentTarget.value)}
          placeholder="name.epoch, project address, lock id, or coin type"
          spellcheck={false}
          autocomplete="off"
        />
        <button class="btn" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Reading chain…' : 'Verify'}
        </button>
      </form>
      )}

      {wallet.address && status === 'idle' && (
        <button class="btn ghost mine" onClick={() => void search(wallet.address!)}>
          Show everything I locked
        </button>
      )}

      {view === 'new' && (
        <Create
          wallet={wallet}
          onCreated={(frost) => {
            go('verify')
            setResult(null)
            setSelected(frost)
            setStatus('ready')
            setUrl('id', frost.id)
            // The card is the point of the whole flow: they froze something in
            // order to be able to show it.
            setShare({ frost, celebrate: true })
            scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onCancel={() => go('verify')}
        />
      )}

      {view === 'deploy' && <Deploy wallet={wallet} onCancel={() => go('verify')} />}

      {view === 'guide' && (
        <Guide
          onPick={(id) => {
            go('verify')
            void pick(id)
          }}
          onGo={go}
        />
      )}

      {slow && (
        <p class="muted small">
          Still reading. The public Sui endpoint is slow right now, so this is retrying
          with a back-off rather than hammering it.
        </p>
      )}
      {status === 'error' && <p class="err">{error}</p>}
      {nothingFound && (
        <p class="err">
          Nothing locked with Epoch under that address. It may hold locks created by a different
          wallet — search that one instead.
        </p>
      )}

      {view === 'verify' && status === 'idle' && (
        <>
          <Landing
            onPick={(id) => {
              go('verify')
              void pick(id)
            }}
          />
          <div class="row">
            <button class="btn" onClick={() => go('new')}>
              ❄ Freeze something
            </button>
            <button class="btn ghost" onClick={() => go('deploy')}>
              Deploy
            </button>
          </div>
        </>
      )}

      {view === 'verify' && result && result.frosts.length > 1 && (
        <Results
          kind={result.kind}
          term={result.term}
          frosts={result.frosts}
          resolved={result.resolved}
          alsoName={result.alsoName}
          onSearch={(t) => { setQuery(t); void search(t) }}
          onPick={(id) => void pick(id)}
        />
      )}

      {view === 'verify' && selected && (
        <>
          <section class="stage">
            <div class="crt">
              <Frozen frost={selected} size={200} />
            </div>
            <Verdict frost={selected} />
            {selected.phase !== 'absent' && (
              <button
                class="btn stage-share"
                onClick={() => setShare({ frost: selected, celebrate: false })}
              >
                Share this proof
              </button>
            )}
          </section>

          {selected.phase !== 'absent' && (
            <>
              <Actions frost={selected} wallet={wallet} onDone={() => void pick(selected.id)} />
              <div class="cols">
                <Details frost={selected} />
                <Embed frost={selected} />
              </div>
            </>
          )}

          {result && result.frosts.length > 1 && (
            <button class="btn ghost" onClick={() => setSelected(null)}>
              ← Back to {result.frosts.length} results
            </button>
          )}
        </>
      )}

      <footer class="foot">
        <span>
          Reads <code>epoch_object_lock</code> and <code>vesting_service</code> on Sui mainnet.
          Nothing is stored off-chain.
        </span>
        <a href="https://epochsui.com" target="_blank" rel="noopener noreferrer">
          Built on Epoch ↗
        </a>
      </footer>
      </div>

      {share && (
        <ProofCard
          frost={share.frost}
          celebrate={share.celebrate}
          onClose={() => setShare(null)}
        />
      )}
    </>
  )
}

/**
 * The decals pinned to the page.
 *
 * They are aria-hidden decoration, so they are allowed to be jokes — but they
 * are jokes about the current state, not fixed text. A page that says "walrus
 * status: chill" over a lock that cracked open this morning is lying in the
 * one register the reader has not been taught to distrust.
 */
function Stickers({ view, frost }: { view: View; frost: Frost | null }) {
  const pair: [string, string] =
    view === 'new'
      ? ['Blizzard mode', 'One signature, no undo']
      : view === 'deploy'
        ? ['Name cap required', 'Ships one blob']
        : frost?.phase === 'cracked'
          ? ['Walrus status: awake', 'Term elapsed']
          : frost?.phase === 'thawed'
            ? ['Walrus status: swimming', 'Nothing left to hold']
            : frost
              ? ['Walrus status: asleep', 'Read-only proof']
              : ['Walrus status: chill', 'Read-only proof']

  return (
    <>
      <span class="sticker s-yellow" style="--tilt:-5deg; top:118px; right:34px" aria-hidden="true">
        {pair[0]}
      </span>
      <span class="sticker s-pink" style="--tilt:4deg; top:186px; right:96px" aria-hidden="true">
        {pair[1]}
      </span>
    </>
  )
}

function Verdict({ frost }: { frost: Frost }) {
  if (frost.phase === 'absent') {
    return (
      <div class="verdict is-absent">
        <b>No Epoch lock here</b>
        <p class="muted">
          This object exists on Sui but it is not an Epoch lock or vesting vault. Nothing is frozen.
        </p>
      </div>
    )
  }
  const copy: Record<string, [string, string]> = {
    melting: [
      'Still frozen',
      'The creator cannot cancel this or pull it forward. Only the beneficiary can push the date further out.',
    ],
    cracked: ['Unlocked', 'The term has elapsed. The beneficiary can withdraw at any time.'],
    thawed: ['Fully claimed', 'Everything that was locked here has been withdrawn.'],
    sealed: ['Sealed', 'Locked and not yet melting.'],
  }
  const [title, body] = copy[frost.phase] ?? ['', '']

  return (
    <div class={`verdict is-${frost.phase}`}>
      <b>{title}</b>
      <p class="muted">{body}</p>
    </div>
  )
}

function WalletButton({ wallet }: { wallet: ReturnType<typeof useWallet> }) {
  const [open, setOpen] = useState(false)

  if (wallet.address) {
    return (
      <div class="wallet-state">
        {wallet.wrongNetwork && <span class="pill-warn">Wrong network</span>}
        <button
          class="btn ghost mono"
          title={`${wallet.address} — click to disconnect`}
          onClick={() => void wallet.disconnect()}
        >
          {shortAddr(wallet.address)}
        </button>
      </div>
    )
  }
  if (wallet.wallets.length === 0) {
    return <span class="muted small">No Sui wallet detected</span>
  }
  return (
    <div class="dropdown">
      <button class="btn ghost" onClick={() => setOpen(!open)} disabled={wallet.busy}>
        {wallet.busy ? 'Connecting…' : 'Connect wallet'}
      </button>
      {open && (
        <ul class="menu">
          {wallet.wallets.map((w) => (
            <li key={w.name}>
              <button
                onClick={() => {
                  setOpen(false)
                  void wallet.connect(w)
                }}
              >
                {w.icon && <img src={w.icon} alt="" width="16" height="16" />}
                {w.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
