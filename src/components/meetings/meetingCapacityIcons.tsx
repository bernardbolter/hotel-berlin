/** Line icons matching the live hotel-berlin.de meeting-room capacity set. */

type IconProps = { className?: string; title?: string }

const base = {
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

/** Three dashed rows — classroom / parliamentary. */
export function ClassroomIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path strokeDasharray="2.5 2" d="M8 14h32M8 24h32M8 34h32" />
    </svg>
  )
}

/** Solid seating rows — theatre. */
export function TheaterIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M10 12h28" />
      <path d="M12 20h24M12 28h24M12 36h24" />
    </svg>
  )
}

/** Round table with chairs — banquet. */
export function BanquetIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="24" cy="24" r="9" />
      <circle cx="24" cy="8" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="24" cy="40" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="8" cy="24" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="40" cy="24" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="12.5" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="35.5" cy="12.5" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="35.5" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="35.5" cy="35.5" r="2.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** U-shaped table. */
export function UShapeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M14 12v18a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V12" />
      <circle cx="14" cy="10" r="2" fill="currentColor" stroke="none" />
      <circle cx="34" cy="10" r="2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="20" r="2" fill="currentColor" stroke="none" />
      <circle cx="34" cy="20" r="2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="34" r="2" fill="currentColor" stroke="none" />
      <circle cx="24" cy="36" r="2" fill="currentColor" stroke="none" />
      <circle cx="32" cy="34" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Small round tables — cabaret. */
export function CabaretIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="16" cy="18" r="5" />
      <circle cx="32" cy="18" r="5" />
      <circle cx="24" cy="32" r="5" />
      <circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="10" cy="18" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="26" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="32" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="38" cy="18" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="32" cy="26" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="24" cy="24" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="34" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="30" cy="34" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Cocktail glass — reception. */
export function ReceptionIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M14 10h20L24 26z" />
      <path d="M24 26v10M18 38h12" />
      <path d="M30 8c2 1 3 3 2 5" />
    </svg>
  )
}

/** Rectangular board table — block. */
export function BlockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="14" y="16" width="20" height="16" rx="1" />
      <circle cx="18" cy="12" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="24" cy="12" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="30" cy="12" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="18" cy="36" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="24" cy="36" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="30" cy="36" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="10" cy="20" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="10" cy="28" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="38" cy="20" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="38" cy="28" r="1.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Split room with outward arrows — divisible. */
export function DivisibleIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="8" y="10" width="32" height="28" rx="1" />
      <path strokeDasharray="3 2.5" d="M24 12v24" />
      <path d="M18 24H10M14 20l-4 4 4 4M30 24h8M34 20l4 4-4 4" />
    </svg>
  )
}

/** Monitor — screen. */
export function ScreenIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="8" y="12" width="32" height="20" rx="1.5" />
      <path d="M20 36h8M24 32v4" />
    </svg>
  )
}

/** Side-view projector. */
export function ProjectorIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="8" y="18" width="22" height="12" rx="2" />
      <circle cx="15" cy="24" r="3" />
      <path d="M30 20l10-6v20l-10-6z" />
      <path d="M12 30v4M26 30v4" />
    </svg>
  )
}
