'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { truncateHash, formatFRR, formatBytes } from '@/lib/utils'
import { BlockRowSkeleton } from '@/components/ui/Skeleton'
import { PageTransition } from '@/components/layout/PageTransition'
import type { MempoolInfo, MempoolTx } from '@/lib/types'

export default function MempoolPage() {
  const [info, setInfo] = useState<MempoolInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (background = false) => {
    if (!background) setLoading(true)
    try {
      const res = await fetch('/api/mempool')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setInfo(json)
      setError(null)
    } catch (e) {
      if (!background) setError(String(e))
    } finally {
      if (!background) setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(() => load(true), 10000)
    return () => clearInterval(id)
  }, [load])

  const txs: MempoolTx[] = info?.transactions ?? []
  const totalSize = info?.totalSize ?? 0
  const totalOutput = txs.reduce((s, t) => s + t.outputValue, 0)

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div
          className="flex items-center gap-2 text-xs text-[#4b5563] mb-4"
          style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
        >
          <Link href="/" className="hover:text-[#C0392B] transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-[#f0ede8]">MEMPOOL</span>
        </div>

        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <h1
            style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', letterSpacing: '0.06em' }}
            className="text-4xl text-[#f0ede8]"
          >
            Mempool
          </h1>
          <span className="text-xs text-[#4b5563]" style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}>
            10s refresh
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'PENDING', value: loading ? null : (info?.count ?? txs.length).toLocaleString() },
            { label: 'TOTAL SIZE', value: loading ? null : formatBytes(totalSize) },
            { label: 'TOTAL OUTPUT', value: loading ? null : `${formatFRR(totalOutput)} FRR` },
          ].map(({ label, value }) => (
            <div key={label} className="card p-4">
              <div
                className="text-xs text-[#4b5563] mb-1 tracking-widest"
                style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
              >
                {label}
              </div>
              {value === null ? (
                <div className="skeleton w-20 h-5" />
              ) : (
                <div className="text-lg text-[#f0ede8]" style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}>
                  {value}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div
            className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-b border-[#1e1e2a] text-xs text-[#4b5563] tracking-widest"
            style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
          >
            <span className="flex-1 min-w-0">TXID</span>
            <span className="w-14 text-center shrink-0">VIN</span>
            <span className="w-14 text-center shrink-0">VOUT</span>
            <span className="w-20 text-right shrink-0">SIZE</span>
            <span className="w-20 text-right shrink-0">VSIZE</span>
            <span className="w-32 text-right shrink-0">OUTPUT</span>
          </div>

          {error ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-[#6b7280]">Node unreachable</p>
              <button onClick={() => load()} className="mt-2 text-xs text-[#C0392B] hover:underline">Retry</button>
            </div>
          ) : loading ? (
            Array.from({ length: 8 }).map((_, i) => <BlockRowSkeleton key={i} />)
          ) : txs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#4b5563]">
              <Clock className="w-10 h-10 opacity-30" />
              <p className="text-sm">No pending transactions</p>
              <p className="text-xs opacity-50">Mempool is empty</p>
            </div>
          ) : (
            txs.map((tx, i) => (
              <Link
                key={tx.txid + i}
                href={`/tx/${tx.txid}`}
                className="flex items-center gap-4 px-4 py-3 border-b border-[#1e1e2a] last:border-0 hover:bg-[#13131a] rust-hover transition-all duration-150 group"
              >
                <span className="hash font-mono text-xs flex-1 min-w-0 truncate group-hover:text-[#9ca3af] transition-colors">
                  {truncateHash(tx.txid, 12, 10)}
                </span>
                <span
                  className="text-xs text-[#4b5563] w-14 text-center shrink-0"
                  style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                >
                  {tx.vinCount}
                </span>
                <span
                  className="text-xs text-[#4b5563] w-14 text-center shrink-0"
                  style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                >
                  {tx.voutCount}
                </span>
                <span
                  className="text-xs text-[#4b5563] w-20 text-right shrink-0"
                  style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                >
                  {formatBytes(tx.size)}
                </span>
                <span
                  className="text-xs text-[#4b5563] w-20 text-right shrink-0"
                  style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                >
                  {formatBytes(tx.vsize)}
                </span>
                <span
                  className="text-xs text-[#f0ede8] w-32 text-right shrink-0 whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                >
                  {formatFRR(tx.outputValue)} <span className="text-[#4b5563]">FRR</span>
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  )
}
