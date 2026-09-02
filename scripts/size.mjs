#!/usr/bin/env node
/** Bundle budget guard. The badge is the one that actually matters: it loads
 *  inside an iframe on somebody else's page, every page load. */
import { statSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { readFileSync } from 'node:fs'

const BUDGETS = [
  { name: 'badge', path: 'dist/badge/badge.html', maxGzip: 40_000 },
  { name: 'app', path: 'dist/app/index.html', maxGzip: 220_000 },
]

let failed = false
for (const b of BUDGETS) {
  if (!existsSync(b.path)) {
    console.log(`  ${b.name.padEnd(6)} not built`)
    continue
  }
  const raw = statSync(b.path).size
  const gz = gzipSync(readFileSync(b.path)).length
  const ok = gz <= b.maxGzip
  if (!ok) failed = true
  console.log(
    `  ${b.name.padEnd(6)} ${(raw / 1024).toFixed(1).padStart(7)} KB  ` +
      `gzip ${(gz / 1024).toFixed(1).padStart(6)} KB  ` +
      `${ok ? 'ok' : `OVER by ${((gz - b.maxGzip) / 1024).toFixed(1)} KB`}`,
  )
}
process.exit(failed ? 1 : 0)
