import type { Where } from 'payload'

import { getPayloadClient } from '@/lib/payload/client'
import type { Faq } from '@/payload-types'

export type FaqContext = 'prospect' | 'guest'

export type FaqCategory =
  | 'rooms-booking'
  | 'checkin-checkout'
  | 'dining'
  | 'meetings'
  | 'accessibility'
  | 'getting-here'
  | 'pets-parking'
  | 'general'
  | 'wifi-tech'
  | 'guest-services'
  | 'neighbourhood-guest'
  | 'arrival-departure'
  | 'in-room'
  | 'money-payment'
  | 'health-emergency'
  | 'getting-around'
  | 'house-rules'

export const PROSPECT_FAQ_CATEGORIES: FaqCategory[] = [
  'rooms-booking',
  'checkin-checkout',
  'dining',
  'meetings',
  'accessibility',
  'getting-here',
  'pets-parking',
  'general',
]

export const GUEST_FAQ_CATEGORIES: FaqCategory[] = [
  'arrival-departure',
  'in-room',
  'money-payment',
  'health-emergency',
  'getting-around',
  'house-rules',
  'dining',
  'wifi-tech',
  'guest-services',
  'neighbourhood-guest',
  'general',
]

/** Accordion on /here — WiFi, luggage, check-out, in that order. */
export const HUB_FAQ_SLUGS = ['guest-wifi', 'guest-luggage', 'guest-checkout'] as const

type GetFaqsParams = {
  /** When omitted with allPublished, fetches every published FAQ. */
  context?: FaqContext
  locale: string
  category?: FaqCategory
  /**
   * Fetch all published FAQs (both contexts) for getFAQsForRoute.
   * Still the only Payload query path for FAQs — extends this helper rather
   * than adding a parallel find().
   */
  allPublished?: boolean
}

/** Fetch FAQs for a context (locale-aware), or all published when allPublished. */
export async function getFaqs({
  context,
  locale,
  category,
  allPublished = false,
}: GetFaqsParams): Promise<Faq[]> {
  const payload = await getPayloadClient()
  // Always require published: with overrideAccess (Local API), draft:false alone
  // still returns documents whose _status is draft.
  const and: Where[] = [{ _status: { equals: 'published' } }]
  if (!allPublished) {
    if (!context) {
      throw new Error('getFaqs: context is required unless allPublished is true')
    }
    and.push({ context: { equals: context } })
    if (category) {
      and.push({ category: { equals: category } })
    }
  }

  const { docs } = await payload.find({
    collection: 'faqs',
    locale: locale as 'de' | 'en',
    fallbackLocale: 'en',
    where: { and },
    sort: 'order',
    limit: 200,
    depth: 1,
    // drafts enabled on faqs (Part B Step 1) — public fetches publish only
    draft: false,
  })

  return docs as Faq[]
}
