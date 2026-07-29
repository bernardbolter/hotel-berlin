'use client'

import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'

type Props = {
  showFurtherOut: boolean
  label: string
  hideLabel: string
}

export function FurtherOutToggle({ showFurtherOut, label, hideLabel }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function toggle() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (showFurtherOut) {
      params.delete('further')
      params.delete('distance')
    } else {
      params.set('further', '1')
    }
    const qs = params.toString()
    router.push((qs ? `/neighbourhood?${qs}` : '/neighbourhood') as '/neighbourhood')
  }

  return (
    <button
      type="button"
      aria-pressed={showFurtherOut}
      onClick={toggle}
      className="inline-flex min-h-10 items-center font-ui text-ui-xs uppercase tracking-ui-label text-hbb-green underline-offset-4 hover:underline"
    >
      {showFurtherOut ? hideLabel : label}
    </button>
  )
}
