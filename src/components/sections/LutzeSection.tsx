import { getLocale } from 'next-intl/server'

import { LutzeTeaser } from '@/components/home/LutzeTeaser'
import { getEatAndDrink } from '@/lib/payload/homepage'

/**
 * Homepage Eat & Drink / Lütze block — after Happenings, before the map.
 * Payload-backed copy + photo; Rooms-mirrored layout.
 */
export async function LutzeSection() {
  const locale = (await getLocale()) as 'de' | 'en'
  const copy = await getEatAndDrink(locale)

  return (
    <section aria-labelledby="lutze-heading" className="bg-white">
      <div className="site-shell box-border py-14 pr-5 pl-[10px] md:py-16 md:pr-10 lg:py-20 xl:pr-14">
        <LutzeTeaser copy={copy} />
      </div>
    </section>
  )
}
