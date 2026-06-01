import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { truncateHash, formatFRR } from '@/lib/utils'
import type { UtxoEntry } from '@/lib/types'

export function UtxoList({ utxos }: { utxos: UtxoEntry[] }) {
  if (utxos.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-[#6b7280] mt-6">
        No UTXOs found for this address
      </div>
    )
  }

  return (
    <div className="card overflow-hidden mt-6">
      <div className="px-4 py-3 border-b border-[#1e1e2a]">
        <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em' }}
          className="text-[#f0ede8]">
          UTXOs ({utxos.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e2a]">
              {['TXID', 'BLOCK', 'CONFIRMATIONS', 'AMOUNT', 'STATUS'].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs text-[#4b5563] tracking-widest"
                  style={{ fontFamily: '"Space Mono", monospace' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {utxos.map((u, i) => (
              <tr key={u.txid + u.vout + i}
                className="border-b border-[#1e1e2a] last:border-0 hover:bg-[#13131a] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/tx/${u.txid}`} className="hash-link">
                    {truncateHash(u.txid)}
                  </Link>
                  <span className="text-[#4b5563]">:{u.vout}</span>
                </td>
                <td className="px-4 py-3 hash">{u.height}</td>
                <td className="px-4 py-3 hash">{u.confirmations}</td>
                <td className="px-4 py-3 text-right" style={{ fontFamily: '"Space Mono", monospace' }}>
                  {formatFRR(u.amount)} <span className="text-[#4b5563] text-xs">FRR</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={!u.spendable ? 'immature' : u.coinbase ? 'coinbase' : 'confirmed'}>
                    {!u.spendable ? 'IMMATURE' : u.coinbase ? 'COINBASE' : 'SPENDABLE'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
