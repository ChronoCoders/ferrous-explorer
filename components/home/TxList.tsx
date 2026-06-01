'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { BlockRowSkeleton } from '@/components/ui/Skeleton'
import { truncateHash, formatFRR, formatAge } from '@/lib/utils'

interface TxEntry {
  txid: string
  isCoinbase: boolean
  totalOut: number
  blockHeight: number
  blockHash: string
  timestamp: number
}

export function TxList() {
  const [txs, setTxs] = useState<TxEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/txs')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setTxs(data.transactions ?? [])
      setError(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [load])

  return (
    <div className="card flex flex-col h-[600px] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1e1e2a] flex items-center justify-between shrink-0">
        <h2
          style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em' }}
          className="text-[#f0ede8]"
        >
          Latest Transactions
        </h2>
        <span className="text-xs text-[#4b5563]" style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}>
          30s
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
      {error ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-[#6b7280]">Node unreachable</p>
          <button onClick={load} className="mt-2 text-xs text-[#C0392B] hover:underline">Retry</button>
        </div>
      ) : loading ? (
        Array.from({ length: 8 }).map((_, i) => <BlockRowSkeleton key={i} />)
      ) : txs.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-[#6b7280]">No transactions found</div>
      ) : (
        <div>
          {txs.map((tx, i) => (
            <Link
              key={tx.txid + i}
              href={tx.isCoinbase ? `/block/${tx.blockHash}` : `/tx/${tx.txid}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e2a] last:border-0 hover:bg-[#13131a] transition-all duration-150 group"
            >
              <Badge variant={tx.isCoinbase ? 'coinbase' : 'p2dl'}>
                {tx.isCoinbase ? 'COINBASE' : 'P2DL'}
              </Badge>

              <span
                className="flex-1 min-w-0 truncate group-hover:text-[#9ca3af] transition-colors text-[#6b7280]"
                style={{ fontFamily: 'monospace', fontSize: 12 }}
              >
                {truncateHash(tx.txid, 8, 6)}
              </span>

              <span
                className="text-sm text-[#f0ede8] text-right shrink-0 whitespace-nowrap"
                style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
              >
                {formatFRR(tx.totalOut)}{' '}
                <span className="text-[#4b5563] text-xs">FRR</span>
              </span>

              <span
                className="text-xs text-[#4b5563] text-right shrink-0 whitespace-nowrap"
                style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace', minWidth: 56 }}
              >
                {formatAge(tx.timestamp)}
              </span>
            </Link>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
