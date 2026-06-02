import { NextResponse } from 'next/server'
import { rpcCall } from '@/lib/rpc'

export const dynamic = 'force-dynamic'

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
const BECH32M_CONST = 0x2bc830a3

function polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let chk = 1
  for (const v of values) {
    const top = chk >>> 25
    chk = ((chk & 0x1ffffff) << 5) ^ v
    for (let i = 0; i < 5; i++) if ((top >> i) & 1) chk ^= GEN[i]
  }
  return chk >>> 0
}

function hrpExpand(hrp: string): number[] {
  const out: number[] = []
  for (let i = 0; i < hrp.length; i++) out.push(hrp.charCodeAt(i) >> 5)
  out.push(0)
  for (let i = 0; i < hrp.length; i++) out.push(hrp.charCodeAt(i) & 31)
  return out
}

function convertBits(data: number[]): number[] {
  let acc = 0
  let bits = 0
  const out: number[] = []
  for (const value of data) {
    acc = (acc << 8) | value
    bits += 8
    while (bits >= 5) {
      bits -= 5
      out.push((acc >> bits) & 31)
    }
  }
  if (bits > 0) out.push((acc << (5 - bits)) & 31)
  return out
}

function bech32mEncode(hrp: string, data8: number[]): string {
  const data5 = convertBits(data8)
  const values = [...hrpExpand(hrp), ...data5]
  const mod = polymod([...values, 0, 0, 0, 0, 0, 0]) ^ BECH32M_CONST
  const checksum: number[] = []
  for (let i = 0; i < 6; i++) checksum.push((mod >> (5 * (5 - i))) & 31)
  return hrp + '1' + [...data5, ...checksum].map((d) => CHARSET[d]).join('')
}

// P2DL scriptPubKey: 0xaa 0x20 <32-byte hash> 0x88 0xac (36 bytes) → bech32m address.
function scriptPubkeyToAddress(hex: string, hrp: string): string | null {
  if (!/^[0-9a-fA-F]{72}$/.test(hex)) return null
  const bytes = Buffer.from(hex, 'hex')
  if (bytes.length !== 36) return null
  if (bytes[0] !== 0xaa || bytes[1] !== 0x20 || bytes[34] !== 0x88 || bytes[35] !== 0xac) return null
  return bech32mEncode(hrp, Array.from(bytes.subarray(2, 34)))
}

export async function GET(_req: Request, { params }: { params: Promise<{ addr: string }> }) {
  const { addr } = await params
  try {
    const hrp = addr.startsWith('frr1') ? 'frr' : 'tfrr'

    // listunspent returns { utxos: [...] } whose entries carry script_pubkey, not address.
    const raw = (await rpcCall('listunspent')) as { utxos?: any[] } | any[]
    const list: any[] = Array.isArray(raw) ? raw : (raw?.utxos ?? [])

    const utxos = list
      .filter((u: any) => u.address === addr || scriptPubkeyToAddress(u.script_pubkey ?? '', hrp) === addr)
      .map((u: any) => ({
        txid: u.txid,
        vout: u.vout,
        amount: Math.round((u.amount ?? u.value ?? 0) * 1e8), // FRR → frsats
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
