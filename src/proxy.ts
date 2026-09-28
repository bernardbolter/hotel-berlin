import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'
import { isBasicAuthorized, isSoftLaunch } from './lib/launch/softLaunch'

const intlMiddleware = createMiddleware(routing)

const skipIntl = /^\/(api|admin)(\/|$)/

export default function proxy(request: NextRequest) {
  if (isSoftLaunch() && !isBasicAuthorized(request.headers.get('authorization'))) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Hotel Berlin soft launch", charset="UTF-8"',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }

  const response = skipIntl.test(request.nextUrl.pathname)
    ? NextResponse.next()
    : intlMiddleware(request)

  if (isSoftLaunch()) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return response
}

export const config = {
  matcher: [
    // Soft-launch basic auth also covers /admin and /api. Static files and
    // /robots.txt (dot in the name) stay outside so crawlers can read Disallow.
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
}
