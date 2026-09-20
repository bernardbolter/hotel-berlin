import { amenityToCard, getAmenities } from '@/lib/amenities/resolve'
import type { AmenityHoursLabels } from '@/lib/amenities/types'
import type { AmenityCardProps } from '@/components/here/AmenityCard'
import type { LucideIcon } from 'lucide-react'

export type InHouseAmenity = Omit<AmenityCardProps, 'icon'> & {
  key: string
  icon: LucideIcon
}

type Copy = {
  specWhen: string
  specPrice: string
  specWhat: string
  locationTbc: string
  labels: AmenityHoursLabels
}

/** Hub cards via `getAmenities({ context: 'hub' })`. */
export async function getInHouseAmenities(
  locale: string,
  copy: Copy,
): Promise<InHouseAmenity[]> {
  const loc = locale === 'de' ? 'de' : 'en'
  const docs = await getAmenities({ context: 'hub', locale: loc })
  return docs.map((doc) => {
    const card = amenityToCard(doc, loc, copy)
    return {
      key: card.key,
      icon: card.icon,
      eyebrow: card.eyebrow,
      title: card.title,
      line: card.line,
      notice: card.notice,
      subline: card.summary,
      image: card.image,
      href: card.href,
      pending: card.pending,
    }
  })
}
