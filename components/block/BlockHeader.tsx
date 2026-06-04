import Link from 'next/link'
import { CopyButton } from '@/components/ui/CopyButton'
import type { Block } from '@/lib/types'
import { truncateHash, formatAge, formatBytes, formatDifficulty } from '@/lib/utils'

function MetaCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-[#13131a] border border-[#1e1e2a] rounded-lg p-4">
      <div className="text-xs text-[#4b5563] mb-1 tracking-widest" style={{ fontFamily: '"Space Mono", monospace' }}>
        {label}
      </div>
      <div
        className={`text-sm text-[#f0ede8] break-all ${mono ? 'font-mono' : ''}`}
        style={mono ? { fontFamily: '"Space Mono", monospace' } : {}}
      >
        {value}
      </div>
    </div>
  )
}

export function BlockHeader({ block }: { block: Block }) {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#4b5563] mb-6" style={{ fontFamily: '"Space Mono", monospace' }}>
        <Link href="/" className="hover:text-[#C0392B] transition-colors">HOME</Link>
        <span>/</span>
        <span className="text-[#f0ede8]">BLOCK #{block.height}</span>
      </div>

      {/* Title */}
      <div className="flex items-center gap-4 mb-6">
        <h1
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.06em' }}
          className="text-4xl text-[#f0ede8]"
        >
          Block #{block.height.toLocaleString()}
        </h1>
        <span className="text-sm px-3 py-1 rounded-full bg-[#1a1a24] text-[#22c55e] border border-[#22c55e]/20"
          style={{ fontFamily: '"Space Mono", monospace' }}>
          CONFIRMED
        </span>
      </div>

      {/* Full hash */}
      <div className="mb-6 p-3 rounded-lg bg-[#13131a] border border-[#1e1e2a] flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-[#4b5563] mb-1" style={{ fontFamily: '"Space Mono", monospace' }}>BLOCK HASH</div>
          <div className="text-sm text-[#9ca3af] break-all" style={{ fontFamily: '"Space Mono", monospace' }}>
            {block.hash}
          </div>
        </div>
        <CopyButton text={block.hash} />
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <MetaCard label="HEIGHT" value={block.height.toLocaleString()} mono />
        <MetaCard label="TIMESTAMP" value={new Date(block.timestamp * 1000).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'} mono />
        <MetaCard label="AGE" value={formatAge(block.timestamp)} />
        <MetaCard label="TRANSACTIONS" value={block.txCount.toString()} mono />
        <MetaCard label="SIZE" value={formatBytes(block.size)} mono />
        <MetaCard label="DIFFICULTY" value={formatDifficulty(block.difficulty)} mono />
        <MetaCard label="NONCE" value={block.nonce.toString()} mono />
        <MetaCard label="MINER" value={block.miner ? truncateHash(block.miner, 10, 8) : 'unknown'} mono />
      </div>

      {/* Prev hash */}
      {block.prevHash && (
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-[#4b5563]" style={{ fontFamily: '"Space Mono", monospace' }}>PREV</span>
          <Link
            href={`/block/${block.prevHash}`}
            className="hash-link text-sm"
          >
            {truncateHash(block.prevHash, 16, 8)}
          </Link>
        </div>
      )}

      {/* Merkle root */}
      {block.merkleRoot && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#4b5563]" style={{ fontFamily: '"Space Mono", monospace' }}>MERKLE</span>
          <span className="hash text-sm">{truncateHash(block.merkleRoot, 16, 8)}</span>
        </div>
      )}
    </div>
  )
}
