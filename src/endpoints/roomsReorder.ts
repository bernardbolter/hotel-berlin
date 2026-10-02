import type { Endpoint } from 'payload'

import { isStaffUser } from '@/access'
import { revalidateCms } from '@/lib/payload/revalidate'

export const ROOMS_REVALIDATE_PATHS = [
  '/',
  '/de',
  '/en',
  '/rooms',
  '/de/zimmer',
  '/en/rooms',
]

type IdsBody = {
  ids?: number[]
}

async function parseIds(req: Parameters<Endpoint['handler']>[0]): Promise<
  { ok: true; ids: number[] } | { ok: false; response: Response }
> {
  if (!isStaffUser(req.user)) {
    return { ok: false, response: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  let body: IdsBody
  try {
    body = (await req.json?.()) as IdsBody
  } catch {
    return { ok: false, response: Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  }

  const ids = Array.isArray(body.ids)
    ? body.ids.map(Number).filter((n) => Number.isFinite(n))
    : []
  if (ids.length === 0) {
    return { ok: false, response: Response.json({ error: 'ids required' }, { status: 400 }) }
  }

  return { ok: true, ids }
}

async function assertAllRoomIdsExist(
  req: Parameters<Endpoint['handler']>[0],
  ids: number[],
): Promise<Response | null> {
  const unique = new Set(ids)
  if (unique.size !== ids.length) {
    return Response.json({ error: 'ids must be unique' }, { status: 400 })
  }

  const found = await req.payload.find({
    collection: 'rooms',
    where: { id: { in: ids } },
    limit: ids.length,
    depth: 0,
    overrideAccess: true,
    req,
  })

  if (found.docs.length !== ids.length) {
    return Response.json({ error: 'One or more room ids do not exist' }, { status: 400 })
  }

  return null
}

/**
 * POST /api/rooms/reorder-page
 * Body: { ids: number[] } — all rooms (or the subset being ordered) in new display order.
 * Writes displayOrder = 10, 20, 30…
 */
export const roomsReorderPageEndpoint: Endpoint = {
  path: '/reorder-page',
  method: 'post',
  handler: async (req) => {
    const parsed = await parseIds(req)
    if (!parsed.ok) return parsed.response

    const { ids } = parsed
    const missing = await assertAllRoomIdsExist(req, ids)
    if (missing) return missing

    const transactionID =
      typeof req.payload.db.beginTransaction === 'function'
        ? await req.payload.db.beginTransaction()
        : null
    if (transactionID) {
      ;(req as { transactionID?: string | number }).transactionID = transactionID
    }

    try {
      const order = ids.map((id, i) => ({ id, displayOrder: (i + 1) * 10 }))
      for (const row of order) {
        await req.payload.update({
          collection: 'rooms',
          id: row.id,
          data: { displayOrder: row.displayOrder },
          depth: 0,
          locale: 'en',
          overrideAccess: true,
          context: { disableRevalidate: true },
          req,
        })
      }

      if (transactionID && typeof req.payload.db.commitTransaction === 'function') {
        await req.payload.db.commitTransaction(transactionID)
      }

      await revalidateCms(req, ['rooms'], ROOMS_REVALIDATE_PATHS)

      return Response.json({ ok: true, order })
    } catch (error) {
      if (transactionID && typeof req.payload.db.rollbackTransaction === 'function') {
        await req.payload.db.rollbackTransaction(transactionID)
      }
      console.error('[rooms/reorder-page]', error)
      return Response.json({ error: 'Reorder failed' }, { status: 500 })
    }
  },
}

/**
 * POST /api/rooms/reorder-slider
 * Body: { ids: number[] } — rooms in homepage slider order (may be empty).
 * Sets homepageTeaser.enabled = true and order = 1…n for ids;
 * enabled = false for every other room. Does not touch images[].
 */
export const roomsReorderSliderEndpoint: Endpoint = {
  path: '/reorder-slider',
  method: 'post',
  handler: async (req) => {
    if (!isStaffUser(req.user)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: IdsBody
    try {
      body = (await req.json?.()) as IdsBody
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const ids = Array.isArray(body.ids)
      ? body.ids.map(Number).filter((n) => Number.isFinite(n))
      : []

    if (ids.length > 0) {
      const missing = await assertAllRoomIdsExist(req, ids)
      if (missing) return missing
    }

    const all = await req.payload.find({
      collection: 'rooms',
      limit: 100,
      depth: 0,
      overrideAccess: true,
      req,
    })

    const selected = new Set(ids)
    const transactionID =
      typeof req.payload.db.beginTransaction === 'function'
        ? await req.payload.db.beginTransaction()
        : null
    if (transactionID) {
      ;(req as { transactionID?: string | number }).transactionID = transactionID
    }

    try {
      const order = ids.map((id, i) => ({ id, order: i + 1, enabled: true as const }))

      for (const row of order) {
        const doc = all.docs.find((d) => d.id === row.id)
        await req.payload.update({
          collection: 'rooms',
          id: row.id,
          data: {
            homepageTeaser: {
              ...(typeof doc?.homepageTeaser === 'object' && doc.homepageTeaser
                ? doc.homepageTeaser
                : {}),
              enabled: true,
              order: row.order,
            },
          },
          depth: 0,
          locale: 'en',
          overrideAccess: true,
          context: { disableRevalidate: true },
          req,
        })
      }

      for (const doc of all.docs) {
        if (selected.has(doc.id)) continue
        await req.payload.update({
          collection: 'rooms',
          id: doc.id,
          data: {
            homepageTeaser: {
              ...(typeof doc.homepageTeaser === 'object' && doc.homepageTeaser
                ? doc.homepageTeaser
                : {}),
              enabled: false,
            },
          },
          depth: 0,
          locale: 'en',
          overrideAccess: true,
          context: { disableRevalidate: true },
          req,
        })
      }

      if (transactionID && typeof req.payload.db.commitTransaction === 'function') {
        await req.payload.db.commitTransaction(transactionID)
      }

      await revalidateCms(req, ['rooms'], ROOMS_REVALIDATE_PATHS)

      return Response.json({ ok: true, order })
    } catch (error) {
      if (transactionID && typeof req.payload.db.rollbackTransaction === 'function') {
        await req.payload.db.rollbackTransaction(transactionID)
      }
      console.error('[rooms/reorder-slider]', error)
      return Response.json({ error: 'Reorder failed' }, { status: 500 })
    }
  },
}
