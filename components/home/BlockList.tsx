'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BlockRowSkeleton } from '@/components/ui/Skeleton'
import { truncateHash, formatAge } from '@/lib/utils'
import type { BlockSummary } from '@/lib/types'

export function BlockList() {
  const [blocks, setBlocks] = useState<BlockSummary[]>([])
  const [newHashes, setNewHashes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const prevHashesRef = useRef<Set<string>>(new Set())

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/blocks?count=15')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const incoming: BlockSummary[] = data.blocks

      if (prevHashesRef.current.size === 0) {
        prevHashesRef.current = new Set(incoming.map((b) => b.hash))
        setBlocks(incoming)
        setError(null)
        setLoading(false)
        return
      }

      const fresh = new Set(
        incoming
          .filter((b) => !prevHashesRef.current.has(b.hash))
          .map((b) => b.hash)
      )
      prevHashesRef.current = new Set(incoming.map((b) => b.hash))

      setBlocks(incoming)
      setNewHashes(fresh)
      setError(null)

      if (fresh.size > 0) {
        setTimeout(() => setNewHashes(new Set()), 800)
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [load])

  return (
    <div className="card flex flex-col h-[600px] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1e1e2a] flex items-center justify-between shrink-0">
        <h2
          className="text-[#f0ede8]"
          style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em' }}
        >
          Latest Blocks
        </h2>
        <Link href="/blocks?page=1" className="text-xs text-[#4b5563] hover:text-[#C0392B] transition-colors">
          View all →
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
      {error ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-[#6b7280]">Node unreachable</p>
          <button onClick={load} className="mt-2 text-xs text-[#C0392B] hover:underline">
            Retry
          </button>
        </div>
      ) : loading ? (
        Array.from({ length: 8 }).map((_, i) => <BlockRowSkeleton key={i} />)
      ) : blocks.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-[#6b7280]">No blocks found</div>
      ) : (
        <AnimatePresence initial={false}>
          {blocks.map((block) => {
            const isNew = newHashes.has(block.hash)
            return (
              <motion.div
                key={block.hash}
                initial={isNew ? { opacity: 0, y: -20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  isNew
                    ? { duration: 0.25, ease: 'easeOut' }
                    : { duration: 0 }
                }
                layout="position"
              >
                <Link
                  href={`/block/${block.hash}`}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e2a] last:border-0 hover:bg-[#13131a] rust-hover transition-all duration-150 group"
                >
                  <span
                    className="text-[#C0392B] font-bold text-sm w-14 shrink-0"
                    style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                  >
                    #{block.height}
                  </span>

                  <span
                    className="hash font-mono text-xs group-hover:text-[#9ca3af] transition-colors flex-1 min-w-0 truncate"
                  >
                    {truncateHash(block.hash, 10, 8)}
                  </span>

                  <span
                    className="text-xs text-[#4b5563] text-center shrink-0"
                    style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                  >
                    {block.txCount}tx
                  </span>

                  <span
                    className="text-xs text-[#4b5563] text-right shrink-0 whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace', minWidth: 64 }}
                  >
                    {block.height === 0 ? 'Genesis' : formatAge(block.timestamp)}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>
      )}
      </div>
    </div>
  )
}
