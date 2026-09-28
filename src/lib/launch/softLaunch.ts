import type { Metadata } from 'next'

/** One env switch for soft launch: basic auth, robots disallow, noindex. */
export function isSoftLaunch(): boolean {
  return process.env.SOFT_LAUNCH === 'true'
}

export function isBasicAuthorized(authorization: string | null | undefined): boolean {
  const user = process.env.BASIC_AUTH_USER
  const password = process.env.BASIC_AUTH_PASSWORD
  if (!user || !password) return false

  const parsed = parseBasicAuth(authorization)
  if (!parsed) return false

  return safeEqual(parsed.user, user) && safeEqual(parsed.password, password)
}

export function parseBasicAuth(
  authorization: string | null | undefined,
): { user: string; password: string } | null {
  if (!authorization?.startsWith('Basic ')) return null
  try {
    const decoded = atob(authorization.slice(6))
    const colon = decoded.indexOf(':')
    if (colon === -1) return null
    return { user: decoded.slice(0, colon), password: decoded.slice(colon + 1) }
  } catch {
    return null
  }
}

export function softLaunchMetadata(): Metadata {
  if (!isSoftLaunch()) return {}
  return {
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  }
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let i = 0; i < left.length; i++) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i)
  }
  return mismatch === 0
}
