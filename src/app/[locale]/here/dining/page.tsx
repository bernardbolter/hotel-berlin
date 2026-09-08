import { getTranslations } from 'next-intl/server'

import { HereFactGroup } from '@/components/here/HereFactGroup'
import { HereSubpage } from '@/components/here/HereSubpage'
import { LineCta } from '@/components/primitives/LineCta'
import { OpenStatusBadge } from '@/components/primitives/OpenStatusBadge'
import { herePageMetadata } from '@/lib/here/canonical'
import { guestStayFromHotel, getHotel } from '@/lib/payload/hotel'
import { getVenueBySlug } from '@/lib/payload/venues'
import { localizeInBuildingLocation } from '@/lib/venues/localizeCopy'
import {
  formatVenueHoursSegments,
  localizeHoursSegmentLabel,
  toOpeningHoursEntries,
} from '@/lib/venues/formatHours'

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
  const [lutze, wundermart, hotel] = await Promise.all([
    getVenueBySlug('lutze', loc).catch(() => null),
    getVenueBySlug('wundermart', loc).catch(() => null),
    getHotel(loc).catch(() => null),
  ])
  const stay = guestStayFromHotel(hotel, loc)
  const hoursEntries = toOpeningHoursEntries(lutze?.openingHours)
  const hourSegments = formatVenueHoursSegments(hoursEntries, t('pages.dining.openEnd'))
  const price = stay.breakfastPricing
  const priceBody =
    price.adultPrice != null && price.childPrice != null && price.childAgeFrom != null
      ? t('pages.dining.breakfastPrice', {
          adult: price.adultPrice,
          child: price.childPrice,
          age: price.childAgeFrom,
        })
      : null

  const lutzeItems = [
    ...hourSegments.map((segment) => ({
      label: localizeHoursSegmentLabel(segment.label, {
        kitchen: t('pages.dining.kitchen'),
        bar: t('pages.dining.bar'),
      }),
      body: segment.body,
    })),
    ...(lutze?.location
      ? [
          {
            label: t('pages.dining.where'),
            body: localizeInBuildingLocation(lutze.location, loc) || lutze.location,
          },
        ]
      : [{ label: t('pages.dining.where'), body: t('pages.dining.lutzeWhere') }]),
    { label: t('pages.dining.reserve'), body: t('pages.dining.reserveNote') },
  ]

  const breakfastItems = [
    {
      label: t('pages.dining.weekdays'),
      body: stay.breakfastWeekdays || stay.breakfastHours,
    },
    ...(stay.breakfastWeekend
      ? [{ label: t('pages.dining.weekends'), body: stay.breakfastWeekend }]
      : []),
    { label: t('pages.dining.where'), body: stay.breakfastLocation },
    ...(priceBody ? [{ label: t('pages.dining.price'), body: priceBody }] : []),
  ]

  return (
    <HereSubpage
      title={t('pages.dining.title')}
      intro={lutze?.shortDescription || t('pages.dining.intro')}
      backLabel={t('backToHub')}
    >
      {hoursEntries.length > 0 ? (
        <div className="mb-6">
          <OpenStatusBadge variant="guest" openingHours={hoursEntries} />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <HereFactGroup title={t('pages.dining.lutzeTitle')} items={lutzeItems} />
        <div id="breakfast" className="scroll-mt-28">
          <HereFactGroup title={t('pages.dining.breakfastTitle')} items={breakfastItems} />
        </div>
        {wundermart ? (
          <div id="wundermart" className="scroll-mt-28">
            <HereFactGroup
              title={wundermart.name}
              items={[
                ...(wundermart.location
                  ? [{ label: t('pages.dining.where'), body: wundermart.location }]
                  : []),
                { body: wundermart.shortDescription || t('pages.dining.wundermartBody') },
              ]}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <LineCta href="/restaurant" className="text-ui-sm">
          {t('pages.dining.restaurantCta')}
        </LineCta>
      </div>
    </HereSubpage>
  )
}
