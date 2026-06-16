'use client'

import { useEffect, useState } from 'react'
import type { ChainInfo } from '@/lib/types'

export function DifficultyAdjustment() {
  const [stats, setStats] = useState<ChainInfo | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch('/api/chain')
        if (!res.ok) return
        const d = (await res.json()) as ChainInfo
        if (active) setStats(d)
      } catch {}
    }
    load()
    const id = setInterval(load, 15000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  const target = stats?.block_time_target ?? 150
  const bt = stats?.avg_block_time ?? target
  const adj = stats?.estimated_adjustment ?? 0

  const slow = bt > target
  const color = adj > 0.005 ? '#4ade80' : adj < -0.005 ? '#C0392B' : '#f0ede8'
  const mag = Math.min(Math.abs((bt - target) / target), 1) * 50

  const ready = stats != null

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h2
          style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em' }}
          className="text-[#f0ede8]"
        >
          Difficulty Adjustment
        </h2>
        <span
          className="text-sm font-medium"
          style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace', color }}
        >
          {ready ? `${adj > 0 ? '+' : ''}${adj.toFixed(2)}%` : '—'}
          <span className="ml-1.5 text-[10px] text-[#4b5563]">next block</span>
        </span>
      </div>

      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: '#1a1a24' }}>
        <div className="absolute inset-y-0 left-1/2 w-px" style={{ background: '#4b5563' }} />
        {ready && (
          <div
            className="absolute inset-y-0"
            style={
              slow
                ? { left: '50%', width: `${mag}%`, background: '#C0392B' }
                : { right: '50%', width: `${mag}%`, background: '#4ade80' }
            }
          />
        )}
      </div>

      <div
        className="mt-2 flex items-center justify-between text-[11px] text-[#4b5563]"
        style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
      >
        <span>← faster · difficulty ↑</span>
        <span className="text-[#6b7280]">
          {ready ? `${Math.round(bt)}s` : '—'} / {target}s target
        </span>
        <span>slower · difficulty ↓ →</span>
      </div>
    </div>
  )
}
