import type { MeetingRoomsManagerCopy } from '@/lib/meetings/meetingRoomsManagerCopy'

export type MeetingCompletenessImage = {
  altDe?: string | null
  altEn?: string | null
}

/** Minimum gallery size before a meeting room counts as complete. */
export const MEETING_ROOM_MIN_PHOTOS = 2

function isPlaceholderAlt(alt: string | null | undefined): boolean {
  const t = (alt ?? '').trim().toLowerCase()
  return (
    !t ||
    t.includes('alt pending') ||
    t.includes('alt fehlt') ||
    t.includes('alt text missing') ||
    t.includes('bildbeschreibung fehlt') ||
    t.includes('alt folgt')
  )
}

export function meetingRoomCompletenessIssues(
  images: MeetingCompletenessImage[],
  t: MeetingRoomsManagerCopy,
): string[] {
  const issues: string[] = []
  if (images.length < MEETING_ROOM_MIN_PHOTOS) issues.push(t.missingPhotos(images.length))
  images.forEach((img, i) => {
    if (isPlaceholderAlt(img.altDe) || isPlaceholderAlt(img.altEn)) {
      issues.push(t.missingAlt(i + 1))
    }
  })
  return issues
}

export function isMeetingRoomComplete(images: MeetingCompletenessImage[]): boolean {
  // Minimal copy shape for the boolean check without i18n
  const stub = {
    missingPhotos: () => 'x',
    missingAlt: () => 'x',
  } as unknown as MeetingRoomsManagerCopy
  return meetingRoomCompletenessIssues(images, stub).length === 0
}
