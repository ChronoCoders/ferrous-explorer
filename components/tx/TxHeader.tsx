import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { CopyButton } from '@/components/ui/CopyButton'
import { formatAge, formatBytes } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

export function TxHeader({ tx }: { tx: Transaction }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-[#4b5563] mb-6" style={{ fontFamily: '"Space Mono", monospace' }}>
        <Link href="/" className="hover:text-[#C0392B] transition-colors">HOME</Link>
        <span>/</span>
        <span className="hover:text-[#C0392B] transition-colors cursor-default">TX</span>
        <span>/</span>
        <span className="text-[#f0ede8]">{tx.txid.slice(0, 12)}...</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.06em' }}
          className="text-4xl text-[#f0ede8]"
        >
          Transaction
        </h1>
        <Badge variant={tx.isCoinbase ? 'coinbase' : 'p2dl'}>
          {tx.isCoinbase ? 'COINBASE' : 'P2DL'}
        </Badge>
        {tx.confirmations != null && (
          <span className="text-sm px-3 py-1 rounded-full bg-[#1a1a24] text-[#22c55e] border border-[#22c55e]/20"
            style={{ fontFamily: '"Space Mono", monospace' }}>
            {tx.confirmations} confirmations
          </span>
        )}
      </div>

      <div className="mb-6 p-3 rounded-lg bg-[#13131a] border border-[#1e1e2a] flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-[#4b5563] mb-1" style={{ fontFamily: '"Space Mono", monospace' }}>TXID</div>
          <div className="text-sm text-[#9ca3af] break-all" style={{ fontFamily: '"Space Mono", monospace' }}>
            {tx.txid}
          </div>
        </div>
        <CopyButton text={tx.txid} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'BLOCK HEIGHT', value: tx.blockHeight?.toLocaleString() ?? '—' },
          { label: 'SIZE', value: formatBytes(tx.size) },
          { label: 'TIMESTAMP', value: tx.timestamp ? formatAge(tx.timestamp) : '—' },
          { label: 'CONFIRMATIONS', value: tx.confirmations?.toLocaleString() ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#13131a] border border-[#1e1e2a] rounded-lg p-4">
            <div className="text-xs text-[#4b5563] mb-1 tracking-widest" style={{ fontFamily: '"Space Mono", monospace' }}>
              {label}
            </div>
            <div className="text-sm text-[#f0ede8]" style={{ fontFamily: '"Space Mono", monospace' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {tx.blockHash && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#4b5563]" style={{ fontFamily: '"Space Mono", monospace' }}>BLOCK</span>
          <Link href={`/block/${tx.blockHash}`} className="hash-link text-sm">
            {tx.blockHash}
          </Link>
        </div>
      )}
    </div>
  )
}
