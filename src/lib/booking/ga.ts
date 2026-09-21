/** GA cross-domain linker — same `_ga` cookie the live Galaxy mask forwards. */
export function getGaLinkerParam(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(/(?:^|; )_ga=([^;]*)/)
  const value = match?.[1]?.trim()
  return value || undefined
}

/**
 * New tab is a logged decision (audit §7): the hotel site stays open behind
 * the booker on Radisson / MeetingPackage. Falls back to same-tab if the
 * popup is blocked.
 */
export function openBookingHandoff(url: string): void {
  const opened = window.open(url, '_blank', 'noopener,noreferrer')
  if (!opened) window.location.assign(url)
}
