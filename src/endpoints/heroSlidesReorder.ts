import type { Endpoint } from 'payload'

import { isStaffUser } from '@/access'
import {
  heroPathsForContext,
  isHeroSlideContext,
  type HeroSlideContext,
} from '@/lib/hero/slideContext'
import { revalidateCms } from '@/lib/payload/revalidate'

type ReorderBody = {
  context?: HeroSlideContext
  ids?: number[]
}

/**
 * POST /api/hero-slides/reorder
 * Body: { context, ids: number[] } — live (enabled) slide ids in new order.
 * Rewrites order = 1…n. Disabled slides keep their order and stay after live ones on next normalise.
 */
export const heroSlidesReorderEndpoint: Endpoint = {
  path: '/reorder',
  method: 'post',
  handler: async (req) => {
    if (!isStaffUser(req.user)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: ReorderBody
    try {
      body = (await req.json?.()) as ReorderBody
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const context = body.context
    const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter((n) => Number.isFinite(n)) : []
    if (!isHeroSlideContext(context)) {
      return Response.json({ error: 'Invalid context' }, { status: 400 })
    }
    if (ids.length === 0) {
      return Response.json({ error: 'ids required' }, { status: 400 })
    }

    const live = await req.payload.find({
      collection: 'hero-slides',
      where: {
        and: [{ context: { equals: context } }, { enabled: { equals: true } }],
      },
      limit: 200,
      depth: 0,
      overrideAccess: true,
      req,
    })

    const liveIds = new Set(live.docs.map((d) => d.id))
    if (liveIds.size !== ids.length || ids.some((id) => !liveIds.has(id))) {
      return Response.json(
        { error: 'ids must match enabled slides for this context exactly' },
        { status: 400 },
      )
    }

    // Transaction via sequential updates (Postgres adapter supports req.transactionID when present)
    for (let i = 0; i < ids.length; i++) {
      await req.payload.update({
        collection: 'hero-slides',
        id: ids[i]!,
        data: { order: i + 1 },
        depth: 0,
        overrideAccess: true,
        context: { disableRevalidate: true },
        req,
      })
    }

    await revalidateCms(req, ['hero-slides'], heroPathsForContext(context))

    return Response.json({
      ok: true,
      order: ids.map((id, i) => ({ id, order: i + 1 })),
    })
  },
}

export { heroPathsForContext } from '@/lib/hero/slideContext'

/**
 * Renumber all slides in a context: enabled first (by order, createdAt), then disabled.
 * Returns whether anything changed.
 */
export async function normaliseHeroSlideOrder(
  payload: Parameters<Endpoint['handler']>[0]['payload'],
  context: HeroSlideContext,
  req?: Parameters<Endpoint['handler']>[0],
): Promise<{ changed: boolean; orders: Array<{ id: number; order: number; enabled: boolean }> }> {
  const all = await payload.find({
    collection: 'hero-slides',
    where: { context: { equals: context } },
    limit: 200,
    depth: 0,
    sort: 'order',
    overrideAccess: true,
    req,
  })

  const enabled = all.docs
    .filter((d) => d.enabled !== false)
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return String(a.createdAt).localeCompare(String(b.createdAt))
    })
  const disabled = all.docs
    .filter((d) => d.enabled === false)
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return String(a.createdAt).localeCompare(String(b.createdAt))
    })

  const sequence = [...enabled, ...disabled]
  const orders = sequence.map((d, i) => ({
    id: d.id,
    order: i + 1,
    enabled: d.enabled !== false,
  }))

  const needs =
    orders.some((o, i) => {
      const doc = sequence[i]!
      return doc.order !== o.order
    }) || hasDuplicateOrGap(all.docs.map((d) => d.order))

  if (!needs) {
    return { changed: false, orders }
  }

  for (const row of orders) {
    await payload.update({
      collection: 'hero-slides',
      id: row.id,
      data: { order: row.order },
      depth: 0,
      overrideAccess: true,
      context: { disableRevalidate: true },
      req,
    })
  }

  if (req) {
    await revalidateCms(req, ['hero-slides'], heroPathsForContext(context))
  }

  return { changed: true, orders }
}

function hasDuplicateOrGap(orders: number[]): boolean {
  if (orders.length === 0) return false
  const sorted = [...orders].sort((a, b) => a - b)
  const unique = new Set(sorted)
  if (unique.size !== sorted.length) return true
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i + 1) return true
  }
  return false
}

/** POST /api/hero-slides/normalise-order — renumber 1…n for a context. */
export const heroSlidesNormaliseEndpoint: Endpoint = {
  path: '/normalise-order',
  method: 'post',
  handler: async (req) => {
    if (!isStaffUser(req.user)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    let body: { context?: HeroSlideContext }
    try {
      body = (await req.json?.()) as { context?: HeroSlideContext }
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    if (!isHeroSlideContext(body.context)) {
      return Response.json({ error: 'Invalid context' }, { status: 400 })
    }
    const result = await normaliseHeroSlideOrder(req.payload, body.context, req)
    return Response.json({ ok: true, ...result })
  },
}
