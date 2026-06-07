import type { Where } from 'payload'

import { getPayloadClient } from './client'

type FAQQuery = {
  audience?: 'prospect' | 'guest' | 'both'
  category?: string
}

export async function getFAQs({ audience, category }: FAQQuery = {}) {
  const payload = await getPayloadClient()
  const where: Where = {}

  if (audience) {
    where.audience = { in: [audience, 'both'] }
  }

  if (category) {
    where.category = { equals: category }
  }

  const { docs } = await payload.find({
    collection: 'faqs',
    where: Object.keys(where).length > 0 ? where : undefined,
    sort: 'priority',
    limit: 50,
  })

  return docs
}
