import { describe, expect, it } from 'vitest'

import {
  canPublishArtwork,
  checkArtworkCompleteness,
  checkCompleteness,
  formatMissingList,
} from '../../src/lib/completeness'

const complete = {
  artist: 1,
  locationInBuilding: { floor: '4', spot: 'bei den Aufzügen' },
  images: [{ image: 10, alt: 'Mural an den Aufzügen' }],
  photoAlt: { de: 'Mural an den Aufzügen', en: 'Mural by the lifts' },
  permission: 'granted' as const,
}

describe('artwork completeness', () => {
  it('is complete when photo, artist, floor, spot, alt DE and permission are set', () => {
    const result = checkArtworkCompleteness(complete)
    expect(result.complete).toBe(true)
    expect(result.blocking).toEqual([])
    expect(result.warnings).toEqual([])
    expect(canPublishArtwork(complete)).toBe(true)
  })

  it('blocks publish when the photo is missing', () => {
    const result = checkArtworkCompleteness({ ...complete, images: [] })
    expect(result.complete).toBe(false)
    expect(result.blocking.map((i) => i.code)).toEqual(['artwork.photo'])
  })

  it('blocks when alt DE is missing, even if a photo exists', () => {
    const result = checkArtworkCompleteness({
      ...complete,
      images: [{ image: 10, alt: '' }],
      photoAlt: { de: '', en: 'Mural by the lifts' },
    })
    expect(result.blocking.map((i) => i.code)).toEqual(['artwork.altDe'])
  })

  it('warns when alt EN is missing but still allows publish', () => {
    const result = checkArtworkCompleteness({
      ...complete,
      photoAlt: { de: 'Mural an den Aufzügen', en: '' },
    })
    expect(result.complete).toBe(true)
    expect(result.warnings.map((i) => i.code)).toEqual(['artwork.altEn'])
  })

  it('treats the image row alt as DE when media locale alts are absent', () => {
    const result = checkArtworkCompleteness({
      ...complete,
      photoAlt: null,
      images: [{ image: 10, alt: 'Mural an den Aufzügen' }],
    })
    expect(result.complete).toBe(true)
    // No EN media alt → warning
    expect(result.warnings.map((i) => i.code)).toEqual(['artwork.altEn'])
  })

  it('blocks artist, floor and spot independently', () => {
    const result = checkArtworkCompleteness({
      artist: null,
      locationInBuilding: { floor: null, spot: '  ' },
      images: [{ image: 10, alt: 'x' }],
      photoAlt: { de: 'x', en: 'x' },
      permission: 'granted',
    })
    expect(result.blocking.map((i) => i.code).sort()).toEqual([
      'artwork.artist',
      'artwork.floor',
      'artwork.spot',
    ])
  })

  it('defaults permission to open and blocks publishing until granted', () => {
    const open = checkArtworkCompleteness({ ...complete, permission: undefined })
    expect(open.complete).toBe(false)
    expect(open.blocking.map((i) => i.code)).toEqual(['artwork.permission'])

    const denied = checkArtworkCompleteness({ ...complete, permission: 'denied' })
    expect(denied.blocking.map((i) => i.code)).toEqual(['artwork.permission'])
    expect(denied.blocking[0]?.message.de).toMatch(/abgelehnt/)
  })

  it('names every blocking gap in German for the publish toast', () => {
    const result = checkArtworkCompleteness({ images: [] })
    const line = formatMissingList(result.blocking, 'de')
    expect(line).toContain('Foto fehlt')
    expect(line).toContain('Künstler:in fehlt')
    expect(line).toContain('Ort im Haus fehlt')
    expect(line).toContain('Ort fehlt')
    expect(line).toContain('Foto-Freigabe')
  })

  it('routes artworks through the shared dispatcher', () => {
    expect(checkCompleteness('artworks', complete).complete).toBe(true)
  })
})
