export function FerrousLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="37" height="37" stroke="#C0392B" strokeWidth="3"/>
      <rect x="57.5" y="1.5" width="37" height="37" stroke="#C0392B" strokeWidth="3"/>
      <rect x="1.5" y="57.5" width="37" height="37" stroke="#C0392B" strokeWidth="3"/>
      <rect x="57.5" y="57.5" width="37" height="37" stroke="#C0392B" strokeWidth="3"/>
      <line x1="38.5" y1="20" x2="57.5" y2="20" stroke="#C0392B" strokeWidth="3"/>
      <line x1="38.5" y1="76" x2="57.5" y2="76" stroke="#C0392B" strokeWidth="3"/>
      <line x1="20" y1="38.5" x2="20" y2="57.5" stroke="#C0392B" strokeWidth="3"/>
      <line x1="76" y1="38.5" x2="76" y2="57.5" stroke="#C0392B" strokeWidth="3"/>
    </svg>
  )
}
