import { getLocale } from 'next-intl/server'

import { resolveBridgeNav } from '@/lib/nav/bridge'
import { getHotel } from '@/lib/payload/hotel'
import { getSecondaryNavLinks } from '@/lib/payload/navigation'

import { SiteNav } from './SiteNav'

type Props = {
  context?: 'outside' | 'inside'
}

export async function SiteNavWithData({ context = 'outside' }: Props) {
  const locale = (await getLocale()) as 'de' | 'en'
  const [hereLinks, hotel] = await Promise.all([
    getSecondaryNavLinks(locale),
    getHotel().catch(() => null),
  ])

  return (
    <SiteNav
      context={context}
      hereLinks={hereLinks}
      bridge={resolveBridgeNav(hotel?.bridgeNav, locale)}
    />
  )
}
