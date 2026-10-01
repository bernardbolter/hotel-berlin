import type { CollectionConfig } from 'payload'

import { isAdminUser, isStaffUser, adminsOrSelf, isAdmin, isAdminField } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => !isAdminUser(user),
    description:
      'CMS logins. Only admins can create users or change roles. Hotel staff accounts should be Editor.',
  },
  auth: {
    // Default Payload token/session is 2h — too short for photo entry sessions.
    tokenExpiration: 60 * 60 * 12, // 12 hours
  },
  access: {
    // Payload's `admin` panel gate is boolean-only (not the full Access union).
    admin: ({ req: { user } }) => isStaffUser(user),
    create: isAdmin,
    delete: isAdmin,
    read: adminsOrSelf,
    unlock: ({ req: { user } }) => isAdminUser(user),
    update: adminsOrSelf,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        update: isAdminField,
      },
      admin: {
        description:
          'Admins manage users and the Hotel global. Editors manage collections and the other globals. Set hotel accounts to Editor.',
      },
    },
  ],
}
