import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      company,
      contactPerson,
      email,
      phone,
      startDate,
      endDate,
      eventType,
      guestCount,
      roomCount,
      overnightGuestCount,
      stayDuration,
      roomOfInterest,
      isRoomBlock,
      notes,
      privacyAccepted,
      consentGiven,
      locale,
    } = body ?? {}

    if (
      !contactPerson ||
      !email ||
      !phone ||
      !startDate ||
      !endDate ||
      !eventType ||
      !privacyAccepted ||
      !consentGiven ||
      (locale !== 'de' && locale !== 'en')
    ) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const doc = await payload.create({
      collection: 'meeting-inquiries',
      data: {
        company: company || undefined,
        contactPerson,
        email,
        phone,
        startDate,
        endDate,
        eventType,
        guestCount: typeof guestCount === 'number' ? guestCount : undefined,
        roomCount: typeof roomCount === 'number' ? roomCount : undefined,
        overnightGuestCount:
          typeof overnightGuestCount === 'number' ? overnightGuestCount : undefined,
        stayDuration: stayDuration || undefined,
        roomOfInterest: roomOfInterest || undefined,
        isRoomBlock: Boolean(isRoomBlock),
        notes: notes || undefined,
        privacyAccepted: true,
        consentGiven: true,
        locale,
      },
    })

    return NextResponse.json({ id: doc.id }, { status: 201 })
  } catch (error) {
    console.error('meeting-inquiries create failed', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
