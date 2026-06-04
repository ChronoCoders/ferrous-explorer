'use client'

import { useChainStats } from '@/hooks/useChainStats'
import { formatHashrate, formatDifficulty } from '@/lib/utils'

interface Row {
  label: string
  value: string | null   // null = loading
  mono?: boolean
  color?: string
  suffix?: string
  bar?: { pct: number; note: string }
}

function blockTimeColor(secs: number): string {
  if (secs < 120) return '#4ade80'
  if (secs <= 180) return '#f0ede8'
  return '#C0392B'
}

function formatHalvingEta(seconds: number): string {
  const days = seconds / 86400
  if (days >= 365) {
    const years = Math.floor(days / 365)
    const months = Math.floor((days % 365) / 30)
    return `~${years}y ${months}m`
  }
  if (days >= 30) return `~${Math.floor(days)}d`
  const d = Math.floor(days)
  const h = Math.floor((seconds % 86400) / 3600)
  return `~${d}d ${h}h`
}

const HALVING_INTERVAL = 840_000
const MAX_SUPPLY = 21_000_000

export function NetworkStats() {
  const { stats, loading } = useChainStats()

  const bt = stats?.avg_block_time ?? null
  const btDelta = bt != null ? Math.round(((bt - 150) / 150) * 100) : null

  const minedPct = stats ? (stats.supply_frr / MAX_SUPPLY) * 100 : 0
  const minedPctStr = minedPct < 0.01 ? minedPct.toFixed(3) : minedPct.toFixed(2)

  const intoEpoch = stats ? HALVING_INTERVAL - stats.blocks_to_halving : 0
  const halvingPct = (intoEpoch / HALVING_INTERVAL) * 100
  const halvingEta = stats
    ? formatHalvingEta(stats.blocks_to_halving * (stats.avg_block_time || 150))
    : ''

  const network: Row[] = [
    {
      label: 'Total Blocks',
      value: loading ? null : (stats?.height ?? 0).toLocaleString(),
      mono: true,
    },
    {
      label: 'Total Transactions',
      value: loading ? null : (stats?.total_txs ?? 0).toLocaleString(),
      mono: true,
    },
    {
      label: 'Avg Block Time',
      value: loading ? null : bt != null ? `${bt}s` : '—',
      mono: true,
      color: bt != null ? blockTimeColor(bt) : undefined,
      suffix:
        btDelta != null ? `${btDelta > 0 ? '+' : ''}${btDelta}% vs target` : undefined,
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
    {
      label: 'Chain Start',
      value: loading
        ? null
        : stats?.chain_start != null
          ? new Date(stats.chain_start * 1000).toISOString().slice(0, 10)
          : '—',
      mono: true,
    },
    {
      label: 'Epoch',
      value: loading ? null : stats ? stats.epoch.toLocaleString() : '—',
      mono: true,
      bar: stats
        ? { pct: stats.epoch_progress, note: `${stats.epoch_progress}% of 2,048 blocks` }
        : undefined,
    },
  ]

  const protocol: Row[] = [
    { label: 'Algorithm', value: 'RandomX' },
    { label: 'Signature Scheme', value: 'ML-DSA-65 (FIPS 204)' },
    { label: 'Address Format', value: 'P2DL · bech32m', mono: true },
    { label: 'Block Reward', value: '50 FRR', mono: true },
    {
      label: 'Max Supply',
      value: '21,000,000 FRR',
      mono: true,
      bar: loading || !stats ? undefined : { pct: minedPct, note: `${minedPctStr}% mined` },
    },
    {
      label: 'Halving Interval',
      value: '840,000 blocks',
      mono: true,
      bar:
        loading || !stats
          ? undefined
          : {
              pct: halvingPct,
              note: `${stats.blocks_to_halving.toLocaleString()} blocks left · ${halvingEta}`,
            },
    },
  ]

  return (
    <div className="card p-4 overflow-visible">
      <h2
        style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em', paddingLeft: '2px' }}
        className="text-[#f0ede8] mb-4"
      >
        Network Stats
      </h2>

      <div className="grid grid-cols-2 gap-0 divide-x divide-[#1e1e2a]">
        <div className="pr-6">
          <GroupHeader title="NETWORK" />
          <div className="divide-y divide-[#1e1e2a]">{network.map(renderRow)}</div>
        </div>
        <div className="pl-6">
          <GroupHeader title="PROTOCOL" />
          <div className="divide-y divide-[#1e1e2a]">{protocol.map(renderRow)}</div>
        </div>
      </div>
    </div>
  )
}

function GroupHeader({ title }: { title: string }) {
  return (
    <div
      className="text-[10px] text-[#4b5563] tracking-widest mb-1 pb-1.5 border-b border-[#1e1e2a]"
      style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
    >
      {title}
    </div>
  )
}

function renderRow({ label, value, mono, color, suffix, bar }: Row) {
  return (
    <div key={label} className="py-2.5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-[#6b7280]">{label}</span>
        {value === null ? (
          <div className="skeleton w-24 h-4 rounded" />
        ) : (
          <span className="text-sm text-right flex items-baseline gap-1.5 justify-end">
            <span
              style={{
                color: color ?? '#f0ede8',
                ...(mono ? { fontFamily: 'var(--font-mono, "Space Mono"), monospace' } : {}),
              }}
            >
              {value}
            </span>
            {suffix && (
              <span
                className="text-xs text-[#4b5563] whitespace-nowrap"
                style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
              >
                {suffix}
              </span>
            )}
          </span>
        )}
      </div>
      {bar && (
        <div className="mt-1.5">
          <div className="h-1 rounded-full bg-[#1a1a24] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#C0392B]"
              style={{ width: `${Math.min(100, Math.max(bar.pct, 0.5))}%` }}
            />
          </div>
          <div
            className="text-[10px] text-[#4b5563] mt-1 text-right"
            style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
          >
            {bar.note}
          </div>
        </div>
      )}
    </div>
  )
}
