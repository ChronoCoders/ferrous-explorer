'use client'

import { useEffect, useState, useRef } from 'react'
import { formatHashrate, formatDifficulty } from '@/lib/utils'

type ChartTab = 'hashrate' | 'blocktime' | 'difficulty'

const MAX_POINTS = 50
const SVG_W = 1200
const SVG_H = 80
const BLOCK_TIME_TARGET = 150

const TABS: { key: ChartTab; label: string }[] = [
  { key: 'hashrate', label: 'HASHRATE' },
  { key: 'blocktime', label: 'BLOCK TIME' },
  { key: 'difficulty', label: 'DIFFICULTY' },
]

const META: Record<ChartTab, { title: string; color: string; fmt: (v: number) => string }> = {
  hashrate: { title: 'NETWORK HASHRATE', color: '#C0392B', fmt: (v) => formatHashrate(v) },
  blocktime: { title: 'BLOCK TIME', color: '#4ade80', fmt: (v) => `${Math.round(v)}s` },
  difficulty: { title: 'DIFFICULTY', color: '#f0ede8', fmt: (v) => formatDifficulty(v) },
}

export function ChainChart() {
  const [activeTab, setActiveTab] = useState<ChartTab>('hashrate')
  const [mounted, setMounted] = useState(false)
  const [, setVersion] = useState(0)

  const hashrateBuffer = useRef<number[]>([])
  const blocktimeBuffer = useRef<number[]>([])
  const difficultyBuffer = useRef<number[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const push = (buf: number[], v: number) => [...buf.slice(-(MAX_POINTS - 1)), v]

    const tick = async () => {
      try {
        const res = await fetch('/api/chain')
        const d = await res.json()
        if (d.hashrate != null) hashrateBuffer.current = push(hashrateBuffer.current, d.hashrate)
        if (d.avg_block_time != null) blocktimeBuffer.current = push(blocktimeBuffer.current, d.avg_block_time)
        if (d.difficulty != null) difficultyBuffer.current = push(difficultyBuffer.current, d.difficulty)
        setVersion((v) => v + 1)
      } catch {}
    }

    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])

  const meta = META[activeTab]
  const data =
    activeTab === 'hashrate'
      ? hashrateBuffer.current
      : activeTab === 'blocktime'
        ? blocktimeBuffer.current
        : difficultyBuffer.current

  const current = data.length > 0 ? data[data.length - 1] : 0

  const scaleVals = activeTab === 'blocktime' ? [...data, BLOCK_TIME_TARGET] : data
  const min = scaleVals.length ? Math.min(...scaleVals) : 0
  const max = scaleVals.length ? Math.max(...scaleVals) : 1
  const range = max - min || 1
  const yOf = (v: number) => SVG_H - ((v - min) / range) * (SVG_H - 8) - 4

  const path =
    data.length >= 2
      ? 'M ' + data.map((v, i) => `${(i / (data.length - 1)) * SVG_W},${yOf(v)}`).join(' L ')
      : null
  const targetY = activeTab === 'blocktime' ? yOf(BLOCK_TIME_TARGET) : null

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="flex items-center justify-between" style={{ padding: '12px 16px' }}>
        <h2
          style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em' }}
          className="text-[#f0ede8]"
        >
          {meta.title}
        </h2>

        <div className="flex items-center gap-3">
          <span
            className="text-sm font-medium"
            style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace', color: meta.color }}
          >
            {mounted && data.length > 0 ? meta.fmt(current) : '—'}
          </span>

          <div className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="px-2.5 py-1 rounded text-xs transition-all"
                style={{
                  fontFamily: 'var(--font-mono, "Space Mono"), monospace',
                  background: activeTab === t.key ? '#C0392B' : '#1a1a24',
                  color: activeTab === t.key ? '#fff' : '#6b7280',
                  border: `1px solid ${activeTab === t.key ? '#C0392B' : '#2a2a3a'}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: SVG_H, overflow: 'hidden' }}>
        {!mounted || path === null ? (
          <div className="skeleton" style={{ height: SVG_H, width: '100%' }} />
        ) : (
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: SVG_H, display: 'block' }}
          >
            {targetY !== null && (
              <line
                x1={0}
                y1={targetY}
                x2={SVG_W}
                y2={targetY}
                stroke="#4ade80"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity={0.4}
                vectorEffect="non-scaling-stroke"
              />
            )}
            <path d={path} fill="none" stroke={meta.color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
        )}
      </div>
    </div>
  )
}
