/** Guest-facing venue copy that is stored unlocalized in Payload. */

export function localizeInBuildingLocation(
  value: string | null | undefined,
  locale: 'de' | 'en',
): string {
  if (!value) return ''
  if (locale !== 'de') return value
  return value
    .replace(/\bGround Floor\b/gi, 'Erdgeschoss')
    .replace(/\bground floor\b/gi, 'Erdgeschoss')
}

export function localizeCuisineLead(
  value: string | null | undefined,
  locale: 'de' | 'en',
): string | null {
  const first = value?.split(/[,·]/)[0]?.trim()
  if (!first) return null
  if (locale !== 'de') return first
  if (/^italian$/i.test(first)) return 'Italienisch'
  return first
}
