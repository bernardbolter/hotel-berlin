import type { Field, GlobalConfig } from 'payload'

import { openingHoursArrayField } from '../fields/openingHours'

type LocalePairDefaults = {
  valueDE?: string
  valueEN?: string
  noteDE?: string
  noteEN?: string
}

function localePair(name: string, label: string, defaults: LocalePairDefaults = {}): Field {
  return {
    name,
    label,
    type: 'group',
    fields: [
      { name: 'valueDE', type: 'text', defaultValue: defaults.valueDE ?? undefined },
      { name: 'valueEN', type: 'text', defaultValue: defaults.valueEN ?? undefined },
      { name: 'noteDE', type: 'text', defaultValue: defaults.noteDE ?? undefined },
      { name: 'noteEN', type: 'text', defaultValue: defaults.noteEN ?? undefined },
    ],
  }
}

export const Hotel: GlobalConfig = {
  slug: 'hotel',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'legalName', type: 'text' },
    { name: 'description', type: 'richText', localized: true },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      admin: { description: 'Max 160 chars. Used for meta descriptions and AI citation.' },
    },
    { name: 'url', type: 'text' },
    { name: 'telephone', type: 'text' },
    { name: 'conferencePhone', type: 'text' },
    { name: 'email', type: 'email' },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'streetAddress', type: 'text' },
        { name: 'addressLocality', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'addressCountry', type: 'text' },
      ],
    },
    {
      name: 'geo',
      type: 'group',
      fields: [
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
      ],
    },
    { name: 'hasMap', type: 'text', admin: { description: 'Google Maps URL' } },
    {
      name: 'directionsUrl',
      type: 'text',
      admin: {
        description:
          '“Get directions” link — Google Maps directions URL. Falls back to hasMap, then coords.',
      },
    },
    {
      name: 'mapBounds',
      type: 'group',
      admin: {
        description: 'Viewport for neighbourhood map and homepage map teaser.',
      },
      fields: [
        { name: 'north', type: 'number' },
        { name: 'south', type: 'number' },
        { name: 'west', type: 'number' },
        { name: 'east', type: 'number' },
      ],
    },
    { name: 'checkinTime', type: 'text' },
    { name: 'checkoutTime', type: 'text' },
    {
      name: 'guestStay',
      label: 'Guest stay info (/here hero + extras)',
      type: 'group',
      fields: [
        {
          name: 'wifiNetwork',
          type: 'text',
          admin: { description: 'Guest WiFi SSID — shown in monospace pill. Not localised.' },
        },
        {
          name: 'wifiPassword',
          type: 'text',
          admin: { description: 'Guest WiFi password — shown in monospace pill. Not localised.' },
        },
        localePair('checkout', 'Check-out', {
          valueDE: '12:00',
          valueEN: '12:00',
          noteDE: 'Später auf Anfrage',
          noteEN: 'Later on request',
        }),
        localePair('breakfast', 'Breakfast / Frühstück', {
          valueDE: '06:30 – 10:00',
          valueEN: '06:30 – 10:00',
          noteDE: 'Lütze, Erdgeschoss',
          noteEN: 'Lütze, ground floor',
        }),
        localePair('parking', 'Parking / Parken', {
          valueDE: '4 € / Std.',
          valueEN: '€4 / hour',
          noteDE: 'Tiefgarage · max. 25 €/Tag',
          noteEN: 'Underground · max. €25/day',
        }),
        localePair('luggage', 'Luggage / Gepäck', {
          valueDE: 'Rezeption',
          valueEN: 'Reception',
          noteDE: 'Auch nach dem Check-out',
          noteEN: 'Also after check-out',
        }),
        {
          name: 'more',
          label: 'Stay card extras (not in the hero)',
          type: 'group',
          admin: {
            description:
              'Wundermart, Bett & Bike, Sauna, pets — render only when a value is set. Leave blank to hide.',
          },
          fields: [
            localePair('wundermart', 'Wundermart', {}),
            localePair('bettAndBike', 'Bett & Bike', {}),
            localePair('saunaFitness', 'Sauna & Fitness', {
              valueDE: '24/7',
              valueEN: '24/7',
              noteDE: 'Sauna · Fitness',
              noteEN: 'Sauna · gym',
            }),
            localePair('pets', 'Pets / Hunde', {
              valueDE: '€30 / Tag',
              valueEN: '€30 / day',
              noteDE: 'Hunde willkommen',
              noteEN: 'Dogs welcome',
            }),
          ],
        },
        {
          name: 'checkoutNote',
          type: 'text',
          localized: true,
          admin: { hidden: true, description: 'Legacy — use checkout.noteDE / noteEN' },
        },
        {
          name: 'breakfastLocation',
          type: 'text',
          localized: true,
          admin: { hidden: true, description: 'Legacy — use breakfast.noteDE / noteEN' },
        },
        {
          name: 'parkingSummary',
          type: 'text',
          localized: true,
          admin: { hidden: true, description: 'Legacy — use parking.value / note' },
        },
        {
          name: 'luggageNote',
          type: 'text',
          localized: true,
          admin: { hidden: true, description: 'Legacy — use luggage.value / note' },
        },
      ],
    },
    {
      name: 'bridgeNav',
      label: 'Bridge navigation',
      type: 'group',
      admin: {
        description:
          'Row-2 door between outside (home) and /here. Full string; the last caps word becomes the boxed button.',
      },
      fields: [
        {
          name: 'toHereLabelEN',
          type: 'text',
          defaultValue: 'Already in the house? ENTER →',
        },
        {
          name: 'toHereLabelDE',
          type: 'text',
          defaultValue: 'Schon im Haus? ENTER →',
        },
        {
          name: 'toStayLabelEN',
          type: 'text',
          defaultValue: 'Not here yet? STAY →',
        },
        {
          name: 'toStayLabelDE',
          type: 'text',
          defaultValue: 'Noch nicht hier? BLEIB →',
        },
      ],
    },
    { name: 'starRating', type: 'number' },
    { name: 'priceRange', type: 'text' },
    { name: 'totalRooms', type: 'number' },
    { name: 'foundingDate', type: 'text' },
    { name: 'brand', type: 'text' },
    { name: 'parentOrganization', type: 'text' },
    { name: 'wikidataId', type: 'text', admin: { description: 'e.g. Q1630833' } },
    {
      name: 'sameAs',
      type: 'array',
      fields: [{ name: 'url', type: 'text' }],
    },
    {
      name: 'amenityFeature',
      type: 'array',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'value', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'certifications',
      type: 'array',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'openingHours',
      type: 'group',
      admin: {
        hidden: true,
        description: 'Legacy flat strings — kept so Postgres columns are not renamed. Use Hours rows.',
      },
      fields: [
        { name: 'reception', type: 'text' },
        { name: 'breakfast', type: 'text' },
      ],
    },
    openingHoursArrayField({
      name: 'hours',
      label: 'Hours',
      admin: {
        description:
          'Same row shape as venues. Reception, breakfast (weekday/weekend), and any other hotel-wide hours.',
      },
    }),
    {
      name: 'breakfastPricing',
      label: 'Breakfast prices',
      type: 'group',
      admin: {
        description: 'A–Z breakfast prices. Shown on the guest hub dining band, not hardcoded.',
      },
      fields: [
        { name: 'adultPrice', type: 'number', admin: { description: 'Adult price in EUR, e.g. 23' } },
        { name: 'childPrice', type: 'number', admin: { description: 'Child price in EUR, e.g. 12' } },
        {
          name: 'childAgeFrom',
          type: 'number',
          admin: { description: 'Children from this age pay the child price, e.g. 6' },
        },
      ],
    },
    {
      name: 'roomService',
      label: 'Room service',
      type: 'group',
      admin: {
        description:
          'Guest hub dining band states this plainly. Default is no room service — collect at the bar.',
      },
      fields: [
        {
          name: 'offered',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Hotel offers in-room dining. Leave off to state that it does not.' },
        },
        {
          name: 'note',
          type: 'text',
          localized: true,
          admin: {
            description:
              'Guest-facing line, e.g. "Kein Zimmerservice — Abholung an der Bar".',
          },
        },
      ],
    },
    {
      name: 'heroMapImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Circular map image in the homepage hero. Upload a square image (~600×600). Replaces the generated Mapbox preview when set.',
      },
    },
    {
      name: 'getDirectionsLabel',
      type: 'text',
      localized: true,
      admin: {
        description: 'Hero map CTA label, e.g. "Get Directions" / "Wegbeschreibung".',
      },
    },
    {
      name: 'heroShortAddress',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Short display address in the hero map badge hover pill (e.g. "Lützowplatz 17, Tiergarten"). Distinct from the full structured address.',
      },
    },
    {
      name: 'meetAndWork',
      label: 'Meet & Work',
      type: 'group',
      admin: {
        description:
          'Homepage “Meet & Work” teaser — editable DE/EN copy and rotating photos. Links to /meetings.',
      },
      fields: [
        {
          name: 'kicker',
          type: 'text',
          localized: true,
          admin: { description: 'Section kicker, e.g. "Meet & Work" / "Tagen & Arbeiten".' },
        },
        {
          name: 'subhead',
          type: 'text',
          localized: true,
          admin: {
            description: 'Bold subhead, e.g. "Serious business, playful spaces".',
          },
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          admin: { description: 'Short pitch paragraph under the subhead.' },
        },
        {
          name: 'slides',
          type: 'array',
          labels: { singular: 'Slide', plural: 'Slides' },
          minRows: 1,
          maxRows: 8,
          admin: {
            description:
              'Rotating photos (like Sleep & Relax). Each slide has an image and a typewriter caption (DE/EN).',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'imageAlt',
              type: 'text',
              localized: true,
              admin: {
                description: 'Descriptive alt text — AEO ImageObject.description.',
              },
            },
            {
              name: 'caption',
              type: 'text',
              localized: true,
              admin: {
                description:
                  'Typewriter line under the body, e.g. room/space name. Localize DE + EN.',
              },
            },
          ],
        },
        {
          name: 'ctaLabel',
          type: 'text',
          localized: true,
          admin: {
            description: 'Line-CTA label, e.g. "All meeting rooms" / "Alle Meetingräume".',
          },
        },
      ],
    },
    {
      name: 'roomsPageIntro',
      label: 'Rooms page intro',
      type: 'group',
      admin: {
        description: 'Editable header for /rooms · /zimmer index page.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: {
            description: 'Defaults to "Rooms & Suites" / "Zimmer & Suiten" if empty.',
          },
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          admin: { description: 'Intro paragraph under the H1 (Laica A).' },
        },
      ],
    },
    {
      name: 'compareTable',
      label: 'Rooms compare table',
      type: 'group',
      admin: {
        description: 'Hide-dont-delete toggle for the /rooms comparison matrix.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show the “Compare all rooms” section on the rooms index.',
          },
        },
      ],
    },
    {
      name: 'roomsSuitesCallout',
      label: 'Rooms page — suites callout',
      type: 'group',
      admin: {
        description:
          'Quote block on /rooms · /zimmer — shown after the room slug set in “Insert after”.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Show the suites callout on the rooms index.' },
        },
        {
          name: 'insertAfterSlug',
          type: 'text',
          defaultValue: 'premium',
          admin: {
            description: 'Room slug after which the callout appears (default: premium).',
          },
        },
        {
          name: 'quote',
          type: 'textarea',
          localized: true,
          admin: { description: 'Pull quote — serif, shown above the title.' },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: { description: 'Heading, e.g. "The Suites" / "Die Suiten".' },
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          admin: { description: 'Short paragraph under the title.' },
        },
      ],
    },
    {
      name: 'eatAndDrink',
      label: 'Eat & Drink',
      type: 'group',
      admin: {
        description:
          'Homepage Lütze / Eat & Drink teaser — Rooms-style layout (text + arch photo + one Sweep CTA). Links to /restaurant.',
      },
      fields: [
        {
          name: 'kicker',
          type: 'text',
          localized: true,
          admin: { description: 'Small label above the heading, e.g. "Eat & Drink" / "Essen & Trinken".' },
        },
        {
          name: 'heading',
          type: 'text',
          localized: true,
          admin: {
            description: 'Serif headline, e.g. "The place to eat, play, and hang all day."',
          },
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          admin: { description: 'Short pitch paragraph under the heading.' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Arch-topped teaser photo (interior / terrace).' },
        },
        {
          name: 'imageAlt',
          type: 'text',
          localized: true,
          admin: {
            description: 'Descriptive alt text — AEO ImageObject.description.',
          },
        },
        {
          name: 'ctaLabel',
          type: 'text',
          localized: true,
          admin: {
            description: 'Sweep-CTA label, e.g. "Eat & Drink" / "Essen & Trinken".',
          },
        },
      ],
    },
  ],
}
