import { getTranslations } from 'next-intl/server'

import { HereFactGroup } from '@/components/here/HereFactGroup'
import { HereSubpage } from '@/components/here/HereSubpage'
import { herePageMetadata } from '@/lib/here/canonical'
import { getHotel, guestStayFromHotel } from '@/lib/payload/hotel'
import { getVenueBySlug } from '@/lib/payload/venues'
import { formatVenueHoursSegments, localizeHoursSegmentLabel, toOpeningHoursEntries } from '@/lib/venues/formatHours'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'here' })
  return herePageMetadata(
    '/here/dining',
    locale,
    t('pages.dining.title'),
    t('pages.dining.intro'),
  )
}

export default async function HereDiningPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('here')
  const loc = locale === 'de' ? 'de' : 'en'
  const [lutze, hotel] = await Promise.all([
    getVenueBySlug('lutze', loc).catch(() => null),
    getHotel(loc).catch(() => null),
  ])
  const stay = guestStayFromHotel(hotel)
  const hourSegments = formatVenueHoursSegments(
    toOpeningHoursEntries(lutze?.openingHours),
    t('pages.dining.openEnd'),
  )

  const lutzeItems = [
    ...hourSegments.map((segment) => ({
      label: localizeHoursSegmentLabel(segment.label, {
        kitchen: t('pages.dining.kitchen'),
        bar: t('pages.dining.bar'),
      }),
      body: segment.body,
    })),
    ...(lutze?.location
      ? [{ label: t('pages.dining.where'), body: lutze.location }]
      : [{ label: t('pages.dining.where'), body: t('pages.dining.lutzeWhere') }]),
    { label: t('pages.dining.reserve'), body: t('pages.dining.reserveNote') },
  ]

  return (
    <HereSubpage
      kicker={t('inProgress')}
      title={t('pages.dining.title')}
      intro={lutze?.shortDescription || t('pages.dining.intro')}
      backLabel={t('backToHub')}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <HereFactGroup title={t('pages.dining.lutzeTitle')} items={lutzeItems} />
        <HereFactGroup
          title={t('pages.dining.breakfastTitle')}
          items={[
            { label: t('pages.dining.hours'), body: stay.breakfastHours },
            { label: t('pages.dining.where'), body: stay.breakfastLocation },
          ]}
        />
        <HereFactGroup
          title={t('pages.dining.wundermartTitle')}
          items={[{ body: t('pages.dining.wundermartBody') }]}
        />
        <HereFactGroup
          title={t('pages.dining.gardenTitle')}
          items={[{ body: t('pages.dining.gardenBody') }]}
        />
      </div>
    </HereSubpage>
  )
}
