import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'coinbase' | 'p2dl' | 'confirmed' | 'mempool' | 'immature' | 'default'
  children: React.ReactNode
  className?: string
}

const variants = {
  coinbase: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
  p2dl: 'bg-red-950 text-red-400 border border-red-900',
  confirmed: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
  mempool: 'bg-yellow-950 text-yellow-400 border border-yellow-900',
  immature: 'bg-orange-950 text-orange-400 border border-orange-900',
  default: 'bg-zinc-900 text-zinc-400 border border-zinc-700',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
