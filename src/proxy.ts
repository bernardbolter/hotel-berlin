import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Match all pathnames except Payload admin/API, static files, and internals
    '/((?!api|admin|_next|_vercel|.*\\..*).*)',
  ],
}
