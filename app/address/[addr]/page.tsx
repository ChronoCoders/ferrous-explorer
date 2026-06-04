import { notFound } from 'next/navigation'
import { AddressHeader } from '@/components/address/AddressHeader'
import { UtxoList } from '@/components/address/UtxoList'
import { PageTransition } from '@/components/layout/PageTransition'
import { getBaseUrl } from '@/lib/baseUrl'
import type { AddressInfo } from '@/lib/types'

interface Props {
  params: Promise<{ addr: string }>
}

async function getAddress(addr: string): Promise<AddressInfo | null> {
  try {
    const baseUrl = await getBaseUrl()
    const res = await fetch(`${baseUrl}/api/address/${addr}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (data.error) return null
    return data
  } catch {
    return null
  }
}

export default async function AddressPage({ params }: Props) {
  const { addr } = await params
  const info = await getAddress(addr)

  if (!info) {
    notFound()
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AddressHeader info={info} />
        <UtxoList utxos={info.utxos} />
      </div>
    </PageTransition>
  )
}

export async function generateMetadata({ params }: Props) {
  const { addr } = await params
  return {
    title: `${addr.slice(0, 16)}... — Ferrous Explorer`,
  }
}
