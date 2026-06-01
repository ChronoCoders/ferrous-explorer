import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center">
      <div
        className="text-8xl text-[#C0392B] mb-4"
        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
      >
        404
      </div>
      <h2
        className="text-2xl text-[#f0ede8] mb-3"
        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.06em' }}
      >
        Not Found
      </h2>
      <p className="text-[#6b7280] text-sm mb-8 max-w-sm">
        This block, transaction, or address doesn't exist in the last 100 blocks, or the node is unreachable.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg bg-[#C0392B] text-white text-sm font-medium hover:bg-[#a93226] transition-colors"
      >
        Back to Explorer
      </Link>
    </div>
  )
}
