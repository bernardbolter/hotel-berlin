import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../payload.config'
import { footerAwardDefs, footerSeedDe, footerSeedEn } from './data/footer'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const awardsDir = path.resolve(dirname, 'assets/awards')

const force =
  process.argv.includes('--force') || process.env.FOOTER_SEED_FORCE === '1'
const awardsOnly =
  process.argv.includes('--awards') || process.env.FOOTER_SEED_AWARDS === '1'
const bottomOnly =
  process.argv.includes('--bottom') || process.env.FOOTER_SEED_BOTTOM === '1'

async function findMediaByFilename(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filename: string,
) {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  })
  return existing.docs[0] ?? null
}

async function ensureAwardMedia(payload: Awaited<ReturnType<typeof getPayload>>) {
  const mediaIds: number[] = []

  for (const award of footerAwardDefs) {
    let media = await findMediaByFilename(payload, award.filename)
    if (!media) {
      const filePath = path.join(awardsDir, award.filename)
      media = await payload.create({
        collection: 'media',
        data: { alt: award.altEn },
        filePath,
      })
      console.log(`  Uploaded media: ${award.filename}`)
    } else {
      console.log(`  Reusing media: ${award.filename}`)
    }
    mediaIds.push(media.id as number)
  }

  return mediaIds
}

async function main() {
  const payload = await getPayload({ config })
  const existing = await payload.findGlobal({ slug: 'footer' })
  const hasColumns = Boolean(existing.columns && existing.columns.length > 0)
  const hasAwards = Boolean(existing.awards && existing.awards.length > 0)

  const mediaIds = await ensureAwardMedia(payload)
  const awardsEn = footerAwardDefs.map((award, index) => ({
    visible: award.visible,
    image: mediaIds[index],
    altText: award.altEn,
    linkUrl: award.linkUrl,
  }))
  const awardsDe = footerAwardDefs.map((award, index) => ({
    visible: award.visible,
    image: mediaIds[index],
    altText: award.altDe,
    linkUrl: award.linkUrl,
  }))

  if (awardsOnly) {
    await payload.updateGlobal({
      slug: 'footer',
      data: { awards: awardsEn, awardsHeading: footerSeedEn.awardsHeading },
      locale: 'en',
    })
    await payload.updateGlobal({
      slug: 'footer',
      data: { awards: awardsDe, awardsHeading: footerSeedDe.awardsHeading },
      locale: 'de',
    })
    console.log(`Footer awards seeded (${awardsEn.length} logos).`)
    process.exit(0)
  }

  if (bottomOnly) {
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        partnerLinks: footerSeedEn.partnerLinks,
        legalLinks: footerSeedEn.legalLinks,
        copyrightEntity: footerSeedEn.copyrightEntity,
      },
      locale: 'en',
    })
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        partnerLinks: footerSeedDe.partnerLinks,
        legalLinks: footerSeedDe.legalLinks,
        copyrightEntity: footerSeedDe.copyrightEntity,
      },
      locale: 'de',
    })
    console.log(
      `Footer bottom bars seeded (${footerSeedEn.partnerLinks.length} partners, ${footerSeedEn.legalLinks.length} legal links).`,
    )
    process.exit(0)
  }

  if (hasColumns && !force) {
    const hasLegal = Boolean(existing.legalLinks && existing.legalLinks.length > 0)
    const patch: Record<string, unknown> = {}
    const patchDe: Record<string, unknown> = {}

    if (!hasAwards) {
      patch.awards = awardsEn
      patch.awardsHeading = footerSeedEn.awardsHeading
      patchDe.awards = awardsDe
      patchDe.awardsHeading = footerSeedDe.awardsHeading
    }
    if (!hasLegal) {
      patch.partnerLinks = footerSeedEn.partnerLinks
      patch.legalLinks = footerSeedEn.legalLinks
      patchDe.partnerLinks = footerSeedDe.partnerLinks
      patchDe.legalLinks = footerSeedDe.legalLinks
    }

    if (Object.keys(patch).length > 0) {
      await payload.updateGlobal({ slug: 'footer', data: patch, locale: 'en' })
      await payload.updateGlobal({ slug: 'footer', data: patchDe, locale: 'de' })
      console.log('Footer already seeded — patched missing awards/legal/partner links.')
    } else {
      console.log(
        `Footer already seeded — columns: ${existing.columns?.length}, awards: ${existing.awards?.length}. Use --force, --awards, or --bottom to overwrite.`,
      )
    }
    process.exit(0)
  }

  await payload.updateGlobal({
    slug: 'footer',
    data: { ...footerSeedEn, awards: awardsEn },
    locale: 'en',
  })
  await payload.updateGlobal({
    slug: 'footer',
    data: { ...footerSeedDe, awards: awardsDe },
    locale: 'de',
  })
  console.log(`Footer seeded (en + de) with ${awardsEn.length} award logos.`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
