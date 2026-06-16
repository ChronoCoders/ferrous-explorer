'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { CopyButton } from '@/components/ui/CopyButton'
import { formatFRR } from '@/lib/utils'
import type { AddressInfo } from '@/lib/types'

export function AddressHeader({ info }: { info: AddressInfo }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-[#4b5563] mb-6" style={{ fontFamily: '"Space Mono", monospace' }}>
        <Link href="/" className="hover:text-[#C0392B] transition-colors">HOME</Link>
        <span>/</span>
        <span className="hover:text-[#C0392B] transition-colors cursor-default">ADDRESS</span>
        <span>/</span>
        <span className="text-[#f0ede8]">{info.address.slice(0, 16)}...</span>
      </div>

      <h1
        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.06em' }}
        className="text-4xl text-[#f0ede8] mb-4"
      >
        Address
      </h1>

      <div className="mb-6 p-4 rounded-lg bg-[#13131a] border border-[#1e1e2a] flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="p2dl">P2DL</Badge>
            <span className="text-xs text-[#4b5563]" style={{ fontFamily: '"Space Mono", monospace' }}>
              Dilithium · bech32m
            </span>
          </div>
          <div className="text-sm text-[#9ca3af] break-all" style={{ fontFamily: '"Space Mono", monospace' }}>
            {info.address}
          </div>
        </div>
        <CopyButton text={info.address} />
      </div>

      <div className="mb-6 p-6 rounded-lg bg-gradient-to-br from-[#1a1014] to-[#13131a] border border-[#C0392B]/20">
        <div className="text-xs text-[#6b7280] mb-2 tracking-widest" style={{ fontFamily: '"Space Mono", monospace' }}>
          BALANCE
        </div>
        <div className="flex items-baseline gap-3">
          <span
            className="text-4xl font-bold text-[#f0ede8]"
            style={{ fontFamily: '"Space Mono", monospace' }}
          >
            {formatFRR(info.balance)}
          </span>
          <span className="text-lg text-[#C0392B]" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            FRR
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        {[
          { label: 'UTXO COUNT', value: info.utxoCount.toString() },
          { label: 'SPENDABLE', value: `${info.utxos.filter((u) => u.spendable).length} UTXOs` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#13131a] border border-[#1e1e2a] rounded-lg p-4">
            <div className="text-xs text-[#4b5563] mb-1 tracking-widest" style={{ fontFamily: '"Space Mono", monospace' }}>
              {label}
            </div>
            <div className="text-sm text-[#f0ede8]" style={{ fontFamily: '"Space Mono", monospace' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
