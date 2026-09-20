import type { Access, FieldAccess } from 'payload'

export type StaffRole = 'admin' | 'editor'

type AuthUser = {
  id?: number | string
  role?: StaffRole | null
}

/**
 * JWT / Local API user → role. Sessions issued before `role` existed
 * are treated as admin so the existing operator is not locked out.
 */
export function userRole(user: unknown): StaffRole | null {
  if (!user || typeof user !== 'object') return null
  const auth = user as AuthUser
  if (auth.role === 'admin' || auth.role === 'editor') return auth.role
  if (auth.id != null) return 'admin'
  return null
}

export function isAdminUser(user: unknown): boolean {
  return userRole(user) === 'admin'
}

export function isStaffUser(user: unknown): boolean {
  return userRole(user) != null
}

export const anyone: Access = () => true

export const isAdmin: Access = ({ req: { user } }) => isAdminUser(user)

export const isStaff: Access = ({ req: { user } }) => isStaffUser(user)

export const adminsOrSelf: Access = ({ req: { user } }) => {
  if (isAdminUser(user)) return true
  if (user?.id != null) return { id: { equals: user.id } }
  return false
}

export const isAdminField: FieldAccess = ({ req: { user } }) => isAdminUser(user)

/** Public site + REST read; only signed-in staff can write. */
export const publicReadStaffWrite = {
  read: anyone,
  create: isStaff,
  update: isStaff,
  delete: isStaff,
}

/** Content globals (homepage, nav, footer, meetings). */
export const staffWritableGlobal = {
  read: anyone,
  update: isStaff,
}

/** Hotel identity / guest-stay facts — admin only. */
export const adminWritableGlobal = {
  read: anyone,
  update: isAdmin,
}
