import { APIError, type CollectionBeforeChangeHook } from 'payload'

import {
  checkHeroSlideCompleteness,
  formatMissingList,
  type HeroSlideCompletenessInput,
} from '@/lib/completeness'

async function readLocales(
  req: Parameters<CollectionBeforeChangeHook>[0]['req'],
  id: number | undefined,
  field: 'altText' | 'captionOverride' | 'description' | 'keywords',
  incoming: string | null | undefined,
): Promise<{ de: string; en: string }> {
  const loc = req.locale === 'en' ? 'en' : 'de'
  let de = ''
  let en = ''
  if (id != null) {
    try {
      const [deDoc, enDoc] = await Promise.all([
        req.payload.findByID({
          collection: 'hero-slides',
          id,
          locale: 'de',
          depth: 0,
          overrideAccess: true,
          req,
        }),
        req.payload.findByID({
          collection: 'hero-slides',
          id,
          locale: 'en',
          depth: 0,
          overrideAccess: true,
          req,
        }),
      ])
      de = String((deDoc as unknown as Record<string, unknown>)[field] ?? '').trim()
      en = String((enDoc as unknown as Record<string, unknown>)[field] ?? '').trim()
    } catch {
      // create path / missing doc
    }
  }
  if (incoming?.trim()) {
    if (loc === 'en') en = incoming.trim()
    else de = incoming.trim()
  }
  return { de, en }
}

/**
 * Enabling a slide (`enabled: true`) requires blocking completeness.
 * Disabled slides can be saved incomplete.
 */
export const enforceHeroSlideCompletenessOnEnable: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  operation,
}) => {
  const nextEnabled =
    data?.enabled === true ||
    (data?.enabled == null && operation === 'create') ||
    (data?.enabled == null && originalDoc?.enabled !== false)

  // Only refuse when the saved document would be enabled
  if (data?.enabled === false) return data
  if (!nextEnabled) return data
  // Creating with default enabled:true also gates
  if (operation === 'create' && data?.enabled === false) return data

  const id = originalDoc?.id as number | undefined
  const input: HeroSlideCompletenessInput = {
    image: (data?.image ?? originalDoc?.image) as HeroSlideCompletenessInput['image'],
    altTextLocales: await readLocales(
      req,
      id,
      'altText',
      typeof data?.altText === 'string' ? data.altText : null,
    ),
    venue: (data?.venue ?? originalDoc?.venue) as HeroSlideCompletenessInput['venue'],
    captionOverrideLocales: await readLocales(
      req,
      id,
      'captionOverride',
      typeof data?.captionOverride === 'string' ? data.captionOverride : null,
    ),
    credit:
      typeof data?.credit === 'string'
        ? data.credit
        : typeof originalDoc?.credit === 'string'
          ? originalDoc.credit
          : null,
    descriptionLocales: await readLocales(
      req,
      id,
      'description',
      typeof data?.description === 'string' ? data.description : null,
    ),
    keywordsLocales: await readLocales(
      req,
      id,
      'keywords',
      typeof data?.keywords === 'string' ? data.keywords : null,
    ),
  }

  const result = checkHeroSlideCompleteness(input)
  if (!result.complete) {
    throw new APIError(
      `Noch nicht vollständig: ${formatMissingList(result.blocking, 'de')}`,
      400,
      { completeness: result.blocking.map((i) => i.code) },
    )
  }

  return data
}
