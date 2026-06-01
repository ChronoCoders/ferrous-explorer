import { BlockList } from '@/components/home/BlockList'
import { TxList } from '@/components/home/TxList'
import { MempoolPanel } from '@/components/home/MempoolPanel'
import { HashrateChart } from '@/components/home/HashrateChart'
import { BlockTimeChart } from '@/components/home/BlockTimeChart'
import { NetworkStats } from '@/components/home/NetworkStats'
import { PageTransition } from '@/components/layout/PageTransition'

export default function HomePage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hashrate — full-width hero */}
        <HashrateChart />

        {/* Three-column grid — equal fixed-height cards with internal scroll */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <BlockList />
          <TxList />
          <MempoolPanel />
        </div>

        {/* Bottom sections */}
        <BlockTimeChart />

        {/* Network stats — full width, single column */}
        <NetworkStats />
      </div>
    </PageTransition>
  )
}
