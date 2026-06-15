import type { Metadata } from 'next'
import { Space_Grotesk, Space_Mono, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { StatsBar } from '@/components/layout/StatsBar'
import { Footer } from '@/components/layout/Footer'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ferrous Explorer — Testnet',
  description:
    'Block explorer for the Ferrous Network — Bitcoin re-forged with Dilithium post-quantum signatures and RandomX PoW.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} ${bebasNeue.variable} h-full`}
    >
      <head>
        <link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml" />
      </head>
      <body
        className="min-h-full flex flex-col bg-[#0d0d0f] text-[#f0ede8]"
        style={{ fontFamily: 'var(--font-body), sans-serif' }}
      >
        <Navbar />
        <StatsBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
