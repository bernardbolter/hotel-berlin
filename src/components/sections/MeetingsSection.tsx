'use client'

import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { KenBurnsSlider } from '@/components/primitives/KenBurnsSlider'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { SlideDotsNav } from '@/components/primitives/SlideDotsNav'
import meetingsData from '@/lib/data/meetings.json'
import { getRoomIcon } from '@/lib/data/roomIcons'

import { Link } from '@/i18n/routing'

type MeetingData = (typeof meetingsData)[number]

export function MeetingsSection() {
  const meetingRooms = meetingsData as MeetingData[]
  const [currentRoom, setCurrentRoom] = useState(0)

  const roomImages = useMemo(
    () => meetingRooms[currentRoom]?.images ?? [],
    [meetingRooms, currentRoom],
  )

  return (
    <section aria-labelledby="meetings-heading" className="bg-hbb-teal-deep">
      <div className="grid grid-cols-1 gap-6 px-section-sm pb-6 pt-section-y md:grid-cols-2 md:gap-10 md:px-section-x">
        <SectionHeading
          id="meetings-heading"
          label="Meet & Work"
          title="Serious business, playful spaces"
          tone="inverse"
        />
        <p className="self-center font-serif text-serif-sm text-white/80">
          Business is in our DNA. With over 4,000 m² of flexible conference and meeting spaces,
          cutting-edge event technology, and a dedicated team, we ensure everything from conferences
          to workshops runs smoothly — leaving space for ideas and connections to take the lead.
        </p>
      </div>

      <div className="grid grid-cols-1 border-t border-white/10 md:grid-cols-[1.15fr_1fr]">
        <div className="relative min-h-[280px] md:min-h-[400px]">
          <KenBurnsSlider
            key={currentRoom}
            images={roomImages}
            aria-label="Hotel Berlin, Berlin meeting room photos"
            interval={4500}
            showDots={false}
            className="h-full min-h-[280px] md:min-h-[400px]"
          />
        </div>

        <div className="flex flex-col justify-between border-t border-white/10 px-7 py-7 md:border-l md:border-t-0">
          <SlideDotsNav
            count={meetingRooms.length}
            current={currentRoom}
            labels={meetingRooms.map((r) => r.name)}
            onSelect={setCurrentRoom}
            className="mb-6 [&_button[aria-selected=true]]:bg-hbb-amber [&_button[aria-selected=false]]:bg-white/20"
          />

          <div className="relative flex-1" aria-live="polite" aria-atomic="true">
            {meetingRooms.map((room, i) => (
              <div
                key={room.name}
                aria-hidden={i !== currentRoom}
                className={`transition-opacity duration-400 ${
                  i === currentRoom ? 'opacity-100' : 'absolute inset-0 opacity-0'
                }`}
              >
                <h3 className="mb-1 font-serif text-serif-lg font-medium text-white">
                  {room.name}
                </h3>
                <p className="mb-5 font-ui text-ui-sm text-white/60">{room.capacityLabel}</p>
                <ul role="list" className="grid grid-cols-3 border border-white/15">
                  {room.icons.map((icon) => {
                    const Icon = getRoomIcon(icon.icon)
                    return (
                      <li
                        key={icon.label}
                        className="flex flex-col items-center gap-1 border-r border-white/15 py-3 last:border-r-0"
                      >
                        <Icon aria-hidden="true" size={16} className="text-white/50" />
                        <span className="text-center font-ui text-ui-xs text-white/60">
                          {icon.label}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-5">
            <Link
              href="/meetings"
              className="btn-primary flex items-center gap-1.5"
            >
              All meeting rooms
              <ArrowRight aria-hidden="true" size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
