/**
 * The content policy is written twice. Check that it says the same thing.
 *
 * `index.html` carries it in a meta tag, which travels inside the blob and is
 * therefore the only copy a .epoch name serves. `vercel.json` sends it as an
 * HTTP header on the mirror. A browser given both applies the INTERSECTION —
 * the strictest of the two — so the mirror is silently governed by whichever
 * copy is tighter, per directive.
 *
 * That is how the embed panel broke on Vercel while passing everywhere else:
 * `frame-src` was widened in the meta tag to let the badge's own host be
 * framed, and the header still said `'self'`. The intersection blocked every
 * frame, and nothing in the build could see it, because the header is not in
 * the build.
 *
 * Run: node scripts/csp-parity-test.mjs
 */
import { readFileSync } from 'node:fs'

const html = readFileSync('index.html', 'utf8')
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'))

const meta = html.match(/http-equiv="Content-Security-Policy"\s*\n?\s*content="([^"]+)"/)?.[1]
if (!meta) {
  console.error('no CSP meta tag found in index.html')
  process.exit(1)
}

const rootRule = vercel.headers?.find((h) => h.source === '/')
const header = rootRule?.headers?.find((h) => h.key === 'Content-Security-Policy')?.value
if (!header) {
  console.error('no CSP header for "/" in vercel.json')
  process.exit(1)
}

const parse = (csp) =>
  Object.fromEntries(
    csp
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [name, ...values] = d.split(/\s+/)
        return [name, values.sort().join(' ')]
      }),
  )

const a = parse(meta)
const b = parse(header)

/*
 * `frame-ancestors` is expected to differ and must not be flagged.
 *
 * It has no effect in a meta tag at all — browsers ignore it there — so the
 * blob cannot express it, and the header is the only place it can be said.
 * The mirror is allowed to refuse being framed; the blob simply cannot ask.
 */
const EXPECTED_TO_DIFFER = new Set(['frame-ancestors'])

let bad = 0
const names = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()
console.log('\nCSP PARITY — index.html meta vs vercel.json header\n')

for (const name of names) {
  if (EXPECTED_TO_DIFFER.has(name)) continue
  const same = a[name] === b[name]
  if (!same) bad++
  console.log(
    `  ${same ? 'ok  ' : 'FAIL'}  ${name}` +
      (same ? '' : `\n          meta:   ${a[name] ?? '(absent)'}\n          header: ${b[name] ?? '(absent)'}`),
  )
}

console.log(`\n${bad === 0 ? 'both copies agree' : `${bad} directive(s) DIVERGED`}\n`)
process.exit(bad === 0 ? 0 : 1)
