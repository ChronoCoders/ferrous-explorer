import { NextResponse } from 'next/server'
import { rpcCall } from '@/lib/rpc'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // getrawmempool returns:
    // { count, total_size, transactions: [{ txid, size, vsize, vin_count, vout_count, output_value }] }
    // On nodes that don't yet expose the method, rpcCall throws → caught below.
    const res = (await rpcCall('getrawmempool')) as {
      count: number
      total_size: number
      transactions: Array<{
        txid: string
        size: number
        vsize: number
        vin_count: number
        vout_count: number
        output_value: number
      }>
    }

    const transactions = (res?.transactions ?? []).map((tx) => ({
      txid: tx.txid,
      size: tx.size ?? 0,
      vsize: tx.vsize ?? 0,
      vinCount: tx.vin_count ?? 0,
      voutCount: tx.vout_count ?? 0,
      outputValue: tx.output_value ?? 0,
    }))

    return NextResponse.json({
      count: res?.count ?? transactions.length,
      totalSize: res?.total_size ?? 0,
      transactions,
    })
  } catch {
    // Method not found (node not yet redeployed) or node unreachable —
    // degrade gracefully to an empty mempool rather than erroring the page.
    return NextResponse.json({ count: 0, totalSize: 0, transactions: [] })
  }
}
