import { NextResponse } from 'next/server'
import { rpcCall, rpcBatch } from '@/lib/rpc'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') ?? '25')), 50)

  try {
    const chainInfo = (await rpcCall('getblockchaininfo')) as { blocks: number }
    const tip = chainInfo.blocks

    const totalBlocks = tip + 1
    const totalPages = Math.max(1, Math.ceil(totalBlocks / limit))

    const startHeight = tip - (page - 1) * limit

    const heights: number[] = []
    for (let i = 0; i < limit; i++) {
      const h = startHeight - i
      if (h < 0) break
      heights.push(h)
    }

    const hashResults = (await rpcBatch(
      heights.map((h) => ({ method: 'getblockhash', params: [h] }))
    )) as string[]
    const hashes = hashResults.filter(Boolean)

    const blockResults = (await rpcBatch(
      hashes.map((h) => ({ method: 'getblock', params: [h, true] }))
    )) as Array<{
      hash: string
      height: number
      time: number
      n_tx: number
      size: number
      miner: string
      difficulty: number
    } | null>

    const blocks = blockResults.filter(Boolean).map((b) => ({
      height: b!.height,
      hash: b!.hash,
      timestamp: b!.time,
      txCount: b!.n_tx,
      size: b!.size,
      miner: b!.miner ?? '',
      difficulty: b!.difficulty ?? 0,
    }))

    return NextResponse.json({
      blocks,
      page,
      totalPages,
      totalBlocks,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 503 })
  }
}
