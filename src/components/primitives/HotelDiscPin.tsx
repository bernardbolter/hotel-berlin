export interface HotelDiscPinProps {
  className?: string
  style?: React.CSSProperties
}

export function HotelDiscPin({ className = '', style }: HotelDiscPinProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={style}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-hbb-dark shadow-md ring-2 ring-white">
        <span className="h-2 w-2 rounded-full bg-hbb-amber" />
      </div>
    </div>
  )
}
