import { describe, expect, it } from 'vitest'

import { mediaSizedUrl } from '@/lib/media/url'

describe('mediaSizedUrl', () => {
  it('falls back to the original URL when the named size is missing', () => {
    const original = '/api/media/file/f3-700px-card-fallback.jpg'
    const image = {
      url: original,
      sizes: {
        // withoutEnlargement: source 700px < card 864 → no card derivative
        card: { url: null },
        thumb: { url: '/api/media/file/f3-700px-card-fallback-300x300.webp' },
      },
    }

    expect(mediaSizedUrl(image, 'card')).toBe(original)
  })

  it('falls back when the size entry is absent entirely', () => {
    const original = '/api/media/file/narrow-original.jpg'
    expect(mediaSizedUrl({ url: original, sizes: {} }, 'card')).toBe(original)
  })

  it('prefers the named size when present', () => {
    expect(
      mediaSizedUrl(
        {
          url: '/api/media/file/wide.jpg',
          sizes: { card: { url: '/api/media/file/wide-864.webp' } },
        },
        'card',
      ),
    ).toBe('/api/media/file/wide-864.webp')
  })
})
