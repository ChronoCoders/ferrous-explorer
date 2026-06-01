import { NextResponse } from 'next/server'
import { rpcCall } from '@/lib/rpc'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ addr: string }> }) {
  const { addr } = await params
  try {
    const raw = (await rpcCall('listunspent')) as any[]
    const utxos = (raw ?? [])
      .filter((u: any) => u.address === addr)
      .map((u: any) => ({
        txid: u.txid,
        vout: u.vout,
        amount: u.amount ?? u.value ?? 0,
        height: u.height ?? 0,
        confirmations: u.confirmations ?? 0,
        coinbase: u.coinbase ?? false,
        scriptPubkey: u.script_pubkey ?? '',
        spendable: (u.confirmations ?? 0) >= (u.coinbase ? 100 : 1),
      }))

    const balance = utxos.reduce((s: number, u: any) => s + u.amount, 0)

    return NextResponse.json({
      address: addr,
      balance,
      utxoCount: utxos.length,
      utxos,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 503 })
  }
}
