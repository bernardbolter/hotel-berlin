/**
 * Built-in fallback placements (from doc/faqs/faq-placements.json).
 * Used when the faq-placements global is empty or unreachable so a broken CMS
 * never blanks FAQ surfaces.
 */
import type { FaqRouteKey } from './routes'

export type DefaultPlacement = {
  route: FaqRouteKey
  audience: 'prospect' | 'guest' | 'both'
  topics: string[]
  cap: number | null
  showAll: boolean
}

export const DEFAULT_FAQ_PLACEMENTS: DefaultPlacement[] = [
  {
    route: 'home',
    audience: 'prospect',
    topics: ['checkin-checkout', 'parking', 'pets', 'payment'],
    cap: 4,
    showAll: false,
  },
  {
    route: 'rooms',
    audience: 'prospect',
    topics: ['rooms', 'in-room'],
    cap: 4,
    showAll: false,
  },
  {
    route: 'room-detail',
    audience: 'prospect',
    topics: ['rooms', 'in-room'],
    cap: 5,
    showAll: false,
  },
  {
    route: 'meetings',
    audience: 'prospect',
    topics: ['meetings', 'sustainability'],
    cap: 5,
    showAll: false,
  },
  {
    route: 'amenities',
    audience: 'prospect',
    topics: ['wellness', 'activities', 'services', 'bikes'],
    cap: 8,
    showAll: false,
  },
  {
    route: 'sustainability',
    audience: 'prospect',
    topics: ['sustainability'],
    cap: 5,
    showAll: false,
  },
  {
    route: 'offers',
    audience: 'prospect',
    topics: ['loyalty'],
    cap: 5,
    showAll: false,
  },
  {
    route: 'contact',
    audience: 'prospect',
    topics: ['contact', 'lost-property'],
    cap: 8,
    showAll: false,
  },
  {
    route: 'faq',
    audience: 'prospect',
    topics: [],
    cap: null,
    showAll: true,
  },
  {
    route: 'here',
    audience: 'guest',
    topics: [],
    cap: 3,
    showAll: false,
  },
  {
    route: 'here-dining',
    audience: 'guest',
    topics: ['breakfast', 'dining'],
    cap: 6,
    showAll: false,
  },
  {
    route: 'here-getting-around',
    audience: 'guest',
    topics: ['getting-here', 'bikes', 'parking', 'getting-around'],
    cap: 6,
    showAll: false,
  },
  {
    route: 'here-faq',
    audience: 'guest',
    topics: [],
    cap: null,
    showAll: true,
  },
  {
    route: 'policy-checkin',
    audience: 'prospect',
    topics: ['checkin-checkout'],
    cap: 8,
    showAll: false,
  },
  {
    route: 'policy-cancellation',
    audience: 'prospect',
    topics: ['cancellation'],
    cap: 8,
    showAll: false,
  },
  {
    route: 'policy-pets',
    audience: 'prospect',
    topics: ['pets'],
    cap: 8,
    showAll: false,
  },
  {
    route: 'policy-fees',
    audience: 'prospect',
    topics: [],
    cap: 8,
    showAll: false,
  },
  {
    route: 'policy-payment',
    audience: 'prospect',
    topics: ['payment'],
    cap: 8,
    showAll: false,
  },
]

export const DEFAULT_FAQ_PLACEMENT_BY_ROUTE = Object.fromEntries(
  DEFAULT_FAQ_PLACEMENTS.map((p) => [p.route, p]),
) as Record<FaqRouteKey, DefaultPlacement>
