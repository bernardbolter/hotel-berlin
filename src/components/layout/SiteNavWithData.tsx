import { getLocale } from 'next-intl/server'

import { resolveBridgeNav } from '@/lib/nav/bridge'
import { berlinTodayIso } from '@/lib/booking'
import { getHotel } from '@/lib/payload/hotel'
import { getSecondaryNavLinks } from '@/lib/payload/navigation'

import { SiteNav } from './SiteNav'

type Props = {
  context?: 'outside' | 'inside'
  /**
   * Pass explicitly on generateStaticParams / dynamicParams slug routes so
   * this component never calls getLocale() → headers().
   */
  locale?: 'de' | 'en'
}

export async function SiteNavWithData({ context = 'outside', locale: localeProp }: Props) {
  const locale = localeProp ?? ((await getLocale()) as 'de' | 'en')
  const [hereLinks, hotel] = await Promise.all([
    getSecondaryNavLinks(locale),
    getHotel().catch(() => null),
  ])

  return (
    <SiteNav
      context={context}
      hereLinks={hereLinks}
      bridge={resolveBridgeNav(hotel?.bridgeNav, locale)}
      todayIso={berlinTodayIso()}
    />
  )
}
