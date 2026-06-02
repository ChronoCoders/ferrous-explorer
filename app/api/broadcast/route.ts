import { NextResponse } from 'next/server'
import { rpcCall } from '@/lib/rpc'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let hex = ''
  try {
    const body = (await req.json()) as { hex?: string }
    hex = (body.hex ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!hex) {
    return NextResponse.json({ error: 'Missing transaction hex' }, { status: 400 })
  }
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
    return NextResponse.json({ error: 'Not a valid hex string' }, { status: 400 })
  }

  try {
    const txid = (await rpcCall('sendrawtransaction', [hex])) as string
    return NextResponse.json({ txid })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    )
  }
}
