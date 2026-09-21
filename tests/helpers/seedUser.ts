import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export type TestUserRole = 'admin' | 'editor'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

/**
 * Seeds a test user for e2e admin tests.
 * New CMS users default to editor; pass `role: 'admin'` when the spec needs Users / Hotel.
 */
export async function seedTestUser(role: TestUserRole = 'editor'): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  await payload.create({
    collection: 'users',
    data: { ...testUser, role },
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
