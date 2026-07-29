'use client'

import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'

type Props = {
  pathname: '/neighbourhood' | '/you-me-berlin'
  options: { value: string; label: string }[]
  param: string
  activeValue?: string | null
  ariaLabel: string
}

export function ToggleFilterGroup({
  pathname,
  options,
  param,
  activeValue,
  ariaLabel,
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
    // Query string appended to canonical pathname key — next-intl localizes the path.
    router.push((qs ? `${pathname}?${qs}` : pathname) as '/neighbourhood')
  }

  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
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
