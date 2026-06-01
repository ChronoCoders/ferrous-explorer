import { NextResponse } from 'next/server'
import { rpcCallAll } from '@/lib/rpc'
import type { NodeInfo } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Static node metadata. Order MUST match the NODES array in lib/rpc.ts
// ([SEED1, SEED4]) so the per-node rpcCallAll() results line up by index.
const NODE_META = [
  { id: 'seed1', name: 'seed1.ferrous.network', location: 'New York, US', lat: 40.71, lon: -74.01 },
  { id: 'seed4', name: 'seed4.ferrous.network', location: 'Frankfurt, DE', lat: 50.11, lon: 8.68 },
]

export async function GET() {
  // One call per method across every node; each returns one entry per node
  // (result or null), index-aligned to NODE_META.
  const [chain, mining, conns] = await Promise.all([
    rpcCallAll('getblockchaininfo'),
    rpcCallAll('getmininginfo'),
    rpcCallAll('getconnectioncount'),
  ])

  const nodes: NodeInfo[] = NODE_META.map((meta, i) => {
    const ci = chain[i] as { blocks?: number } | null
    const mi = mining[i] as { hashrate?: number; networkhashps?: number } | null
    const cc = conns[i] as number | null

    return {
      ...meta,
      online: ci !== null,
      height: ci?.blocks ?? 0,
      hashrate: mi?.hashrate ?? mi?.networkhashps ?? 0,
      peers: typeof cc === 'number' ? cc : 0,
    }
  })

  return NextResponse.json(nodes)
}
