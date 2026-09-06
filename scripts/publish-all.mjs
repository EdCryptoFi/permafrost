#!/usr/bin/env node
/**
 * Build, publish both bundles to Walrus, verify each one came back byte for
 * byte, and record the ids in src/chain/published.ts.
 *
 * Publishing by hand meant carrying two 43-character ids between a terminal
 * and a browser field — and one of them starts with a hyphen, which shells and
 * clipboards love to mangle. This closes that gap: the file the deploy screen
 * reads is written from the publisher's own response, so it cannot claim an id
 * that was never stored.
 *
 *   npm run publish:all
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, statSync } from 'node:fs'

const AGG = 'https://aggregator.walrus-mainnet.walrus.space/v1/blobs'
const OG_BLOB = '1FKmDKfGGZmY064rKYtxwt2QuG3MaySoVOsWnYs2ePM'

const TARGETS = [
  { name: 'permafrost', file: 'dist/app/index.html' },
  { name: 'frostbadge', file: 'dist/badge/badge.html' },
]

const run = (cmd, args, env) =>
  execFileSync(cmd, args, { encoding: 'utf8', env: { ...process.env, ...env } })

console.error('building…')
run('npm', ['run', 'build'], { VITE_OG_IMAGE: `${AGG}/${OG_BLOB}` })

const published = []

for (const t of TARGETS) {
  const local = readFileSync(t.file)
  console.error(`publishing ${t.name} (${(local.length / 1024).toFixed(1)} KB)…`)

  const blobId = run('node', ['scripts/publish.mjs', t.file]).trim()
  if (!blobId) throw new Error(`no blob id for ${t.name}`)

  // Never record an id without reading it back: a publish that reported
  // success but stored nothing would otherwise be recorded as truth.
  const res = await fetch(`${AGG}/${blobId}`)
  if (!res.ok) throw new Error(`${t.name}: aggregator returned ${res.status} for ${blobId}`)
  const remote = Buffer.from(await res.arrayBuffer())
  if (!remote.equals(local)) {
    throw new Error(`${t.name}: stored blob differs from the local build`)
  }

  console.error(`  ok ${blobId} — ${remote.length} bytes verified`)
  published.push({ name: t.name, blobId, bytes: remote.length })
}

const today = new Date().toISOString().slice(0, 10)
const header = readFileSync('src/chain/published.ts', 'utf8').split('export const PUBLISHED')[0]

writeFileSync(
  'src/chain/published.ts',
  header +
    'export const PUBLISHED: PublishedBlob[] = [\n' +
    published
      .map(
        (p) =>
          `  {\n    name: '${p.name}',\n    blobId: '${p.blobId}',\n` +
          `    bytes: ${p.bytes},\n    publishedAt: '${today}',\n  },`,
      )
      .join('\n') +
    '\n]\n\nexport const suggestedBlobFor = (name: string): PublishedBlob | undefined =>\n' +
    '  PUBLISHED.find((p) => p.name === name)\n',
)

console.error('\nrecorded in src/chain/published.ts:')
for (const p of published) console.log(`  ${p.name.padEnd(12)} ${p.blobId}`)

/*
 * Build again, and it matters.
 *
 * The deploy console reads its suggested blob ids from `published.ts`, which
 * is bundled INTO the build. Recording them after the build meant every
 * published console carried the ids of the publish before it — so opening the
 * deploy screen and signing what it offered re-pointed each name at the blob
 * it was already on. A no-op that looks exactly like success: a signature, a
 * digest, a green tick, and nothing changed on chain.
 *
 * The rebuilt bundle has different bytes from the one just uploaded, so it is
 * not the blob being signed. That is fine and unavoidable — the console
 * cannot contain its own hash. What matters is that the ids it SUGGESTS are
 * the ones that were just published, and now they are.
 */
console.error('\nrebuilding so the deploy console carries these ids…')
// Same env as the first build. Without it the rebuild silently drops the
// og:image — the tag was set from VITE_OG_IMAGE, so a plain `build:site` here
// left the local bundle 350 bytes lighter than the one that shipped and
// missing its social card. The published blob was fine; the artifact left on
// disk afterwards was not, and that is the one a person would reach for next.
run('npm', ['run', 'build:site'], { VITE_OG_IMAGE: `${AGG}/${OG_BLOB}` })

console.error('\nsign the two update_blob calls at ?view=deploy')
