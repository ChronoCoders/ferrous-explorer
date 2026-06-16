import { NextResponse } from 'next/server'
import { rpcCall, rpcBatch } from '@/lib/rpc'
import { estimateTxSize } from '@/lib/txSize'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ txid: string }> }) {
  const { txid } = await params
  try {
    const chainInfo = (await rpcCall('getblockchaininfo')) as { blocks: number }
    const tip = chainInfo.blocks
    const searchDepth = Math.min(tip, 100)

    const heights = Array.from({ length: searchDepth }, (_, i) => Math.max(0, tip - i))
    const hashResults = await rpcBatch(heights.map((h) => ({ method: 'getblockhash', params: [h] })))
    const hashes = hashResults.filter(Boolean) as string[]

    for (const blockHash of hashes) {
      const raw = (await rpcCall('getblock', [blockHash, true])) as any
      const txs: any[] = raw.transactions ?? []
      const found = txs.find((t: any) => t.txid === txid)
      if (found) {
        const isCoinbase = found.vin?.some((i: any) => i.coinbase === true) ?? false
        const inputs = (found.vin ?? []).map((i: any) => ({
          txid: i.txid ?? '',
          vout: i.vout ?? 0,
          scriptSig: i.script_sig ?? '',
          isCoinbase: i.coinbase === true,
          address: i.address ?? undefined,
          amount: i.value ?? undefined,
        }))
        const outputs = (found.vout ?? []).map((o: any, idx: number) => ({
          n: idx,
          address: o.address ?? '',
          amount: Math.round((o.value_frr ?? o.value ?? 0) * 1e8),
          scriptPubkey: o.script_pubkey ?? '',
        }))
        const totalOut = outputs.reduce((s: number, o: any) => s + o.amount, 0)
        return NextResponse.json({
          txid: found.txid,
          version: found.version ?? 1,
          inputs,
          outputs,
          size: found.size ?? estimateTxSize(inputs.length, outputs.length, isCoinbase),
          isCoinbase,
          totalOut,
          blockHash: raw.hash,
          blockHeight: raw.height,
          confirmations: tip - raw.height + 1,
          timestamp: raw.time,
        })
      }
    }
    return NextResponse.json({ error: 'Transaction not found in last 100 blocks' }, { status: 404 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 503 })
  }
}
