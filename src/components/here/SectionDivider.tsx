type SectionDividerProps = {
  label: string
  className?: string
}

/** Centred label between hairlines — Archivo uppercase, muted. */
export function SectionDivider({ label, className = '' }: SectionDividerProps) {
  return (
    <div
      className={`section-divider col-span-2 flex items-center gap-3 py-3 ${className}`}
      role="separator"
      aria-label={label}
    >
      <hr className="min-w-0 flex-1 border-0 border-t border-gray-200" />
      <span className="shrink-0 font-ui text-[10px] uppercase tracking-[0.07em] text-[#AAAAAA]">
        {label}
      </span>
      <hr className="min-w-0 flex-1 border-0 border-t border-gray-200" />
    </div>
  )
}
