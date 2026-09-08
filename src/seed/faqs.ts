/**
 * Upsert FAQs: prospect rows from data.ts, then the full guest A–Z.
 * Writes EN then DE so /de/hier and /de/hier/faq do not fall back to English.
 * Usage: npm run seed:faqs
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

import config from '../payload.config'
import { faqsSeed } from './data'
import { GUEST_AZ_FAQS, type GuestAzFaq } from './guest-az-faqs'
import type { Faq } from '@/payload-types'

type ProspectFaq = (typeof faqsSeed)[number]
type FaqWrite = Pick<Faq, 'slug' | 'question' | 'answer' | 'context' | 'category' | 'order'>

function prospectLocales(faq: ProspectFaq) {
  const { questionDE, answerDE, question, answer, ...rest } = faq
  return {
    en: { ...rest, question, answer },
    de: { question: questionDE, answer: answerDE },
  }
}

function guestLocales(faq: GuestAzFaq) {
  return {
    en: {
      slug: faq.slug,
      context: 'guest' as const,
      category: faq.category,
      order: faq.order,
      question: faq.en.question,
      answer: faq.en.answer,
    },
    de: { question: faq.de.question, answer: faq.de.answer },
  }
}

async function upsertFaq(
  payload: Payload,
  slug: string,
  en: FaqWrite,
  de: { question: string; answer: string },
) {
  const existing = await payload.find({
    collection: 'faqs',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  const id = existing.docs[0]
    ? (
        await payload.update({
          collection: 'faqs',
          id: existing.docs[0].id,
          data: en,
          locale: 'en',
          overrideAccess: true,
        })
      ).id
    : (
        await payload.create({
          collection: 'faqs',
          data: en,
          locale: 'en',
          overrideAccess: true,
        })
      ).id

  await payload.update({
    collection: 'faqs',
    id,
    data: de,
    locale: 'de',
    overrideAccess: true,
  })

  console.log(`✓ ${existing.docs[0] ? 'updated' : 'created'} ${slug}`)
}

export async function upsertFaqs(payload: Payload) {
  const prospect = faqsSeed.filter((faq) => faq.context === 'prospect')
  console.log(`--- Upserting ${prospect.length} prospect FAQs ---`)
  for (const faq of prospect) {
    const { en, de } = prospectLocales(faq)
    await upsertFaq(payload, faq.slug, en, de)
  }

  console.log(`--- Upserting ${GUEST_AZ_FAQS.length} guest A–Z FAQs ---`)
  for (const faq of GUEST_AZ_FAQS) {
    const { en, de } = guestLocales(faq)
    await upsertFaq(payload, faq.slug, en, de)
  }

  const keep = new Set(GUEST_AZ_FAQS.map((faq) => faq.slug))
  const leftovers = await payload.find({
    collection: 'faqs',
    where: { context: { equals: 'guest' } },
    limit: 200,
    depth: 0,
  })
  for (const doc of leftovers.docs) {
    if (keep.has(doc.slug)) continue
    await payload.delete({
      collection: 'faqs',
      id: doc.id,
      overrideAccess: true,
    })
    console.log(`✓ removed leftover ${doc.slug}`)
  }

  console.log('Done.')
}

async function seed() {
  const payload = await getPayload({ config })
  await upsertFaqs(payload)
  process.exit(0)
}

const isCli =
  process.argv[1]?.includes('seed/faqs.ts') || process.argv[1]?.includes('seed/faqs.js')

if (isCli) {
  seed().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
