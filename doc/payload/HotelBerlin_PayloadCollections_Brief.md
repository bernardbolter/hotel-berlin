# Hotel Berlin — Payload Collections Build Brief
*For Cursor / Claude Opus*
*Goal: all Payload collections defined and seeded with real content from the live site*

---

## Overview

Build all Payload CMS collections for hotel-berlin.de. Every collection should be seeded with real content extracted from the live site — no lorem ipsum. The schema is designed so that every field an editor fills in generates structured data automatically; JSON-LD output hooks are out of scope for this task but field names must match the schema planning exactly so hooks can be wired later without renaming fields.

Stack: Payload 3.x with Next.js (monorepo), PostgreSQL (Neon), TypeScript.

---

## Build Order

1. `tags` — no dependencies
2. `hotel` global — no dependencies
3. `rooms` — depends on tags
4. `meetingRooms` — no dependencies
5. `venues` — no dependencies
6. `artists` — depends on tags
7. `artworks` — depends on artists, tags
8. `exhibitions` — depends on artists, artworks
9. `people` — depends on tags
10. `events` — depends on venues, artists, people, tags
11. `faqs` — depends on tags
12. `neighbourhoodPlaces` — depends on tags, people
13. `insiderStories` — depends on people, neighbourhoodPlaces

---

## Collection 1: `tags`

Simple taxonomy. Used across all collections for filtering and schema type hints.

```typescript
// collections/Tags.ts
import { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Category', value: 'category' },
        { label: 'Medium', value: 'medium' },
        { label: 'Theme', value: 'theme' },
        { label: 'Amenity', value: 'amenity' },
        { label: 'Neighbourhood', value: 'neighbourhood' },
      ],
    },
  ],
}
```

**Seed data:**
```json
[
  { "name": "Art", "slug": "art", "type": "category" },
  { "name": "Sport", "slug": "sport", "type": "category" },
  { "name": "Music", "slug": "music", "type": "category" },
  { "name": "Food & Drink", "slug": "food-drink", "type": "category" },
  { "name": "Community", "slug": "community", "type": "category" },
  { "name": "Neighbourhood", "slug": "neighbourhood", "type": "category" },
  { "name": "Culture", "slug": "culture", "type": "category" },
  { "name": "Screen Print", "slug": "screen-print", "type": "medium" },
  { "name": "Mural", "slug": "mural", "type": "medium" },
  { "name": "Photography", "slug": "photography", "type": "medium" },
  { "name": "Skateboarding", "slug": "skateboarding", "type": "theme" },
  { "name": "Urban Art", "slug": "urban-art", "type": "theme" },
  { "name": "Free WiFi", "slug": "free-wifi", "type": "amenity" },
  { "name": "Air Conditioning", "slug": "air-conditioning", "type": "amenity" },
  { "name": "Wellness Bathroom", "slug": "wellness-bathroom", "type": "amenity" },
  { "name": "Balcony", "slug": "balcony", "type": "amenity" },
  { "name": "Tiergarten", "slug": "tiergarten", "type": "neighbourhood" },
  { "name": "Schöneberg", "slug": "schoeneberg", "type": "neighbourhood" }
]
```

---

## Collection 2: `hotel` — Global

Single document. Sitewide. Generates `LodgingBusiness` JSON-LD on every page.

```typescript
// globals/Hotel.ts
import { GlobalConfig } from 'payload'

export const Hotel: GlobalConfig = {
  slug: 'hotel',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'legalName', type: 'text' },
    { name: 'description', type: 'richText', localized: true },
    { name: 'shortDescription', type: 'textarea', localized: true,
      admin: { description: 'Max 160 chars. Used for meta descriptions and AI citation.' } },
    { name: 'url', type: 'text' },
    { name: 'telephone', type: 'text' },
    { name: 'conferencePhone', type: 'text' },
    { name: 'email', type: 'email' },
    {
      name: 'address', type: 'group', fields: [
        { name: 'streetAddress', type: 'text' },
        { name: 'addressLocality', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'addressCountry', type: 'text' },
      ],
    },
    {
      name: 'geo', type: 'group', fields: [
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
      ],
    },
    { name: 'hasMap', type: 'text', admin: { description: 'Google Maps URL' } },
    { name: 'checkinTime', type: 'text' },
    { name: 'checkoutTime', type: 'text' },
    { name: 'starRating', type: 'number' },
    { name: 'priceRange', type: 'text' },
    { name: 'totalRooms', type: 'number' },
    { name: 'foundingDate', type: 'text' },
    { name: 'brand', type: 'text' },
    { name: 'parentOrganization', type: 'text' },
    { name: 'wikidataId', type: 'text', admin: { description: 'e.g. Q1630833' } },
    {
      name: 'sameAs', type: 'array', fields: [
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'amenityFeature', type: 'array', fields: [
        { name: 'name', type: 'text' },
        { name: 'value', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'certifications', type: 'array', fields: [
        { name: 'name', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'openingHours', type: 'group', fields: [
        { name: 'reception', type: 'text', defaultValue: 'Mo-Su 00:00-24:00' },
        { name: 'breakfast', type: 'text', defaultValue: 'Mo-Su 06:30-10:00' },
      ],
    },
  ],
}
```

**Seed data:**
```json
{
  "name": "Hotel Berlin, Berlin",
  "legalName": "Pandox Berlin GmbH",
  "url": "https://hotel-berlin.de",
  "telephone": "+493026050",
  "conferencePhone": "+4930260526 02",
  "email": "info@hotel-berlin.de",
  "address": {
    "streetAddress": "Lützowplatz 17",
    "addressLocality": "Berlin",
    "postalCode": "10785",
    "addressCountry": "DE"
  },
  "geo": { "latitude": 52.5034, "longitude": 13.3572 },
  "hasMap": "https://maps.google.com/?q=52.5034,13.3572",
  "checkinTime": "15:00",
  "checkoutTime": "12:00",
  "starRating": 4,
  "priceRange": "€€",
  "totalRooms": 701,
  "foundingDate": "1958",
  "brand": "Radisson Individuals",
  "parentOrganization": "Pandox AB",
  "wikidataId": "Q1630833",
  "sameAs": [
    { "url": "https://www.facebook.com/hotel.berlin/" },
    { "url": "https://www.instagram.com/hotel_berlin_berlin/" },
    { "url": "https://www.wikidata.org/entity/Q1630833" }
  ],
  "amenityFeature": [
    { "name": "Free WiFi", "value": true },
    { "name": "Underground Parking", "value": true },
    { "name": "Sauna", "value": true },
    { "name": "Fitness Centre", "value": true },
    { "name": "Pet Friendly", "value": true },
    { "name": "EV Charging Nearby", "value": true },
    { "name": "24/7 Reception", "value": true },
    { "name": "Luggage Storage", "value": true },
    { "name": "Non-Smoking Rooms", "value": true },
    { "name": "Accessible Rooms Available", "value": true }
  ],
  "certifications": [
    { "name": "BREEAM", "url": "https://breaam.com" },
    { "name": "The Green Key", "url": "https://www.green-key.org" },
    { "name": "Cvent Top 25 Europe Independent Hotels" },
    { "name": "Sustainable Meetings Berlin Leader" },
    { "name": "Sustainable Berlin Leader" }
  ],
  "openingHours": {
    "reception": "Mo-Su 00:00-24:00",
    "breakfast": "Mo-Su 06:30-10:00"
  }
}
```

---

## Collection 3: `rooms`

11 room types. Each generates `HotelRoom` + `Offer` JSON-LD.

```typescript
// collections/Rooms.ts
import { CollectionConfig } from 'payload'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'shortDescription', type: 'textarea', localized: true,
      admin: { description: 'Max 160 chars. AI citation length.' } },
    { name: 'description', type: 'richText', localized: true },
    { name: 'fromPrice', type: 'number', admin: { description: 'From-price in EUR' } },
    { name: 'currency', type: 'text', defaultValue: 'EUR' },
    { name: 'floorSizeM2', type: 'number', admin: { description: 'Floor area in m²' } },
    {
      name: 'bedConfiguration', type: 'group', fields: [
        {
          name: 'type', type: 'select', options: [
            { label: 'Queen (160×200cm)', value: 'queen' },
            { label: 'King (180×200cm)', value: 'king' },
            { label: 'Twin (2× 90×200cm)', value: 'twin' },
            { label: 'Bunk beds (2× 90×200cm)', value: 'bunk' },
          ],
        },
        { name: 'details', type: 'text' },
      ],
    },
    {
      name: 'occupancy', type: 'group', fields: [
        { name: 'maxAdults', type: 'number' },
        { name: 'maxChildren', type: 'number' },
        { name: 'maxTotal', type: 'number' },
      ],
    },
    {
      name: 'amenities', type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      filterOptions: { type: { equals: 'amenity' } },
    },
    { name: 'images', type: 'array', fields: [
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
      { name: 'alt', type: 'text', required: true },
      { name: 'caption', type: 'text' },
    ]},
    { name: 'bookingUrl', type: 'text', admin: { description: 'Radisson booking deep-link for this room type' } },
    { name: 'featured', type: 'checkbox', defaultValue: false,
      admin: { description: 'Show on homepage rooms teaser' } },
    { name: 'displayOrder', type: 'number', admin: { description: 'Order on rooms index page' } },
    {
      name: 'storyConnection', type: 'group',
      admin: { description: 'You, Me & Berlin — insider story link' },
      fields: [
        { name: 'hasStory', type: 'checkbox', defaultValue: false },
        { name: 'storyTeaser', type: 'text', localized: true },
      ],
    },
  ],
}
```

**Seed data — all 11 room types from live site:**
```json
[
  {
    "name": "Individual",
    "slug": "individual",
    "fromPrice": 72.25,
    "currency": "EUR",
    "shortDescription": "Double bed, free WiFi. A quiet room that does its job without fuss.",
    "bedConfiguration": { "type": "queen", "details": "1 Queen Bed (160×200cm)" },
    "occupancy": { "maxAdults": 2, "maxChildren": 0, "maxTotal": 2 },
    "featured": false,
    "displayOrder": 1
  },
  {
    "name": "Cosy Small",
    "slug": "cosy-small",
    "fromPrice": 72.25,
    "currency": "EUR",
    "shortDescription": "King or queen bed with rain shower. Compact and well thought-through.",
    "bedConfiguration": { "type": "king", "details": "King or Queen Bed" },
    "occupancy": { "maxAdults": 2, "maxChildren": 0, "maxTotal": 2 },
    "featured": false,
    "displayOrder": 2
  },
  {
    "name": "Standard",
    "slug": "standard",
    "fromPrice": 72.25,
    "currency": "EUR",
    "floorSizeM2": 25,
    "shortDescription": "Part of the You, Me & Berlin series — resident stories woven into the room design.",
    "bedConfiguration": { "type": "queen", "details": "1 Queen Bed (160×200cm)" },
    "occupancy": { "maxAdults": 2, "maxChildren": 1, "maxTotal": 3 },
    "storyConnection": { "hasStory": true, "storyTeaser": "A room with a Berlin story built in." },
    "featured": true,
    "displayOrder": 3
  },
  {
    "name": "Superior",
    "slug": "superior",
    "fromPrice": 80.75,
    "currency": "EUR",
    "shortDescription": "Casual desk, room to think. Part of the You, Me & Berlin series.",
    "bedConfiguration": { "type": "queen", "details": "1 Queen Bed (160×200cm)" },
    "occupancy": { "maxAdults": 2, "maxChildren": 1, "maxTotal": 3 },
    "storyConnection": { "hasStory": true, "storyTeaser": "Thoughtful details, Berlin stories." },
    "featured": true,
    "displayOrder": 4
  },
  {
    "name": "Family",
    "slug": "family",
    "fromPrice": 97.75,
    "currency": "EUR",
    "shortDescription": "Bunk beds for the kids, proper space for everyone. Up to 4 people.",
    "bedConfiguration": { "type": "bunk", "details": "Bunk beds, up to 4 people" },
    "occupancy": { "maxAdults": 2, "maxChildren": 2, "maxTotal": 4 },
    "featured": false,
    "displayOrder": 5
  },
  {
    "name": "Premium Family",
    "slug": "premium-family",
    "fromPrice": 92.65,
    "currency": "EUR",
    "shortDescription": "Four extra bunk beds. The room that fits the whole crew — up to 6 people.",
    "bedConfiguration": { "type": "bunk", "details": "4 extra bunk beds, up to 6 people" },
    "occupancy": { "maxAdults": 2, "maxChildren": 4, "maxTotal": 6 },
    "featured": false,
    "displayOrder": 6
  },
  {
    "name": "Premium",
    "slug": "premium",
    "fromPrice": 106.25,
    "currency": "EUR",
    "shortDescription": "Spacious, wellness bathroom, king-size bed. Some rooms have a balcony.",
    "bedConfiguration": { "type": "king", "details": "1 King Bed (180×200cm)" },
    "occupancy": { "maxAdults": 2, "maxChildren": 1, "maxTotal": 3 },
    "featured": true,
    "displayOrder": 7
  },
  {
    "name": "Junior Suite",
    "slug": "junior-suite",
    "fromPrice": 122.40,
    "currency": "EUR",
    "shortDescription": "King-size bed, proper seating area, separate toilet and bathroom.",
    "bedConfiguration": { "type": "king", "details": "1 King Bed (180×200cm)" },
    "occupancy": { "maxAdults": 2, "maxChildren": 1, "maxTotal": 3 },
    "featured": false,
    "displayOrder": 8
  },
  {
    "name": "Suite — One Bedroom",
    "slug": "suite-one-bedroom",
    "fromPrice": 122.40,
    "currency": "EUR",
    "shortDescription": "King-size bed, seating area, separate toilet and bathroom. A suite that earns the name.",
    "bedConfiguration": { "type": "king", "details": "1 King Bed (180×200cm)" },
    "occupancy": { "maxAdults": 2, "maxChildren": 1, "maxTotal": 3 },
    "featured": false,
    "displayOrder": 9
  },
  {
    "name": "Corner Suite",
    "slug": "corner-suite",
    "fromPrice": 173.40,
    "currency": "EUR",
    "floorSizeM2": 50,
    "shortDescription": "Wellness bathroom, lounge alcove, king-size bed. Corner views, proper space.",
    "bedConfiguration": { "type": "king", "details": "1 King Bed (180×200cm)" },
    "occupancy": { "maxAdults": 2, "maxChildren": 1, "maxTotal": 3 },
    "featured": true,
    "displayOrder": 10
  },
  {
    "name": "Studio 45",
    "slug": "studio-45",
    "fromPrice": 389.00,
    "currency": "EUR",
    "floorSizeM2": 95,
    "shortDescription": "95m². Named for Studio 54 and the Lionel Hampton legacy. The most distinctive room in the hotel.",
    "bedConfiguration": { "type": "king", "details": "1 King Bed (180×200cm)" },
    "occupancy": { "maxAdults": 2, "maxChildren": 1, "maxTotal": 3 },
    "featured": true,
    "displayOrder": 11
  }
]
```

---

## Collection 4: `meetingRooms`

All rooms from the live site. Generates `MeetingRoom` JSON-LD. The `combinableWith` field enables the schema `amenityFeature` for divisible spaces.

```typescript
// collections/MeetingRooms.ts
import { CollectionConfig } from 'payload'

export const MeetingRooms: CollectionConfig = {
  slug: 'meeting-rooms',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'richText', localized: true },
    { name: 'shortDescription', type: 'textarea', localized: true },
    { name: 'floorSizeM2', type: 'number', required: true },
    { name: 'area', type: 'select', options: [
      { label: 'Ballroom (Berlin, Berlin)', value: 'ballroom' },
      { label: 'Area A', value: 'area-a' },
      { label: 'Area B', value: 'area-b' },
      { label: 'Area C', value: 'area-c' },
    ]},
    {
      name: 'capacity', type: 'group', fields: [
        { name: 'classroom', type: 'number' },
        { name: 'theatre', type: 'number' },
        { name: 'banquet', type: 'number' },
        { name: 'uShape', type: 'number' },
        { name: 'cabaret', type: 'number' },
        { name: 'reception', type: 'number' },
        { name: 'block', type: 'number' },
      ],
    },
    {
      name: 'features', type: 'group', fields: [
        { name: 'screen', type: 'checkbox', defaultValue: false },
        { name: 'projector', type: 'checkbox', defaultValue: false },
        { name: 'divisible', type: 'checkbox', defaultValue: false },
        { name: 'naturalLight', type: 'checkbox', defaultValue: false },
        { name: 'hybridReady', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'combinableWith', type: 'relationship',
      relationTo: 'meeting-rooms',
      hasMany: true,
      admin: { description: 'Other rooms this can be combined with' },
    },
    { name: 'images', type: 'array', fields: [
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
      { name: 'alt', type: 'text', required: true },
    ]},
    { name: 'enquiryUrl', type: 'text',
      defaultValue: 'https://hotel-berlin.de/en/meet-work/request-for-proposal' },
    { name: 'displayOrder', type: 'number' },
    { name: 'featured', type: 'checkbox', defaultValue: false,
      admin: { description: 'Show on meetings page teaser' } },
  ],
}
```

**Seed data — all rooms from live site:**
```json
[
  {
    "name": "Berlin, Berlin",
    "slug": "berlin-berlin",
    "floorSizeM2": 540,
    "area": "ballroom",
    "shortDescription": "540m² ballroom. The city's best independent meeting space — theatre for 550, reception for 1,200.",
    "capacity": { "classroom": 440, "theatre": 550, "banquet": 450, "uShape": null, "cabaret": 250, "reception": 1200, "block": null },
    "features": { "screen": true, "projector": true, "divisible": true, "naturalLight": false, "hybridReady": true },
    "displayOrder": 1,
    "featured": true
  },
  {
    "name": "Berlin 1",
    "slug": "berlin-1",
    "floorSizeM2": 90,
    "area": "area-c",
    "shortDescription": "90m². Combinable with Berlin 2 and Berlin 3.",
    "capacity": { "classroom": 60, "theatre": 90, "banquet": 50, "uShape": 32, "cabaret": 45, "reception": 180, "block": 35 },
    "features": { "screen": true, "projector": true, "divisible": false },
    "displayOrder": 2,
    "featured": false
  },
  {
    "name": "Berlin 2",
    "slug": "berlin-2",
    "floorSizeM2": 90,
    "area": "area-c",
    "shortDescription": "90m². Combinable with Berlin 1 and Berlin 3.",
    "capacity": { "classroom": 60, "theatre": 90, "banquet": 50, "uShape": 32, "cabaret": 45, "reception": 260, "block": 35 },
    "features": { "screen": true, "projector": true, "divisible": false },
    "displayOrder": 3,
    "featured": false
  },
  {
    "name": "Berlin 3",
    "slug": "berlin-3",
    "floorSizeM2": 180,
    "area": "area-c",
    "shortDescription": "180m². Combinable with Berlin 1 and Berlin 2.",
    "capacity": { "classroom": 120, "theatre": 180, "banquet": 150, "uShape": 70, "cabaret": 70, "reception": 260, "block": 48 },
    "features": { "screen": true, "projector": true, "divisible": false },
    "displayOrder": 4,
    "featured": true
  },
  {
    "name": "Berlin 4",
    "slug": "berlin-4",
    "floorSizeM2": 60,
    "area": "area-c",
    "shortDescription": "60m². Combinable with Berlin 3, Berlin 5, and Berlin 6.",
    "capacity": { "classroom": 30, "theatre": 60, "banquet": 30, "uShape": 25, "cabaret": 27, "reception": 80, "block": 25 },
    "features": { "screen": true, "projector": true, "divisible": false },
    "displayOrder": 5,
    "featured": false
  },
  {
    "name": "Berlin 5",
    "slug": "berlin-5",
    "floorSizeM2": 60,
    "area": "area-c",
    "shortDescription": "60m². Combinable with Berlin 3, Berlin 4, and Berlin 6.",
    "capacity": { "classroom": 30, "theatre": 60, "banquet": 30, "uShape": 25, "cabaret": 27, "reception": 80, "block": 25 },
    "features": { "screen": true, "projector": true, "divisible": false },
    "displayOrder": 6,
    "featured": false
  },
  {
    "name": "Berlin 6",
    "slug": "berlin-6",
    "floorSizeM2": 60,
    "area": "area-c",
    "shortDescription": "60m². Combinable with Berlin 3, Berlin 4, and Berlin 5.",
    "capacity": { "classroom": 30, "theatre": 60, "banquet": 30, "uShape": 25, "cabaret": 27, "reception": 80, "block": 25 },
    "features": { "screen": true, "projector": true, "divisible": false },
    "displayOrder": 7,
    "featured": false
  },
  {
    "name": "Meeting Room A1",
    "slug": "meeting-room-a1",
    "floorSizeM2": 73,
    "area": "area-a",
    "shortDescription": "73m². State-of-the-art technology, appealing design.",
    "capacity": { "classroom": 40, "theatre": 60, "banquet": 50, "uShape": 30, "cabaret": 45, "reception": 90, "block": 28 },
    "features": { "screen": true, "projector": true, "divisible": false },
    "displayOrder": 8,
    "featured": true
  },
  {
    "name": "Meeting Room A2",
    "slug": "meeting-room-a2",
    "floorSizeM2": 46,
    "area": "area-a",
    "shortDescription": "46m². Intimate and well-equipped.",
    "capacity": { "classroom": 20, "theatre": 30, "banquet": 20, "uShape": 18, "cabaret": null, "reception": 40, "block": null },
    "features": { "screen": true, "projector": true, "divisible": false },
    "displayOrder": 9,
    "featured": false
  },
  {
    "name": "Meeting Room A3",
    "slug": "meeting-room-a3",
    "floorSizeM2": 50,
    "area": "area-a",
    "shortDescription": "50m². Flexible layout, full AV.",
    "capacity": { "classroom": 24, "theatre": 32, "banquet": 30, "uShape": 20, "cabaret": null, "reception": 40, "block": null },
    "features": { "screen": true, "projector": true, "divisible": false },
    "displayOrder": 10,
    "featured": false
  },
  {
    "name": "Meeting Room A4",
    "slug": "meeting-room-a4",
    "floorSizeM2": 72,
    "area": "area-a",
    "shortDescription": "72m². Mirror of A1 — same spec, same quality.",
    "capacity": { "classroom": 40, "theatre": 60, "banquet": 50, "uShape": 30, "cabaret": 45, "reception": 80, "block": 28 },
    "features": { "screen": true, "projector": true, "divisible": false },
    "displayOrder": 11,
    "featured": false
  },
  {
    "name": "Meeting Room B1",
    "slug": "meeting-room-b1",
    "floorSizeM2": 30,
    "area": "area-b",
    "shortDescription": "30m². Boardroom style. Screen included. Seats 8.",
    "capacity": { "classroom": null, "theatre": null, "banquet": null, "uShape": null, "cabaret": null, "reception": 8, "block": 8 },
    "features": { "screen": true, "projector": false, "divisible": false },
    "displayOrder": 12,
    "featured": false
  }
]
```

---

## Collection 5: `venues`

Named spaces at the hotel. Generates `LocalBusiness` / `Restaurant` / `SportsActivityLocation` / `ArtGallery` JSON-LD per venue type.

```typescript
// collections/Venues.ts
import { CollectionConfig } from 'payload'

export const Venues: CollectionConfig = {
  slug: 'venues',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'venueType', type: 'select', required: true,
      options: [
        { label: 'Restaurant', value: 'Restaurant' },
        { label: 'Bar', value: 'Bar' },
        { label: 'Art Gallery', value: 'ArtGallery' },
        { label: 'Sports Activity Location', value: 'SportsActivityLocation' },
        { label: 'Event Venue', value: 'EventVenue' },
        { label: 'Local Business', value: 'LocalBusiness' },
      ],
    },
    { name: 'tagline', type: 'text', localized: true },
    { name: 'description', type: 'richText', localized: true },
    { name: 'shortDescription', type: 'textarea', localized: true },
    { name: 'location', type: 'text', admin: { description: 'e.g. "B2 Basement", "Ground Floor", "Lützowplatz 17"' } },
    { name: 'telephone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'website', type: 'text' },
    { name: 'instagramUrl', type: 'text' },
    {
      name: 'openingHours', type: 'array', fields: [
        { name: 'dayOfWeek', type: 'text', admin: { description: 'e.g. Mo-Su or Monday,Tuesday' } },
        { name: 'opens', type: 'text', admin: { description: 'e.g. 10:00' } },
        { name: 'closes', type: 'text', admin: { description: 'e.g. 23:00 or open-end' } },
        { name: 'label', type: 'text', admin: { description: 'e.g. "Kitchen", "Bar"' } },
      ],
    },
    { name: 'servesCuisine', type: 'text', admin: { description: 'Restaurant only. e.g. Italian, International' } },
    { name: 'reservationUrl', type: 'text' },
    { name: 'menuUrl', type: 'text' },
    { name: 'priceRange', type: 'text' },
    { name: 'isOpenToPublic', type: 'checkbox', defaultValue: true },
    { name: 'isGuestFacing', type: 'checkbox', defaultValue: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'images', type: 'array', fields: [
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
      { name: 'alt', type: 'text', required: true },
    ]},
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'sameAs', type: 'array', fields: [{ name: 'url', type: 'text' }] },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'displayOrder', type: 'number' },
  ],
}
```

**Seed data:**
```json
[
  {
    "name": "Lütze",
    "slug": "lutze",
    "venueType": "Restaurant",
    "tagline": "The place to eat, play, and hang all day.",
    "shortDescription": "Italian deli café, bar, and garden at Lützowplatz 17. Open to guests and Berliners alike.",
    "location": "Ground Floor, Lützowplatz 17",
    "email": "luetze@hotel-berlin.de",
    "website": "https://hotel-berlin.de/en/eat-drink/luetze-bar-berlin",
    "openingHours": [
      { "dayOfWeek": "Mo-Su", "opens": "10:00", "closes": "open end", "label": "Bar" },
      { "dayOfWeek": "Mo-Su", "opens": "11:30", "closes": "15:00", "label": "Kitchen lunch" },
      { "dayOfWeek": "Mo-Su", "opens": "17:00", "closes": "22:30", "label": "Kitchen dinner" }
    ],
    "servesCuisine": "Italian, International",
    "reservationUrl": "https://hotel-berlin.de/en/eat-drink/luetze-bar-berlin",
    "priceRange": "€€",
    "isOpenToPublic": true,
    "featured": true,
    "displayOrder": 1
  },
  {
    "name": "FKKB — Freiluft Kunst Klub Berlin",
    "slug": "fkkb",
    "venueType": "ArtGallery",
    "tagline": "Artists in residence. The hotel just gives it a home.",
    "shortDescription": "Independent art gallery with artists in residence, murals on every floor, and exhibitions that change and return.",
    "location": "Hotel Berlin, Berlin — multiple floors",
    "website": "https://fkkb.de",
    "instagramUrl": "https://instagram.com/freiluftkunstklub",
    "isOpenToPublic": true,
    "featured": true,
    "displayOrder": 2
  },
  {
    "name": "KTTK — Königlicher Tischtennis Klub Berlin",
    "slug": "kttk",
    "venueType": "SportsActivityLocation",
    "tagline": "Four JOOLA tables. Open to guests, open to Berliners.",
    "shortDescription": "Table tennis club in the hotel basement. Thursday tournament nights from 19:00. No booking, no dress code. €5 entry.",
    "location": "B2 Basement",
    "website": "https://hotel-berlin.de",
    "openingHours": [
      { "dayOfWeek": "Thursday", "opens": "19:00", "closes": "open end", "label": "Tournament Night" }
    ],
    "isOpenToPublic": true,
    "featured": true,
    "displayOrder": 3
  },
  {
    "name": "Sissi Skateboard Club",
    "slug": "sissi",
    "venueType": "SportsActivityLocation",
    "tagline": "A meeting space that dances out of line.",
    "shortDescription": "Mini-ramp built by skateboarders. Permanent home of the WALLRIDE exhibition by Jürgen Blümlein. Available as a meeting and event space.",
    "location": "Hotel Berlin, Berlin",
    "website": "https://fkkb.de/sissi-club",
    "isOpenToPublic": true,
    "featured": false,
    "displayOrder": 4
  }
]
```

---

## Collection 6: `faqs`

Single collection. Tagged by audience and topic. Generates `FAQPage` JSON-LD on any page that includes a FAQ block.

```typescript
// collections/FAQs.ts
import { CollectionConfig } from 'payload'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: { useAsTitle: 'question' },
  fields: [
    { name: 'question', type: 'text', required: true, localized: true,
      admin: { description: 'Write as someone would ask an AI assistant. Not "Check-in procedures" but "What time can I check in at Hotel Berlin?"' } },
    { name: 'answer', type: 'textarea', required: true, localized: true,
      admin: { description: 'Self-contained answer. Front-load the answer. Name the hotel explicitly. Max ~120 words.' } },
    {
      name: 'audience', type: 'select', required: true,
      options: [
        { label: 'Prospect (main site)', value: 'prospect' },
        { label: 'Guest (/here)', value: 'guest' },
        { label: 'Both', value: 'both' },
      ],
    },
    {
      name: 'category', type: 'select', required: true,
      options: [
        { label: 'Check-in / Check-out', value: 'check-in' },
        { label: 'Cancellation', value: 'cancellation' },
        { label: 'Payment', value: 'payment' },
        { label: 'Parking', value: 'parking' },
        { label: 'Pets', value: 'pets' },
        { label: 'Transport', value: 'transport' },
        { label: 'Dining', value: 'dining' },
        { label: 'Amenities', value: 'amenities' },
        { label: 'Accessibility', value: 'accessibility' },
        { label: 'Local Area', value: 'local' },
        { label: 'Events & Culture', value: 'events' },
      ],
    },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'priority', type: 'number', admin: { description: 'Lower = shown first. Use for homepage FAQ ordering.' } },
    { name: 'publishedAt', type: 'date' },
  ],
}
```

**Seed data — from live site FAQs:**
```json
[
  {
    "question": "What time can I check in at Hotel Berlin, Berlin?",
    "answer": "Check-in at Hotel Berlin, Berlin is from 15:00. Early check-in is available for €30 if a room is ready. If you arrive between 06:00 and 12:00, the previous night must be booked. Online check-in and self-service kiosks are available on site.",
    "audience": "both",
    "category": "check-in",
    "priority": 1
  },
  {
    "question": "What time is check-out at Hotel Berlin, Berlin?",
    "answer": "Check-out at Hotel Berlin, Berlin is by 12:00 noon. Late check-out may be available on request — ask at reception on the morning of departure.",
    "audience": "guest",
    "category": "check-in",
    "priority": 2
  },
  {
    "question": "What is the cancellation policy for a flexible rate at Hotel Berlin?",
    "answer": "Flexible rate bookings at Hotel Berlin, Berlin can be cancelled free of charge until 18:00 on the day of arrival. A late cancellation or no-show results in a charge of 90% of the first night.",
    "audience": "prospect",
    "category": "cancellation",
    "priority": 3
  },
  {
    "question": "What is the cancellation policy for an early booker rate?",
    "answer": "For the Early Booker 10% discount rate, free cancellation applies up to 3 days before arrival — after that, 90% of the total stay is charged. For the Early Booker 15% rate, free cancellation applies up to 7 days before arrival.",
    "audience": "prospect",
    "category": "cancellation",
    "priority": 4
  },
  {
    "question": "Is there parking at Hotel Berlin, Berlin?",
    "answer": "Yes. Hotel Berlin, Berlin has underground parking with over 200 spaces. The rate is €4 per hour, with a maximum of €25 per day. EV charging is available nearby.",
    "audience": "both",
    "category": "parking",
    "priority": 5
  },
  {
    "question": "Are pets allowed at Hotel Berlin, Berlin?",
    "answer": "Yes, pets are welcome at Hotel Berlin, Berlin. There is a charge of €30 per night. Pets are welcome at breakfast.",
    "audience": "both",
    "category": "pets",
    "priority": 6
  },
  {
    "question": "How do I get to Hotel Berlin, Berlin from the airport?",
    "answer": "From Berlin Brandenburg Airport (BER), take the RE7 or RB14 train to Zoologischer Garten, then bus 100 to Lützowplatz. The hotel is at Lützowplatz 17, 10785 Berlin.",
    "audience": "prospect",
    "category": "transport",
    "priority": 7
  },
  {
    "question": "What are the breakfast times at Hotel Berlin?",
    "answer": "Breakfast is served daily from 06:30 to 10:00. It is a full buffet with vegan options available.",
    "audience": "both",
    "category": "dining",
    "priority": 8
  },
  {
    "question": "Is there WiFi at Hotel Berlin, Berlin?",
    "answer": "Yes. Free WiFi is available in all rooms and throughout the hotel at Hotel Berlin, Berlin.",
    "audience": "both",
    "category": "amenities",
    "priority": 9
  },
  {
    "question": "Does Hotel Berlin, Berlin have a sauna or fitness centre?",
    "answer": "Yes. Hotel Berlin, Berlin has a sauna and fitness centre available to guests.",
    "audience": "both",
    "category": "amenities",
    "priority": 10
  },
  {
    "question": "Where can I store luggage at Hotel Berlin, Berlin?",
    "answer": "Luggage storage is available at Hotel Berlin, Berlin. Ask at reception.",
    "audience": "guest",
    "category": "amenities",
    "priority": 11
  },
  {
    "question": "What payment methods are accepted at Hotel Berlin?",
    "answer": "A credit card is required at booking. Full prepayment is charged after the free cancellation window closes. Company billing can be arranged at check-in.",
    "audience": "prospect",
    "category": "payment",
    "priority": 12
  }
]
```

---

## Collections 7–11 — Stub Now, Extend Later

Build these with core fields only. No seed data required for launch — content arrives progressively from hotel team and FKKB recovery.

### `artists`
Fields: `name` (required), `slug` (auto), `alias`, `bio` (richText, localized), `shortBio` (textarea), `portrait` (upload), `website`, `instagram`, `nationality`, `basedIn`, `medium`, `tags` (relationship).

### `artworks`
Fields: `title`, `slug`, `artist` (relationship → artists, required), `editionNumber`, `medium`, `dimensions`, `year`, `description` (richText, localized), `images` (array), `status` (select: available/sold/not-for-sale), `tags`.

### `exhibitions`
Fields: `title`, `slug`, `subtitle`, `description` (richText, localized), `startDate`, `endDate`, `location` (text), `heroImage`, `artists` (relationship → artists, many), `artworks` (relationship → artworks, many), `status` (select: upcoming/current/past).

### `events`
Fields: `name` (required, localized), `slug`, `description` (richText, localized), `shortDescription`, `startDate` (required), `endDate`, `category` (select: Art/Music/Sport/Food/Community/Neighbourhood/Other — drives schema type), `venue` (relationship → venues), `price` (number, nullable), `ticketUrl`, `heroImage`, `tags`, `featured`, `isRecurring`, `recurrenceNote` (text stub).

### `people`
Fields: `name` (required), `slug`, `role` (text — e.g. "Dr. Motte — Love Parade founder"), `bio` (richText, localized), `shortBio`, `portrait`, `website`, `instagram`, `tags`, `isInsider` (checkbox — marks as You, Me & Berlin profile).

---

## Query Functions

After collections are built, create `/src/lib/payload/` with these functions. Each hits the Payload local API:

```typescript
// src/lib/payload/rooms.ts
export async function getRooms() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'rooms',
    sort: 'displayOrder',
    limit: 20,
  })
  return docs
}

export async function getFeaturedRooms() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'rooms',
    where: { featured: { equals: true } },
    sort: 'displayOrder',
    limit: 4,
  })
  return docs
}

export async function getRoomBySlug(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'rooms',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}
```

Create equivalent functions for `getMeetingRooms()`, `getFeaturedMeetingRooms()`, `getVenues()`, `getVenueBySlug()`, `getFAQs({ audience, category })`, `getEvents({ featured, limit })`.

---

## Definition of Done

- [ ] All collections registered in `payload.config.ts`
- [ ] Hotel global seeded with all values above
- [ ] All 11 rooms seeded and visible in Payload admin
- [ ] All 12 meeting rooms seeded with capacity data
- [ ] All 4 venues seeded
- [ ] All 12 FAQs seeded
- [ ] Stub collections created: artists, artworks, exhibitions, events, people
- [ ] `/src/lib/payload/` query functions created for rooms, meetingRooms, venues, faqs
- [ ] `npm run dev` starts without errors
- [ ] Payload admin at `/admin` shows all collections with correct seed data
- [ ] No TypeScript errors
