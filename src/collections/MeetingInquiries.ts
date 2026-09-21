import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { isStaff } from '@/access'
import { sendMeetingInquiryEmails } from '@/lib/meetings/inquiryEmails'

const afterChange: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  try {
    await sendMeetingInquiryEmails(doc, req.payload)
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: 'Failed to send meeting inquiry emails',
    })
  }
  return doc
}

export const MeetingInquiries: CollectionConfig = {
  slug: 'meeting-inquiries',
  admin: {
    useAsTitle: 'contactPerson',
    defaultColumns: ['contactPerson', 'company', 'eventType', 'startDate', 'createdAt'],
  },
  access: {
    create: () => true,
    read: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: 'company', type: 'text' },
    { name: 'contactPerson', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date', required: true },
    {
      name: 'eventType',
      type: 'text',
      required: true,
      admin: {
        description:
          'Free text mirroring meetings.eventTypes — historical submissions stay stable if options change.',
      },
    },
    { name: 'guestCount', type: 'number' },
    { name: 'roomCount', type: 'number', admin: { description: 'Overnight / contingent room count.' } },
    {
      name: 'overnightGuestCount',
      type: 'number',
      admin: { description: 'Guests staying overnight (room block).' },
    },
    {
      name: 'stayDuration',
      type: 'text',
      admin: { description: 'Free-text duration of stay, e.g. 2 nights.' },
    },
    {
      name: 'roomOfInterest',
      type: 'relationship',
      relationTo: 'meeting-rooms',
      admin: {
        description: 'Pre-filled when the form is reached via a room detail page CTA.',
      },
    },
    {
      name: 'isRoomBlock',
      type: 'checkbox',
      defaultValue: false,
      label: '10+ rooms as a block',
    },
    { name: 'notes', type: 'textarea' },
    {
      name: 'privacyAccepted',
      type: 'checkbox',
      required: true,
      admin: { description: 'Privacy policy checkbox.' },
    },
    {
      name: 'consentGiven',
      type: 'checkbox',
      required: true,
      admin: { description: 'Data-processing consent checkbox.' },
    },
    {
      name: 'locale',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Deutsch', value: 'de' },
      ],
      required: true,
    },
  ],
  hooks: {
    afterChange: [afterChange],
  },
}
