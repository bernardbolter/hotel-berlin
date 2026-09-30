import type { Payload } from 'payload'

import { checkArtworkCompleteness, type ArtworkCompletenessInput } from './artworks'
import type { CompletenessResult } from './types'

export { checkArtworkCompleteness, canPublishArtwork } from './artworks'
export type { ArtworkCompletenessInput } from './artworks'
export { enforceArtworkCompletenessOnPublish } from './enforcePublish'
export {
  formatMissingList,
  issueMessages,
  partitionIssues,
  type CompletenessIssue,
  type CompletenessLocale,
  type CompletenessResult,
  type CompletenessSeverity,
} from './types'

export type CompletenessCollection = 'artworks'

/**
 * Collection dispatcher — guided entry, sidebar and dashboard call this,
 * not the per-collection helpers, so new collections plug in here once.
 */
export function checkCompleteness(
  collection: CompletenessCollection,
  doc: ArtworkCompletenessInput,
): CompletenessResult {
  switch (collection) {
    case 'artworks':
      return checkArtworkCompleteness(doc)
    default: {
      const _exhaustive: never = collection
      return _exhaustive
    }
  }
}

/**
 * Media uploaded in an abandoned guided flow (step 1 done, no artwork save)
 * are orphans. Needs-attention lists them; we do not try to prevent the upload.
 */
export async function findOrphanedArtworkMedia(
  payload: Payload,
  options: { limit?: number } = {},
): Promise<Array<{ id: number; filename: string | null; createdAt: string }>> {
  const limit = options.limit ?? 50

  const media = await payload.find({
    collection: 'media',
    limit: 500,
    depth: 0,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const artworks = await payload.find({
    collection: 'artworks',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  const used = new Set<number>()
  for (const work of artworks.docs) {
    for (const row of work.images ?? []) {
      const id = typeof row.image === 'number' ? row.image : row.image?.id
      if (typeof id === 'number') used.add(id)
    }
    const contextId =
      typeof work.contextImage === 'number' ? work.contextImage : work.contextImage?.id
    if (typeof contextId === 'number') used.add(contextId)
    for (const row of work.detailImages ?? []) {
      const id = typeof row.image === 'number' ? row.image : row.image?.id
      if (typeof id === 'number') used.add(id)
    }
  }

  return media.docs
    .filter((doc) => !used.has(doc.id))
    .slice(0, limit)
    .map((doc) => ({
      id: doc.id,
      filename: doc.filename ?? null,
      createdAt: doc.createdAt,
    }))
}
