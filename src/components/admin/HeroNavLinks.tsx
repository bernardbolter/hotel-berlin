'use client'

import { Link, useAuth, useTranslation } from '@payloadcms/ui'

import { meetingRoomsManagerCopy } from '@/lib/meetings/meetingRoomsManagerCopy'
import { roomsManagerCopy } from '@/lib/rooms/roomsManagerCopy'

/**
 * Extra admin nav entries. Hotel-staff only see the room managers.
 */
export function HeroNavLinks() {
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const t = roomsManagerCopy(i18n?.language)
  const tMeeting = meetingRoomsManagerCopy(i18n?.language)
  const role = (user as { role?: string } | null)?.role
  const hotelStaffOnly = role === 'hotel-staff'

  const linkStyle = {
    display: 'block',
    padding: '6px 16px',
    fontSize: 13,
    textDecoration: 'none',
    color: 'var(--theme-text)',
  } as const

  return (
    <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {!hotelStaffOnly ? (
        <>
          <Link href="/admin/hero-startseite" style={linkStyle}>
            Hero Startseite
          </Link>
          <Link href="/admin/hero-hier" style={linkStyle}>
            Hero Hier
          </Link>
          <Link href="/admin/hero-essen" style={linkStyle}>
            Hero Essen & Trinken
          </Link>
        </>
      ) : null}
      <Link href="/admin/rooms-manager" style={linkStyle}>
        {t.title}
      </Link>
      <Link href="/admin/meeting-rooms-manager" style={linkStyle}>
        {tMeeting.title}
      </Link>
    </div>
  )
}

export default HeroNavLinks
