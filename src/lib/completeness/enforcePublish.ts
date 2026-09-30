import { APIError, type CollectionBeforeChangeHook } from 'payload'

import {
  checkArtworkCompleteness,
  formatMissingList,
  type ArtworkCompletenessInput,
} from '@/lib/completeness'

async function resolvePhotoAlt(
  req: Parameters<CollectionBeforeChangeHook>[0]['req'],
  imageRef: number | { id?: number | null } | null | undefined,
): Promise<{ de?: string | null; en?: string | null } | null> {
  const id = typeof imageRef === 'number' ? imageRef : imageRef?.id
  if (typeof id !== 'number') return null
  try {
    const [deDoc, enDoc] = await Promise.all([
      req.payload.findByID({
        collection: 'media',
        id,
        locale: 'de',
        depth: 0,
        overrideAccess: true,
        req,
      }),
      req.payload.findByID({
        collection: 'media',
        id,
        locale: 'en',
        depth: 0,
        overrideAccess: true,
        req,
      }),
    ])
    return { de: deDoc.alt ?? null, en: enDoc.alt ?? null }
  } catch {
    return null
  }
}

/**
 * Going live (`visibility: live`) requires the shared completeness rules.
 * Hidden / draft saves are always allowed so the guided flow can stash work.
 */
export const enforceArtworkCompletenessOnPublish: CollectionBeforeChangeHook = async ({
  data,
  req,
}) => {
  if (data?.visibility !== 'live') return data

  const images = (data.images ?? []) as ArtworkCompletenessInput['images']
  const lead = images?.find((row) => row != null)
  const photoAlt = await resolvePhotoAlt(req, lead?.image ?? null)

  const result = checkArtworkCompleteness({
    artist: data.artist as ArtworkCompletenessInput['artist'],
    locationInBuilding: data.locationInBuilding as ArtworkCompletenessInput['locationInBuilding'],
    images,
    photoAlt,
    permission: data.permission as ArtworkCompletenessInput['permission'],
  })

  if (!result.complete) {
    throw new APIError(
      `Noch nicht vollständig: ${formatMissingList(result.blocking, 'de')}`,
      400,
      { completeness: result.blocking.map((i) => i.code) },
    )
  }

  return data
}
