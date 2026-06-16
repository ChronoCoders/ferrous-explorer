import { NextResponse } from 'next/server'
import { rpcCall, rpcBatch } from '@/lib/rpc'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const chainInfo = (await rpcCall('getblockchaininfo')) as { blocks: number }
    const tip = chainInfo.blocks
    const count = Math.min(20, tip + 1)

    const heights = Array.from({ length: count }, (_, i) => Math.max(0, tip - i))

    const hashes = (await rpcBatch(
      heights.map((h) => ({ method: 'getblockhash', params: [h] }))
    )) as string[]

    const blocks = (await rpcBatch(
      hashes.filter(Boolean).map((h) => ({ method: 'getblock', params: [h, true] }))
    )) as any[]

    const txs: any[] = []
    for (const block of blocks.filter(Boolean)) {
      for (const tx of block.transactions ?? []) {
        const isCoinbase = tx.vin?.some((i: any) => i.coinbase === true) ?? false
        const outputs = (tx.vout ?? []).map((o: any, idx: number) => ({
          n: idx,
          address: o.address ?? '',
          amount: Math.round((o.value_frr ?? o.value ?? 0) * 1e8),
          scriptPubkey: o.script_pubkey ?? '',
        }))
        const totalOut = outputs.reduce((s: number, o: any) => s + o.amount, 0)

        txs.push({
          txid: tx.txid,
          isCoinbase,
          totalOut,
          blockHeight: block.height,
          blockHash: block.hash,
          timestamp: block.time,
        })
      }
    }

    return NextResponse.json({ transactions: txs.slice(0, 20) })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 503 })
  }
}
