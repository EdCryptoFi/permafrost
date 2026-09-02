#!/usr/bin/env node
/**
 * Rebuild the social card PNG from assets/og.svg.
 *
 * macOS ships no SVG rasteriser except Quick Look, which always renders into a
 * SQUARE canvas fitted by height — a 1200x630 source comes back with its sides
 * cropped. So the source is authored square with the design centred, rendered,
 * then the middle band is cropped back out at exactly 1200x630.
 */
import { execFileSync } from 'node:child_process'
import { rmSync, existsSync } from 'node:fs'

const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'ignore' })

rmSync('assets/og.svg.png', { force: true })
rmSync('assets/og.png', { force: true })

run('qlmanage', ['-t', '-s', '1200', '-o', 'assets', 'assets/og.svg'])
if (!existsSync('assets/og.svg.png')) {
  console.error('qlmanage produced nothing — is assets/og.svg valid?')
  process.exit(1)
}
run('sips', ['-c', '630', '1200', 'assets/og.svg.png', '--out', 'assets/og.png'])
rmSync('assets/og.svg.png', { force: true })

console.log('assets/og.png written at 1200x630')
console.log('next: node scripts/publish.mjs assets/og.png')
console.log('then: VITE_OG_IMAGE=https://aggregator.walrus-mainnet.walrus.space/v1/blobs/<id> npm run build:app')
