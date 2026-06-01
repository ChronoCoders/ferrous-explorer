// Pure-CSS fade-in. Previously this used framer-motion with
// initial={{opacity:0}} + animate={{opacity:1}}, but if the JS animation
// failed to fire (hydration/version issue) the whole page stayed at
// opacity:0 — invisible. A CSS keyframe always runs and always ends
// visible, so content can never get stuck hidden.
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in-up">{children}</div>
}
