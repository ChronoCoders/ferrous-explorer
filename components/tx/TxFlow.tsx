'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { truncateHash, formatFRR } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

// Arrow that draws itself on mount — signals that the flow is being revealed,
// not just statically present.
function DrawArrow({ fee }: { fee: number }) {
  return (
    <div className="flex sm:flex-col items-center justify-center gap-2 px-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Shaft */}
        <motion.line
          x1="2"
          y1="16"
          x2="26"
          y2="16"
          stroke="#C0392B"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeInOut', delay: 0.15 }}
        />
        {/* Arrowhead top */}
        <motion.line
          x1="18"
          y1="8"
          x2="26"
          y2="16"
          stroke="#C0392B"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeInOut', delay: 0.5 }}
        />
        {/* Arrowhead bottom */}
        <motion.line
          x1="18"
          y1="24"
          x2="26"
          y2="16"
          stroke="#C0392B"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeInOut', delay: 0.5 }}
        />
      </svg>
      {fee > 0 && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.2 }}
        >
          <div
            className="text-xs text-[#4b5563]"
            style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
          >
            fee
          </div>
          <div
            className="text-xs text-[#C0392B]"
            style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
          >
            {formatFRR(fee)}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export function TxFlow({ tx }: { tx: Transaction }) {
  const fee = tx.fee ?? 0

  return (
    <div className="card p-6 mt-6">
      <h2
        style={{ fontFamily: 'var(--font-display, "Bebas Neue"), sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em' }}
        className="text-[#f0ede8] mb-6"
      >
        Transaction Flow
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        {/* Inputs */}
        <div className="flex-1 space-y-2">
          <div
            className="text-xs text-[#4b5563] mb-3 tracking-widest"
            style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
          >
            INPUTS ({tx.inputs.length})
          </div>
          {tx.inputs.map((inp, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-[#0d0d0f] border border-[#1e1e2a] flex items-center justify-between gap-2"
            >
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                {inp.isCoinbase ? (
                  <>
                    <Badge variant="coinbase">COINBASE</Badge>
                    <span
                      className="text-xs text-[#22c55e]"
                      style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                    >
                      Newly generated
                    </span>
                  </>
                ) : (
                  <>
                    <Badge variant="p2dl">P2DL</Badge>
                    {inp.address ? (
                      <Link href={`/address/${inp.address}`} className="hash-link text-xs truncate">
                        {truncateHash(inp.address, 8, 6)}
                      </Link>
                    ) : (
                      <span className="hash text-xs truncate">
                        {truncateHash(inp.txid)}:{inp.vout}
                      </span>
                    )}
                  </>
                )}
              </div>
              {inp.amount != null && (
                <span
                  className="text-xs text-[#f0ede8] shrink-0"
                  style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
                >
                  {formatFRR(inp.amount)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Animated arrow */}
        <DrawArrow fee={fee} />

        {/* Outputs */}
        <div className="flex-1 space-y-2">
          <div
            className="text-xs text-[#4b5563] mb-3 tracking-widest"
            style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
          >
            OUTPUTS ({tx.outputs.length})
          </div>
          {tx.outputs.map((out, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-[#0d0d0f] border border-[#1e1e2a] flex items-center justify-between gap-2"
            >
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <Badge variant="p2dl">P2DL</Badge>
                {out.address ? (
                  <Link href={`/address/${out.address}`} className="hash-link text-xs truncate">
                    {truncateHash(out.address, 8, 6)}
                  </Link>
                ) : (
                  <span className="hash text-xs">unknown</span>
                )}
              </div>
              <span
                className="text-xs text-[#f0ede8] shrink-0"
                style={{ fontFamily: 'var(--font-mono, "Space Mono"), monospace' }}
              >
                {formatFRR(out.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
