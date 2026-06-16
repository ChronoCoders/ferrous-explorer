import { NextResponse } from 'next/server'
import { rpcCall, rpcBatch } from '@/lib/rpc'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const count = Math.min(parseInt(searchParams.get('count') ?? '20'), 50)

  try {
    const chainInfo = (await rpcCall('getblockchaininfo')) as { blocks: number }
    const tip = chainInfo.blocks

    const heights = Array.from({ length: Math.min(count, tip + 1) }, (_, i) => tip - i)

    const hashResults = await rpcBatch(heights.map((h) => ({ method: 'getblockhash', params: [h] })))
    const hashes = hashResults.filter(Boolean) as string[]

    const blockResults = await rpcBatch(hashes.map((h) => ({ method: 'getblock', params: [h, true] })))

    const blocks = blockResults
      .filter(Boolean)
      .map((b) => {
        const block = b as {
          hash: string
          height: number
          time: number
          n_tx: number
          size: number
          miner: string
          difficulty: number
        }
        return {
          height: block.height,
          hash: block.hash,
          timestamp: block.time,
          txCount: block.n_tx,
          size: block.size,
          miner: block.miner ?? '',
          difficulty: block.difficulty ?? 0,
        }
      })

    return NextResponse.json({ blocks })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 503 })
  }
}
