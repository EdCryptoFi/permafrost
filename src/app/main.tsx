import { render } from 'preact'
import '@/theme.css'
import { App } from './App'

/**
 * The app refuses to run inside a frame.
 *
 * This is not a security measure — `frame-ancestors` does that. It is a
 * blast radius limit, written after the alternative was seen live: a .epoch
 * name serves its single blob at every path, so a frame pointed at
 * `/badge/` got the whole application. Five copies of PermaFrost rendered
 * inside five boxes meant to hold a badge, each one starting a WebGL context
 * and its own burst of chain reads, on the page whose entire subject is a
 * small honest widget.
 *
 * The url is fixed now. This exists so that the next thing that frames this
 * document by mistake — a stale blob, a proxy, somebody's copy — shows one
 * line of text instead of a site inside a site.
 *
 * The badge has its own entry point and is unaffected: being framed is its
 * whole purpose.
 */
const framed = (() => {
  try {
    return window.self !== window.top
  } catch {
    // Cross-origin parent: reading `top` throws, and only a frame can be in
    // that position. Throwing is itself the answer.
    return true
  }
})()

const root = document.getElementById('app')!

if (framed) {
  // Built as nodes, not markup. Nothing here should ever be a string that
  // becomes HTML, least of all on a page that arrived somewhere unexpected.
  const p = document.createElement('p')
  p.style.cssText =
    'margin:0;padding:10px 14px;font:13px/1.4 system-ui,sans-serif;color:#bcc8ce'
  p.append('PermaFrost does not run in a frame. ')

  const a = document.createElement('a')
  a.href = location.href
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  a.style.cssText = 'color:#54d6ff'
  a.textContent = 'Open it directly'
  p.append(a)
  p.append('.')

  root.replaceChildren(p)
} else {
  render(<App />, root)
}
