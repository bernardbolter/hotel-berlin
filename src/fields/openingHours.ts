import type { ArrayField, Field } from 'payload'

/** Same opening-hours row shape for `venues` and `hotel`. */
export const openingHoursRowFields: Field[] = [
  { name: 'dayOfWeek', type: 'text', admin: { description: 'e.g. Mo-Su, Mo-Fr, Sa-Su, or Thursday' } },
  { name: 'opens', type: 'text', admin: { description: 'e.g. 10:00' } },
  { name: 'closes', type: 'text', admin: { description: 'Clock time, e.g. 22:30 or 01:00. Required for open/closed status.' } },
  {
    name: 'isOpenEnded',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description:
        'No advertised close — still store a clock bound in `closes` so status can be derived. The UI renders the i18n “open end” phrase.',
    },
  },
  {
    name: 'segment',
    type: 'text',
    admin: {
      description:
        'Grouping label for open/closed status, e.g. "Bar" / "Kitchen" / "Breakfast". Multiple rows may share a segment.',
    },
  },
  {
    name: 'note',
    type: 'text',
    admin: { description: 'Optional status note, e.g. "Kitchen closes 22:30"' },
  },
]

export function openingHoursArrayField(
  overrides: Partial<Omit<ArrayField, 'type' | 'fields'>> = {},
): ArrayField {
  return {
    name: 'openingHours',
    type: 'array',
    labels: { singular: 'Hours row', plural: 'Opening hours' },
    fields: openingHoursRowFields,
    ...overrides,
  }
}
