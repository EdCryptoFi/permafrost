#!/usr/bin/env node
/**
 * Claim-versus-behaviour audit.
 *
 * Every assertion the product makes about itself — in the badge, the guide and
 * the README — checked against what the code and the chain actually do. On a
 * product whose only value is that it does not overstate, drift between the
 * copy and the behaviour is the most expensive bug available.
 *
 *   npm run test:claims
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'pf-claims-'))
const out = join(dir, 'run.mjs')

execFileSync('npx', [
  'esbuild', 'scripts/claims-test.ts', '--bundle', '--platform=node', '--format=esm',
  `--outfile=${out}`, `--alias:@=${process.cwd()}/src`, '--log-level=error',
], { stdio: 'inherit' })

execFileSync('node', [out], { stdio: 'inherit' })
