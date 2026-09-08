import { describe, expect, it } from 'vitest'

import { rotateByDay } from '../../src/lib/here/getHubPeople'
import { PERSON_CARD_FIXTURES } from '../../src/lib/here/personCardFixtures'

describe('rotateByDay', () => {
  const faces = ['a', 'b', 'c', 'd', 'e']

  it('returns the same order for the same Berlin date key', () => {
    expect(rotateByDay(faces, '2026-09-08')).toEqual(rotateByDay(faces, '2026-09-08'))
  })

  it('changes the starting face across consecutive dates', () => {
    const monday = rotateByDay(faces, '2026-09-07')
    const tuesday = rotateByDay(faces, '2026-09-08')
    const wednesday = rotateByDay(faces, '2026-09-09')
    expect(new Set([monday[0], tuesday[0], wednesday[0]]).size).toBeGreaterThan(1)
  })

  it('keeps all items', () => {
    expect(rotateByDay(faces, '2026-09-08').sort()).toEqual([...faces].sort())
  })
})

describe('PersonCard fixtures', () => {
  it('keeps a room pill on hosts and omits it when the artist has no room', () => {
    const [host, artist] = PERSON_CARD_FIXTURES
    expect(host?.room).toBe('Room 1185')
    expect(host?.recs.length).toBeGreaterThan(0)
    expect(artist?.room).toBeNull()
  })
})


describe('rotateByDay', () => {
  const faces = ['a', 'b', 'c', 'd', 'e']

  it('returns the same order for the same Berlin date key', () => {
    expect(rotateByDay(faces, '2026-09-08')).toEqual(rotateByDay(faces, '2026-09-08'))
  })

  it('changes the starting face across consecutive dates', () => {
    const monday = rotateByDay(faces, '2026-09-07')
    const tuesday = rotateByDay(faces, '2026-09-08')
    const wednesday = rotateByDay(faces, '2026-09-09')
    expect(new Set([monday[0], tuesday[0], wednesday[0]]).size).toBeGreaterThan(1)
  })

  it('keeps all items', () => {
    expect(rotateByDay(faces, '2026-09-08').sort()).toEqual([...faces].sort())
  })
})
