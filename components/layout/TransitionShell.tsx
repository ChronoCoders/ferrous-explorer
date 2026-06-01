'use client'

import { AnimatePresence } from 'framer-motion'

// AnimatePresence must be a client component; it wraps the server-rendered
// layout shell so exit animations fire on route changes.
export function TransitionShell({ children }: { children: React.ReactNode }) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>
}
