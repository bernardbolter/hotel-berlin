import type { MetadataRoute } from 'next'

import { isSoftLaunch } from '@/lib/launch/softLaunch'

export default function robots(): MetadataRoute.Robots {
  if (isSoftLaunch()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
  }
}
