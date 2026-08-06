/**
 * Upsert placeholder FAQs for the brief schema (context / category / order / slug).
 * Usage: npm run seed:faqs
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'
import { faqsSeed } from './data'

async function seed() {
  const payload = await getPayload({ config })

  console.log(`--- Upserting ${faqsSeed.length} FAQs ---`)
  for (const faq of faqsSeed) {
    const existing = await payload.find({
      collection: 'faqs',
      where: { slug: { equals: faq.slug } },
      limit: 1,
      depth: 0,
    })

    const data = {
      question: faq.question,
      answer: faq.answer,
      context: faq.context,
      category: faq.category,
      order: faq.order,
      slug: faq.slug,
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'faqs',
        id: existing.docs[0].id,
        data,
        locale: 'en',
        overrideAccess: true,
      })
      console.log(`✓ updated ${faq.slug}`)
    } else {
      await payload.create({
        collection: 'faqs',
        data,
        locale: 'en',
        overrideAccess: true,
      })
      console.log(`✓ created ${faq.slug}`)
    }
  }

  console.log('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
