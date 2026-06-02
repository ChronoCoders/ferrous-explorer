'use client'

import { useEffect, useState, useRef } from 'react'
import { formatBytes } from '@/lib/utils'

const MAX_POINTS = 50
const SVG_W = 1200
const SVG_H = 80

function buildPath(data: number[]): string | null {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  return (
    'M ' +
    data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * SVG_W
        const y = SVG_H - ((v - min) / range) * (SVG_H - 8) - 4
        return `${x},${y}`
      })
      .join(' L ')
  )
}

export function MempoolDepthChart() {
  const [mounted, setMounted] = useState(false)
  const [, setVersion] = useState(0)
  const countBuffer = useRef<number[]>([])
  const sizeBuffer = useRef<number[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const push = (buf: number[], v: number) => [...buf.slice(-(MAX_POINTS - 1)), v]
    const tick = async () => {
      try {
        const res = await fetch('/api/mempool')
        const d = await res.json()
        if (d.error) return
        countBuffer.current = push(countBuffer.current, d.count ?? 0)
        sizeBuffer.current = push(sizeBuffer.current, d.totalSize ?? 0)
        setVersion((v) => v + 1)
      } catch {
        /* keep last good buffers */
      }
    }
    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])

  const counts = countBuffer.current
  const sizes = sizeBuffer.current
  const curCount = counts.length ? counts[counts.length - 1] : 0
  const curSize = sizes.length ? sizes[sizes.length - 1] : 0
  const minSize = sizes.length ? Math.min(...sizes) : 0
  const maxSize = sizes.length ? Math.max(...sizes) : 0
  // Each series normalized independently (secondary Y axis for size).
  const countPath = buildPath(counts)
  const sizePath = buildPath(sizes)

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="flex items-center justify-between" style={{ padding: '10px 16px' }}>
        <h2
          style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em' }}
          className="text-[#f0ede8]"
        >
          Mempool Depth
        </h2>
        <span
          className="text-sm font-medium text-[#f0ede8]"
          style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
        >
          {mounted ? `${curCount} txs · ${formatBytes(curSize)}` : '—'}
        </span>
      </div>

      <div style={{ height: 72, overflow: 'hidden' }}>
        {!mounted || countPath === null ? (
          <div className="skeleton" style={{ height: 72, width: '100%' }} />
        ) : (
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: 72, display: 'block' }}
          >
            <path d={countPath} fill="none" stroke="#C0392B" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            {sizePath && (
              <path
                d={sizePath}
                fill="none"
                stroke="#4ade80"
                strokeWidth="1.5"
                strokeDasharray="6 3"
                opacity={0.7}
                vectorEffect="non-scaling-stroke"
              />
            )}
            <text x={1180} y={12} textAnchor="end" fontSize={18} fill="#4ade80" opacity={0.5}>
              {Math.round(maxSize / 1024)}KB
            </text>
            <text x={1180} y={72} textAnchor="end" fontSize={18} fill="#4ade80" opacity={0.5}>
              {Math.round(minSize / 1024)}KB
            </text>
          </svg>
        )}
      </div>

      <div
        className="flex items-center gap-4 text-[11px] text-[#4b5563]"
        style={{ padding: '6px 16px', fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
      >
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ background: '#C0392B' }} /> TXS</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ background: '#4ade80' }} /> SIZE</span>
      </div>
    </div>
  )
}
