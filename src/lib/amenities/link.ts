import type { Amenity } from '@/payload-types'

const AMENITY_PAGE_PATHS: Record<string, string> = {
  wallride: '/here/wallride',
  art: '/here/art',
  dining: '/here/dining',
  restaurant: '/restaurant',
  meetings: '/meetings',
  neighbourhood: '/neighbourhood',
}

function venueAmenityHref(slug: string): string {
  if (slug === 'lutze') return '/restaurant'
  if (slug === 'fkkb') return '/here/art'
  return '/here'
}

export function amenityPageHref(doc: Pick<Amenity, 'href' | 'link'>): string | null {
  const type = doc.link?.type
  if (type === 'venue') {
    const venue = doc.link?.venue
    const slug = typeof venue === 'object' && venue ? venue.slug : null
    return slug ? venueAmenityHref(slug) : null
  }
  if (type === 'page') {
    const page = doc.link?.page
    if (page && AMENITY_PAGE_PATHS[page]) return AMENITY_PAGE_PATHS[page]
  }
  return doc.href?.trim() || null
}
