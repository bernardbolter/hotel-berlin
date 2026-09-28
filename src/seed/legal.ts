/**
 * Upsert the five legal pages (EN then DE) from the scraped live-site JSON.
 * Usage: npm run seed:legal
 *        npm run seed:legal -- --force
 */
import 'dotenv/config'
import './guard'

import { getPayload } from 'payload'
import type { Payload } from 'payload'

import { LEGAL_SLUGS, getLegalDocumentFallback } from '@/lib/legal/documents'
import { blocksToLexical } from '@/lib/legal/lexical'
import type { LegalSlug } from '@/lib/legal/types'
import config from '../payload.config'

const forceFromArgv =
  process.argv.includes('--force') || process.env.LEGAL_SEED_FORCE === '1'

export async function upsertLegalDocuments(payload: Payload, force = false) {
  for (const slug of LEGAL_SLUGS) {
    const en = getLegalDocumentFallback(slug, 'en')
    const de = getLegalDocumentFallback(slug, 'de')

    const existing = await payload.find({
      collection: 'legal-documents',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      locale: 'en',
    })

    const dataEn = {
      slug: slug as LegalSlug,
      title: en.title,
      updatedLabel: en.updated || null,
      lede: slug === 'terms' ? null : en.lede || null,
      body: blocksToLexical(en.blocks),
    }

    const dataDe = {
      title: de.title,
      updatedLabel: de.updated || null,
      lede: slug === 'terms' ? null : de.lede || null,
      body: blocksToLexical(de.blocks),
    }

    if (existing.docs[0] && !force) {
      console.log(`  skip ${slug} (exists, pass --force to overwrite)`)
      continue
    }

    const id = existing.docs[0]
      ? (
          await payload.update({
            collection: 'legal-documents',
            id: existing.docs[0].id,
            data: dataEn,
            locale: 'en',
            overrideAccess: true,
            context: { disableRevalidate: true },
          })
        ).id
      : (
          await payload.create({
            collection: 'legal-documents',
            data: dataEn,
            locale: 'en',
            overrideAccess: true,
            context: { disableRevalidate: true },
          })
        ).id

    await payload.update({
      collection: 'legal-documents',
      id,
      data: dataDe,
      locale: 'de',
      overrideAccess: true,
      context: { disableRevalidate: true },
    })

    console.log(`  ${existing.docs[0] ? 'updated' : 'created'} ${slug}`)
  }
}

async function seed() {
  const payload = await getPayload({ config })
  await upsertLegalDocuments(payload, forceFromArgv)
  console.log('Legal pages seed complete.')
  process.exit(0)
}

const isCli =
  process.argv[1]?.includes('seed/legal.ts') || process.argv[1]?.includes('seed/legal.js')

if (isCli) {
  seed().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
