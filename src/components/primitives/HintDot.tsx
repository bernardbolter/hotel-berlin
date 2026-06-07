export type HintDotVariant = 'default' | 'featured' | 'concierge'

export interface HintDotProps {
  variant?: HintDotVariant
  className?: string
  style?: React.CSSProperties
}

const variantClasses: Record<HintDotVariant, string> = {
  default: 'bg-hbb-teal',
  featured: 'bg-hbb-amber',
  concierge: 'bg-hbb-purple',
}

export function HintDot({ variant = 'default', className = '', style }: HintDotProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={style}
    >
      <span
        className={`block h-2 w-2 rounded-full ring-2 ring-white ${variantClasses[variant]}`}
      />
    </div>
  )
}
