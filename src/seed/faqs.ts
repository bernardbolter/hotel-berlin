/**
 * Upsert FAQs: prospect rows from data.ts, then the full guest A–Z.
 * Writes EN then DE so /de/hier and /de/hier/faq do not fall back to English.
 * Usage: npm run seed:faqs
 *
 * Step 3 merge guard: never overwrite merge survivors with pre-merge seed text,
 * and never recreate absorbed slugs as published (skip create/update for them).
 */
import 'dotenv/config'
import './guard'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

import config from '../payload.config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { faqsSeed } from './data'
import { loadFaqMergeSets } from './faqMergeSets'
import { GUEST_AZ_FAQS, type GuestAzFaq } from './guest-az-faqs'
import type { Faq } from '@/payload-types'

function loadStep3DraftSlugs(): Set<string> {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const file = path.join(root, 'doc/faqs/faq-new-drafts.json')
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as { records: Array<{ slug: string }> }
  return new Set(raw.records.map((r) => r.slug))
}

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
  opts: { survivors: Set<string>; absorbed: Set<string> },
) {
  if (opts.absorbed.has(slug)) {
    console.log(`⊘ skip absorbed ${slug} (Step 3 merge — do not republish)`)
    return
  }

  const existing = await payload.find({
    collection: 'faqs',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0] && opts.survivors.has(slug)) {
    console.log(`⊘ skip survivor ${slug} (keep post-merge Q/A)`)
    return
  }

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
          data: { ...en, _status: 'published' },
          locale: 'en',
          overrideAccess: true,
          draft: false,
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
  const { survivors, absorbed } = loadFaqMergeSets()
  const prospect = faqsSeed.filter((faq) => faq.context === 'prospect')
  console.log(`--- Upserting ${prospect.length} prospect FAQs ---`)
  for (const faq of prospect) {
    const { en, de } = prospectLocales(faq)
    await upsertFaq(payload, faq.slug, en, de, { survivors, absorbed })
  }

  console.log(`--- Upserting ${GUEST_AZ_FAQS.length} guest A–Z FAQs ---`)
  for (const faq of GUEST_AZ_FAQS) {
    const { en, de } = guestLocales(faq)
    await upsertFaq(payload, faq.slug, en, de, { survivors, absorbed })
  }

  // Keep guest A–Z + absorbed merge drafts + Step 3 new drafts.
  const draftSlugs = loadStep3DraftSlugs()
  const keep = new Set([
    ...GUEST_AZ_FAQS.map((faq) => faq.slug),
    ...absorbed,
    ...survivors,
    ...draftSlugs,
  ])
  const leftovers = await payload.find({
    collection: 'faqs',
    where: { context: { equals: 'guest' } },
    limit: 200,
    depth: 0,
    overrideAccess: true,
    draft: true,
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
