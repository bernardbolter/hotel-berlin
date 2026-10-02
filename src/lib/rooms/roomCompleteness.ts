import type { RoomsManagerCopy } from '@/lib/rooms/roomsManagerCopy'
import { focalToPercent } from '@/lib/media/focal'

export type CompletenessImage = {
  altDe?: string | null
  altEn?: string | null
  shotType?: string | null
  focalX?: number | null
  focalY?: number | null
}

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

export function roomCompletenessIssues(
  images: CompletenessImage[],
  t: RoomsManagerCopy,
): string[] {
  const issues: string[] = []
  if (images.length < 4) issues.push(t.missingPhotos(images.length))
  images.forEach((img, i) => {
    if (isPlaceholderAlt(img.altDe) || isPlaceholderAlt(img.altEn)) {
      issues.push(t.missingAlt(i + 1))
    }
  })
  const cover = images[0]
  if (cover) {
    const fx = focalToPercent(cover.focalX)
    const fy = focalToPercent(cover.focalY)
    if (fx === 50 && fy === 50) issues.push(t.missingFocal)
    if (cover.shotType !== 'wide') issues.push(t.missingWide)
  } else {
    issues.push(t.missingFocal)
    issues.push(t.missingWide)
  }
  return issues
}

export function isRoomComplete(images: CompletenessImage[]): boolean {
  // Use a minimal DE copy shape for boolean check without i18n
  const stub = {
    missingPhotos: () => 'x',
    missingAlt: () => 'x',
    missingFocal: 'x',
    missingWide: 'x',
  } as unknown as RoomsManagerCopy
  return roomCompletenessIssues(images, stub).length === 0
}
