'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { isAddress, isBlockHeight, isTxOrBlockHash } from '@/lib/utils'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const navigate = useCallback(
    (q: string) => {
      const trimmed = q.trim()
      if (!trimmed) return
      if (isAddress(trimmed)) {
        router.push(`/address/${trimmed}`)
      } else if (isBlockHeight(trimmed)) {
        router.push(`/block/${trimmed}`)
      } else if (isTxOrBlockHash(trimmed)) {
        // Could be block hash or txid — try block first
        router.push(`/block/${trimmed}`)
      }
      setQuery('')
      inputRef.current?.blur()
    },
    [router]
  )

  const hint = (() => {
    if (!query) return null
    const t = query.trim()
    if (isAddress(t)) return '→ Address'
    if (isBlockHeight(t)) return '→ Block #' + t
    if (isTxOrBlockHash(t)) return '→ Block / Tx'
    return null
  })()

  return (
    <div className="relative w-full">
      <div
        className={`flex items-center gap-2 px-3 h-9 rounded-md border transition-all duration-150 ${
          focused
            ? 'border-[#C0392B]/60 bg-[#13131a] shadow-[0_0_0_2px_rgba(192,57,43,0.1)]'
            : 'border-[#1e1e2a] bg-[#13131a] hover:border-[#2a2a3a]'
        }`}
      >
        <Search size={14} className="text-[#4b5563] shrink-0" />
        <input
          ref={inputRef}
          id="explorer-search"
          name="q"
          autoComplete="off"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === 'Enter' && navigate(query)}
          placeholder="Block, tx, address..."
          className="flex-1 bg-transparent text-sm text-[#f0ede8] placeholder-[#4b5563] outline-none min-w-0"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        />
        {hint && (
          <span className="text-xs text-[#C0392B] shrink-0" style={{ fontFamily: '"Space Mono", monospace' }}>
            {hint}
          </span>
        )}
        {query ? (
          <button onClick={() => setQuery('')} className="text-[#4b5563] hover:text-[#f0ede8] shrink-0">
            <X size={12} />
          </button>
        ) : (
          <kbd className="hidden sm:block text-xs text-[#4b5563] px-1 py-0.5 rounded border border-[#2a2a3a]"
            style={{ fontFamily: '"Space Mono", monospace' }}>
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  )
}
