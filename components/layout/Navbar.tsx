'use client'

import Link from 'next/link'
import { SearchBar } from './SearchBar'
import { FerrousLogo } from '@/components/ui/FerrousLogo'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1e1e2a] bg-[#0d0d0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <FerrousLogo size={32} />
          <span
            className="text-xl tracking-widest text-[#f0ede8] hidden sm:block"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
          >
            FERROUS
          </span>
          <span className="text-xs text-[#6b7280] hidden sm:block" style={{ fontFamily: '"Space Mono", monospace' }}>
            EXPLORER
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <SearchBar />
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-5 text-sm text-[#6b7280] shrink-0">
          <Link href="/blocks" className="hover:text-[#f0ede8] transition-colors">Blocks</Link>
          <Link href="/mempool" className="hover:text-[#f0ede8] transition-colors">Mempool</Link>
          <Link href="/broadcast" className="hover:text-[#f0ede8] transition-colors">Broadcast</Link>
          <a
            href="https://github.com/ChronoCoders/ferrous"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f0ede8] transition-colors"
          >
            GitHub
          </a>
        </nav>

        {/* Testnet badge */}
        <span
          className="shrink-0 text-xs px-2 py-1 rounded border border-[#C0392B]/30 text-[#C0392B]"
          style={{ fontFamily: '"Space Mono", monospace' }}
        >
          TESTNET
        </span>
      </div>
    </header>
  )
}
