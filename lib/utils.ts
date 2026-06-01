export function truncateHash(hash: string, front = 12, back = 8): string {
  if (!hash || hash.length <= front + back + 3) return hash
  return `${hash.slice(0, front)}...${hash.slice(-back)}`
}

export function formatFRR(sats: number, decimals = 8): string {
  const frr = sats / 1e8
  return frr.toFixed(decimals)
}

export function formatAge(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  if (diff < 0) return 'just now'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function formatHashrate(hps: number): string {
  if (hps >= 1e12) return `${(hps / 1e12).toFixed(2)} TH/s`
  if (hps >= 1e9) return `${(hps / 1e9).toFixed(2)} GH/s`
  if (hps >= 1e6) return `${(hps / 1e6).toFixed(2)} MH/s`
  if (hps >= 1e3) return `${(hps / 1e3).toFixed(2)} KH/s`
  return `${hps.toFixed(2)} H/s`
}

export function formatDifficulty(d: number): string {
  if (d === 0) return '0'
  if (d >= 1) return d.toLocaleString(undefined, { maximumFractionDigits: 2 })
  // Sub-1 difficulty: show 4 significant figures, trimming trailing zeros.
  return d.toPrecision(4).replace(/\.?0+$/, '')
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${bytes} B`
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function isAddress(input: string): boolean {
  return input.startsWith('tfrr1') || input.startsWith('frr1')
}

export function isBlockHeight(input: string): boolean {
  return /^\d+$/.test(input) && input.length <= 8
}

export function isTxOrBlockHash(input: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(input)
}
