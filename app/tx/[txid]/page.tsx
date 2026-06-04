import { notFound } from 'next/navigation'
import { TxHeader } from '@/components/tx/TxHeader'
import { TxFlow } from '@/components/tx/TxFlow'
import { PageTransition } from '@/components/layout/PageTransition'
import { getBaseUrl } from '@/lib/baseUrl'
import type { Transaction } from '@/lib/types'

interface Props {
  params: Promise<{ txid: string }>
}

async function getTx(txid: string): Promise<Transaction | null> {
  try {
    const baseUrl = await getBaseUrl()
    const res = await fetch(`${baseUrl}/api/tx/${txid}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (data.error) return null
    return data
  } catch {
    return null
  }
}

export default async function TxPage({ params }: Props) {
  const { txid } = await params
  const tx = await getTx(txid)

  if (!tx) {
    notFound()
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <TxHeader tx={tx} />
        <TxFlow tx={tx} />
      </div>
    </PageTransition>
  )
}

export async function generateMetadata({ params }: Props) {
  const { txid } = await params
  return {
    title: `Tx ${txid.slice(0, 12)}... — Ferrous Explorer`,
  }
}
