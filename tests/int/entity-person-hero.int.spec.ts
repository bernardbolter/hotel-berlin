import { describe, expect, it } from 'vitest'

import {
  firstName,
  personWalkHeading,
  resolveHeroQuote,
} from '../../src/lib/entity/personHero'
import type { NeighbourhoodPlace } from '../../src/payload-types'

describe('personWalkHeading (R2)', () => {
  it('forms German possessives without zu Fuß', () => {
    expect(personWalkHeading('Katja Morkel', 'de')).toBe('Katjas Orte')
    expect(personWalkHeading('Max Müller', 'de')).toBe('Orte von Max')
    expect(personWalkHeading('Franz X', 'de')).toBe('Orte von Franz')
  })

  it('forms English possessives', () => {
    expect(personWalkHeading('Katja Morkel', 'en')).toBe("Katja's places")
    expect(personWalkHeading('James Bond', 'en')).toBe("James' places")
  })
})

describe('resolveHeroQuote (R4)', () => {
  it('prefers the person quote', () => {
    const picks = [
      {
        slug: 'a',
        name: 'A',
        endorsements: [{ person: 1, quote: 'short tip' }],
      },
    ] as unknown as NeighbourhoodPlace[]
    expect(resolveHeroQuote('Own line.', 1, picks)).toEqual({
      text: 'Own line.',
      placeSlug: null,
      placeName: null,
    })
  })

  it('falls back to the longest endorsement quote', () => {
    const picks = [
      {
        slug: 'short',
        name: 'Short Place',
        endorsements: [{ person: 7, quote: 'Hi' }],
      },
      {
        slug: 'long',
        name: 'Long Place',
        endorsements: [{ person: 7, quote: 'A much longer recommendation sentence.' }],
      },
    ] as unknown as NeighbourhoodPlace[]
    expect(resolveHeroQuote(null, 7, picks)).toEqual({
      text: 'A much longer recommendation sentence.',
      placeSlug: 'long',
      placeName: 'Long Place',
    })
  })

  it('returns null when nothing is available', () => {
    expect(resolveHeroQuote('', 1, [])).toBeNull()
  })
})

describe('firstName', () => {
  it('takes the first token', () => {
    expect(firstName('Katja Morkel')).toBe('Katja')
  })
})
