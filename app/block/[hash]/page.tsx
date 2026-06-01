import { notFound } from 'next/navigation'
import { BlockHeader } from '@/components/block/BlockHeader'
import { BlockTxList } from '@/components/block/BlockTxList'
import { PageTransition } from '@/components/layout/PageTransition'
import type { Block } from '@/lib/types'

interface Props {
  params: Promise<{ hash: string }>
}

async function getBlock(hash: string): Promise<Block | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/block/${hash}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (data.error) return null
    return data
  } catch {
    return null
  }
}

export default async function BlockPage({ params }: Props) {
  const { hash } = await params
  const block = await getBlock(hash)

  if (!block) {
    notFound()
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <BlockHeader block={block} />
        <BlockTxList transactions={block.transactions} />
      </div>
    </PageTransition>
  )
}

export async function generateMetadata({ params }: Props) {
  const { hash } = await params
  return {
    title: `Block ${hash.slice(0, 12)}... — Ferrous Explorer`,
  }
}
