import { NextResponse } from 'next/server'
import { rpcCallAll } from '@/lib/rpc'

export const dynamic = 'force-dynamic'

interface RawMempoolTx {
  txid: string
  size: number
  vsize: number
  vin_count: number
  vout_count: number
  output_value: number
}

interface RawMempool {
  count: number
  total_size: number
  transactions: RawMempoolTx[]
}

export async function GET() {
  try {
    const perNode = (await rpcCallAll('getrawmempool')) as (RawMempool | null)[]

    const byTxid = new Map<string, RawMempoolTx>()
    for (const node of perNode) {
      if (!node?.transactions) continue
      for (const tx of node.transactions) {
        if (!byTxid.has(tx.txid)) byTxid.set(tx.txid, tx)
      }
    }

    const transactions = Array.from(byTxid.values()).map((tx) => ({
      txid: tx.txid,
      size: tx.size ?? 0,
      vsize: tx.vsize ?? 0,
      vinCount: tx.vin_count ?? 0,
      voutCount: tx.vout_count ?? 0,
      outputValue: tx.output_value ?? 0,
    }))

    const totalSize = transactions.reduce((s, t) => s + t.size, 0)

    return NextResponse.json({
      count: transactions.length,
      totalSize,
      transactions,
    })
  } catch {
    return NextResponse.json({ count: 0, totalSize: 0, transactions: [] })
  }
}
