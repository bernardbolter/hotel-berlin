# Hotel Berlin, Berlin — Rooms Collection Addendum
*For Cursor / Claude Opus*
*Addendum to: HotelBerlin_RoomsHero_BuildBrief.md*
*Scope: Schema additions to existing Rooms.ts · Amenity tags collection update · Icon mapping · Bilingual seed copy rewrite*
*Stack: Next.js 15 · Payload CMS 3 · Tailwind CSS · Lucide React*

---

## How to use this brief

The `Rooms` collection already exists at `src/collections/Rooms.ts`. **Do not rewrite it from scratch.** This brief specifies:

1. Fields to **add** to the existing schema
2. Fields to **correct** (wrong type or missing options)
3. A `lucideIcon` field to add to the existing `tags` collection
4. Full amenity tag seed data with icon names
5. Complete bilingual seed data for all 11 room records — rewritten to voice guide standard

Cursor should read the existing `Rooms.ts` first, then apply the changes below. Where a field already exists with a compatible type, leave it. Where a field is missing or mismatched, apply the correction described.

---

## Part 1 — Schema additions to `Rooms.ts`

### Fields to add

Add these fields to the `fields` array in `Rooms.ts`. Insert them in the logical position noted.

#### After `occupancy` group — add `childAgeMin`

```typescript
{
  name: 'childAgeMin',
  type: 'number',
  label: 'Minimum child age (years)',
  admin: { description: 'e.g. 5 for bunk beds. Leave blank if no child restriction.' },
},
```

#### After `childAgeMin` — add bathroom fields

```typescript
{
  name: 'bathroomLabel',
  type: 'select',
  label: 'Bathroom type',
  admin: { description: 'Short label shown in spec strip on homepage and room cards.' },
  options: [
    { label: 'Shower',        value: 'shower' },
    { label: 'Rain shower',   value: 'rain-shower' },
    { label: 'Bath & shower', value: 'bath-shower' },
    { label: 'Spa bathroom',  value: 'spa-bathroom' },
  ],
},
{
  name: 'bathroomDescription',
  type: 'text',
  label: 'Bathroom description (full)',
  admin: { description: 'Used on the room detail page. e.g. "Mini SPA bathroom — 2 basins, freestanding tub, walk-in rain shower, makeup table"' },
},
```

#### After `bathroomDescription` — add feature booleans

```typescript
{
  name: 'hasBalcony',
  type: 'checkbox',
  defaultValue: false,
  label: 'Has balcony',
  admin: { description: 'Some Premium rooms only.' },
},
{
  name: 'hasSauna',
  type: 'checkbox',
  defaultValue: false,
  label: 'Has private sauna',
  admin: { description: 'Studio 45 only.' },
},
{
  name: 'hasSeparateLiving',
  type: 'checkbox',
  defaultValue: false,
  label: 'Has separate living area',
},
{
  name: 'isAccessible',
  type: 'checkbox',
  defaultValue: false,
  label: 'Wheelchair accessible',
},
{
  name: 'accessibilityFeatures',
  type: 'richText',
  label: 'Accessibility features detail',
  admin: { condition: (data) => data.isAccessible },
},
```

#### Replace `storyConnection` group — use proper relationship

The existing `storyConnection` group has a checkbox and a teaser text field. Replace the entire group with a proper relationship field:

```typescript
// REMOVE this:
{
  name: 'storyConnection',
  type: 'group',
  ...
}

// REPLACE WITH:
{
  name: 'insiderStory',
  type: 'relationship',
  relationTo: 'insider-stories',
  label: 'You, Me & Berlin — insider story',
  admin: { description: 'Link to the insider profile whose story lives in this room.' },
},
```

#### Add `adminColumns` to collection config

Add `defaultColumns` to the `admin` object at the top of the collection:

```typescript
admin: {
  useAsTitle: 'name',
  defaultColumns: ['name', 'fromPrice', 'floorSizeM2', 'bathroomLabel', 'featured', 'displayOrder'],
},
```

### Fields to correct

#### `bedConfiguration.type` — add missing options

The existing select is missing `double` (Individual room) and `king-freestanding` (Studio 45). Add both:

```typescript
options: [
  { label: 'Double (140×200cm)',             value: 'double' },
  { label: 'Queen (160×200cm)',               value: 'queen' },
  { label: 'King (180×200cm)',                value: 'king' },
  { label: 'King freestanding (200×210cm)',   value: 'king-freestanding' },
  { label: 'Twin (2× 90×200cm)',              value: 'twin' },
  { label: 'Bunk beds (2× 90×200cm)',         value: 'bunk' },
],
```

#### `currency` — make read-only

```typescript
{ name: 'currency', type: 'text', defaultValue: 'EUR', admin: { readOnly: true } },
```

---

## Part 2 — `tags` collection: add `lucideIcon` field

The existing `tags` collection is being used for amenities via `type: 'amenity'`. Add a `lucideIcon` field to the tags collection so each amenity tag stores its icon name.

Locate `src/collections/Tags.ts` (or equivalent) and add:

```typescript
{
  name: 'lucideIcon',
  type: 'text',
  label: 'Lucide icon name',
  admin: {
    description: 'Exact PascalCase component name from lucide-react. e.g. "Wifi", "BedDouble", "ShowerHead". Leave blank if no icon needed.',
    condition: (data) => data.type === 'amenity',
  },
},
```

### Component usage

In any component rendering amenity tags, resolve the icon dynamically:

```typescript
import dynamic from 'next/dynamic'
import * as LucideIcons from 'lucide-react'

function AmenityIcon({ iconName, size = 15 }: { iconName: string; size?: number }) {
  const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as React.FC<{ size: number; 'aria-hidden': string }>
  if (!Icon) return null
  return <Icon size={size} aria-hidden="true" />
}
```

---

## Part 3 — Amenity tag seed data

Seed these records into the `tags` collection with `type: 'amenity'`. These cover every amenity listed on the current hotel-berlin.de rooms pages.

```typescript
const amenityTags = [
  // Connectivity
  { name: 'Free WiFi',              slug: 'free-wifi',              type: 'amenity', lucideIcon: 'Wifi' },

  // Sleep
  { name: 'King bed',               slug: 'king-bed',               type: 'amenity', lucideIcon: 'BedDouble' },
  { name: 'King bed freestanding',  slug: 'king-bed-freestanding',  type: 'amenity', lucideIcon: 'BedDouble' },
  { name: 'Queen bed',              slug: 'queen-bed',              type: 'amenity', lucideIcon: 'BedDouble' },
  { name: 'Twin beds',              slug: 'twin-beds',              type: 'amenity', lucideIcon: 'Bed' },
  { name: 'Double bed',             slug: 'double-bed',             type: 'amenity', lucideIcon: 'Bed' },
  { name: 'Bunk beds',              slug: 'bunk-beds',              type: 'amenity', lucideIcon: 'BedSingle' },

  // Bathroom
  { name: 'Shower',                 slug: 'shower',                 type: 'amenity', lucideIcon: 'ShowerHead' },
  { name: 'Rain shower',            slug: 'rain-shower',            type: 'amenity', lucideIcon: 'ShowerHead' },
  { name: 'Bath & shower',          slug: 'bath-shower',            type: 'amenity', lucideIcon: 'Bath' },
  { name: 'Spa bathroom',           slug: 'spa-bathroom',           type: 'amenity', lucideIcon: 'Bath' },
  { name: 'Separate guest WC',      slug: 'separate-wc',            type: 'amenity', lucideIcon: 'Toilet' },
  { name: 'Hair dryer',             slug: 'hair-dryer',             type: 'amenity', lucideIcon: 'Wind' },

  // Climate
  { name: 'Air conditioning',       slug: 'air-conditioning',       type: 'amenity', lucideIcon: 'AirVent' },
  { name: 'Adjustable AC',          slug: 'adjustable-ac',          type: 'amenity', lucideIcon: 'Thermometer' },
  { name: 'Sound-proof windows',    slug: 'soundproof-windows',     type: 'amenity', lucideIcon: 'VolumeOff' },

  // Technology
  { name: '42" TV',                 slug: 'tv-42',                  type: 'amenity', lucideIcon: 'Tv' },
  { name: '49" TV',                 slug: 'tv-49',                  type: 'amenity', lucideIcon: 'Tv' },
  { name: '55" TV',                 slug: 'tv-55',                  type: 'amenity', lucideIcon: 'Tv' },
  { name: '2× TVs',                 slug: 'tv-dual',                type: 'amenity', lucideIcon: 'Tv2' },
  { name: 'Teufel sound system',    slug: 'teufel-sound',           type: 'amenity', lucideIcon: 'Speaker' },
  { name: 'DJ deck',                slug: 'dj-deck',                type: 'amenity', lucideIcon: 'Disc3' },
  { name: 'High-end sound system',  slug: 'hifi-sound',             type: 'amenity', lucideIcon: 'AudioLines' },
  { name: 'Instruments',            slug: 'instruments',            type: 'amenity', lucideIcon: 'Music' },
  { name: '200 records',            slug: 'vinyl-collection',       type: 'amenity', lucideIcon: 'Disc3' },

  // In-room provisions
  { name: 'Nespresso machine',      slug: 'nespresso',              type: 'amenity', lucideIcon: 'Coffee' },
  { name: 'Tea facilities',         slug: 'tea',                    type: 'amenity', lucideIcon: 'Coffee' },
  { name: 'Room safe',              slug: 'room-safe',              type: 'amenity', lucideIcon: 'LockKeyhole' },
  { name: 'Refrigerator',           slug: 'refrigerator',           type: 'amenity', lucideIcon: 'Refrigerator' },
  { name: 'Minibar',                slug: 'minibar',                type: 'amenity', lucideIcon: 'Wine' },

  // Space & layout
  { name: 'Desk',                   slug: 'desk',                   type: 'amenity', lucideIcon: 'Laptop' },
  { name: 'Work & dining area',     slug: 'work-dining',            type: 'amenity', lucideIcon: 'UtensilsCrossed' },
  { name: 'Seating area',           slug: 'seating-area',           type: 'amenity', lucideIcon: 'Sofa' },
  { name: 'Foldout sofa',           slug: 'foldout-sofa',           type: 'amenity', lucideIcon: 'Sofa' },
  { name: 'Separate living area',   slug: 'separate-living',        type: 'amenity', lucideIcon: 'LayoutPanelLeft' },
  { name: 'Floor-to-ceiling windows', slug: 'ftc-windows',          type: 'amenity', lucideIcon: 'Maximize' },
  { name: 'Parquet flooring',       slug: 'parquet',                type: 'amenity', lucideIcon: 'Grid2x2' },
  { name: 'Dimmable lighting',      slug: 'dimmable-lighting',      type: 'amenity', lucideIcon: 'Lightbulb' },
  { name: 'Balcony',                slug: 'balcony',                type: 'amenity', lucideIcon: 'Flower2' },

  // Wellness
  { name: 'Private sauna',          slug: 'private-sauna',          type: 'amenity', lucideIcon: 'Flame' },

  // Hotel-wide
  { name: 'Non-smoking',            slug: 'non-smoking',            type: 'amenity', lucideIcon: 'CigaretteOff' },
  { name: 'Adjoining rooms',        slug: 'adjoining-rooms',        type: 'amenity', lucideIcon: 'DoorOpen' },
  { name: 'Wheelchair accessible',  slug: 'accessible',             type: 'amenity', lucideIcon: 'Accessibility' },
  { name: 'Pet friendly',           slug: 'pet-friendly',           type: 'amenity', lucideIcon: 'PawPrint' },

  // Berlin character
  { name: 'Berlin door headboards', slug: 'berlin-doors',           type: 'amenity', lucideIcon: 'DoorClosed' },
  { name: 'You, Me & Berlin map',   slug: 'ymb-map',                type: 'amenity', lucideIcon: 'MapPin' },
  { name: 'Books',                  slug: 'books',                  type: 'amenity', lucideIcon: 'BookOpen' },

  // Views
  { name: 'Garden view',            slug: 'garden-view',            type: 'amenity', lucideIcon: 'Trees' },
  { name: 'Lützowplatz view',       slug: 'luetzowplatz-view',      type: 'amenity', lucideIcon: 'Building2' },
]
```

---

## Part 4 — Bilingual seed data, all 11 rooms

All copy rewritten to the Hotel Berlin, Berlin voice & tone standard:
- `du` throughout (not `Sie`)
- No superlatives without evidence
- No empty institutional claims
- Short, direct sentences
- German written natively — not translated from English
- English: accessible, warm, never bland

Amenity slugs reference the seed tags above.

---

### Individual

```json
{
  "name": { "en": "Individual", "de": "Einzelzimmer" },
  "slug": "individual",
  "featured": true,
  "displayOrder": 1,
  "shortDescription": {
    "en": "A comfortable room with a double bed, fridge, and everything you need for a good night in Berlin.",
    "de": "Ein ruhiges Zimmer mit Doppelbett, Kühlschrank und allem, was du für eine gute Nacht in Berlin brauchst."
  },
  "fromPrice": 72.25,
  "floorSizeM2": null,
  "bedConfiguration": {
    "type": "double",
    "details": "Double bed"
  },
  "occupancy": { "maxAdults": 2, "maxChildren": 0, "maxTotal": 2 },
  "bathroomLabel": "shower",
  "bathroomDescription": "Bathroom with shower and hair dryer",
  "hasBalcony": false,
  "hasSauna": false,
  "hasSeparateLiving": false,
  "isAccessible": false,
  "bookingUrl": "https://www.radissonhotels.com/en-us/hotels/radisson-individuals-berlin/rooms",
  "amenities": ["non-smoking", "free-wifi", "double-bed", "shower", "nespresso", "tea", "room-safe", "tv-42", "teufel-sound", "refrigerator", "berlin-doors", "ymb-map", "air-conditioning"]
}
```

---

### Cosy Small

```json
{
  "name": { "en": "Cosy Small", "de": "Gemütliches Kleines Zimmer" },
  "slug": "cosy-small",
  "featured": true,
  "displayOrder": 2,
  "shortDescription": {
    "en": "King or queen bed, rain shower, and everything you need — nothing more. A good room for getting on with Berlin.",
    "de": "Kingsize- oder Queensize-Bett, Regendusche, alles Wichtige. Ein gutes Zimmer, um Berlin wirklich zu erleben."
  },
  "fromPrice": 72.25,
  "floorSizeM2": null,
  "bedConfiguration": {
    "type": "queen",
    "details": "King or Queen on request"
  },
  "occupancy": { "maxAdults": 2, "maxChildren": 0, "maxTotal": 2 },
  "bathroomLabel": "rain-shower",
  "bathroomDescription": "Bathroom with rain shower and hair dryer",
  "hasBalcony": false,
  "hasSauna": false,
  "hasSeparateLiving": false,
  "isAccessible": false,
  "bookingUrl": "https://www.radissonhotels.com/en-us/hotels/radisson-individuals-berlin/rooms",
  "amenities": ["non-smoking", "free-wifi", "queen-bed", "rain-shower", "nespresso", "tea", "room-safe", "tv-42", "teufel-sound", "refrigerator", "berlin-doors", "ymb-map", "air-conditioning"]
}
```

---

### Standard

```json
{
  "name": { "en": "Standard", "de": "Standard" },
  "slug": "standard",
  "featured": true,
  "displayOrder": 3,
  "shortDescription": {
    "en": "No two are alike. Every Standard room carries its own piece of Berlin — a face, a neighbourhood, a story on the wall.",
    "de": "Kein Standardzimmer gleicht dem anderen. Jedes trägt sein eigenes Stück Berlin — ein Gesicht, ein Kiez, eine Geschichte."
  },
  "fromPrice": 72.25,
  "floorSizeM2": null,
  "bedConfiguration": {
    "type": "queen",
    "details": "Queen bed (160×200cm)"
  },
  "occupancy": { "maxAdults": 2, "maxChildren": 0, "maxTotal": 2 },
  "bathroomLabel": "shower",
  "bathroomDescription": "Bathroom with shower and hair dryer",
  "hasBalcony": false,
  "hasSauna": false,
  "hasSeparateLiving": false,
  "isAccessible": false,
  "bookingUrl": "https://www.radissonhotels.com/en-us/hotels/radisson-individuals-berlin/rooms?&roomtypeid=411336",
  "amenities": ["non-smoking", "free-wifi", "queen-bed", "shower", "nespresso", "tea", "room-safe", "tv-42", "teufel-sound", "refrigerator", "berlin-doors", "ymb-map", "air-conditioning", "desk"]
}
```

---

### Superior

```json
{
  "name": { "en": "Superior", "de": "Superior" },
  "slug": "superior",
  "featured": true,
  "displayOrder": 4,
  "shortDescription": {
    "en": "More space, a proper desk, and a You, Me & Berlin story from someone who knows the neighbourhood. King or twin.",
    "de": "Mehr Platz, ein richtiger Schreibtisch und eine You, Me & Berlin-Geschichte von jemandem, der den Kiez kennt. King oder Twin."
  },
  "fromPrice": 80.75,
  "floorSizeM2": 20,
  "bedConfiguration": {
    "type": "king",
    "details": "King (180×200cm) or Twin (2× 90×200cm) on request"
  },
  "occupancy": { "maxAdults": 2, "maxChildren": 0, "maxTotal": 2 },
  "bathroomLabel": "shower",
  "bathroomDescription": "Bathroom with shower and hair dryer",
  "hasBalcony": false,
  "hasSauna": false,
  "hasSeparateLiving": false,
  "isAccessible": false,
  "bookingUrl": "https://www.radissonhotels.com/en-us/hotels/radisson-individuals-berlin/rooms?&roomtypeid=411337",
  "amenities": ["non-smoking", "free-wifi", "king-bed", "twin-beds", "shower", "nespresso", "tea", "room-safe", "tv-49", "teufel-sound", "refrigerator", "berlin-doors", "ymb-map", "adjustable-ac", "desk", "garden-view", "luetzowplatz-view"]
}
```

---

### Family

```json
{
  "name": { "en": "Family", "de": "Familienzimmer" },
  "slug": "family",
  "featured": true,
  "displayOrder": 5,
  "shortDescription": {
    "en": "Room for four. Two bunk beds (for ages 5 and up), a proper double, and Berlin stories to fall asleep to.",
    "de": "Platz für vier. Zwei Etagenbetten ab 5 Jahren, ein richtiges Doppelbett und Berliner Geschichten zum Einschlafen."
  },
  "fromPrice": 97.75,
  "floorSizeM2": null,
  "bedConfiguration": {
    "type": "king",
    "details": "King (180×200cm) or Twin (2× 90×200cm) — plus 2 bunk beds (90×200cm, ages 5+)"
  },
  "occupancy": { "maxAdults": 2, "maxChildren": 2, "maxTotal": 4 },
  "childAgeMin": 5,
  "bathroomLabel": "shower",
  "bathroomDescription": "Bathroom with shower and hair dryer",
  "hasBalcony": false,
  "hasSauna": false,
  "hasSeparateLiving": false,
  "isAccessible": false,
  "bookingUrl": "https://www.radissonhotels.com/en-us/hotels/radisson-individuals-berlin/rooms?&roomtypeid=447858",
  "amenities": ["non-smoking", "free-wifi", "king-bed", "bunk-beds", "shower", "nespresso", "tea", "room-safe", "tv-42", "teufel-sound", "refrigerator", "berlin-doors", "ymb-map", "air-conditioning"]
}
```

---

### Premium Family

```json
{
  "name": { "en": "Premium Family", "de": "Premium Family" },
  "slug": "premium-family",
  "featured": true,
  "displayOrder": 6,
  "shortDescription": {
    "en": "Space for six. Four bunk beds, a double, and enough room for everyone to have their own corner of Berlin.",
    "de": "Platz für sechs. Vier Etagenbetten, ein Doppelbett und genug Raum, damit jeder seine eigene Ecke Berlin bekommt."
  },
  "fromPrice": 92.65,
  "floorSizeM2": null,
  "bedConfiguration": {
    "type": "king",
    "details": "King (180×200cm) or Twin (2× 90×200cm) — plus 4 bunk beds (90×200cm, ages 5+)"
  },
  "occupancy": { "maxAdults": 2, "maxChildren": 4, "maxTotal": 6 },
  "childAgeMin": 5,
  "bathroomLabel": "shower",
  "bathroomDescription": "Bathroom with shower and hair dryer",
  "hasBalcony": false,
  "hasSauna": false,
  "hasSeparateLiving": false,
  "isAccessible": false,
  "bookingUrl": "https://www.radissonhotels.com/en-us/hotels/radisson-individuals-berlin/rooms?&roomtypeid=414527",
  "amenities": ["non-smoking", "free-wifi", "king-bed", "bunk-beds", "shower", "nespresso", "tea", "room-safe", "tv-42", "teufel-sound", "refrigerator", "berlin-doors", "ymb-map", "air-conditioning"]
}
```

---

### Premium

```json
{
  "name": { "en": "Premium", "de": "Premium" },
  "slug": "premium",
  "featured": true,
  "displayOrder": 7,
  "shortDescription": {
    "en": "Quiet, generous, and genuinely calm. Wellness bathroom, king bed, and some rooms with a private balcony.",
    "de": "Ruhig, großzügig, wirklich entspannt. Wellness-Bad, Kingsize-Bett — und manche Zimmer mit eigenem Balkon."
  },
  "fromPrice": 106.25,
  "floorSizeM2": null,
  "bedConfiguration": {
    "type": "king",
    "details": "King bed (180×200cm)"
  },
  "occupancy": { "maxAdults": 2, "maxChildren": 0, "maxTotal": 2 },
  "bathroomLabel": "bath-shower",
  "bathroomDescription": "Wellness bathroom with bath, shower and hair dryer",
  "hasBalcony": true,
  "hasSauna": false,
  "hasSeparateLiving": false,
  "isAccessible": false,
  "bookingUrl": "https://www.radissonhotels.com/en-us/hotels/radisson-individuals-berlin/rooms?&roomtypeid=411338",
  "amenities": ["non-smoking", "free-wifi", "king-bed", "bath-shower", "nespresso", "tea", "room-safe", "tv-49", "teufel-sound", "refrigerator", "berlin-doors", "adjustable-ac", "seating-area", "balcony", "garden-view"]
}
```

---

### Junior Suite

```json
{
  "name": { "en": "Junior Suite", "de": "Junior Suite" },
  "slug": "junior-suite",
  "featured": true,
  "displayOrder": 8,
  "shortDescription": {
    "en": "A proper suite with a king bed, seating area, and separate bathroom. More space to settle in.",
    "de": "Eine echte Suite: Kingsize-Bett, Sitzbereich, separates Bad. Mehr Platz zum Ankommen."
  },
  "fromPrice": 122.40,
  "floorSizeM2": null,
  "bedConfiguration": {
    "type": "king",
    "details": "King bed (180×200cm)"
  },
  "occupancy": { "maxAdults": 2, "maxChildren": 0, "maxTotal": 2 },
  "bathroomLabel": "bath-shower",
  "bathroomDescription": "Separate bathroom and guest WC",
  "hasBalcony": false,
  "hasSauna": false,
  "hasSeparateLiving": true,
  "isAccessible": false,
  "bookingUrl": "https://www.radissonhotels.com/en-us/hotels/radisson-individuals-berlin/rooms?&roomtypeid=411339",
  "amenities": ["non-smoking", "free-wifi", "king-bed", "bath-shower", "separate-wc", "nespresso", "tea", "room-safe", "tv-49", "teufel-sound", "refrigerator", "berlin-doors", "adjustable-ac", "seating-area", "separate-living", "desk"]
}
```

---

### Suite — One Bedroom

```json
{
  "name": { "en": "Suite — One Bedroom", "de": "Suite mit einem Schlafzimmer" },
  "slug": "suite-one-bedroom",
  "featured": true,
  "displayOrder": 9,
  "shortDescription": {
    "en": "Living room, bedroom, king bed, private bathroom. Room to be in Berlin without being out in it.",
    "de": "Wohnzimmer, Schlafzimmer, Kingsize-Bett, eigenes Bad. Raum, um in Berlin zu sein, ohne draußen sein zu müssen."
  },
  "fromPrice": 122.40,
  "floorSizeM2": null,
  "bedConfiguration": {
    "type": "king",
    "details": "King bed (180×200cm)"
  },
  "occupancy": { "maxAdults": 2, "maxChildren": 0, "maxTotal": 2 },
  "bathroomLabel": "bath-shower",
  "bathroomDescription": "Separate bathroom and guest WC",
  "hasBalcony": false,
  "hasSauna": false,
  "hasSeparateLiving": true,
  "isAccessible": false,
  "bookingUrl": "https://www.radissonhotels.com/en-us/hotels/radisson-individuals-berlin/rooms?&roomtypeid=411340",
  "amenities": ["non-smoking", "free-wifi", "king-bed", "bath-shower", "separate-wc", "nespresso", "tea", "room-safe", "tv-49", "teufel-sound", "refrigerator", "berlin-doors", "adjustable-ac", "seating-area", "separate-living", "desk", "work-dining"]
}
```

---

### Corner Suite

```json
{
  "name": { "en": "Corner Suite", "de": "Corner Suite" },
  "slug": "corner-suite",
  "featured": true,
  "displayOrder": 10,
  "shortDescription": {
    "en": "57m². King bed, wellness bathroom, lounge corner. Berlin at its least hectic — which turns out to be very good.",
    "de": "57 m². Kingsize-Bett, Wellness-Bad, Sofa-Ecke. Berlin von seiner ruhigsten Seite — und die ist wirklich gut."
  },
  "fromPrice": 173.40,
  "floorSizeM2": 57,
  "bedConfiguration": {
    "type": "king",
    "details": "King bed (180×200cm)"
  },
  "occupancy": { "maxAdults": 2, "maxChildren": 0, "maxTotal": 2 },
  "bathroomLabel": "bath-shower",
  "bathroomDescription": "Wellness bathroom with shower, hair dryer and separate guest WC",
  "hasBalcony": false,
  "hasSauna": false,
  "hasSeparateLiving": true,
  "isAccessible": false,
  "bookingUrl": "https://www.radissonhotels.com/en-us/hotels/radisson-individuals-berlin/rooms?&roomtypeid=411341",
  "amenities": ["non-smoking", "free-wifi", "king-bed", "bath-shower", "separate-wc", "nespresso", "tea", "room-safe", "tv-49", "tv-dual", "teufel-sound", "refrigerator", "berlin-doors", "adjustable-ac", "seating-area", "separate-living", "desk", "garden-view", "soundproof-windows"]
}
```

---

### Studio 45

```json
{
  "name": { "en": "Studio 45", "de": "Studio 45" },
  "slug": "studio-45",
  "featured": true,
  "displayOrder": 11,
  "shortDescription": {
    "en": "95m². DJ deck, 200 records curated by DJ Dieta Berliner, private sauna, spa bathroom, freestanding king bed. Lionel Hampton once lived here.",
    "de": "95 m². DJ-Deck, 200 Schallplatten kuratiert von DJ Dieta Berliner, private Sauna, Spa-Bad, freistehendes Kingsize-Bett. Lionel Hampton hat hier gewohnt."
  },
  "description": {
    "en": "A quiet legend lives upstairs at Hotel Berlin, Berlin.\n\nInspired by the energy of Studio 54 and the legacy of jazz great Lionel Hampton — who once called this hotel home — Studio 45 is 95m² built for people who know the difference between style and substance.\n\nAt its heart: a custom lounge, a DJ deck, and over 200 records selected for flow and feel by Berlin's own DJ Dieta Berliner. Instruments that invite you to play. Books that are meant to be read. A sound system that fills the room properly.\n\nBeyond the music: a private sauna, a spa bathroom with freestanding tub and walk-in rain shower, and a freestanding king bed (200×210cm).\n\nStrictly two guests. Your own Berlin, for a while.",
    "de": "Eine stille Legende wohnt eine Etage höher im Hotel Berlin, Berlin.\n\nInspiriert vom ikonischen Vibe des Studio 54 und dem Erbe von Jazz-Legende Lionel Hampton — der einst hier zu Hause war — ist Studio 45 ein 95-Quadratmeter-Rückzugsort für Menschen, die den Unterschied zwischen Stil und Substanz kennen.\n\nIm Zentrum: eine maßgeschneiderte Lounge, ein DJ-Deck und über 200 Schallplatten — handverlesen von DJ Dieta Berliner, nicht nach großen Namen, sondern nach Flow und Klangtreue.\n\nInstrumente, die gespielt werden wollen. Bücher, die gelesen werden sollen. Ein Soundsystem, das den Raum wirklich füllt.\n\nUnd wenn der Takt langsamer wird: private Sauna, Spa-Bad mit freistehender Wanne und begehbarer Regendusche, freistehendes Kingsize-Bett (200×210cm).\n\nNur für zwei Gäste. Dein Berlin, für eine Weile."
  },
  "fromPrice": 389.00,
  "floorSizeM2": 95,
  "bedConfiguration": {
    "type": "king-freestanding",
    "details": "Freestanding king bed (200×210cm)"
  },
  "occupancy": { "maxAdults": 2, "maxChildren": 0, "maxTotal": 2 },
  "bathroomLabel": "spa-bathroom",
  "bathroomDescription": "Mini SPA bathroom — 2 basins, freestanding bathtub, walk-in rain shower, makeup table",
  "hasBalcony": false,
  "hasSauna": true,
  "hasSeparateLiving": true,
  "isAccessible": false,
  "bookingUrl": "https://www.radissonhotels.com/en-us/hotels/radisson-individuals-berlin/rooms",
  "amenities": ["non-smoking", "free-wifi", "king-bed-freestanding", "spa-bathroom", "separate-wc", "nespresso", "tea", "room-safe", "tv-55", "tv-dual", "hifi-sound", "dj-deck", "vinyl-collection", "instruments", "books", "refrigerator", "adjustable-ac", "seating-area", "separate-living", "work-dining", "ftc-windows", "parquet", "dimmable-lighting", "private-sauna", "garden-view", "soundproof-windows"]
}
```

---

## Part 5 — `RoomsHero` component: field name corrections

The existing `Rooms.ts` uses some different field names from the original brief. Update all references in `RoomsHero.tsx` and `RoomSlider.tsx` to use the actual collection field names:

| Original brief field | Actual field in Rooms.ts | Note |
|---|---|---|
| `heroShowing` | `featured` | Same meaning, different name — use `featured` |
| `floorSize` | `floorSizeM2` | Use `floorSizeM2` |
| `bedType` | `bedConfiguration.type` | Use nested path |
| `bedDimensions` | `bedConfiguration.details` | Use nested path |
| `occupancyMax` | `occupancy.maxTotal` | Use nested path |
| `radissonRoomTypeId` | `bookingUrl` | `bookingUrl` is the full URL — no need to construct it |
| `roomStory` | `insiderStory` | After applying schema addition above |

---

## Part 6 — `getRoomsForHero()` query correction

Update `lib/api.ts` to use the correct field name:

```typescript
export async function getRoomsForHero() {
  const data = await payload.find({
    collection: 'rooms',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { featured: { equals: true } },
      ],
    },
    sort: 'displayOrder',
  })
  return data.docs
}
```

Note: sort by `displayOrder` not `fromPrice` — the seed data sets display order explicitly and this gives editorial control over the rotation sequence.

---

## Part 7 — Bathroom display label map

Add this lookup to `RoomSlider.tsx`:

```typescript
const bathroomLabels: Record<string, { en: string; de: string }> = {
  'shower':       { en: 'Shower',        de: 'Dusche' },
  'rain-shower':  { en: 'Rain shower',   de: 'Regendusche' },
  'bath-shower':  { en: 'Bath & shower', de: 'Bad & Dusche' },
  'spa-bathroom': { en: 'Spa bathroom',  de: 'Spa-Bad' },
}
```

Usage:
```typescript
const bathroomLabel = bathroomLabels[room.bathroomLabel]?.[locale] ?? ''
```

---

*Hotel Berlin, Berlin — Rooms Collection Addendum · June 2026*
*Base brief: HotelBerlin_RoomsHero_BuildBrief.md*
*Collection reviewed: src/collections/Rooms.ts (uploaded June 2026)*
