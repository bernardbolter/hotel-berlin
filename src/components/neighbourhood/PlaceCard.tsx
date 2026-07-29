import Image from 'next/image'
import {
  Baby,
  Binoculars,
  Landmark,
  Music,
  Palette,
  ShoppingBag,
  Trees,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from 'lucide-react'

import { Link } from '@/i18n/routing'
import type { PlaceCategory } from '@/lib/queries/neighbourhoodPlaces'

const categoryIcons: Record<PlaceCategory, LucideIcon> = {
  Art: Palette,
  Bar: Wine,
  Kids: Baby,
  Museum: Landmark,
  'Parks and Nature': Trees,
  Party: Music,
  Restaurant: UtensilsCrossed,
  Shopping: ShoppingBag,
  Sightseeing: Binoculars,
}

export type PlaceCardEndorsement = {
  personSlug: string
  personName: string
}

export type PlaceCardProps = {
  name: string
  slug: string
  category: PlaceCategory
  categoryLabel: string
  walkingMinutes?: number | null
  walkingLabel?: string
  description?: string | null
  imageUrl?: string | null
  imageAlt?: string
  endorsements?: PlaceCardEndorsement[]
}

export function PlaceCard({
  name,
  slug,
  category,
  categoryLabel,
  walkingMinutes,
  walkingLabel,
  description,
  imageUrl,
  imageAlt = '',
  endorsements = [],
}: PlaceCardProps) {
  const Icon = categoryIcons[category] ?? Landmark

  return (
    <article className="flex flex-col motion-safe:transition-opacity motion-reduce:transition-none">
      {imageUrl ? (
        <Link
          href={{ pathname: '/neighbourhood/[slug]', params: { slug } }}
          className="relative mb-4 aspect-4/3 overflow-hidden bg-gray-100"
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </Link>
      ) : null}

      <div className="flex items-center gap-2 text-hbb-green">
        <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
        <span className="font-ui text-label uppercase tracking-ui-label">{categoryLabel}</span>
      </div>

      <h3 className="mt-2 font-ui text-ui-md font-medium text-hbb-black">
        <Link
          href={{ pathname: '/neighbourhood/[slug]', params: { slug } }}
          className="hover:text-hbb-green"
        >
          {name}
        </Link>
      </h3>

      {walkingMinutes != null && walkingLabel ? (
        <p className="mt-1 font-ui text-ui-xs text-gray-400">{walkingLabel}</p>
      ) : null}

      {description ? (
        <p className="mt-2 line-clamp-3 font-ui text-ui-sm text-gray-600">{description}</p>
      ) : null}

      {endorsements.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {endorsements.map((endorsement) => (
            <li key={endorsement.personSlug}>
              <Link
                href={{
                  pathname: '/you-me-berlin/[slug]',
                  params: { slug: endorsement.personSlug },
                }}
                className="inline-flex border border-gray-200 px-2 py-1 font-ui text-ui-xs text-gray-600 hover:border-hbb-green hover:text-hbb-green"
              >
                {endorsement.personName}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
