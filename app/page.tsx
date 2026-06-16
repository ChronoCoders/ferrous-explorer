import { BlockList } from '@/components/home/BlockList'
import { TxList } from '@/components/home/TxList'
import { MempoolPanel } from '@/components/home/MempoolPanel'
import { ChainChart } from '@/components/home/ChainChart'
import { BlockTimeChart } from '@/components/home/BlockTimeChart'
import { NetworkStats } from '@/components/home/NetworkStats'
import { DifficultyAdjustment } from '@/components/home/DifficultyAdjustment'
import { MempoolDepthChart } from '@/components/home/MempoolDepthChart'
import { NodeMap } from '@/components/home/NodeMap'
import { PageTransition } from '@/components/layout/PageTransition'

export default function HomePage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <ChainChart />

        <DifficultyAdjustment />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <BlockList />
          <TxList />
          <MempoolPanel />
        </div>

        <MempoolDepthChart />

        <BlockTimeChart />

        <NetworkStats />

        <NodeMap />
      </div>
    </PageTransition>
  )
}
