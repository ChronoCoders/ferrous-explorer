'use client'

import { useEffect, useRef } from 'react'
import { useSpring, useMotionValue } from 'framer-motion'
import { useChainStats } from '@/hooks/useChainStats'
import { formatHashrate, formatDifficulty } from '@/lib/utils'

function AnimatedHeight({ value }: { value: number }) {
  const motionVal = useMotionValue(value)
  const spring = useSpring(motionVal, { stiffness: 120, damping: 20, mass: 0.8 })
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    motionVal.set(value)
  }, [value, motionVal])

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      if (spanRef.current) {
        spanRef.current.textContent = Math.round(v).toLocaleString()
      }
    })
    return unsubscribe
  }, [spring])

  return (
    <span
      ref={spanRef}
      style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
      className="text-sm font-medium text-[#f0ede8]"
    >
      {value.toLocaleString()}
    </span>
  )
}

function blockTimeColor(secs: number): string {
  if (secs < 100) return '#4ade80'   // green — faster than target
  if (secs <= 180) return '#f0ede8'  // white — normal range
  return '#C0392B'                    // rust — slow
}

export function StatsBar() {
  const { stats, loading } = useChainStats()
  const bt = stats?.avg_block_time ?? null
  const btColor = bt != null ? blockTimeColor(bt) : '#f0ede8'

  return (
    <div className="border-b bg-[#0d0d0f]" style={{ borderColor: 'rgba(192,57,43,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-stretch overflow-x-auto">

          {/* HEIGHT */}
          <StatCell label="HEIGHT" loading={loading} divider={false}>
            <div className="flex items-center gap-2">
              {!loading && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C0392B] animate-pulse-dot shrink-0" />
              )}
              <AnimatedHeight value={stats?.height ?? 0} />
            </div>
          </StatCell>

          {/* HASHRATE */}
          <StatCell label="HASHRATE" loading={loading}>
            <span style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
              className="text-sm font-medium text-[#f0ede8]">
              {stats ? formatHashrate(stats.hashrate) : '—'}
            </span>
          </StatCell>

          {/* DIFFICULTY */}
          <StatCell label="DIFFICULTY" loading={loading}>
            <span style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
              className="text-sm font-medium text-[#f0ede8]">
              {stats ? formatDifficulty(stats.difficulty) : '—'}
            </span>
          </StatCell>

          {/* BLOCK TIME — color-coded vs 150s target */}
          <StatCell label="BLOCK TIME" loading={loading}>
            <div className="flex items-baseline gap-1.5">
              <span
                style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace', color: btColor }}
                className="text-sm font-medium"
              >
                {bt != null ? `${bt}s` : '—'}
              </span>
              {bt != null && (
                <span
                  style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                  className="text-xs text-[#4b5563]"
                >
                  / 150s
                </span>
              )}
            </div>
          </StatCell>

          {/* PEERS */}
          <StatCell label="PEERS" loading={loading}>
            <span style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
              className="text-sm font-medium text-[#f0ede8]">
              {stats?.nodes_online?.toString() ?? '—'}
            </span>
          </StatCell>

          {/* SUPPLY */}
          <StatCell label="SUPPLY" loading={loading}>
            <span style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
              className="text-sm font-medium text-[#f0ede8]">
              {stats ? `${stats.supply_frr.toLocaleString(undefined, { maximumFractionDigits: 2 })} FRR` : '—'}
            </span>
          </StatCell>

          {/* NEXT HALVING */}
          <StatCell label="NEXT HALVING" loading={loading}>
            <span style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
              className="text-sm font-medium text-[#f0ede8]">
              {stats ? `${stats.blocks_to_halving.toLocaleString()} blocks` : '—'}
            </span>
          </StatCell>

          {/* EPOCH — RandomX key rotates every 2048 blocks */}
          <StatCell label="EPOCH" loading={loading}>
            <div className="flex items-baseline gap-1.5">
              <span style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                className="text-sm font-medium text-[#f0ede8]">
                {stats ? stats.epoch.toLocaleString() : '—'}
              </span>
              {stats && (
                <span style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                  className="text-xs text-[#4b5563]">
                  {stats.epoch_progress}% in
                </span>
              )}
            </div>
          </StatCell>

          {/* TX COUNT — approximate (≥1 coinbase tx per block) */}
          <StatCell label="TXS" loading={loading}>
            <span style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
              className="text-sm font-medium text-[#f0ede8]">
              {stats ? stats.total_txs.toLocaleString() : '—'}
            </span>
          </StatCell>

          {/* AVG FEE — 0 today: miner does not claim fees into coinbase */}
          <StatCell label="AVG FEE" loading={loading}>
            <span style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
              className="text-sm font-medium text-[#f0ede8]">
              {stats && stats.avg_fee_sats > 0 ? `${stats.avg_fee_sats} sats` : '—'}
            </span>
          </StatCell>

        </div>
      </div>
    </div>
  )
}

function StatCell({
  label,
  loading,
  children,
  divider = true,
}: {
  label: string
  loading: boolean
  children: React.ReactNode
  divider?: boolean
}) {
  // Variant D separators: an inset (56%-height, centered) neutral divider drawn as a
  // ::before pseudo-element — luminance-contrasting so it actually reads on near-black,
  // unlike the old full-height rust 0.15α border. The leftmost (HEIGHT) cell instead
  // carries a 2px rust top-accent to anchor the brand and flag the live tip.
  const dividerCls = divider
    ? " before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-px before:h-[56%] before:bg-[rgba(240,237,232,0.12)]"
    : ''

  return (
    <div
      className={'relative flex flex-col justify-center shrink-0' + dividerCls}
      style={{ padding: '1rem 1.625rem' }}
    >
      <span
        className="text-[10px] text-[#4b5563] tracking-widest mb-1"
        style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
      >
        {label}
      </span>
      {loading ? <div className="skeleton w-16 h-4" /> : children}
    </div>
  )
}
