import type { Where } from 'payload'

import { getFaqs } from '@/lib/faqs'
import { getPayloadClient } from './client'

/** @deprecated Prefer `getFaqs` from `@/lib/faqs` */
export async function getFAQs(opts: {
  audience?: 'prospect' | 'guest' | 'both'
  category?: string
  locale?: string
} = {}) {
  if (opts.audience === 'both' || !opts.audience) {
    const payload = await getPayloadClient()
    const where: Where = {}
    if (opts.category) where.category = { equals: opts.category }
    const { docs } = await payload.find({
      collection: 'faqs',
      locale: (opts.locale as 'de' | 'en') ?? 'en',
      where: Object.keys(where).length > 0 ? where : undefined,
      sort: 'order',
      limit: 50,
    })
    return docs
  }

  return getFaqs({
    context: opts.audience,
    locale: opts.locale ?? 'en',
    category: opts.category as
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
      | undefined,
  })
}
