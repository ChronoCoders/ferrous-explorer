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
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 503 })
  }
}
