'use client'

import { useEffect, useState, useRef } from 'react'
import { formatHashrate } from '@/lib/utils'

const MAX_POINTS = 50
const SVG_W = 1200
const SVG_H = 80

export function HashrateChart() {
  const [data, setData] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)
  // bufferRef persists across renders. setData triggers a re-render but this
  // ref keeps its value, so readings accumulate up to MAX_POINTS.
  const bufferRef = useRef<number[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch('/api/chain')
        const d = await res.json()
        if (d.hashrate != null) {
          bufferRef.current = [...bufferRef.current.slice(-(MAX_POINTS - 1)), d.hashrate as number]
          if (process.env.NODE_ENV === 'development') {
            console.log(`[HashrateChart] buffer length: ${bufferRef.current.length}, latest: ${d.hashrate}`)
          }
          setData([...bufferRef.current])
        }
      } catch {}
    }

    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])

  const current = data.length > 0 ? data[data.length - 1] : 0

  // Build the SVG path from the buffered readings.
  const path = (() => {
    if (data.length < 2) return null
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * SVG_W
      const y = SVG_H - ((v - min) / range) * (SVG_H - 8) - 4
      return `${x},${y}`
    })
    return `M ${points.join(' L ')}`
  })()

  return (
    <div
      className="card"
      style={{ padding: 0, overflow: 'hidden' }}
    >
      {/* Title row — owns its own padding */}
      <div className="flex items-center justify-between" style={{ padding: '12px 16px' }}>
        <h2
          style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em' }}
          className="text-[#f0ede8]"
        >
          Network Hashrate
        </h2>
        <span
          className="text-sm text-[#C0392B] font-medium"
          style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
        >
          {mounted ? formatHashrate(current) : '—'}
        </span>
      </div>

      {/* Chart — exactly 80px, no surrounding space */}
      <div style={{ height: 80, overflow: 'hidden' }}>
        {!mounted || path === null ? (
          <div className="skeleton" style={{ height: 80, width: '100%' }} />
        ) : (
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: 80, display: 'block' }}
          >
            <path d={path} fill="none" stroke="#C0392B" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
        )}
      </div>
    </div>
  )
}
