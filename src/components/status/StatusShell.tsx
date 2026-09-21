'use client'

import { useLocale } from 'next-intl'

import { SiteNav } from '@/components/layout/SiteNav'
import { resolveBridgeNav } from '@/lib/nav/bridge'

/** Nav chrome for 404/error without a Payload round-trip. */
export function StatusShell() {
  const locale = useLocale() === 'en' ? 'en' : 'de'

  return (
    <SiteNav
      context="outside"
      hereLinks={[]}
      bridge={resolveBridgeNav(null, locale)}
    />
  )
}
