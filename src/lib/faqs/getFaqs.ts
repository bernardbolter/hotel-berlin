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
  'wifi-tech',
  'guest-services',
  'neighbourhood-guest',
  'general',
]

type GetFaqsParams = {
  context: FaqContext
  locale: string
  category?: FaqCategory
}

/** Fetch FAQs for a context (locale-aware). */
export async function getFaqs({ context, locale, category }: GetFaqsParams): Promise<Faq[]> {
  const payload = await getPayloadClient()
  const and: Where[] = [{ context: { equals: context } }]
  if (category) {
    and.push({ category: { equals: category } })
  }

  const { docs } = await payload.find({
    collection: 'faqs',
    locale: locale as 'de' | 'en',
    where: { and },
    sort: 'order',
    limit: 200,
    depth: 1,
  })

  return docs as Faq[]
}
