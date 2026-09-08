/** Initials for endorsement chips — first letters of up to two name parts. */
export function personInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

/** Given name for “[Name] recommends” lines — first token of the display name. */
export function personGivenName(name: string): string {
  const part = name.trim().split(/\s+/).filter(Boolean)[0]
  return part || name
}

/** Given name + last initial — "Jan H." for person-first map labels. */
export function personShortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return name
  if (parts.length === 1) return parts[0]
  const last = parts[parts.length - 1]
  return `${parts[0]} ${last[0]}.`
}
