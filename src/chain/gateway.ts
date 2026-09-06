/**
 * The EPT gateway.
 *
 * Epoch shipped a second way to pay for a vesting vault: instead of 10 SUI to
 * the vesting Treasury, you hand over a fixed amount of $EPT and the contract
 * sends it to @0x0 inside the same transaction. Burned by the code, not by a
 * promise to burn it later.
 *
 * Its own source says the counters are "for the public utility page". This is
 * the module that reads them.
 *
 * Two facts about this arrangement are load-bearing and nothing else states
 * them, so they are computed here rather than left to a reader:
 *
 *   The gateway pays the SUI fee out of a float it holds. When that float
 *   cannot cover one more deploy fee, the EPT path aborts — the button is
 *   dead, and the only sign is a Move abort code. So `vaultsAffordable` says
 *   how many more calls the float actually covers.
 *
 *   The gateway refuses to pay a deploy fee above `max_sui_fee`. That fee
 *   lives in a different contract and can be raised there, which would strand
 *   this path without touching it. `capped` says whether that has happened.
 */
import { fetchObject } from './graphql'
import { resolveCoinInfo, type CoinInfo } from './coins'
import { EPT_GATEWAY, VESTING } from './constants'

export type Gateway = {
  id: string
  /** Accepted coin, normalized with the `0x` a TypeName does not carry. */
  eptType: string | null
  coin: CoinInfo | null
  /** Raw units of `eptType` burned per vault. */
  eptFee: bigint
  /** Lifetime, raw units. */
  eptBurned: bigint
  vaultsCreated: number
  /** What the same vault costs paying the Treasury directly, in MIST. */
  suiFee: bigint
  suiFloat: bigint
  maxSuiFee: bigint
  paused: boolean
  /** How many more vaults the float can pay for. Zero means the path is dead. */
  vaultsAffordable: number
  /** The vesting deploy fee has risen past what this gateway will pay. */
  capped: boolean
}

/** A Move `TypeName` serializes without `0x`; every other type string has it. */
function withPrefix(t: string): string {
  return t.startsWith('0x') ? t : `0x${t}`
}

function big(v: unknown): bigint {
  if (typeof v === 'string' || typeof v === 'number') {
    try {
      return BigInt(v)
    } catch {
      return 0n
    }
  }
  return 0n
}

/**
 * Reads the gateway and the vesting Treasury together, because half of what
 * the gateway means is the number it is being compared against.
 */
export async function fetchGateway(signal?: AbortSignal): Promise<Gateway | null> {
  const [gw, treasury] = await Promise.all([
    fetchObject(EPT_GATEWAY.OBJECT, signal),
    fetchObject(VESTING.TREASURY, signal).catch(() => null),
  ])
  if (!gw) return null

  const j = gw.json
  const rawType = typeof j.ept_type === 'string' ? j.ept_type : null
  const eptType = rawType ? withPrefix(rawType) : null

  const suiFee = big(treasury?.json?.deploy_fee)
  const suiFloat = big(j.sui_float)
  const maxSuiFee = big(j.max_sui_fee)

  return {
    id: gw.address,
    eptType,
    // Best effort. A gateway whose ticker will not resolve is still a gateway;
    // the amounts are what matter and they are read from the chain either way.
    coin: eptType ? await resolveCoinInfo(eptType, signal).catch(() => null) : null,
    eptFee: big(j.ept_fee),
    eptBurned: big(j.ept_burned),
    vaultsCreated: Number(big(j.vaults_created)),
    suiFee,
    suiFloat,
    maxSuiFee,
    paused: j.paused === true,
    vaultsAffordable: suiFee > 0n ? Number(suiFloat / suiFee) : 0,
    capped: suiFee > maxSuiFee,
  }
}

/** Whether a wallet could actually use this path right now. */
export function gatewayOpen(g: Gateway): boolean {
  return !g.paused && !g.capped && g.eptType !== null && g.eptFee > 0n && g.vaultsAffordable > 0
}

/** Why it is closed, in the order the contract would abort. */
export function gatewayClosedReason(g: Gateway): string | null {
  if (g.eptType === null || g.eptFee === 0n) return 'No payment coin is configured yet.'
  if (g.paused) return 'Epoch has paused the EPT path. Paying in SUI is unaffected.'
  if (g.capped)
    return 'The vesting deploy fee now exceeds what this gateway will pay, so it aborts rather than draining its float.'
  if (g.vaultsAffordable === 0)
    return 'The gateway’s SUI float cannot cover another deploy fee. Anyone can top it up — `fund` is permissionless.'
  return null
}
