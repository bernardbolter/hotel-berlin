import type { Payload } from 'payload'

type InquiryDoc = {
  id: number | string
  company?: string | null
  contactPerson: string
  email: string
  phone: string
  startDate: string
  endDate: string
  eventType: string
  guestCount?: number | null
  roomCount?: number | null
  overnightGuestCount?: number | null
  stayDuration?: string | null
  notes?: string | null
  locale: 'en' | 'de'
}

export async function sendMeetingInquiryEmails(
  doc: InquiryDoc & Record<string, unknown>,
  payload: Payload,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    payload.logger.warn(
      'RESEND_API_KEY not set — skipping meeting inquiry emails (inquiry saved).',
    )
    return
  }

  const meetings = await payload.findGlobal({ slug: 'meetings', depth: 0 })
  const notifyTo = meetings.contactEmail || 'meetings@hotel-berlin.de'
  const from = process.env.RESEND_FROM_EMAIL || 'Hotel Berlin, Berlin <noreply@hotel-berlin.de>'

  const subjectNotify = `[PLACEHOLDER] New meeting inquiry — ${doc.contactPerson}`
  const subjectConfirm = `[PLACEHOLDER] We received your meeting request`

  const bodyNotify = [
    'PLACEHOLDER — replace with client-approved copy.',
    '',
    `Contact: ${doc.contactPerson}`,
    `Company: ${doc.company ?? '—'}`,
    `Email: ${doc.email}`,
    `Phone: ${doc.phone}`,
    `Dates: ${doc.startDate} → ${doc.endDate}`,
    `Event type: ${doc.eventType}`,
    `Participants: ${doc.guestCount ?? '—'}`,
    `Rooms: ${doc.roomCount ?? '—'}`,
    `Overnight guests: ${doc.overnightGuestCount ?? '—'}`,
    `Stay duration: ${doc.stayDuration ?? '—'}`,
    `Notes: ${doc.notes ?? '—'}`,
    `Locale: ${doc.locale}`,
    `Inquiry ID: ${doc.id}`,
  ].join('\n')

  const bodyConfirm =
    doc.locale === 'de'
      ? [
          'PLACEHOLDER — bitte durch freigegebene Bestätigungstexte ersetzen.',
          '',
          `Hallo ${doc.contactPerson},`,
          '',
          'wir haben deine Tagungsanfrage erhalten und melden uns in Kürze.',
          '',
          'Hotel Berlin, Berlin',
        ].join('\n')
      : [
          'PLACEHOLDER — replace with client-approved confirmation copy.',
          '',
          `Hi ${doc.contactPerson},`,
          '',
          'We received your meeting request and will get back to you shortly.',
          '',
          'Hotel Berlin, Berlin',
        ].join('\n')

  await Promise.all([
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [notifyTo],
        subject: subjectNotify,
        text: bodyNotify,
      }),
    }),
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [doc.email],
        subject: subjectConfirm,
        text: bodyConfirm,
      }),
    }),
  ])
}
