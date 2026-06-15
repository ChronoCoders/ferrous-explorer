'use client'

import { useEffect, useState } from 'react'

type Health = 'operational' | 'degraded' | 'offline'

const STATUS: Record<Health, { color: string; label: string }> = {
  operational: { color: '#4ade80', label: 'All systems operational' },
  degraded: { color: '#fbbf24', label: 'Degraded' },
  offline: { color: '#C0392B', label: 'Systems offline' },
}

export function Footer() {
  const [status, setStatus] = useState<Health>('operational')

  useEffect(() => {
    let active = true

    const check = async () => {
      try {
        const res = await fetch('/api/nodes', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const nodes = (await res.json()) as Array<{ online?: boolean }>
        const online = Array.isArray(nodes) ? nodes.filter((n) => n.online).length : 0
        if (!active) return
        setStatus(online >= 2 ? 'operational' : online === 1 ? 'degraded' : 'offline')
      } catch {
        if (active) setStatus('offline')
      }
    }

    check()
    const id = setInterval(check, 30_000)

    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  const { color, label } = STATUS[status]

  return (
    <footer className="border-t border-[#1e1e2a] py-4 mt-8">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-[#4b5563]"
        style={{ fontFamily: 'var(--font-mono), monospace' }}
      >
        <span>Ferrous Explorer</span>
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span>{label}</span>
        </span>
      </div>
    </footer>
  )
}
