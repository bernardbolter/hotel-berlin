import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import { getResolvedPerson, getResolvedPlace } from '@/lib/aeo/resolve'
import { getEventBySlug } from '@/lib/payload/events'
import { getMeetingRoomBySlug } from '@/lib/payload/meetingRooms'
import { getRoomBySlug } from '@/lib/payload/rooms'

/**
 * Draft / unpublished / unknown entity slugs must resolve to null so the
 * route can notFound() (404) instead of the DYNAMIC_SERVER_USAGE 500.
 */
describe('entity draft and unknown slugs → not found', () => {
  let payload: Payload
  const stamp = Date.now()
  const draftPersonSlug = `f3-draft-person-${stamp}`
  const inactivePlaceSlug = `f3-inactive-place-${stamp}`
  let draftPersonId: number | null = null
  let inactivePlaceId: number | null = null

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    const person = await payload.create({
      collection: 'people',
      data: {
        name: 'F3 Draft Person',
        slug: draftPersonSlug,
        type: 'local',
        status: 'draft',
      },
      overrideAccess: true,
    })
    draftPersonId = person.id

    const place = await payload.create({
      collection: 'neighbourhood-places',
      data: {
        name: 'F3 Inactive Place',
        slug: inactivePlaceSlug,
        category: 'Museum',
        schemaType: 'Museum',
        description: 'Test inactive place for F3 draft 404.',
        status: 'inactive',
        address: {
          addressLocality: 'Berlin',
        },
        geo: { latitude: 52.5, longitude: 13.3 },
      },
      overrideAccess: true,
    })
    inactivePlaceId = place.id
  })

  afterAll(async () => {
    if (draftPersonId != null) {
      await payload.delete({ collection: 'people', id: draftPersonId, overrideAccess: true }).catch(() => {})
    }
    if (inactivePlaceId != null) {
      await payload
        .delete({ collection: 'neighbourhood-places', id: inactivePlaceId, overrideAccess: true })
        .catch(() => {})
    }
  })

  it('person: draft slug resolves to null', async () => {
    expect(await getResolvedPerson(draftPersonSlug, 'de')).toBeNull()
  })

  it('person: unknown slug resolves to null', async () => {
    expect(await getResolvedPerson(`no-such-person-${stamp}`, 'de')).toBeNull()
  })

  it('place: inactive slug resolves to null', async () => {
    expect(await getResolvedPlace(inactivePlaceSlug, 'de')).toBeNull()
  })

  it('place: unknown slug resolves to null', async () => {
    expect(await getResolvedPlace(`no-such-place-${stamp}`, 'de')).toBeNull()
  })

  it('event: unknown slug resolves to null', async () => {
    expect(await getEventBySlug(`no-such-event-${stamp}`, 'de')).toBeNull()
  })

  it('room: unknown slug resolves to null', async () => {
    expect(await getRoomBySlug(`no-such-room-${stamp}`, 'de')).toBeNull()
  })

  it('meeting room: unknown slug resolves to null', async () => {
    expect(await getMeetingRoomBySlug(`no-such-meeting-${stamp}`, 'de')).toBeNull()
  })
})
