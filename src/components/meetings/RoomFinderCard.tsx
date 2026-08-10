import Image from 'next/image'

import { Link } from '@/i18n/routing'
import { MeetingRoomFeatureIcons } from '@/components/meetings/MeetingRoomFeatureIcons'

export type MeetingRoomSummaryCard = {
  slug: string
  name: string
  areaValue: string
  areaLabel: string
  sizeM2: number
  teaserImage: { src: string; alt: string } | null
  capacityLines: { label: string; labelKey: string; value: number }[]
  /** All layout keys with capacity > 0 — used for layout filter. */
  layoutKeys: string[]
  maxGuests: number
  hasDaylight: boolean
  isDivisible: boolean
  hasScreen: boolean
  hasProjector: boolean
  combinableWithNames: string[]
}

type Props = {
  room: MeetingRoomSummaryCard
  sizeLabel: string
  combinableLabel: string
  featureLabels: {
    daylight: string
    divisible: string
    screen: string
    projector: string
  }
}

const CORNER_CLASS = [
  'rounded-tl-[50px]',
  'rounded-tr-[50px]',
  'rounded-br-[50px]',
] as const

/** Stable pick so SSR + client match; reads as random across the grid. */
function cornerClassFor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % CORNER_CLASS.length
  }
  return CORNER_CLASS[hash]!
}

export function RoomFinderCard({
  room,
  sizeLabel,
  combinableLabel,
  featureLabels,
}: Props) {
  return (
    <Link
      href={{ pathname: '/meetings/[slug]', params: { slug: room.slug } }}
      className={[
        'group flex h-full flex-col overflow-hidden border-0 bg-white',
        'shadow-[0_4px_18px_rgba(20,20,20,0.06)] transition-shadow duration-200',
        'hover:shadow-[0_10px_32px_rgba(20,20,20,0.16)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hbb-teal focus-visible:ring-offset-2',
        cornerClassFor(room.slug),
      ].join(' ')}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-subtle)]">
        {room.teaserImage ? (
          <Image
            src={room.teaserImage.src}
            alt={room.teaserImage.alt}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-ui text-[10.5px] font-bold uppercase tracking-[0.14em] text-hbb-teal">
          {room.areaLabel}
        </p>
        <h3 className="mt-1.5 font-ui text-lg font-bold leading-snug text-hbb-black">
          {room.name}
        </h3>
        <p className="mt-1 font-ui text-ui-sm text-[var(--dim)]">
          {sizeLabel.replace('{size}', String(room.sizeM2))}
        </p>
        {room.capacityLines.length > 0 ? (
          <ul
            role="list"
            className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 font-ui text-ui-sm text-hbb-black"
          >
            {room.capacityLines.map((line) => (
              <li key={line.label}>
                <span className="text-[var(--dim)]">{line.label} </span>
                <span className="font-semibold tabular-nums">{line.value}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <MeetingRoomFeatureIcons
          className="mt-4"
          hasDaylight={room.hasDaylight}
          isDivisible={room.isDivisible}
          hasScreen={room.hasScreen}
          hasProjector={room.hasProjector}
          labels={featureLabels}
        />
        {room.combinableWithNames.length > 0 ? (
          <p className="mt-auto pt-4 font-ui text-ui-xs text-[var(--dim)]">
            {combinableLabel} {room.combinableWithNames.join(', ')}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
