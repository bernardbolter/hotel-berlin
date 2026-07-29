'use client'

import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'

export type FilterChipOption = {
  value: string
  label: string
}

type Props = {
  /** Canonical pathname key for next-intl navigation. */
  pathname: '/neighbourhood' | '/you-me-berlin'
  options: FilterChipOption[]
  /** Query param name for this chip group. */
  param: string
  activeValue?: string | null
  ariaLabel: string
  allLabel: string
}

export function FilterChipBar({
  pathname,
  options,
  param,
  activeValue,
  ariaLabel,
  allLabel,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function navigate(nextValue: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (nextValue) {
      params.set(param, nextValue)
    } else {
      params.delete(param)
    }
    const qs = params.toString()
    // Append query to the canonical pathname key; next-intl localizes the path segment.
    router.push((qs ? `${pathname}?${qs}` : pathname) as typeof pathname)
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-2"
    >
      <button
        type="button"
        aria-pressed={!activeValue}
        onClick={() => navigate(null)}
        className={`inline-flex min-h-10 items-center border px-3 font-ui text-ui-xs uppercase tracking-ui-label transition-colors duration-200 ease-out motion-reduce:transition-none ${
          !activeValue
            ? 'border-hbb-green bg-hbb-green/10 text-hbb-green'
            : 'border-gray-200 bg-transparent text-gray-600 hover:border-gray-400 hover:text-hbb-black'
        }`}
      >
        {allLabel}
      </button>
      {options.map((option) => {
        const pressed = activeValue === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={pressed}
            onClick={() => navigate(pressed ? null : option.value)}
            className={`inline-flex min-h-10 items-center border px-3 font-ui text-ui-xs uppercase tracking-ui-label transition-colors duration-200 ease-out motion-reduce:transition-none ${
              pressed
                ? 'border-hbb-green bg-hbb-green/10 text-hbb-green'
                : 'border-gray-200 bg-transparent text-gray-600 hover:border-gray-400 hover:text-hbb-black'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
