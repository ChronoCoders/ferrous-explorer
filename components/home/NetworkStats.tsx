'use client'

import { useChainStats } from '@/hooks/useChainStats'
import { formatHashrate, formatDifficulty } from '@/lib/utils'

interface Row {
  label: string
  value: string | null   // null = loading
  mono?: boolean
}

export function NetworkStats() {
  const { stats, loading } = useChainStats()

  const rows: Row[] = [
    {
      label: 'Total Blocks',
      value: loading ? null : (stats?.height ?? 0).toLocaleString(),
      mono: true,
    },
    {
      label: 'Total Transactions',
      value: loading ? null : (stats?.height ?? 0).toLocaleString(),   // 1 tx/block until txgen kicks in
      mono: true,
    },
    {
      label: 'Avg Block Time',
      value: loading ? null : stats?.avg_block_time != null ? `${stats.avg_block_time}s` : '150s',
      mono: true,
    },
    {
      label: 'Network Hashrate',
      value: loading ? null : stats ? formatHashrate(stats.hashrate) : '—',
      mono: true,
    },
    {
      label: 'Difficulty',
      value: loading ? null : stats ? formatDifficulty(stats.difficulty) : '—',
      mono: true,
    },
    { label: 'Genesis Block', value: '2026-05-31', mono: true },
    { label: 'Algorithm', value: 'RandomX' },
    { label: 'Signature Scheme', value: 'ML-DSA-65 (FIPS 204)' },
    { label: 'Address Format', value: 'P2DL · bech32m' },
    { label: 'Max Supply', value: '21,000,000 FRR', mono: true },
    { label: 'Block Reward', value: '50 FRR', mono: true },
    { label: 'Halving Interval', value: '840,000 blocks', mono: true },
  ]

  return (
    <div className="card p-4">
      <h2
        style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em' }}
        className="text-[#f0ede8] mb-4"
      >
        Network Stats
      </h2>

      <div className="divide-y divide-[#1e1e2a]">
        {rows.map(({ label, value, mono }) => (
          <div key={label} className="flex items-center justify-between py-2.5 gap-4">
            <span className="text-sm text-[#6b7280]">{label}</span>
            {value === null ? (
              <div className="skeleton w-24 h-4 rounded" />
            ) : (
              <span
                className="text-sm text-[#f0ede8] text-right"
                style={mono ? { fontFamily: 'var(--font-mono, "Space Mono"), monospace' } : {}}
              >
                {value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
