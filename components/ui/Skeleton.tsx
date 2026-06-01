import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function BlockRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-[#1e1e2a]">
      <Skeleton className="w-12 h-4" />
      <Skeleton className="flex-1 h-4" />
      <Skeleton className="w-8 h-4" />
      <Skeleton className="w-16 h-4" />
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card p-4">
      <Skeleton className="w-20 h-3 mb-2" />
      <Skeleton className="w-32 h-6" />
    </div>
  )
}
