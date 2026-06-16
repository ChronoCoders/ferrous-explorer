'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { truncateHash, formatFRR } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

function TxRow({ tx }: { tx: Transaction }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-[#1e1e2a] last:border-0">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#13131a] transition-colors text-left"
      >
        <span className="text-[#4b5563]">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <Badge variant={tx.isCoinbase ? 'coinbase' : 'p2dl'}>
          {tx.isCoinbase ? 'COINBASE' : 'P2DL'}
        </Badge>
        <Link
          href={tx.isCoinbase ? '#' : `/tx/${tx.txid}`}
          onClick={(e) => !tx.isCoinbase && e.stopPropagation()}
          className="hash-link flex-1 truncate"
        >
          {truncateHash(tx.txid, 12, 8)}
        </Link>
        <span className="text-sm text-[#f0ede8] shrink-0 whitespace-nowrap" style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}>
          {formatFRR(tx.totalOut)}{' '}<span className="text-xs text-[#4b5563]">FRR</span>
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 grid sm:grid-cols-2 gap-4 bg-[#0d0d0f]">
          <div>
            <div className="text-xs text-[#4b5563] mb-2 tracking-widest" style={{ fontFamily: '"Space Mono", monospace' }}>
              INPUTS ({tx.inputs.length})
            </div>
            {tx.inputs.map((inp, i) => (
              <div key={i} className="py-1.5 border-b border-[#1e1e2a] last:border-0">
                {inp.isCoinbase ? (
                  <span className="text-xs text-[#22c55e]" style={{ fontFamily: '"Space Mono", monospace' }}>
                    COINBASE (newly mined)
                  </span>
                ) : (
                  <div>
                    <span className="hash text-xs">{truncateHash(inp.txid)}</span>
                    <span className="text-xs text-[#4b5563]">:{inp.vout}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs text-[#4b5563] mb-2 tracking-widest" style={{ fontFamily: '"Space Mono", monospace' }}>
              OUTPUTS ({tx.outputs.length})
            </div>
            {tx.outputs.map((out, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1e1e2a] last:border-0 gap-2">
                <Link
                  href={out.address ? `/address/${out.address}` : '#'}
                  className="hash-link text-xs truncate flex-1"
                >
                  {out.address ? truncateHash(out.address, 8, 6) : 'unknown'}
                </Link>
                <span className="text-xs text-[#f0ede8] shrink-0" style={{ fontFamily: '"Space Mono", monospace' }}>
                  {formatFRR(out.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function BlockTxList({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="card overflow-hidden mt-6">
      <div className="px-4 py-3 border-b border-[#1e1e2a]">
        <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em' }}
          className="text-[#f0ede8]">
          Transactions ({transactions.length})
        </h2>
      </div>
      {transactions.map((tx) => (
        <TxRow key={tx.txid} tx={tx} />
      ))}
    </div>
  )
}
