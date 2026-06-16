'use client'

import { useEffect, useState } from 'react'
import { formatHashrate } from '@/lib/utils'
import { COUNTRY_PATHS } from '@/lib/worldmap'
import type { NodeInfo } from '@/lib/types'

const leftPct = (lon: number) => ((lon + 180) / 360) * 100
const topPct = (lat: number) => ((90 - lat) / 180) * 100

const GRID = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
const GRID_Y = [30, 60, 90, 120, 150]

export function NodeMap() {
  const [nodes, setNodes] = useState<NodeInfo[]>([])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch('/api/nodes')
        if (!res.ok) return
        const data = (await res.json()) as NodeInfo[]
        if (active) setNodes(data)
      } catch {}
    }
    load()
    const id = setInterval(load, 15000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  const total = nodes.length || 2
  const online = nodes.filter((n) => n.online).length

  return (
    <div className="card relative overflow-hidden" style={{ height: 280 }}>
      <style>{`
        @keyframes nodemap-ping {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.5; }
          80%,
          100% { transform: translate(-50%,-50%) scale(3.4); opacity: 0; }
        }
      `}</style>

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 360 180"
        preserveAspectRatio="none"
        style={{ background: '#0d0d0f' }}
      >
        {GRID.map((x) => (
          <line key={`vx${x}`} x1={x} y1={0} x2={x} y2={180}
            stroke="rgba(240,237,232,0.03)" strokeWidth={0.3} />
        ))}
        {GRID_Y.map((y) => (
          <line key={`hy${y}`} x1={0} y1={y} x2={360} y2={y}
            stroke="rgba(240,237,232,0.03)" strokeWidth={0.3} />
        ))}
        {COUNTRY_PATHS.map((d, i) => (
          <path key={i} d={d}
            fill="rgba(240,237,232,0.06)"
            stroke="rgba(240,237,232,0.03)"
            strokeWidth={0.3} />
        ))}
      </svg>

      <div
        className="absolute left-4 top-3 z-10 text-[#6b7280]"
        style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace', fontSize: 11, letterSpacing: '0.18em' }}
      >
        ACTIVE NODES
      </div>
      <div
        className="absolute right-4 top-3 z-10 text-[#6b7280]"
        style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace', fontSize: 11, letterSpacing: '0.1em' }}
      >
        <span className="text-[#4ade80]">{online}</span> / {total} ONLINE
      </div>

      {nodes.map((n) => (
        <div
          key={n.id}
          className="group absolute z-10"
          style={{ left: `${leftPct(n.lon)}%`, top: `${topPct(n.lat)}%`, transform: 'translate(-50%,-50%)' }}
        >
          {n.online && (
            <span
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: 14, height: 14,
                background: 'rgba(74,222,128,0.45)',
                animation: 'nodemap-ping 2s ease-out infinite',
              }}
            />
          )}
          <span
            className="relative block rounded-full"
            style={{
              width: 6, height: 6,
              background: n.online ? '#4ade80' : '#6b7280',
              boxShadow: n.online ? '0 0 6px 1px rgba(74,222,128,0.7)' : 'none',
            }}
          />

          <div
            className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 whitespace-nowrap rounded-md px-3 py-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            style={{
              background: '#141418',
              border: '1px solid rgba(240,237,232,0.10)',
              fontFamily: 'var(--font-mono, "Space Mono"), monospace',
            }}
          >
            <div className="text-xs font-medium text-[#f0ede8]">{n.name}</div>
            <div className="text-[11px] text-[#6b7280]">{n.location}</div>
            <div className="mt-1.5 space-y-0.5 text-[11px]">
              <div><span className="text-[#6b7280]">Height </span><span className="text-[#f0ede8]">{n.height.toLocaleString()}</span></div>
              <div><span className="text-[#6b7280]">Hashrate </span><span className="text-[#f0ede8]">{formatHashrate(n.hashrate)}</span></div>
              <div><span className="text-[#6b7280]">Peers </span><span className="text-[#f0ede8]">{n.peers}</span></div>
              <div><span className="text-[#6b7280]">Status </span><span style={{ color: n.online ? '#4ade80' : '#C0392B' }}>{n.online ? 'ONLINE' : 'OFFLINE'}</span></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
