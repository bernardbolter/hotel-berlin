/**
 * Reseed must not clobber Step 3 merge survivors or republish absorbed slugs.
 * Uses the live local CMS (same as other FAQ int specs).
 */
import 'dotenv/config'
import { describe, expect, it } from 'vitest'

import { getPayloadClient } from '../../src/lib/payload/client'
import { loadFaqMergeSets } from '../../src/seed/faqMergeSets'
import { upsertFaqs } from '../../src/seed/faqs'

describe('FAQ seed merge guard (live CMS)', () => {
  it('does not overwrite survivors or republish absorbed on reseed', async () => {
    const { survivors, absorbed } = loadFaqMergeSets()
    expect(survivors.size).toBe(7)
    expect(absorbed.size).toBe(7)

    const payload = await getPayloadClient()

    const beforeBySlug = new Map<
      string,
      { answerEn: string; answerDe: string; status: string | null | undefined }
    >()

    for (const slug of survivors) {
      const en = await payload.find({
        collection: 'faqs',
        where: { slug: { equals: slug } },
        locale: 'en',
        limit: 1,
        depth: 0,
        overrideAccess: true,
        draft: true,
      })
      const de = await payload.find({
        collection: 'faqs',
        where: { slug: { equals: slug } },
        locale: 'de',
        limit: 1,
        depth: 0,
        overrideAccess: true,
        draft: true,
      })
      const doc = en.docs[0]
      expect(doc, `missing survivor ${slug}`).toBeTruthy()
      beforeBySlug.set(slug, {
        answerEn: doc!.answer ?? '',
        answerDe: de.docs[0]?.answer ?? '',
        status: doc!._status,
      })
    }

    for (const slug of absorbed) {
      const found = await payload.find({
        collection: 'faqs',
        where: { slug: { equals: slug } },
        locale: 'en',
        limit: 1,
        depth: 0,
        overrideAccess: true,
        draft: true,
      })
      const doc = found.docs[0]
      expect(doc, `missing absorbed ${slug}`).toBeTruthy()
      expect(doc!._status, `${slug} must be draft before reseed`).toBe('draft')
      beforeBySlug.set(slug, {
        answerEn: doc!.answer ?? '',
        answerDe: '',
        status: doc!._status,
      })
    }

    await upsertFaqs(payload)

    for (const slug of survivors) {
      const en = await payload.find({
        collection: 'faqs',
        where: { slug: { equals: slug } },
        locale: 'en',
        limit: 1,
        depth: 0,
        overrideAccess: true,
        draft: true,
      })
      const de = await payload.find({
        collection: 'faqs',
        where: { slug: { equals: slug } },
        locale: 'de',
        limit: 1,
        depth: 0,
        overrideAccess: true,
        draft: true,
      })
      const before = beforeBySlug.get(slug)!
      expect(en.docs[0]?.answer, `survivor ${slug} EN overwritten`).toBe(before.answerEn)
      expect(de.docs[0]?.answer, `survivor ${slug} DE overwritten`).toBe(before.answerDe)
      expect(en.docs[0]?._status).toBe(before.status)
    }

    for (const slug of absorbed) {
      const found = await payload.find({
        collection: 'faqs',
        where: { slug: { equals: slug } },
        locale: 'en',
        limit: 1,
        depth: 0,
        overrideAccess: true,
        draft: true,
      })
      expect(found.docs[0], `absorbed ${slug} deleted`).toBeTruthy()
      expect(found.docs[0]!._status, `absorbed ${slug} republished`).toBe('draft')
    }
  }, 120_000)
})
