'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { KenBurnsSlider } from '@/components/primitives/KenBurnsSlider'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { SlideDotsNav } from '@/components/primitives/SlideDotsNav'
import meetingsData from '@/lib/data/meetings.json'
import { getRoomIcon } from '@/lib/data/roomIcons'

import { Link } from '@/i18n/routing'

type MeetingData = (typeof meetingsData)[number]

export function MeetingsSection() {
  const t = useTranslations('meetings')
  const meetingRooms = meetingsData as MeetingData[]
  const [currentRoom, setCurrentRoom] = useState(0)

  const roomImages = useMemo(() => {
    const room = meetingRooms[currentRoom]
    if (!room) return []
    return room.images.map((img) => ({
      src: img.src,
      alt: t(`items.${room.id}.${img.altKey}`),
    }))
  }, [meetingRooms, currentRoom, t])

  return (
    <section aria-labelledby="meetings-heading" className="bg-hbb-teal-deep">
      <div className="grid grid-cols-1 gap-6 px-section-sm pb-6 pt-section-y md:grid-cols-2 md:gap-10 md:px-section-x">
        <SectionHeading
          id="meetings-heading"
          label={t('label')}
          title={t('title')}
          tone="inverse"
        />
        <p className="self-center font-serif text-serif-sm text-white/80">{t('body')}</p>
      </div>

      <div className="grid grid-cols-1 border-t border-white/10 md:grid-cols-[1.15fr_1fr]">
        <div className="relative min-h-[280px] md:min-h-[400px]">
          <KenBurnsSlider
            key={currentRoom}
            images={roomImages}
            aria-label={t('galleryAria')}
            interval={4500}
            showDots={false}
            className="h-full min-h-[280px] md:min-h-[400px]"
          />
        </div>

        <div className="flex flex-col justify-between border-t border-white/10 px-7 py-7 md:border-l md:border-t-0">
          <SlideDotsNav
            count={meetingRooms.length}
            current={currentRoom}
            labels={meetingRooms.map((r) => t(`items.${r.id}.name`))}
            onSelect={setCurrentRoom}
            ariaLabel={t('dotNavAria')}
            className="mb-6 [&_button[aria-selected=true]]:bg-hbb-amber [&_button[aria-selected=false]]:bg-white/20"
          />

          <div className="relative flex-1" aria-live="polite" aria-atomic="true">
            {meetingRooms.map((room, i) => (
              <div
                key={room.id}
                aria-hidden={i !== currentRoom}
                className={`transition-opacity duration-400 ${
                  i === currentRoom ? 'opacity-100' : 'absolute inset-0 opacity-0'
                }`}
              >
                <h3 className="mb-1 font-serif text-serif-lg font-medium text-white">
                  {t(`items.${room.id}.name`)}
                </h3>
                <p className="mb-5 font-ui text-ui-sm text-white/60">
                  {t(`items.${room.id}.capacity`)}
                </p>
                <ul role="list" className="grid grid-cols-3 border border-white/15">
                  {room.icons.map((icon) => {
                    const Icon = getRoomIcon(icon.icon)
                    return (
                      <li
                        key={icon.key}
                        className="flex flex-col items-center gap-1 border-r border-white/15 py-3 last:border-r-0"
                      >
                        <Icon aria-hidden="true" size={16} className="text-white/50" />
                        <span className="text-center font-ui text-ui-xs text-white/60">
                          {t(`items.${room.id}.${icon.key}`)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-5">
            <Link href="/meetings" className="btn-primary flex items-center gap-1.5">
              {t('cta')}
              <ArrowRight aria-hidden="true" size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
