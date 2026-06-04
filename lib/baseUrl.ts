import { headers } from 'next/headers'

// Server components can't use relative fetch URLs — derive the origin from the
// request headers so self-fetches work on any port and behind Cloudflare Tunnel.
export async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}
