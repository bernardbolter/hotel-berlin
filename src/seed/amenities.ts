/**
 * Upsert Im Haus amenities from the current i18n copy.
 * Usage: npm run seed:amenities
 *        npm run seed:amenities -- --force
 */
import 'dotenv/config'
import './guard'

import { getPayload } from 'payload'
import type { Payload } from 'payload'
import { generateNKeysBetween } from 'payload/shared'

import config from '../payload.config'
import { amenitiesSeed } from './data/amenities'
import { plainRichText } from './richText'

const forceFromArgv =
  process.argv.includes('--force') || process.env.AMENITIES_SEED_FORCE === '1'

async function faqIdsBySlug(payload: Payload, slugs: string[]): Promise<number[]> {
  if (slugs.length === 0) return []
  const { docs } = await payload.find({
    collection: 'faqs',
    where: { slug: { in: slugs } },
    limit: slugs.length,
    depth: 0,
  })
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc.id as number]))
  return slugs.map((slug) => bySlug.get(slug)).filter((id): id is number => id != null)
}

export async function upsertAmenities(payload: Payload, force = false) {
  const keys = generateNKeysBetween(null, null, amenitiesSeed.length)

  for (const [index, row] of amenitiesSeed.entries()) {
    const existing = await payload.find({
      collection: 'amenities',
      where: { slug: { equals: row.slug } },
      limit: 1,
      depth: 0,
      locale: 'en',
    })

    const relatedFaqs = await faqIdsBySlug(payload, row.relatedFaqSlugs ?? [])

    const dataEn = {
      slug: row.slug,
      title: row.title.en,
      location: row.location.en,
      lucideIcon: row.lucideIcon,
      href: row.href ?? null,
      pending: Boolean(row.pending),
      hidden: false,
      includeInSchema: row.includeInSchema !== false,
      showInHub: row.showInHub !== false,
      kind: row.kind ?? 'facility',
      schemaType: row.schemaType ?? 'none',
      hoursOverride: row.hoursOverride?.en ?? null,
      price: row.price?.en ?? null,
      what: row.what?.en ?? null,
      summary: row.summary.en,
      access: row.access?.en ?? null,
      details: row.details?.en ? plainRichText(row.details.en) : null,
      subline: row.subline.en,
      openingHours: row.openingHours ?? [],
      relatedFaqs,
      _order: keys[index],
    }

    const dataDe = {
      title: row.title.de,
      location: row.location.de,
      hoursOverride: row.hoursOverride?.de ?? null,
      price: row.price?.de ?? null,
      what: row.what?.de ?? null,
      summary: row.summary.de,
      access: row.access?.de ?? null,
      details: row.details?.de ? plainRichText(row.details.de) : null,
      subline: row.subline.de,
    }

    if (existing.docs[0] && !force) {
      console.log(`  skip ${row.slug} (exists, pass --force to overwrite)`)
      continue
    }

    const id = existing.docs[0]
      ? (
          await payload.update({
            collection: 'amenities',
            id: existing.docs[0].id,
            data: dataEn,
            locale: 'en',
            overrideAccess: true,
            context: { disableRevalidate: true },
          })
        ).id
      : (
          await payload.create({
            collection: 'amenities',
            data: dataEn,
            locale: 'en',
            overrideAccess: true,
            context: { disableRevalidate: true },
          })
        ).id

    await payload.update({
      collection: 'amenities',
      id,
      data: dataDe,
      locale: 'de',
      overrideAccess: true,
      context: { disableRevalidate: true },
    })

    console.log(`  ${existing.docs[0] ? 'updated' : 'created'} ${row.slug}`)
  }
}

async function main() {
  const payload = await getPayload({ config })
  console.log('Seeding amenities...')
  await upsertAmenities(payload, forceFromArgv)
  console.log('Done.')
  process.exit(0)
}

const isCli =
  process.argv[1]?.includes('seed/amenities.ts') ||
  process.argv[1]?.includes('seed/amenities.js')

if (isCli) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
