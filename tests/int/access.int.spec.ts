import { describe, expect, it } from 'vitest'

import {
  adminWritableGlobal,
  adminsOrSelf,
  isAdmin,
  isAdminField,
  isAdminUser,
  isStaff,
  publicReadStaffWrite,
  staffWritableGlobal,
  userRole,
} from '@/access'
import { Users } from '@/collections/Users'
import { Hotel } from '@/globals/Hotel'

const admin = { id: 1, role: 'admin' as const }
const editor = { id: 2, role: 'editor' as const }
const legacy = { id: 3 }
const args = (user: unknown) => ({ req: { user } }) as never

describe('staff roles', () => {
  it('reads admin and editor from the user, and treats pre-role sessions as admin', () => {
    expect(userRole(admin)).toBe('admin')
    expect(userRole(editor)).toBe('editor')
    expect(userRole(legacy)).toBe('admin')
    expect(userRole(null)).toBeNull()
    expect(isAdminUser(admin)).toBe(true)
    expect(isAdminUser(editor)).toBe(false)
    expect(isAdminUser(legacy)).toBe(true)
  })

  it('lets only admins create and list other users; editors can only see themselves', () => {
    expect(isAdmin(args(admin))).toBe(true)
    expect(isAdmin(args(editor))).toBe(false)
    expect(adminsOrSelf(args(admin))).toBe(true)
    expect(adminsOrSelf(args(editor))).toEqual({ id: { equals: 2 } })
    expect(adminsOrSelf(args(null))).toBe(false)
    expect(isAdminField(args(admin))).toBe(true)
    expect(isAdminField(args(editor))).toBe(false)
  })

  it('lets editors write content collections and content globals, not the Hotel global', () => {
    expect(isStaff(args(editor))).toBe(true)
    expect(isStaff(args(null))).toBe(false)
    expect(publicReadStaffWrite.read(args(null))).toBe(true)
    expect(publicReadStaffWrite.create(args(editor))).toBe(true)
    expect(publicReadStaffWrite.create(args(null))).toBe(false)
    expect(staffWritableGlobal.update(args(editor))).toBe(true)
    expect(adminWritableGlobal.update(args(editor))).toBe(false)
    expect(adminWritableGlobal.update(args(admin))).toBe(true)
  })

  it('defaults new users to editor; editors can open admin but not Users or Hotel', () => {
    const roleField = Users.fields.find((field) => 'name' in field && field.name === 'role')
    expect(roleField && 'defaultValue' in roleField ? roleField.defaultValue : undefined).toBe(
      'editor',
    )
    expect(Users.access.admin?.(args(editor))).toBe(true)
    expect(Users.access.admin?.(args(admin))).toBe(true)
    expect(Users.access.admin?.(args(null))).toBe(false)
    expect(Users.admin?.hidden?.({ user: editor } as never)).toBe(true)
    expect(Users.admin?.hidden?.({ user: admin } as never)).toBe(false)
    expect(Hotel.admin?.hidden?.({ user: editor } as never)).toBe(true)
    expect(Hotel.admin?.hidden?.({ user: admin } as never)).toBe(false)
  })
})
