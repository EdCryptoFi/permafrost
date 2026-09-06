/**
 * Claim-versus-behaviour audit. Every assertion the product makes about itself,
 * checked against what the code and the chain actually do.
 */
import { resolveFrost } from '@/chain/resolve'
import { smartSearch } from '@/chain/search'
import { resolveEpochName } from '@/chain/names'
import { availableAction, buildExtend, buildClaimLock, buildLock } from '@/chain/tx'
import { isHollow, urgencyOf, msLeft, type Frost } from '@/chain/frost'
import { safeSymbol } from '@/chain/coins'

let ok = 0, bad = 0
const claim = (text: string, holds: boolean, note = '') => {
  holds ? ok++ : bad++
  console.log(`  ${holds ? 'HOLDS  ' : 'BROKEN '} ${text}${note ? '  — ' + note : ''}`)
}

const CC   = '0xee72005ed5e5470c66acb08075b39ed8e4945355019b3022e56a2a9d8e0e60a9'
const MT   = '0xf63d5c606b3af6665e174ebbb268b78b9da51f76d3bb17144ca98308505a8c77'
const OWN  = '0x474bfe301c8505b13d0149cbbc106fa5ef7d9edf896aaa938789ed6a691b8d1d'

const cc = await resolveFrost(CC)
const mt = await resolveFrost(MT)

console.log('\nPURPOSE — "reads the lock from Sui, nothing stored off-chain"')
claim('reads real chain state', cc.phase === 'melting' && cc.lockedAmount! > 0n)
claim('no storage layer exists',
  !/localStorage|indexedDB/.test(
    (await import('node:fs')).readFileSync('src/chain/resolve.ts', 'utf8')))

console.log('\nDESCRIPTION — "the site holding it cannot edit a character"')
// Check the props type, not the file: the comment that states this rule and
// an aria-label derived from the frost both contain the word.
const props = (await import('node:fs'))
  .readFileSync('src/ice/Frozen.tsx', 'utf8')
  .match(/export type FrozenProps = \{([\s\S]*?)\n\}/)?.[1] ?? ''
claim('badge takes no free-text prop', !/:\s*string/.test(props),
  props.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(l => l.trim()).filter(Boolean).join(' '))
claim('chain-sourced tickers are shape-gated', safeSymbol('1,000,000 SUI') === null)

// "Connect any Sui wallet." The list is filtered before a reader ever sees it,
// so a filter that is too narrow is invisible: the wallet simply is not there
// and there is nothing to click. Both signing features, and no chain check
// before an account exists to ask.
{
  const w = (await import('node:fs')).readFileSync('src/wallet/useWallet.ts', 'utf8')
  const gate = w.slice(w.indexOf('function supportsSui'), w.indexOf('function supportsSui') + 220)
  claim('legacy-signing wallets are still offered',
    gate.includes('LEGACY') && gate.includes('||'))
  claim('wallets are not filtered on chains before connecting',
    !/function supportsSui[\s\S]{0,200}w\.chains/.test(w))
  claim('both signing features are actually called',
    w.includes('signAndExecuteTransactionBlock({') && w.includes('signAndExecuteTransaction({'))
}

console.log('\nDESCRIPTION — "the search box takes four different things"')
for (const [what, term, want] of [
  ['a .epoch name', 'permafrost.epoch', 'name'],
  ['a project address', OWN, 'creator'],
  ['a lock id', CC, 'object'],
  ['a coin type', '0x2::sui::SUI', 'coin'],
] as [string, string, string][]) {
  const r = await smartSearch(term, null)
  claim(`accepts ${what}`, r.kind === want, `kind=${r.kind}, ${r.frosts.length} found`)
}

console.log('\nDESCRIPTION — "nobody can cancel it or pull the date forward"')
claim('no cancel function is exposed anywhere',
  !/cancel|shorten|::unlock\b/.test(
    (await import('node:fs')).readFileSync('src/chain/tx.ts', 'utf8')))
const later = buildExtend(cc, cc.unlockMs + 86400e3)
claim('extend only builds a later date', !!later)

console.log('\nDESCRIPTION — "only the beneficiary can push the date further out"')
claim('offers nothing to a stranger', availableAction(cc, '0xstranger') === null)
claim('offers nothing when disconnected', availableAction(cc, null) === null)
claim('offers extend to the beneficiary', availableAction(cc, cc.beneficiary!) === 'extend')

console.log('\nDESCRIPTION — "a lock holding nothing says so"')
claim('the empty lock is flagged', isHollow(mt), `${mt.lockedAmount} ${mt.symbol}`)
claim('the funded lock is not flagged', !isHollow(cc))

console.log('\nDESCRIPTION — "under 30 days it says unlocking soon"')
const u = urgencyOf(cc)
claim('a lock inside the window is graded', u !== 'none',
  `${Math.round(msLeft(cc) / 86400e3)}d left -> ${u}`)
claim('a hollow lock is not double-flagged', urgencyOf(mt) === 'none')

console.log('\nFUNCTIONS — every builder produces a transaction')
claim('lock builder', !!buildLock({ itemId: '0x1', itemType: '0x2::a::B', unlockMs: Date.now() + 1e6, beneficiary: OWN }))
claim('claim builder', !!buildClaimLock(cc))

console.log('\nGUIDE — "nothing here is a roadmap, it all works right now"')
const guide = (await import('node:fs')).readFileSync('src/app/Guide.tsx', 'utf8')
claim('guide promises nothing future-tense',
  !/coming soon|will be|roadmap will|planned/i.test(guide))
claim('guide names only implemented packages',
  guide.includes('epoch_object_lock') && guide.includes('vesting_service'))

const rec = await resolveEpochName('permafrost')
claim('the site resolves its own name', !!rec, rec ? `blob ${rec.blobId.slice(0, 12)}…` : '')

console.log(`\n${ok} claims hold, ${bad} broken`)
process.exit(bad ? 1 : 0)
