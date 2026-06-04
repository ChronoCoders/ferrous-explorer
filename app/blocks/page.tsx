'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { truncateHash, formatAge, formatBytes } from '@/lib/utils'
import { BlockRowSkeleton } from '@/components/ui/Skeleton'
import { PageTransition } from '@/components/layout/PageTransition'
import type { BlockSummary } from '@/lib/types'

interface PagedResponse {
  blocks: BlockSummary[]
  page: number
  totalPages: number
  totalBlocks: number
  hasNext: boolean
  hasPrev: boolean
}

const LIMIT = 25

function BlocksInner() {
  const searchParams = useSearchParams()
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))

  const [data, setData] = useState<PagedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (background = false) => {
      if (!background) setLoading(true)
      try {
        const res = await fetch(`/api/blocks/paginated?page=${page}&limit=${LIMIT}`)
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        setData(json)
        setError(null)
      } catch (e) {
        // Don't blow away a good view on a transient background failure
        if (!background) setError(String(e))
      } finally {
        if (!background) setLoading(false)
      }
    },
    [page]
  )

  useEffect(() => {
    load()
    // Only page 1 polls for new blocks — historical pages stay static so the
    // list doesn't shift while the user is reading. Background refreshes skip
    // the skeleton so the list updates in place.
    if (page === 1) {
      const id = setInterval(() => load(true), 15000)
      return () => clearInterval(id)
    }
  }, [load, page])

  const totalPages = data?.totalPages ?? 1
  const hasPrev = data?.hasPrev ?? page > 1
  const hasNext = data?.hasNext ?? false

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-2 text-xs text-[#4b5563] mb-4"
          style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
        >
          <Link href="/" className="hover:text-[#C0392B] transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-[#f0ede8]">BLOCKS</span>
        </div>

        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <h1
            style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', letterSpacing: '0.06em' }}
            className="text-4xl text-[#f0ede8]"
          >
            Blocks
          </h1>
          {data && (
            <span className="text-xs text-[#4b5563]" style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}>
              {data.totalBlocks.toLocaleString()} total blocks
            </span>
          )}
        </div>

        <div className="card overflow-hidden">
          {/* Column headers */}
          <div
            className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-b border-[#1e1e2a] text-xs text-[#4b5563] tracking-widest"
            style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
          >
            <span className="w-16 shrink-0">HEIGHT</span>
            <span className="flex-1 min-w-0">HASH</span>
            <span className="w-14 text-center shrink-0">TXS</span>
            <span className="w-20 text-right shrink-0">SIZE</span>
            <span className="w-24 text-right shrink-0">AGE</span>
            <span className="w-40 text-right shrink-0">MINER</span>
          </div>

          {error ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-[#6b7280]">Node unreachable</p>
              <button onClick={() => load()} className="mt-2 text-xs text-[#C0392B] hover:underline">Retry</button>
            </div>
          ) : loading ? (
            Array.from({ length: 12 }).map((_, i) => <BlockRowSkeleton key={i} />)
          ) : !data || data.blocks.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-[#6b7280]">No blocks found</div>
          ) : (
            data.blocks.map((block) => (
              <Link
                key={block.hash}
                href={`/block/${block.hash}`}
                className="flex items-center gap-4 px-4 py-3 border-b border-[#1e1e2a] last:border-0 hover:bg-[#13131a] rust-hover transition-all duration-150 group"
              >
                <span
                  className="text-[#C0392B] font-bold text-sm w-16 shrink-0"
                  style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                >
                  #{block.height}
                </span>
                <span className="hash font-mono text-xs flex-1 min-w-0 truncate group-hover:text-[#9ca3af] transition-colors">
                  {truncateHash(block.hash, 12, 10)}
                </span>
                <span
                  className="text-xs text-[#4b5563] w-14 text-center shrink-0"
                  style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                >
                  {block.txCount}tx
                </span>
                <span
                  className="text-xs text-[#4b5563] w-20 text-right shrink-0"
                  style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                >
                  {formatBytes(block.size)}
                </span>
                <span
                  className="text-xs text-[#4b5563] w-24 text-right shrink-0 whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                >
                  {block.height === 0 ? 'Genesis' : formatAge(block.timestamp)}
                </span>
                <span
                  className="text-xs text-[#6b7280] w-40 text-right shrink-0 truncate"
                  style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                >
                  {block.miner ? truncateHash(block.miner, 6, 6) : '—'}
                </span>
              </Link>
            ))
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <PageButton href="/blocks?page=1" disabled={!hasPrev} label="First page">
            <ChevronsLeft size={16} />
          </PageButton>
          <PageButton href={`/blocks?page=${page - 1}`} disabled={!hasPrev} label="Previous page">
            <ChevronLeft size={16} />
            <span className="hidden sm:inline ml-1">Previous</span>
          </PageButton>

          <span
            className="px-4 text-sm text-[#9ca3af] whitespace-nowrap"
            style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
          >
            Page {page} of {totalPages.toLocaleString()}
          </span>

          <PageButton href={`/blocks?page=${page + 1}`} disabled={!hasNext} label="Next page">
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight size={16} />
          </PageButton>
          <PageButton href={`/blocks?page=${totalPages}`} disabled={!hasNext} label="Last page">
            <ChevronsRight size={16} />
          </PageButton>
        </div>
      </div>
    </PageTransition>
  )
}

function PageButton({
  href,
  disabled,
  label,
  children,
}: {
  href: string
  disabled: boolean
  label: string
  children: React.ReactNode
}) {
  const base =
    'flex items-center px-3 py-2 rounded-md text-sm border transition-all'
  if (disabled) {
    return (
      <span
        aria-disabled
        className={`${base} border-[#1e1e2a] text-[#2a2a3a] cursor-not-allowed`}
        style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
      >
        {children}
      </span>
    )
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={`${base} border-[#1e1e2a] text-[#9ca3af] hover:border-[#C0392B]/40 hover:text-[#C0392B]`}
      style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
    >
      {children}
    </Link>
  )
}

export default function BlocksPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="card overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <BlockRowSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <BlocksInner />
    </Suspense>
  )
}
