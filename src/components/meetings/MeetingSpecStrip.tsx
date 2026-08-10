import { Maximize2, Ruler, Sun, Users } from 'lucide-react'

type SpecItem = {
  icon: 'size' | 'daylight' | 'ceiling' | 'combinable'
  label: string
  value: string
}

type Props = {
  items: SpecItem[]
  className?: string
}

const ICONS = {
  size: Ruler,
  daylight: Sun,
  ceiling: Maximize2,
  combinable: Users,
} as const

export function MeetingSpecStrip({ items, className = '' }: Props) {
  const visible = items.filter((item) => item.value && item.value !== '–')
  if (visible.length === 0) return null

  return (
    <ul
      role="list"
      className={`flex flex-wrap gap-x-8 gap-y-4 border-y border-gray-200 py-5 ${className}`}
    >
      {visible.map((item) => {
        const Icon = ICONS[item.icon]
        return (
          <li key={`${item.icon}-${item.label}`} className="flex min-w-28 flex-col gap-1">
            <span className="font-ui text-[10px] uppercase tracking-widest text-gray-400">
              {item.label}
            </span>
            <span className="flex items-center gap-1.5 font-ui text-base font-medium text-hbb-black">
              <Icon size={14} aria-hidden="true" className="text-hbb-teal" />
              {item.value}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
