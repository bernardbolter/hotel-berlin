import type { ComponentType } from 'react'

import {
  BanquetIcon,
  BlockIcon,
  CabaretIcon,
  ClassroomIcon,
  DivisibleIcon,
  ProjectorIcon,
  ReceptionIcon,
  ScreenIcon,
  TheaterIcon,
  UShapeIcon,
} from '@/components/meetings/meetingCapacityIcons'

type Capacities = {
  theater?: number | null
  classroom?: number | null
  banquet?: number | null
  uShape?: number | null
  cabaret?: number | null
  reception?: number | null
  block?: number | null
}

type Props = {
  capacities: Capacities
  labels: {
    theater: string
    classroom: string
    banquet: string
    uShape: string
    cabaret: string
    reception: string
    block: string
  }
  /** When set, appends divisible / screen / projector cells (old-site order). */
  features?: {
    isDivisible?: boolean | null
    hasScreen?: boolean | null
    hasProjector?: boolean | null
    labels: {
      divisible: string
      screen: string
      projector: string
    }
  }
  className?: string
}

/** Old-site order: Classroom → Theatre → … → Block, then amenity flags. */
const CAPACITY_KEYS = [
  'classroom',
  'theater',
  'banquet',
  'uShape',
  'cabaret',
  'reception',
  'block',
] as const

const CAPACITY_ICONS: Record<
  (typeof CAPACITY_KEYS)[number],
  ComponentType<{ className?: string }>
> = {
  classroom: ClassroomIcon,
  theater: TheaterIcon,
  banquet: BanquetIcon,
  uShape: UShapeIcon,
  cabaret: CabaretIcon,
  reception: ReceptionIcon,
  block: BlockIcon,
}

function capacityValue(value: number | null | undefined): string {
  return typeof value === 'number' ? String(value) : '–'
}

function featureValue(on: boolean | null | undefined): string {
  return on ? '✓' : '–'
}

export function CapacityTable({ capacities, labels, features, className = '' }: Props) {
  const items: {
    key: string
    label: string
    value: string
    Icon: ComponentType<{ className?: string }>
  }[] = CAPACITY_KEYS.map((key) => ({
    key,
    label: labels[key],
    value: capacityValue(capacities[key]),
    Icon: CAPACITY_ICONS[key],
  }))

  if (features) {
    items.push(
      {
        key: 'divisible',
        label: features.labels.divisible,
        value: featureValue(features.isDivisible),
        Icon: DivisibleIcon,
      },
      {
        key: 'screen',
        label: features.labels.screen,
        value: featureValue(features.hasScreen),
        Icon: ScreenIcon,
      },
      {
        key: 'projector',
        label: features.labels.projector,
        value: featureValue(features.hasProjector),
        Icon: ProjectorIcon,
      },
    )
  }

  return (
    <ul
      role="list"
      className={`grid grid-cols-2 gap-x-6 gap-y-8 border-y border-[var(--rule)] py-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${className}`}
    >
      {items.map(({ key, label, value, Icon }) => (
        <li key={key} className="flex flex-col items-center text-center">
          <Icon className="h-11 w-11 text-hbb-black" />
          <span className="mt-2 font-ui text-ui-sm font-bold text-hbb-black">{label}</span>
          <span className="mt-1 font-ui text-ui-md text-[var(--dim)]" aria-label={`${label}: ${value}`}>
            {value}
          </span>
        </li>
      ))}
    </ul>
  )
}
