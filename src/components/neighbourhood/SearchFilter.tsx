'use client'

import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'

type Props = {
  pathname: '/neighbourhood' | '/you-me-berlin'
  initialValue?: string
  placeholder: string
  submitLabel: string
  clearLabel: string
}

export function SearchFilter({
  pathname,
  initialValue = '',
  placeholder,
  submitLabel,
  clearLabel,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialValue)

  function applySearch(next: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (next.trim()) {
      params.set('search', next.trim())
    } else {
      params.delete('search')
    }
    const qs = params.toString()
    router.push((qs ? `${pathname}?${qs}` : pathname) as typeof pathname)
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    applySearch(value)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-2" role="search">
      <label className="sr-only" htmlFor="listing-search">
        {placeholder}
      </label>
      <input
        id="listing-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="min-h-10 min-w-50 flex-1 border border-gray-200 bg-white px-3 font-ui text-ui-sm text-hbb-black outline-none focus:border-hbb-green"
      />
      <button
        type="submit"
        className="inline-flex min-h-10 items-center border border-hbb-green bg-hbb-green/10 px-4 font-ui text-ui-xs uppercase tracking-ui-label text-hbb-green"
      >
        {submitLabel}
      </button>
      {initialValue ? (
        <button
          type="button"
          onClick={() => {
            setValue('')
            applySearch('')
          }}
          className="inline-flex min-h-10 items-center border border-gray-200 px-4 font-ui text-ui-xs uppercase tracking-ui-label text-gray-500 hover:text-hbb-black"
        >
          {clearLabel}
        </button>
      ) : null}
    </form>
  )
}
