# Hotel Berlin, Berlin — Places Collection Build Brief
*For Cursor / Claude Opus*
*Goal: Payload CMS `places` collection, seed data, and static JSON data layer*
*Depends on: HotelBerlin_CursorBuildBrief.md (scaffold build brief)*

---

## What this is

A self-contained build task that adds the `places` collection to the Hotel Berlin, Berlin Payload CMS instance and seeds it with real data. This collection powers three things:

- The `<MapTeaser>` component on the homepage — static non-interactive map with baked-in pins
- The `<NeighbourhoodMap>` interactive Mapbox GL JS map on `/neighbourhood`
- The `/here/explore` guest map (same component, different default context)

The collection is also the CMS interface that allows hotel staff to add, edit, and remove places without touching code.

---

## Context

The hotel site has a two-context model:

- **Outside context** (`/`, `/neighbourhood`) — prospect-facing. Shows the neighbourhood to people who haven't arrived yet.
- **Inside context** (`/here/explore`) — guest-facing. Shows concierge recommendations to people already at the hotel.

The `places` collection serves both contexts via a single `context` field. The map component receives a `defaultContext` prop that determines which pins are visible on load. Staff manage all places in one collection — the context field controls where each place appears.

---

## Tech stack

Matches the existing scaffold:

| | |
|---|---|
| CMS | Payload CMS 3.x |
| Database | PostgreSQL (Neon) |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Static data fallback | `/lib/data/places.json` — same shape as Payload collection |

---

## Task 1 — Payload collection definition

Create `src/collections/Places.ts`.

### Field spec

```typescript
import { CollectionConfig } from 'payload'

export const Places: CollectionConfig = {
  slug: 'places',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'context', 'type', 'category', 'walkingMinutes'],
    group: 'Neighbourhood',
  },
  access: {
    read: () => true,
  },
  fields: [
    // ── IDENTITY ──────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Display name shown on map and cards' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL-safe identifier — auto-generated from name, editable' },
    },

    // ── CONTEXT & TYPE ────────────────────────────────────
    {
      name: 'context',
      type: 'select',
      required: true,
      options: [
        { label: 'Outside — neighbourhood map only (/neighbourhood)', value: 'outside' },
        { label: 'Inside — guest explore only (/here/explore)',       value: 'inside'  },
        { label: 'Both — appears on both maps',                       value: 'both'    },
      ],
      admin: {
        description: 'Controls which map this place appears on. "Both" = hotel concierge picks visible to all.',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Monument — landmark, site, or attraction', value: 'monument'   },
        { label: 'Concierge pick — team recommendation',     value: 'concierge'  },
        { label: 'In the building — inside the hotel',       value: 'in-building' },
      ],
      admin: {
        description: 'Monument = static editorial content. Concierge = team voice, updated seasonally. In the building = Lütze, KTTK, FKKB etc.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Park & outdoor',  value: 'park'       },
        { label: 'Museum',          value: 'museum'     },
        { label: 'Gallery',         value: 'gallery'    },
        { label: 'Music & culture', value: 'culture'    },
        { label: 'Restaurant',      value: 'restaurant' },
        { label: 'Bar',             value: 'bar'        },
        { label: 'Café',            value: 'cafe'       },
        { label: 'Shop',            value: 'shop'       },
        { label: 'Transport',       value: 'transport'  },
        { label: 'Sport',           value: 'sport'      },
        { label: 'Other',           value: 'other'      },
      ],
    },

    // ── COPY ─────────────────────────────────────────────
    {
      name: 'shortDescription',
      type: 'text',
      required: true,
      maxLength: 120,
      admin: {
        description: 'One line — shown in map popup and card previews. Max 120 characters. Write in the hotel voice — direct, specific, no superlatives.',
      },
    },
    {
      name: 'shortDescriptionDE',
      type: 'text',
      maxLength: 120,
      admin: { description: 'German version of short description. Write natively — do not translate.' },
    },
    {
      name: 'fullDescription',
      type: 'richText',
      admin: {
        description: 'Used on detail pages and expanded card views. Optional for monuments, recommended for concierge picks.',
      },
    },

    // ── LOCATION ──────────────────────────────────────────
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'lat',
          type: 'number',
          required: true,
          admin: { description: 'Latitude — e.g. 52.5027' },
        },
        {
          name: 'lng',
          type: 'number',
          required: true,
          admin: { description: 'Longitude — e.g. 13.3583' },
        },
      ],
    },
    {
      name: 'address',
      type: 'text',
      admin: { description: 'Street address — shown in popup. Optional for parks and landmarks.' },
    },

    // ── DISTANCE ─────────────────────────────────────────
    {
      name: 'walkingMinutes',
      type: 'number',
      admin: {
        description: 'Walking time from hotel in minutes. Fill this in manually — the team knows whether it is a nice walk or not. Leave empty for in-building places.',
      },
    },
    {
      name: 'walkingNote',
      type: 'text',
      admin: {
        description: 'Optional note on the walk — e.g. "Nice route along the canal". Keep it short.',
      },
    },
    {
      name: 'floor',
      type: 'text',
      admin: {
        description: 'For in-building places only — e.g. "Ground floor", "B2 Basement", "Every floor". Replaces walking time in the UI.',
      },
    },

    // ── PRACTICAL ─────────────────────────────────────────
    {
      name: 'website',
      type: 'text',
      admin: { description: 'Full URL including https://' },
    },
    {
      name: 'hours',
      type: 'text',
      admin: { description: 'Opening hours as a simple string — e.g. "Daily 10:00–22:00" or "Thu–Sun from 18:00"' },
    },

    // ── MEDIA ─────────────────────────────────────────────
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Used in card views and detail pages. Not shown on the map itself.' },
    },

    // ── MAP PIN OVERRIDE ──────────────────────────────────
    {
      name: 'pinIcon',
      type: 'select',
      options: [
        { label: 'Default (set by category)', value: 'auto'         },
        { label: 'Building',                  value: 'building'     },
        { label: 'Tree / park',               value: 'park'         },
        { label: 'Music',                     value: 'music'        },
        { label: 'Coffee',                    value: 'cafe'         },
        { label: 'Shop',                      value: 'shop'         },
        { label: 'Gallery / art',             value: 'gallery'      },
        { label: 'Waves / water',             value: 'waves'        },
        { label: 'Architecture',              value: 'arch'         },
        { label: 'Table tennis',              value: 'sport'        },
      ],
      defaultValue: 'auto',
      admin: { description: 'Overrides the automatic icon set by category. Leave as "auto" unless you need something specific.' },
    },

    // ── SCHEMA ────────────────────────────────────────────
    {
      name: 'schemaType',
      type: 'select',
      options: [
        { label: 'TouristAttraction',   value: 'TouristAttraction'   },
        { label: 'LocalBusiness',       value: 'LocalBusiness'       },
        { label: 'Restaurant',          value: 'Restaurant'          },
        { label: 'CafeOrCoffeeShop',    value: 'CafeOrCoffeeShop'    },
        { label: 'BarOrPub',            value: 'BarOrPub'            },
        { label: 'Park',                value: 'Park'                },
        { label: 'ArtGallery',          value: 'ArtGallery'          },
        { label: 'Museum',              value: 'Museum'              },
        { label: 'SportsActivityLocation', value: 'SportsActivityLocation' },
      ],
      defaultValue: 'TouristAttraction',
      admin: { description: 'Schema.org type used in JSON-LD output. Defaults to TouristAttraction — change for restaurants, bars etc.' },
    },

    // ── VISIBILITY ────────────────────────────────────────
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Featured places are shown on the homepage MapTeaser. Keep to 6–8 maximum.' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide from maps and lists without deleting the record.' },
    },
  ],
}
```

### Register in Payload config

In `payload.config.ts`, add `Places` to the `collections` array:

```typescript
import { Places } from './collections/Places'

export default buildConfig({
  collections: [
    // ... existing collections
    Places,
  ],
})
```

---

## Task 2 — Static JSON seed data

Create `/lib/data/places.json`. This file serves two purposes:

1. Development data layer before Payload is connected
2. Seed file for populating the Payload database on first run

The shape must exactly match the Payload collection field names so query functions require zero changes when switching from JSON to Payload API.

```json
[
  {
    "id": "hotel-berlin-berlin",
    "name": "Hotel Berlin, Berlin",
    "slug": "hotel-berlin-berlin",
    "context": "both",
    "type": "in-building",
    "category": "other",
    "shortDescription": "Lützowplatz 17 — 701 rooms, Lütze, FKKB, KTTK, and Wundermart all inside.",
    "shortDescriptionDE": "Lützowplatz 17 — 701 Zimmer, Lütze, FKKB, KTTK und Wundermart im Haus.",
    "location": { "lat": 52.5027, "lng": 13.3583 },
    "address": "Lützowplatz 17, 10785 Berlin",
    "walkingMinutes": null,
    "floor": null,
    "website": "https://hotel-berlin.de",
    "hours": null,
    "pinIcon": "building",
    "schemaType": "LodgingBusiness",
    "featured": true,
    "active": true
  },

  {
    "id": "lutze",
    "name": "Lütze",
    "slug": "lutze",
    "context": "both",
    "type": "in-building",
    "category": "restaurant",
    "shortDescription": "Italian deli-café, bar, and garden. Open to guests and Berliners. Daily from 10:00.",
    "shortDescriptionDE": "Italienisches Delikatessen-Café, Bar und Garten. Täglich ab 10:00.",
    "location": { "lat": 52.5027, "lng": 13.3583 },
    "address": "Lützowplatz 17, 10785 Berlin — ground floor",
    "walkingMinutes": null,
    "floor": "Ground floor",
    "website": "https://luetze-berlin.de",
    "hours": "Bar daily 10:00 – open end. Kitchen 11:30–15:00 and 17:00–22:30.",
    "pinIcon": "cafe",
    "schemaType": "Restaurant",
    "featured": false,
    "active": true
  },

  {
    "id": "kttk",
    "name": "KTTK — Königlicher Tischtennis Klub Berlin",
    "slug": "kttk",
    "context": "both",
    "type": "in-building",
    "category": "sport",
    "shortDescription": "Four JOOLA tables. Open to guests and Berliners. Thursday nights — tournament. No booking, no dress code.",
    "shortDescriptionDE": "Vier JOOLA-Tische. Für Gäste und Berliner. Donnerstags Turnier. Keine Reservierung, kein Dresscode.",
    "location": { "lat": 52.5027, "lng": 13.3583 },
    "address": "Lützowplatz 17, 10785 Berlin",
    "walkingMinutes": null,
    "floor": "B2 Basement",
    "website": "https://kttk-berlin.de",
    "hours": "Daily 13:00–23:00. Tournament Thu from 19:00.",
    "pinIcon": "sport",
    "schemaType": "SportsActivityLocation",
    "featured": false,
    "active": true
  },

  {
    "id": "fkkb",
    "name": "FKKB — Freiluft Kunst Klub Berlin",
    "slug": "fkkb",
    "context": "both",
    "type": "in-building",
    "category": "gallery",
    "shortDescription": "Artists in residence, murals on every floor, exhibitions that change and return. Independent — the hotel just gives it a home.",
    "shortDescriptionDE": "Künstler in Residenz, Wandbilder auf jeder Etage, wechselnde Ausstellungen. Unabhängig — das Hotel gibt ihnen Raum.",
    "location": { "lat": 52.5027, "lng": 13.3583 },
    "address": "Lützowplatz 17, 10785 Berlin — every floor",
    "walkingMinutes": null,
    "floor": "Every floor",
    "website": "https://fkkb.de",
    "hours": "Open during hotel hours. Free entry.",
    "pinIcon": "gallery",
    "schemaType": "ArtGallery",
    "featured": false,
    "active": true
  },

  {
    "id": "landwehrkanal",
    "name": "Landwehrkanal",
    "slug": "landwehrkanal",
    "context": "both",
    "type": "monument",
    "category": "park",
    "shortDescription": "Canalside walks, bookshops, bars, and neighbourhood life. 2 minutes south of the hotel.",
    "shortDescriptionDE": "Spaziergänge am Kanal, Buchläden, Bars und Kiez-Leben. 2 Minuten südlich vom Hotel.",
    "location": { "lat": 52.4998, "lng": 13.3583 },
    "address": "Landwehrkanal, 10785 Berlin",
    "walkingMinutes": 2,
    "walkingNote": "Walk south from the hotel — Corneliusbrücke is directly opposite.",
    "floor": null,
    "website": null,
    "hours": null,
    "pinIcon": "waves",
    "schemaType": "TouristAttraction",
    "featured": true,
    "active": true
  },

  {
    "id": "lutzowplatz-park",
    "name": "Lützowplatz Park",
    "slug": "lutzowplatz-park",
    "context": "both",
    "type": "monument",
    "category": "park",
    "shortDescription": "The square itself — Hercules sculpture, mature trees, and the contemporary art of Haus am Lützowplatz next door.",
    "shortDescriptionDE": "Der Platz selbst — Hercules-Skulptur, alte Bäume und nebenan das Haus am Lützowplatz.",
    "location": { "lat": 52.5022, "lng": 13.3558 },
    "address": "Lützowplatz, 10785 Berlin",
    "walkingMinutes": 2,
    "walkingNote": "Right outside the hotel entrance.",
    "floor": null,
    "website": null,
    "hours": "Open at all times.",
    "pinIcon": "park",
    "schemaType": "Park",
    "featured": true,
    "active": true
  },

  {
    "id": "haus-am-lutzowplatz",
    "name": "Haus am Lützowplatz",
    "slug": "haus-am-lutzowplatz",
    "context": "both",
    "type": "concierge",
    "category": "gallery",
    "shortDescription": "Contemporary art in a 19th-century building — German and international artists, free entry, consistently good.",
    "shortDescriptionDE": "Zeitgenössische Kunst in einem Gründerzeitgebäude — deutsche und internationale Künstler, freier Eintritt.",
    "location": { "lat": 52.5022, "lng": 13.3555 },
    "address": "Lützowplatz 9, 10785 Berlin",
    "walkingMinutes": 3,
    "walkingNote": "Walk along the square — you'll see it.",
    "floor": null,
    "website": "https://hausamluetzowplatz.de",
    "hours": "Tue–Sun 11:00–18:00. Free entry.",
    "pinIcon": "gallery",
    "schemaType": "ArtGallery",
    "featured": true,
    "active": true
  },

  {
    "id": "philharmonie",
    "name": "Berliner Philharmonie & Kulturforum",
    "slug": "philharmonie",
    "context": "outside",
    "type": "monument",
    "category": "culture",
    "shortDescription": "Hans Scharoun's golden hall — one of the world's great concert buildings. The Kulturforum museums are next door.",
    "shortDescriptionDE": "Hans Scharouns goldener Saal — eines der bedeutendsten Konzertgebäude der Welt. Die Kulturforum-Museen sind nebenan.",
    "location": { "lat": 52.5096, "lng": 13.3690 },
    "address": "Herbert-von-Karajan-Straße 1, 10785 Berlin",
    "walkingMinutes": 9,
    "walkingNote": "Walk east along Tiergartenstraße — follow the signs.",
    "floor": null,
    "website": "https://berliner-philharmoniker.de",
    "hours": "Box office daily 15:00–18:00 on performance days.",
    "pinIcon": "arch",
    "schemaType": "Museum",
    "featured": true,
    "active": true
  },

  {
    "id": "tiergarten",
    "name": "Tiergarten",
    "slug": "tiergarten",
    "context": "outside",
    "type": "monument",
    "category": "park",
    "shortDescription": "Berlin's great park — 210 hectares of paths, lakes, and the Siegessäule column at its centre. 10 minutes on foot.",
    "shortDescriptionDE": "Berlins großer Park — 210 Hektar Wege, Seen und die Siegessäule im Herzen. 10 Minuten zu Fuß.",
    "location": { "lat": 52.5145, "lng": 13.3505 },
    "address": "Großer Tiergarten, 10785 Berlin",
    "walkingMinutes": 10,
    "walkingNote": "Cross Corneliusbrücke and head north.",
    "floor": null,
    "website": null,
    "hours": "Open at all times.",
    "pinIcon": "park",
    "schemaType": "Park",
    "featured": true,
    "active": true
  },

  {
    "id": "potsdamer-platz",
    "name": "Potsdamer Platz",
    "slug": "potsdamer-platz",
    "context": "outside",
    "type": "monument",
    "category": "culture",
    "shortDescription": "Sony Center, cinema, and the rebuilt square that was Berlin's Cold War scar. 14 minutes east.",
    "shortDescriptionDE": "Sony Center, Kino und der wiedergeborene Platz, der einst Berlins Kalter-Krieg-Wunde war. 14 Minuten östlich.",
    "location": { "lat": 52.5096, "lng": 13.3760 },
    "address": "Potsdamer Platz, 10785 Berlin",
    "walkingMinutes": 14,
    "walkingNote": "Walk east along Potsdamer Straße.",
    "floor": null,
    "website": null,
    "hours": null,
    "pinIcon": "arch",
    "schemaType": "TouristAttraction",
    "featured": true,
    "active": true
  },

  {
    "id": "kadwe",
    "name": "KaDeWe",
    "slug": "kadwe",
    "context": "outside",
    "type": "monument",
    "category": "shop",
    "shortDescription": "Europe's second-largest department store — the food hall on the sixth floor is the reason to go. 15 minutes walk.",
    "shortDescriptionDE": "Europas zweitgrößtes Kaufhaus — die Feinkostabteilung im sechsten Stock ist der eigentliche Grund. 15 Minuten zu Fuß.",
    "location": { "lat": 52.4985, "lng": 13.3430 },
    "address": "Tauentzienstraße 21–24, 10789 Berlin",
    "walkingMinutes": 15,
    "walkingNote": "Walk south via Nollendorfplatz.",
    "floor": null,
    "website": "https://kadewe.de",
    "hours": "Mon–Thu 10:00–20:00, Fri 10:00–21:00, Sat 09:30–21:00.",
    "pinIcon": "shop",
    "schemaType": "LocalBusiness",
    "featured": false,
    "active": true
  },

  {
    "id": "cafe-am-neuen-see",
    "name": "Café am Neuen See",
    "slug": "cafe-am-neuen-see",
    "context": "both",
    "type": "concierge",
    "category": "cafe",
    "shortDescription": "Boathouse café inside Tiergarten. Rent a pedalo, drink a beer on the terrace, forget the city exists. Worth the walk.",
    "shortDescriptionDE": "Bootshaus-Café im Tiergarten. Tretboot mieten, Bier auf der Terrasse trinken, die Stadt vergessen. Den Weg wert.",
    "location": { "lat": 52.5139, "lng": 13.3471 },
    "address": "Lichtensteinallee 2, 10787 Berlin",
    "walkingMinutes": 15,
    "walkingNote": "Walk into Tiergarten from Corneliusbrücke — follow the path to the lake.",
    "floor": null,
    "website": "https://cafeamneuensee.de",
    "hours": "Daily from 10:00 (weather permitting, April–October).",
    "pinIcon": "cafe",
    "schemaType": "CafeOrCoffeeShop",
    "featured": false,
    "active": true
  },

  {
    "id": "potsdamer-strasse-galleries",
    "name": "Potsdamer Straße gallery district",
    "slug": "potsdamer-strasse-galleries",
    "context": "both",
    "type": "concierge",
    "category": "gallery",
    "shortDescription": "Berlin's emerging gallery strip — Blain|Southern, Capitain Petzel, and others in a 10-minute stretch. Go on a Thursday evening.",
    "shortDescriptionDE": "Berlins aufstrebende Galerienmeile — Blain|Southern, Capitain Petzel und andere auf 10 Gehminuten. Am besten donnerstagabends.",
    "location": { "lat": 52.5060, "lng": 13.3650 },
    "address": "Potsdamer Straße, 10785 Berlin",
    "walkingMinutes": 10,
    "walkingNote": "Walk east along Lützowstraße, turn onto Potsdamer Straße.",
    "floor": null,
    "website": null,
    "hours": "Most galleries Tue–Sat 11:00–18:00.",
    "pinIcon": "gallery",
    "schemaType": "ArtGallery",
    "featured": false,
    "active": true
  },

  {
    "id": "lutzowufer-walk",
    "name": "Lützowufer canalside walk",
    "slug": "lutzowufer-walk",
    "context": "both",
    "type": "concierge",
    "category": "park",
    "shortDescription": "The canal path running south from the hotel. Good for an evening walk, a morning run, or just standing by the water.",
    "shortDescriptionDE": "Der Kanalweg südlich vom Hotel. Gut für einen Abendspaziergang, eine Morgenrunde oder einfach am Wasser stehen.",
    "location": { "lat": 52.4998, "lng": 13.3560 },
    "address": "Lützowufer, 10785 Berlin",
    "walkingMinutes": 2,
    "walkingNote": "Cross the road at Corneliusbrücke — the path runs east and west along the canal.",
    "floor": null,
    "website": null,
    "hours": "Open at all times.",
    "pinIcon": "waves",
    "schemaType": "TouristAttraction",
    "featured": false,
    "active": true
  }
]
```

---

## Task 3 — Query functions

Create `/lib/queries/places.ts`. These functions are the only interface between the data layer and the components. Payload API calls replace the JSON reads later with zero component changes.

```typescript
import placesData from '@/lib/data/places.json'

export type PlaceContext = 'outside' | 'inside' | 'both'
export type PlaceType    = 'monument' | 'concierge' | 'in-building'

export interface Place {
  id: string
  name: string
  slug: string
  context: PlaceContext
  type: PlaceType
  category: string
  shortDescription: string
  shortDescriptionDE?: string
  location: { lat: number; lng: number }
  address?: string
  walkingMinutes?: number
  walkingNote?: string
  floor?: string
  website?: string
  hours?: string
  pinIcon: string
  schemaType: string
  featured: boolean
  active: boolean
}

const places = placesData as Place[]

// All active places
export function getAllPlaces(): Place[] {
  return places.filter(p => p.active)
}

// Places for a given map context
// 'outside' returns context=outside AND context=both
// 'inside' returns context=inside AND context=both
export function getPlacesForContext(ctx: PlaceContext): Place[] {
  return places.filter(p => p.active && (p.context === ctx || p.context === 'both'))
}

// Featured places only — for MapTeaser homepage component
export function getFeaturedPlaces(): Place[] {
  return places.filter(p => p.active && p.featured)
}

// Single place by slug
export function getPlaceBySlug(slug: string): Place | undefined {
  return places.find(p => p.slug === slug && p.active)
}

// In-building places only — for /here context directory
export function getInBuildingPlaces(): Place[] {
  return places.filter(p => p.active && p.type === 'in-building')
}

// Concierge picks — the team's recommendations
export function getConciergepicks(): Place[] {
  return places.filter(p => p.active && p.type === 'concierge')
}
```

---

## Task 4 — JSON-LD schema output

Each place should generate a JSON-LD block for AEO/GEO purposes. Create `/lib/schema/placeSchema.ts`:

```typescript
import { Place } from '@/lib/queries/places'

export function placeToJsonLd(place: Place): object {
  return {
    '@context': 'https://schema.org',
    '@type': place.schemaType,
    '@id': `https://hotel-berlin.de/neighbourhood#${place.slug}`,
    name: place.name,
    description: place.shortDescription,
    ...(place.address && { address: place.address }),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: place.location.lat,
      longitude: place.location.lng,
    },
    ...(place.website && { url: place.website }),
    ...(place.walkingMinutes && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'walkingMinutesFromHotel',
        value: place.walkingMinutes,
      },
    }),
    containedInPlace: {
      '@type': 'Hotel',
      '@id': 'https://hotel-berlin.de/#hotel',
      name: 'Hotel Berlin, Berlin',
    },
  }
}
```

---

## Task 5 — Payload seed script

Create `/scripts/seedPlaces.ts`. Runs once to populate the Payload database from the JSON file. Should be idempotent — safe to run multiple times without creating duplicates.

```typescript
import payload from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import placesData from '../lib/data/places.json'

async function seed() {
  const payloadInstance = await getPayload({ config })

  for (const place of placesData) {
    const existing = await payloadInstance.find({
      collection: 'places',
      where: { slug: { equals: place.slug } },
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping existing place: ${place.name}`)
      continue
    }

    await payloadInstance.create({
      collection: 'places',
      data: place,
    })

    console.log(`Created: ${place.name}`)
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
```

Add to `package.json` scripts:

```json
"seed:places": "tsx scripts/seedPlaces.ts"
```

---

## Task 6 — Payload admin UI improvements

These small additions make the collection easier for hotel staff to use.

### List view — add a coloured context badge

In the admin `defaultColumns`, `context` is already included. Payload's select fields render the label by default which is verbose. Add a custom cell component to render a coloured badge instead. File: `src/components/admin/ContextBadge.tsx`.

Badge colours to match the site:
- `outside` → amber `#F79B2E` background
- `inside` → teal `#7ab8b0` background  
- `both` → dark purple `#4a4a6a` background

### Conditional field display

Hide `walkingMinutes` and `walkingNote` when `type === 'in-building'`. Show `floor` only when `type === 'in-building'`. Payload supports this with the `condition` property on fields:

```typescript
{
  name: 'floor',
  type: 'text',
  admin: {
    condition: (data) => data.type === 'in-building',
    description: 'e.g. "Ground floor", "B2 Basement", "Every floor"',
  },
},
{
  name: 'walkingMinutes',
  type: 'number',
  admin: {
    condition: (data) => data.type !== 'in-building',
  },
},
```

### afterChange hook — trigger ISR revalidation

When a place is created, updated, or deleted, the neighbourhood page should revalidate. Add to the collection config:

```typescript
hooks: {
  afterChange: [
    async ({ req }) => {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hotel-berlin.de'
      await fetch(`${baseUrl}/api/revalidate?path=/neighbourhood&secret=${process.env.REVALIDATE_SECRET}`)
      await fetch(`${baseUrl}/api/revalidate?path=/here/explore&secret=${process.env.REVALIDATE_SECRET}`)
    },
  ],
},
```

---

## Definition of done

- [ ] `src/collections/Places.ts` created and registered in `payload.config.ts`
- [ ] `lib/data/places.json` created with all 14 seed records
- [ ] `lib/queries/places.ts` created with all six query functions
- [ ] `lib/schema/placeSchema.ts` created
- [ ] `scripts/seedPlaces.ts` created and `seed:places` npm script added
- [ ] Conditional field display working in Payload admin (`floor` / `walkingMinutes`)
- [ ] `afterChange` hook triggers ISR revalidation on `/neighbourhood` and `/here/explore`
- [ ] `npm run seed:places` runs without errors and creates 14 records in Payload
- [ ] TypeScript compiles cleanly — no `any` types
- [ ] All query functions return correctly typed `Place[]` or `Place | undefined`

---

## Environment variables required

```
NEXT_PUBLIC_SITE_URL=https://hotel-berlin.de
REVALIDATE_SECRET=<generate a random string>
```

---

## Notes for Cursor

- Do not change any existing collection schemas — this is an additive task only
- The JSON seed data is the source of truth for coordinates and copy — do not invent or approximate values
- The `containedInPlace` in the JSON-LD output creates the semantic link between neighbourhood places and the hotel entity — this is important for AEO/GEO and must not be omitted
- Walking times are editorial, not calculated — the `walkingMinutes` field is a number the team fills in, not a computed value from coordinates
- The four concierge picks (Café am Neuen See, Haus am Lützowplatz, Potsdamer Straße galleries, Lützowufer walk) are test data — the hotel team will replace or supplement these with their own picks via the Payload admin UI
- In-building places (Lütze, KTTK, FKKB) share the hotel's lat/lng because they are at the same address — this is correct, not an error

---

*Hotel Berlin, Berlin — Places Collection Build Brief · June 2026*
*Next brief: `<MapTeaser>` and `<NeighbourhoodMap>` component build*
