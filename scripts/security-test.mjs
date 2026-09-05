#!/usr/bin/env node
/**
 * Security regression tests.
 *
 * The project has no test runner and one HTML file as its output, so these run
 * the real modules through esbuild rather than pulling in a framework the
 * bundle would have to justify. Each case is a vulnerability that was found by
 * audit and must not come back.
 *
 *   npm run test:security
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'pf-sec-'))
const entry = join(dir, 'run.ts')

writeFileSync(entry, `
import { safeSymbol } from '@/chain/coins'
import { isSuiObjectId } from '@/chain/resolve'
import { normalizeName } from '@/chain/names'
import { availableAction } from '@/chain/tx'
import type { Frost } from '@/chain/frost'

let pass = 0, fail = 0
const t = (name: string, ok: boolean) => {
  ok ? pass++ : fail++
  console.log(\`  \${ok ? 'ok  ' : 'FAIL'}  \${name}\`)
}

// VULN-001 — a ticker is attacker-composable text inside a trust artefact.
t('should reject a symbol that states a quantity', safeSymbol('1,000,000 SUI') === null)
t('should reject a symbol that claims an audit', safeSymbol('SUI \\u00b7 AUDITED') === null)
t('should reject a symbol carrying markup', safeSymbol('<img src=x>') === null)
t('should reject a symbol long enough to break layout', safeSymbol('A'.repeat(120)) === null)
t('should still accept a real ticker', safeSymbol('CCTOO') === 'CCTOO')
t('should still accept an underscored ticker', safeSymbol('AF_LP_IRON') === 'AF_LP_IRON')

// Object ids reach MoveCalls, so the shape gate must hold.
t('should reject a non-hex object id', !isSuiObjectId('0xZZZ'))
t('should reject an unprefixed object id', !isSuiObjectId('deadbeef'))
t('should reject an over-long object id', !isSuiObjectId('0x' + 'a'.repeat(65)))
t('should accept a well-formed object id', isSuiObjectId('0x' + 'a'.repeat(64)))

// Names are looked up against a registry; the shape gate mirrors the contract.
t('should reject a name with a path traversal', normalizeName('../etc') === null)
t('should reject a purely numeric name', normalizeName('12345') === null)
t('should reject a name that is too short', normalizeName('ab') === null)
t('should accept a real name with or without suffix',
  normalizeName('permafrost') === 'permafrost' && normalizeName('PermaFrost.epoch') === 'permafrost')

// Signing is gated on chain data vs the connected wallet, never on the URL.
const lock = {
  kind: 'lock', id: '0x1', phase: 'melting', progress: 0, released: 0,
  lockedAtMs: 0, unlockMs: 0, creator: '0xcreator', beneficiary: '0xowner',
  innerType: '0x2::a::B', nowMs: 0,
} as Frost
t('should offer nothing to a disconnected visitor', availableAction(lock, null) === null)
t('should offer nothing to a wallet that is not the beneficiary',
  availableAction(lock, '0xattacker') === null)
t('should offer extend to the beneficiary', availableAction(lock, '0xowner') === 'extend')
t('should offer nothing on a claimed lock',
  availableAction({ ...lock, phase: 'thawed' }, '0xowner') === null)

console.log(\`\\n\${pass} passed, \${fail} failed\`)
process.exit(fail ? 1 : 0)
`)

execFileSync(
  'npx',
  ['esbuild', entry, '--bundle', '--platform=node', '--format=esm',
   `--outfile=${join(dir, 'run.mjs')}`, `--alias:@=${process.cwd()}/src`, '--log-level=error'],
  { stdio: 'inherit' },
)
console.log('security regression tests\n')
execFileSync('node', [join(dir, 'run.mjs')], { stdio: 'inherit' })
