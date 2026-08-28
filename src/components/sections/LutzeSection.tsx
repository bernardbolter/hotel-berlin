import { getLocale, getTranslations } from 'next-intl/server'

import { LutzeTeaser, type LutzeFact } from '@/components/home/LutzeTeaser'
import { getEatAndDrink } from '@/lib/payload/homepage'
import { getVenueBySlug } from '@/lib/payload/venues'
import {
  formatVenueHoursSegments,
  toOpeningHoursEntries,
} from '@/lib/venues/formatHours'

/**
 * Homepage Eat & Drink / Lütze block — after Happenings, before the map.
 * Payload-backed copy + photo; Rooms-mirrored layout.
 */
export async function LutzeSection() {
  const locale = (await getLocale()) as 'de' | 'en'
  const [copy, venue, t, tRest] = await Promise.all([
    getEatAndDrink(locale),
    getVenueBySlug('lutze', locale).catch(() => null),
    getTranslations('lutze'),
    getTranslations('restaurantPage'),
  ])

  const segments = formatVenueHoursSegments(
    toOpeningHoursEntries(venue?.openingHours),
    tRest('openEnd'),
  )
  const kitchen = segments.find((item) => item.label.toLowerCase() === 'kitchen')
  const bar = segments.find((item) => item.label.toLowerCase() === 'bar')

  const facts: LutzeFact[] = [
    {
      icon: 'kitchen',
      label: t('hourLabelKitchen'),
      value: kitchen?.body ?? t('hoursKitchen'),
    },
    {
      icon: 'bar',
      label: t('hourLabelBar'),
      value: bar?.body ?? t('hoursBar'),
    },
  ]

  if (venue?.servesCuisine?.trim()) {
    facts.push({
      icon: 'cuisine',
      label: t('cuisineLabel'),
      value: venue.servesCuisine.replace(/,\s*/g, ' · '),
    })
  }

  return (
    <section aria-labelledby="lutze-heading" className="bg-white">
      {/* Full-bleed white; rooms shell mirrored — bleed on the left for the photo bar */}
      <div className="site-shell box-border pt-14 pr-[15px] pb-[41px] pl-5 min-[551px]:pr-5 md:pt-16 md:pb-[49px] md:pl-10 lg:pt-20 lg:pr-[10px] lg:pb-[65px] xl:pl-14">
        <LutzeTeaser
          copy={copy}
          facts={facts}
          restaurantUrl="https://www.luetze-berlin.de/"
          visitAria={t('ctaVisitAria')}
        />
      </div>
    </section>
  )
}
