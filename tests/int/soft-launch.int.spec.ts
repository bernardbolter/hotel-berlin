import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
  isBasicAuthorized,
  isSoftLaunch,
  parseBasicAuth,
  softLaunchMetadata,
} from '@/lib/launch/softLaunch'
import robots from '@/app/robots'

const KEYS = ['SOFT_LAUNCH', 'BASIC_AUTH_USER', 'BASIC_AUTH_PASSWORD'] as const

const original: Record<(typeof KEYS)[number], string | undefined> = {
  SOFT_LAUNCH: undefined,
  BASIC_AUTH_USER: undefined,
  BASIC_AUTH_PASSWORD: undefined,
}

function setEnv(values: Partial<Record<(typeof KEYS)[number], string | undefined>>) {
  for (const key of KEYS) {
    if (key in values) {
      const value = values[key]
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

describe('soft launch', () => {
  beforeAll(() => {
    for (const key of KEYS) original[key] = process.env[key]
  })

  afterEach(() => {
    setEnv(original)
  })

  it('is off unless SOFT_LAUNCH is exactly true', () => {
    setEnv({ SOFT_LAUNCH: undefined })
    expect(isSoftLaunch()).toBe(false)
    setEnv({ SOFT_LAUNCH: '1' })
    expect(isSoftLaunch()).toBe(false)
    setEnv({ SOFT_LAUNCH: 'true' })
    expect(isSoftLaunch()).toBe(true)
  })

  it('rejects missing or malformed basic auth', () => {
    setEnv({ BASIC_AUTH_USER: 'hotel', BASIC_AUTH_PASSWORD: 'secret' })
    expect(isBasicAuthorized(null)).toBe(false)
    expect(isBasicAuthorized('Bearer x')).toBe(false)
    expect(parseBasicAuth('Basic !!!')).toBeNull()
  })

  it('accepts the configured user and password', () => {
    setEnv({ BASIC_AUTH_USER: 'hotel', BASIC_AUTH_PASSWORD: 'secret' })
    const header = `Basic ${btoa('hotel:secret')}`
    expect(isBasicAuthorized(header)).toBe(true)
    expect(isBasicAuthorized(`Basic ${btoa('hotel:wrong')}`)).toBe(false)
  })

  it('fails closed when credentials are unset', () => {
    setEnv({
      SOFT_LAUNCH: 'true',
      BASIC_AUTH_USER: undefined,
      BASIC_AUTH_PASSWORD: undefined,
    })
    expect(isBasicAuthorized(`Basic ${btoa('a:b')}`)).toBe(false)
  })

  it('disallows all crawlers while SOFT_LAUNCH is on', () => {
    setEnv({ SOFT_LAUNCH: 'true' })
    expect(robots()).toEqual({
      rules: { userAgent: '*', disallow: '/' },
    })
    expect(softLaunchMetadata().robots).toMatchObject({ index: false, follow: false })
  })

  it('allows indexing when the switch is off, except admin and api', () => {
    setEnv({ SOFT_LAUNCH: undefined })
    expect(robots()).toEqual({
      rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] }],
    })
    expect(softLaunchMetadata()).toEqual({})
  })
})
