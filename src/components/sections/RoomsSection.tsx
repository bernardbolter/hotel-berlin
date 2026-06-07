'use client'

import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { KenBurnsSlider } from '@/components/primitives/KenBurnsSlider'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { SlideDotsNav } from '@/components/primitives/SlideDotsNav'
import roomsData from '@/lib/data/rooms.json'
import { getRoomIcon } from '@/lib/data/roomIcons'

import { Link } from '@/i18n/routing'

type RoomData = (typeof roomsData)[number]

export function RoomsSection() {
  const rooms = roomsData as RoomData[]
  const [currentRoom, setCurrentRoom] = useState(0)

  const roomImages = useMemo(
    () => rooms[currentRoom]?.images ?? [],
    [rooms, currentRoom],
  )

  return (
    <section aria-labelledby="rooms-heading" className="bg-hbb-page">
      <div className="grid grid-cols-1 gap-6 px-section-sm pb-6 pt-section-y md:grid-cols-2 md:gap-10 md:px-section-x">
        <SectionHeading
          id="rooms-heading"
          label="Sleep & Relax"
          title="Room to spread out"
        />
        <p className="self-center font-serif text-serif-sm text-gray-600">
          Quiet, spacious, and genuinely comfortable. Whether you&apos;re here for one night or a
          week — your place to land. Thoughtful design details and a relaxed, home-like feel make
          every room a personal retreat.
        </p>
      </div>

      <div className="grid grid-cols-1 border-t border-gray-200 md:grid-cols-[1.15fr_1fr]">
        <div className="relative min-h-[280px] md:min-h-[400px]">
          <KenBurnsSlider
            key={currentRoom}
            images={roomImages}
            aria-label="Hotel Berlin, Berlin room photos"
            interval={4500}
            showDots={false}
            className="h-full min-h-[280px] md:min-h-[400px]"
          />
        </div>

        <div className="flex flex-col justify-between border-t border-gray-200 px-7 py-7 md:border-l md:border-t-0">
          <SlideDotsNav
            count={rooms.length}
            current={currentRoom}
            labels={rooms.map((r) => r.name)}
            onSelect={setCurrentRoom}
            className="mb-6"
          />

          <div className="relative flex-1" aria-live="polite" aria-atomic="true">
            {rooms.map((room, i) => (
              <div
                key={room.name}
                aria-hidden={i !== currentRoom}
                className={`transition-opacity duration-400 ${
                  i === currentRoom ? 'opacity-100' : 'absolute inset-0 opacity-0'
                }`}
              >
                <h3 className="mb-1 font-serif text-serif-lg font-medium text-hbb-black">
                  {room.name}
                </h3>
                <p className="mb-5 font-ui text-ui-sm text-gray-500">{room.priceLabel}</p>
                <ul role="list" className="grid grid-cols-3 border border-gray-200">
                  {room.icons.map((icon) => {
                    const Icon = getRoomIcon(icon.icon)
                    return (
                      <li
                        key={icon.label}
                        className="flex flex-col items-center gap-1 border-r border-gray-200 py-3 last:border-r-0"
                      >
                        <Icon aria-hidden="true" size={16} className="text-gray-400" />
                        <span className="text-center font-ui text-ui-xs text-gray-500">
                          {icon.label}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 border-t border-gray-200 pt-5">
            <Link href="/rooms" className="btn-primary flex items-center gap-1.5">
              Discover our rooms
              <ArrowRight aria-hidden="true" size={13} />
            </Link>
            <a
              href="/book"
              className="border-b border-gray-300 pb-px font-ui text-ui-sm text-gray-500"
            >
              Check availability
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
