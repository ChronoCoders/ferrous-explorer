'use client'

import { useEffect, useState, useCallback } from 'react'
import { Clock } from 'lucide-react'
import { truncateHash } from '@/lib/utils'
import type { MempoolTx } from '@/lib/types'

export function MempoolPanel() {
  const [txs, setTxs] = useState<MempoolTx[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/mempool')
      const data = await res.json()
      setTxs(data.transactions ?? [])
    } catch {
      setTxs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 20000)
    return () => clearInterval(id)
  }, [load])

  return (
    <div className="card flex flex-col h-[600px] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1e1e2a] flex items-center justify-between shrink-0">
        <h2 style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em' }}
          className="text-[#f0ede8]">
          Mempool
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a24] text-[#6b7280]"
          style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}>
          {txs.length} pending
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="skeleton w-32 h-4" />
        </div>
      ) : txs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#4b5563]">
          <Clock className="w-8 h-8 opacity-30" />
          <p className="text-sm">No pending transactions</p>
          <p className="text-xs opacity-50">Mempool is empty</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {txs.map((tx, i) => (
            <div key={tx.txid + i} className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e2a] last:border-0">
              <span className="hash flex-1 min-w-0 truncate">{truncateHash(tx.txid)}</span>
              <span className="text-xs text-[#4b5563] shrink-0" style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}>
                {tx.size}B
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
