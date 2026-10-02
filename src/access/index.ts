import type { Access, FieldAccess } from 'payload'

export type StaffRole = 'admin' | 'editor' | 'hotel-staff'

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
  if (auth.role === 'admin' || auth.role === 'editor' || auth.role === 'hotel-staff') {
    return auth.role
  }
  if (auth.id != null) return 'admin'
  return null
}

export function isAdminUser(user: unknown): boolean {
  return userRole(user) === 'admin'
}

/** Admin or editor — full content CMS (not hotel-staff). */
export function isEditorOrAdminUser(user: unknown): boolean {
  const role = userRole(user)
  return role === 'admin' || role === 'editor'
}

export function isHotelStaffUser(user: unknown): boolean {
  return userRole(user) === 'hotel-staff'
}

/** Anyone who may open the Payload admin (admin, editor, hotel-staff). */
export function isStaffUser(user: unknown): boolean {
  return userRole(user) != null
}

export const anyone: Access = () => true

export const isAdmin: Access = ({ req: { user } }) => isAdminUser(user)

export const isStaff: Access = ({ req: { user } }) => isStaffUser(user)

export const isEditorOrAdmin: Access = ({ req: { user } }) => isEditorOrAdminUser(user)

export const adminsOrSelf: Access = ({ req: { user } }) => {
  if (isAdminUser(user)) return true
  if (user?.id != null) return { id: { equals: user.id } }
  return false
}

export const isAdminField: FieldAccess = ({ req: { user } }) => isAdminUser(user)

/** Hide nav entries from hotel-staff (rooms + media stay visible). */
export function hideFromHotelStaff({ user }: { user: unknown }): boolean {
  return isHotelStaffUser(user)
}

/**
 * Public site + REST read for anonymous/editors; hotel-staff blocked from admin
 * collection access via URL. Local API without a user still reads.
 */
export const publicReadStaffWrite = {
  read: ({ req: { user } }: { req: { user: unknown } }) => !isHotelStaffUser(user),
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
}

/** Rooms: hotel-staff may update, not create/delete. */
export const roomsAccess = {
  read: anyone,
  create: isEditorOrAdmin,
  update: isStaff,
  delete: isEditorOrAdmin,
}

/** Meeting rooms: same deal as rooms — hotel-staff may update, not create/delete. */
export const meetingRoomsAccess = roomsAccess

/** Media: hotel-staff may create + read; delete/update only editor/admin. */
export const mediaAccess = {
  read: anyone,
  create: isStaff,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
}

/** Tags (amenities): readable by hotel-staff for Rooms Manager; hidden in nav. */
export const tagsAccess = {
  read: anyone,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
}

/** Content globals — editor/admin only; hotel-staff cannot open in admin. */
export const staffWritableGlobal = {
  read: ({ req: { user } }: { req: { user: unknown } }) => !isHotelStaffUser(user),
  update: isEditorOrAdmin,
}

/** Hotel identity / guest-stay facts — admin only. */
export const adminWritableGlobal = {
  read: anyone,
  update: isAdmin,
}
