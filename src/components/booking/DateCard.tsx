'use client'

import { Calendar } from 'lucide-react'
import { useLocale } from 'next-intl'

type Props = {
  id: string
  label: string
  value: string
  min?: string
  required?: boolean
  onChange: (iso: string) => void
}

function cardParts(iso: string, locale: string) {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) {
    return { day: '–', month: '', year: '' }
  }
  const months =
    locale === 'de'
      ? ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return {
    day: String(day),
    month: months[month - 1] ?? '',
    year: String(year),
  }
}

export function DateCard({ id, label, value, min, required = true, onChange }: Props) {
  const locale = useLocale()
  const parts = cardParts(value, locale)

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="font-ui text-ui-sm font-medium text-hbb-black">
        {label}
      </label>
      <div className="relative mt-1 border-b border-hbb-black/20">
        <div className="pointer-events-none flex items-center justify-between gap-3 py-2 pr-1" aria-hidden="true">
          <div className="min-w-0">
            <span className="block font-ui text-[1.85rem] font-semibold leading-none tracking-tight text-hbb-black">
              {parts.day}
            </span>
            <span className="mt-1 block font-ui text-ui-sm text-hbb-nav-secondary">
              {parts.month} {parts.year}
            </span>
          </div>
          <Calendar className="size-5 shrink-0 text-hbb-black" strokeWidth={1.5} />
        </div>
        <input
          id={id}
          type="date"
          required={required}
          value={value}
          min={min}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
        />
      </div>
    </div>
  )
}
