/**
 * Does the built site work when every path returns the same blob?
 *
 * This exists because a bug shipped that could not be seen anywhere I was
 * looking. Every local check runs on a server that routes paths, where
 * `/badge/` serves the badge. The target does not: a .epoch name serves one
 * blob at every path, so `/badge/` serves the app — and the embed panel
 * framed 262 KB of PermaFrost inside a box meant for a badge, live, for
 * anyone who opened it.
 *
 * A static grep would not have caught it either; the url is assembled at
 * runtime from `location.origin`. So this serves the real build under the
 * real routing and asks the real browser what it ended up loading.
 *
 * Run: node scripts/epoch-routing-test.mjs
 */
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'

const SITE = 'dist/site/index.html'
const PORT = 8973
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const LOCK = '0xee72005ed5e5470c66acb08075b39ed8e4945355019b3022e56a2a9d8e0e60a9'

if (!existsSync(SITE)) {
  console.error(`${SITE} not found — run \`npm run build:site\` first.`)
  process.exit(1)
}

// One blob, every path. Exactly what walrus_names does.
const body = readFileSync(SITE)
const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': body.length })
  res.end(body)
})
await new Promise((r) => server.listen(PORT, r))

const origin = `http://localhost:${PORT}`
const dom = await new Promise((resolve, reject) => {
  const p = spawn(CHROME, [
    '--headless',
    '--disable-gpu',
    '--virtual-time-budget=20000',
    '--dump-dom',
    `${origin}/?id=${LOCK}`,
  ])
  let out = ''
  p.stdout.on('data', (d) => (out += d))
  p.on('error', reject)
  p.on('close', () => resolve(out))
})
server.close()

const srcs = [...dom.matchAll(/<iframe[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1])
const framed = srcs.filter((s) => s.startsWith('http'))
const sameOrigin = framed.filter((s) => s.startsWith(origin))

let bad = 0
const check = (text, ok, note = '') => {
  if (!ok) bad++
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${text}${note ? '  — ' + note : ''}`)
}

console.log('\nEPOCH ROUTING — every path serves one blob\n')
check('the page rendered at all', dom.includes('Embed this proof'))
check('the embed panel frames something', framed.length > 0, `${framed.length} frames`)
check(
  'no frame points back at this origin',
  sameOrigin.length === 0,
  sameOrigin.length ? `would render the app: ${sameOrigin[0]}` : 'all cross-origin',
)
check(
  'every frame points at the badge host',
  framed.length > 0 && framed.every((s) => s.includes('frostbadge.')),
  framed[0] ?? '',
)

console.log(`\n${bad === 0 ? 'passes' : `${bad} FAILED`} under one-blob routing\n`)
process.exit(bad === 0 ? 0 : 1)
