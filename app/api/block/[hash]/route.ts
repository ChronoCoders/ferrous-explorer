import { NextResponse } from 'next/server'
import { rpcCall } from '@/lib/rpc'

export const dynamic = 'force-dynamic'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseVerboseBlock(b: any) {
  const txs = (b.transactions ?? []).map((tx: any) => {
    const isCoinbase = tx.vin?.some((i: any) => i.coinbase !== undefined) ?? false
    const inputs = (tx.vin ?? []).map((i: any) => ({
      txid: i.txid ?? '',
      vout: i.vout ?? 0,
      scriptSig: i.script_sig ?? i.scriptSig ?? '',
      isCoinbase: i.coinbase !== undefined,
      address: i.address ?? undefined,
      amount: i.value ?? undefined,
    }))
    const outputs = (tx.vout ?? []).map((o: any, idx: number) => ({
      n: idx,
      address: o.address ?? o.scriptPubkey ?? '',
      // value_frr is already in FRR (float); multiply by 1e8 to store as frsats
      amount: Math.round((o.value_frr ?? o.value ?? 0) * 1e8),
      scriptPubkey: o.script_pubkey ?? o.scriptPubKey ?? '',
    }))
    const totalOut = outputs.reduce((s: number, o: any) => s + o.amount, 0)
    return {
      txid: tx.txid,
      version: tx.version ?? 1,
      inputs,
      outputs,
      size: tx.size ?? 0,
      isCoinbase,
      totalOut,
      blockHash: b.hash,
      blockHeight: b.height,
      timestamp: b.time,
    }
  })

  return {
    hash: b.hash,
    height: b.height,
    timestamp: b.time,
    nBits: b.bits ?? b.n_bits ?? '',
    nonce: b.nonce ?? 0,
    merkleRoot: b.merkle_root ?? b.merkleroot ?? '',
    prevHash: b.prev_block_hash ?? b.previousblockhash ?? '',
    size: b.size ?? 0,
    txCount: b.n_tx ?? txs.length,
    miner: b.miner ?? '',
    difficulty: b.difficulty ?? 0,
    transactions: txs,
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params
  try {
    // If numeric, treat as height
    let blockHash = hash
    if (/^\d+$/.test(hash)) {
      blockHash = (await rpcCall('getblockhash', [parseInt(hash)])) as string
    }
    const raw = await rpcCall('getblock', [blockHash, true])
    const block = parseVerboseBlock(raw)
    return NextResponse.json(block)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 404 })
  }
}
