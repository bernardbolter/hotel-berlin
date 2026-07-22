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
      {/* Full-bleed white; content in 1440 shell, 10px from the left */}
      <div className="site-shell box-border py-14 pr-5 pl-[10px] md:py-16 md:pr-10 lg:py-20 xl:pr-14">
        <RoomsTeaser rooms={items} copy={copy} />
      </div>
    </section>
  )
}
