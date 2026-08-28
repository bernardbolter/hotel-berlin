import { getLocale, getTranslations } from 'next-intl/server'

import { getRoomsTeaserCopy } from '@/lib/payload/homepage'
import { getRoomsForHero } from '@/lib/payload/rooms'
import { mapRoomToHeroItem } from '@/lib/rooms/roomHero'

import { RoomsTeaser } from './RoomsTeaser'

export async function RoomsHero() {
  const t = await getTranslations('rooms')
  const locale = (await getLocale()) as 'de' | 'en'
  let rooms: Awaited<ReturnType<typeof getRoomsForHero>> = []
  try {
    rooms = await getRoomsForHero(locale)
  } catch (error) {
    console.error('[RoomsHero] Failed to load rooms:', error)
  }

  if (rooms.length === 0) return null

  const copy = await getRoomsTeaserCopy(locale)
  const items = rooms.map((room) => mapRoomToHeroItem(room, locale, t('from').toLowerCase()))

  return (
    <section aria-labelledby="rooms-heading" className="bg-white">
      {/* Full-bleed white; 15px left at ≤550 (matches hero forest panel), 20px to lg, 10px at lg+ */}
      <div className="site-shell box-border pt-14 pr-5 pb-[41px] pl-[15px] min-[551px]:pl-5 md:pt-16 md:pr-10 md:pb-[49px] lg:pt-20 lg:pb-[65px] lg:pl-[10px] xl:pr-14">
        <RoomsTeaser rooms={items} copy={copy} />
      </div>
    </section>
  )
}
