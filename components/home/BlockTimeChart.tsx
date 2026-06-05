'use client'

import { useEffect, useState, useRef } from 'react'
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell } from 'recharts'

interface BarDatum {
  height: number
  interval: number   // seconds
}

type Range = '1H' | '6H' | '24H'

const RANGE_BLOCKS: Record<Range, number> = {
  '1H': 24,   // ~24 blocks/hour at 150s
  '6H': 144,
  '24H': 576,
}

const TARGET = 150

function barColor(secs: number): string {
  if (secs < 120) return '#4ade80'
  if (secs <= 180) return '#f0ede8'
  return '#C0392B'
}

export function BlockTimeChart() {
  const [range, setRange] = useState<Range>('1H')
  const [data, setData] = useState<BarDatum[]>([])
  const [mounted, setMounted] = useState(false)
  const cache = useRef<Record<Range, BarDatum[]>>({ '1H': [], '6H': [], '24H': [] })

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return

    const load = async () => {
      // Use cache to avoid re-fetching
      if (cache.current[range].length > 0) {
        setData(cache.current[range])
        return
      }

      try {
        const count = RANGE_BLOCKS[range] + 1   // +1 to get one extra for interval calc
        const res = await fetch(`/api/blocks?count=${Math.min(count, 50)}`)
        const json = await res.json()
        if (json.error || !json.blocks) return

        const blocks: { height: number; timestamp: number }[] = json.blocks
        const sorted = [...blocks].sort((a, b) => a.height - b.height)

        const bars: BarDatum[] = []
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i - 1].height === 0) continue
          const diff = sorted[i].timestamp - sorted[i - 1].timestamp
          if (diff > 0) {
            bars.push({ height: sorted[i].height, interval: diff })
          }
        }

        const result = bars.reverse()  // newest first for display
        cache.current[range] = result
        setData(result)
      } catch {}
    }

    load()
  }, [mounted, range])

  const buttons: Range[] = ['1H', '6H', '24H']

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2
          style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em' }}
          className="text-[#f0ede8]"
        >
          Block Time History
        </h2>
        <div className="flex items-center gap-1">
          {buttons.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-2.5 py-1 rounded text-xs transition-all"
              style={{
                fontFamily: 'var(--font-mono, "Space Mono"), monospace',
                background: range === r ? '#C0392B' : '#1a1a24',
                color: range === r ? '#fff' : '#6b7280',
                border: `1px solid ${range === r ? '#C0392B' : '#2a2a3a'}`,
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {!mounted || data.length === 0 ? (
        <div className="skeleton rounded" style={{ height: 160 }} />
      ) : (
        <div style={{ height: 160, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 160 }}>
            <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="20%">
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload as BarDatum
                  return (
                    <div
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid rgba(192,57,43,0.3)',
                        borderRadius: '2px',
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '11px',
                        padding: '6px 10px',
                      }}
                    >
                      <div style={{ color: '#6b7280' }}>Block #{d.height}</div>
                      <div style={{ color: barColor(d.interval) }}>{d.interval}s</div>
                      <div style={{ color: '#4b5563' }}>target: {TARGET}s</div>
                    </div>
                  )
                }}
              />
              <Bar dataKey="interval" radius={[2, 2, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.interval)} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        {[
          { color: '#4ade80', label: '< 120s fast' },
          { color: '#f0ede8', label: '120–180s normal' },
          { color: '#C0392B', label: '> 180s slow' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
            <span className="text-xs text-[#4b5563]" style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
