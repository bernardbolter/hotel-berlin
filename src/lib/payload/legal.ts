import { getPayloadClient } from '@/lib/payload/client'
import { lexicalToBlocks } from '@/lib/legal/lexical'
import type { LegalDocument, LegalSlug } from '@/lib/legal/types'

export async function getLegalDocumentFromPayload(
  slug: LegalSlug,
  locale: 'de' | 'en',
): Promise<LegalDocument | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'legal-documents',
    where: { slug: { equals: slug } },
    locale,
    fallbackLocale: false,
    limit: 1,
    depth: 0,
  })

  const doc = docs[0]
  if (!doc) return null

  return {
    slug,
    locale,
    title: doc.title,
    updated: doc.updatedLabel || null,
    lede: doc.lede || null,
    blocks: lexicalToBlocks(doc.body),
  }
}
