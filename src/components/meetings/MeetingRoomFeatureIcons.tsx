import type { ComponentType } from 'react'
import { Sun } from 'lucide-react'

import {
  DivisibleIcon,
  ProjectorIcon,
  ScreenIcon,
} from '@/components/meetings/meetingCapacityIcons'

type Props = {
  hasDaylight?: boolean | null
  isDivisible?: boolean | null
  hasScreen?: boolean | null
  hasProjector?: boolean | null
  labels: {
    daylight: string
    divisible: string
    screen: string
    projector: string
  }
  className?: string
}

type FeatureItem = {
  key: string
  Icon: ComponentType<{ className?: string }>
  label: string
}

export function MeetingRoomFeatureIcons({
  hasDaylight,
  isDivisible,
  hasScreen,
  hasProjector,
  labels,
  className = '',
}: Props) {
  const features: FeatureItem[] = []
  if (hasDaylight) features.push({ key: 'daylight', Icon: Sun, label: labels.daylight })
  if (isDivisible)
    features.push({ key: 'divisible', Icon: DivisibleIcon, label: labels.divisible })
  if (hasScreen) features.push({ key: 'screen', Icon: ScreenIcon, label: labels.screen })
  if (hasProjector)
    features.push({ key: 'projector', Icon: ProjectorIcon, label: labels.projector })

  if (features.length === 0) return null

  return (
    <ul role="list" className={`flex flex-wrap gap-4 ${className}`}>
      {features.map(({ key, Icon, label }) => (
        <li
          key={key}
          className="flex items-center gap-2 font-ui text-ui-sm text-gray-600"
        >
          <Icon className="h-4 w-4 shrink-0 text-hbb-teal" aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  )
}
