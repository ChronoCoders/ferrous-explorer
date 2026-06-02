'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageTransition } from '@/components/layout/PageTransition'

export default function BroadcastPage() {
  const [hex, setHex] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [txid, setTxid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setSubmitting(true)
    setTxid(null)
    setError(null)
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hex: hex.trim() }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        setError(json.error ?? `HTTP ${res.status}`)
      } else {
        setTxid(json.txid as string)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = hex.trim().length > 0 && !submitting

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-2 text-xs text-[#4b5563] mb-4"
          style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
        >
          <Link href="/" className="hover:text-[#C0392B] transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-[#f0ede8]">BROADCAST</span>
        </div>

        <h1
          style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', letterSpacing: '0.06em' }}
          className="text-4xl text-[#f0ede8] mb-6"
        >
          Broadcast Transaction
        </h1>

        <div className="card p-4">
          <label
            className="block text-xs text-[#4b5563] mb-2 tracking-widest"
            style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
          >
            RAW TRANSACTION HEX
          </label>
          <textarea
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            placeholder="Paste raw transaction hex"
            spellCheck={false}
            rows={8}
            className="w-full resize-y rounded bg-[#0d0d0f] border border-[#1e1e2a] p-3 text-xs text-[#f0ede8] outline-none focus:border-[#C0392B]/50 break-all"
            style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
          />

          <button
            onClick={submit}
            disabled={!canSubmit}
            className="mt-3 px-4 py-2 rounded text-xs tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'var(--font-mono, "Space Mono"), monospace',
              background: '#C0392B',
              color: '#fff',
              border: '1px solid #C0392B',
            }}
          >
            {submitting ? 'BROADCASTING…' : 'BROADCAST'}
          </button>
        </div>

        {txid && (
          <div className="card p-4 mt-4" style={{ borderColor: 'rgba(74,222,128,0.3)' }}>
            <div className="text-xs text-[#4ade80] mb-2 tracking-widest" style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}>
              BROADCAST OK
            </div>
            <Link
              href={`/tx/${txid}`}
              className="hash font-mono text-xs break-all text-[#f0ede8] hover:text-[#C0392B] transition-colors"
            >
              {txid}
            </Link>
          </div>
        )}

        {error && (
          <div className="card p-4 mt-4" style={{ borderColor: 'rgba(192,57,43,0.4)' }}>
            <div className="text-xs text-[#C0392B] mb-2 tracking-widest" style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}>
              REJECTED
            </div>
            <div className="text-xs text-[#f0ede8] break-all" style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}>
              {error}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
