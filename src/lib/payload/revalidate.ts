import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  GlobalAfterChangeHook,
  GlobalConfig,
} from 'payload'

export const CMS_CACHE_TAG = 'cms'

type RevalidateReq = { context?: { disableRevalidate?: unknown } }

/**
 * Invalidate the site after a Payload write. `revalidatePath('/', 'layout')`
 * covers today's fully dynamic tree; tags are for ISR (checklist 2.19).
 * No-ops in seed / Payload CLI where `next/cache` is unavailable.
 */
export async function revalidateCms(
  req?: RevalidateReq,
  extraTags: string[] = [],
  extraPaths: string[] = [],
): Promise<void> {
  if (req?.context?.disableRevalidate) return

  try {
    const { revalidatePath, revalidateTag } = await import('next/cache')
    revalidatePath('/', 'layout')
    for (const path of extraPaths) {
      revalidatePath(path)
    }
    revalidateTag(CMS_CACHE_TAG, 'max')
    for (const tag of extraTags) {
      revalidateTag(tag, 'max')
    }
  } catch {
    // Seed scripts and non-Next contexts have no cache
  }
}

export function collectionCacheHooks(tag: string): { hooks: NonNullable<CollectionConfig['hooks']> } {
  const afterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
    await revalidateCms(req, [tag])
    return doc
  }
  const afterDelete: CollectionAfterDeleteHook = async ({ req }) => {
    await revalidateCms(req, [tag])
  }
  return {
    hooks: {
      afterChange: [afterChange],
      afterDelete: [afterDelete],
    },
  }
}

export function globalCacheHooks(tag: string): { hooks: NonNullable<GlobalConfig['hooks']> } {
  const afterChange: GlobalAfterChangeHook = async ({ req }) => {
    await revalidateCms(req, [tag])
  }
  return {
    hooks: {
      afterChange: [afterChange],
    },
  }
}
