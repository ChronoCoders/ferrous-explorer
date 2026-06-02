import { NextResponse } from 'next/server'
import { rpcCall, rpcBatch, rpcCallAll } from '@/lib/rpc'

export const dynamic = 'force-dynamic'

async function computeAvgBlockTime(tipHeight: number): Promise<number> {
  const SAMPLE = 10
  if (tipHeight < 2) return 150

  const count = Math.min(SAMPLE, tipHeight)
  const heights = Array.from({ length: count + 1 }, (_, i) => tipHeight - i)

  const hashes = (await rpcBatch(
    heights.map((h) => ({ method: 'getblockhash', params: [h] }))
  )) as string[]

  const blocks = (await rpcBatch(
    hashes.filter(Boolean).map((h) => ({ method: 'getblock', params: [h, true] }))
  )) as Array<{ time: number } | null>

  const timestamps = blocks
    .filter(Boolean)
    .map((b) => b!.time)
    .filter((t) => t > 0)
    .sort((a, b) => a - b)

  if (timestamps.length < 2) return 150

  const intervals: number[] = []
  for (let i = 1; i < timestamps.length; i++) {
    const diff = timestamps[i] - timestamps[i - 1]
    if (diff > 0) intervals.push(diff)
  }

  if (intervals.length === 0) return 150
  return Math.round(intervals.reduce((s, v) => s + v, 0) / intervals.length)
}

// Average fee per non-coinbase tx over the last 10 blocks, in frsats.
//
// The node's verbose getblock exposes no per-input amounts, so the literal
// Σinputs−Σoutputs per tx is not computable from RPC. The equivalent that IS
// computable is fees = coinbase_output − block_subsidy (miners claim fees into
// the coinbase). NOTE: the current Ferrous miner does NOT add fees to the
// coinbase (every coinbase output is exactly the 50 FRR subsidy), so this
// returns 0 today even when non-coinbase txs exist. The formula is correct and
// forward-compatible: it begins reporting real fees the moment the miner claims
// them. Returns 0 when there are no non-coinbase txs in the window.
async function computeAvgFeeSats(tipHeight: number): Promise<number> {
  const SAMPLE = 10
  if (tipHeight < 1) return 0

  const count = Math.min(SAMPLE, tipHeight)
  const heights = Array.from({ length: count }, (_, i) => tipHeight - i)

  const hashes = (await rpcBatch(
    heights.map((h) => ({ method: 'getblockhash', params: [h] }))
  )) as string[]

  const blocks = (await rpcBatch(
    hashes.filter(Boolean).map((h) => ({ method: 'getblock', params: [h, true] }))
  )) as Array<{
    height: number
    transactions: Array<{ is_coinbase: boolean; vout: Array<{ value_frr: number }> }>
  } | null>

  let totalFeesFrr = 0
  let nonCoinbaseCount = 0

  for (const b of blocks) {
    if (!b || !Array.isArray(b.transactions)) continue
    const subsidy = 50 / Math.pow(2, Math.floor(b.height / 840_000))
    const coinbase = b.transactions.find((t) => t.is_coinbase)
    const coinbaseOut = coinbase
      ? coinbase.vout.reduce((s, o) => s + o.value_frr, 0)
      : 0
    totalFeesFrr += Math.max(0, coinbaseOut - subsidy)
    nonCoinbaseCount += b.transactions.filter((t) => !t.is_coinbase).length
  }

  if (nonCoinbaseCount === 0) return 0
  return Math.round((totalFeesFrr / nonCoinbaseCount) * 100_000_000)
}

export async function GET() {
  try {
    const [chainInfo, miningInfo] = await Promise.all([
      rpcCall('getblockchaininfo') as Promise<{
        blocks: number
        bestblockhash: string
        chain: string
      }>,
      rpcCall('getmininginfo') as Promise<{
        networkhashps: number
        difficulty: number
        blocks: number
      }>,
    ])

    let connections = 0
    try {
      const netInfo = (await rpcCall('getnetworkinfo')) as { connections: number }
      connections = netInfo.connections
    } catch {}

    // Ask every node for getconnectioncount; count how many actually respond.
    // nodes_online is 0, 1, or 2 — distinct from `connections` (peer count
    // reported by the primary node).
    const connCounts = await rpcCallAll('getconnectioncount')
    const nodes_online = connCounts.filter((c) => c !== null).length

    const avg_block_time = await computeAvgBlockTime(chainInfo.blocks)
    const avg_fee_sats = await computeAvgFeeSats(chainInfo.blocks)

    // Circulating supply and blocks-until-next-halving, computed from height.
    // BigInt() constructor (not literal `n` syntax) so this compiles at the
    // project's ES2017 target.
    const ZERO = BigInt(0)
    const INITIAL_REWARD = BigInt(5_000_000_000) // 50 FRR in frsats
    const HALVING_INTERVAL = BigInt(840_000)
    const height = BigInt(chainInfo.blocks)

    const calculateSupply = (h: bigint): bigint => {
      let supply = ZERO
      let reward = INITIAL_REWARD
      let remaining = h
      while (remaining > ZERO && reward > ZERO) {
        const blocksThisEra = remaining < HALVING_INTERVAL ? remaining : HALVING_INTERVAL
        supply += blocksThisEra * reward
        remaining -= blocksThisEra
        reward /= BigInt(2)
      }
      return supply
    }

    const supply = calculateSupply(height)
    const blocksToHalving = HALVING_INTERVAL - (height % HALVING_INTERVAL)

    // Estimated next-block difficulty change (±1% retarget, inverse of target ratio).
    const BLOCK_TIME_TARGET = 150
    const targetRatio = Math.min(1.01, Math.max(0.99, avg_block_time / BLOCK_TIME_TARGET))
    const estimated_adjustment = Number(((1 / targetRatio - 1) * 100).toFixed(2)) // % difficulty, next block

    return NextResponse.json({
      height: chainInfo.blocks,
      bestblockhash: chainInfo.bestblockhash,
      hashrate: miningInfo.networkhashps,
      difficulty: miningInfo.difficulty,
      connections,
      nodes_online,
      chain: chainInfo.chain,
      avg_block_time,
      supply_frr: Number(supply) / 100_000_000,
      blocks_to_halving: Number(blocksToHalving),
      // RandomX epoch: key rotates every 2048 blocks (matches BlockHeader::epoch_key).
      epoch: Math.floor(chainInfo.blocks / 2048),
      epoch_progress: Math.round(((chainInfo.blocks % 2048) / 2048) * 100),
      total_txs: chainInfo.blocks, // approximate: ≥1 coinbase tx per block
      avg_fee_sats,
      estimated_adjustment, // signed % difficulty change estimated for the next block
      block_time_target: BLOCK_TIME_TARGET,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 503 })
  }
}
