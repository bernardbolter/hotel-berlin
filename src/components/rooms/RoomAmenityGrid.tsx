import { AmenityIcon } from '@/components/home/AmenityIcon'

export type RoomAmenityItem = {
  id: string | number
  name: string
  description?: string | null
  iconName?: string | null
}

type Props = {
  amenities: RoomAmenityItem[]
  heading: string
  className?: string
}

/** Bare Lucide icon + bold label + one-line description — rooms detail amenity grid (brief §3.4). */
export function RoomAmenityGrid({ amenities, heading, className = '' }: Props) {
  if (amenities.length === 0) return null

  return (
    <section className={className} aria-labelledby="room-amenities-heading">
      <h2 id="room-amenities-heading" className="font-ui text-ui-lg font-medium text-hbb-black">
        {heading}
      </h2>
      <ul
        role="list"
        className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {amenities.map((amenity) => (
          <li key={amenity.id} className="flex flex-col items-start gap-2 text-left">
            <AmenityIcon
              iconName={amenity.iconName}
              size={22}
              className="shrink-0 text-hbb-rooms-highlight"
            />
            <div className="min-w-0">
              <p className="font-ui text-ui-sm font-bold text-hbb-black">{amenity.name}</p>
              {amenity.description ? (
                <p className="mt-1 font-ui text-ui-sm leading-snug text-gray-700">
                  {amenity.description}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
