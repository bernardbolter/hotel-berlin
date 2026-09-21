import type { ArrayField, Field } from 'payload'

/**
 * Date-bounded exceptions for `openingHours`: closures, holiday hours, on-request.
 * Same row shape on `amenities` and `venues`. No yearly recurrence — add a row
 * per window. The hours formatter uses a row only when today (Berlin) falls
 * inside validFrom–validThrough.
 */
export const specialHoursRowFields: Field[] = [
  {
    name: 'validFrom',
    type: 'date',
    required: true,
    admin: {
      date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' },
      description: 'First day this exception applies (Berlin calendar date).',
    },
  },
  {
    name: 'validThrough',
    type: 'date',
    admin: {
      date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' },
      description: 'Last day inclusive. Leave empty to apply on validFrom only.',
    },
  },
  {
    name: 'kind',
    type: 'select',
    required: true,
    defaultValue: 'closed',
    options: [
      { label: 'Closed', value: 'closed' },
      { label: 'Different hours', value: 'hours' },
      { label: 'On request', value: 'on-request' },
    ],
    admin: {
      description: 'Closed = shut that day. Hours = replacement window. On request = no clock times.',
    },
  },
  {
    name: 'opens',
    type: 'text',
    admin: {
      description: 'e.g. 10:00 — only when kind is “Different hours”.',
      condition: (_, sibling) => sibling?.kind === 'hours',
    },
  },
  {
    name: 'closes',
    type: 'text',
    admin: {
      description: 'e.g. 18:00 — only when kind is “Different hours”.',
      condition: (_, sibling) => sibling?.kind === 'hours',
    },
  },
  {
    name: 'note',
    type: 'text',
    localized: true,
    admin: {
      description: 'Optional guest-facing line, e.g. “Feiertag” / “On request, 45 min notice”.',
    },
  },
]

export function specialHoursArrayField(
  overrides: Partial<Omit<ArrayField, 'type' | 'fields'>> = {},
): ArrayField {
  return {
    name: 'specialHours',
    type: 'array',
    labels: { singular: 'Special hours', plural: 'Special hours' },
    admin: {
      description:
        'One-off closures, holiday hours, or “on request” windows. Regular weekly hours stay in Opening hours.',
    },
    fields: specialHoursRowFields,
    ...overrides,
  }
}
