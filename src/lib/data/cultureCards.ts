import type { ContentCardProps } from '@/components/primitives/ContentCard'

export type CultureCardId = 'fkkb' | 'kttk' | 'sissi' | 'haus-luetzowplatz'

export interface CultureCardConfig {
  id: CultureCardId
  badgeColor: ContentCardProps['badgeColor']
  ctaHref: string
  ctaExternal?: boolean
  image: string
}

export const cultureCardConfig: CultureCardConfig[] = [
  {
    id: 'fkkb',
    badgeColor: 'teal',
    ctaHref: '/gallery',
    image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&q=80',
  },
  {
    id: 'kttk',
    badgeColor: 'green',
    ctaHref: '/here/explore',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
  },
  {
    id: 'sissi',
    badgeColor: 'amber',
    ctaHref: '/skateboard-museum',
    image: 'https://images.unsplash.com/photo-1547448415-e9f5b28e57d0?w=800&q=80',
  },
  {
    id: 'haus-luetzowplatz',
    badgeColor: 'purple',
    ctaHref: 'https://haus-am-luetzowplatz.de',
    ctaExternal: true,
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
  },
]
