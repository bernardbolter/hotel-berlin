# Hotel Berlin, Berlin — Content schema inventory

*Generated 2026-09-16T10:56:50.150Z from Payload Local API dump. Config has `fallback: true` (`src/payload.config.ts:66`); fillRate `n/total` is the dump’s **English** pass with fallback off (meeting-rooms `images[].alt` is 0/21 in fillRate and 21 `enEmptyDeFilled` in localeBuckets — DE is filled, EN is not). Cross-check Section 4 before treating a localized 0/total as empty in both languages. Nothing in the repo was changed except this file and `docs/content/schema-inventory.json`.*

Sources: collection/global configs (`src/collections/*`, `src/globals/*`, `src/payload.config.ts`), `src/collections/Media.ts`, `next.config.ts`, UI components listed in Section 3, live Postgres via Local API.

The brief listed “18 collections”; the config has **19** (the brief’s own list includes `legal-documents`). All 19 are inventoried.

Locales: `de`, `en`; default `de`; `fallback: true` (`src/payload.config.ts:66`). No collection or global has `versions` / `drafts`.

## Section 1 — Every field, every collection and global

### `users`

- File: `src/collections/Users.ts`
- `versions`: false · `drafts`: false · `auth`: true
- Status-style select: does not exist.
- Note: auth: true (`src/collections/Users.ts:8`). Source file declares no custom fields; email/sessions/hash etc. are Payload-injected.
- Record count (dev DB): **1**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| email | email | true | false | true | — | — | — | — | — | — | Payload auth default (users.email) | beforeChange(1) | — |
| resetPasswordToken | text | false | false | false | — | — | — | — | — | — | — | — | — |
| resetPasswordExpiration | date | false | false | false | — | — | — | — | — | — | — | — | — |
| salt | text | false | false | false | — | — | — | — | — | — | — | — | — |
| hash | text | false | false | false | — | — | — | — | — | — | — | — | — |
| loginAttempts | number | false | false | false | 0 | — | — | — | — | — | — | — | — |
| lockUntil | date | false | false | false | — | — | — | — | — | — | — | — | — |
| sessions | array | false | false | false | — | — | — | — | — | — | — | — | — |
| sessions[].id | text | true | false | false | — | — | — | — | — | — | — | — | — |
| sessions[].createdAt | date | false | false | false | [function] ()=>new Date() | — | — | — | — | — | — | — | — |
| sessions[].expiresAt | date | true | false | false | — | — | — | — | — | — | — | — | — |

### `media`

- File: `src/collections/Media.ts`
- `versions`: false · `drafts`: false · `upload`: true
- Status-style select: does not exist.
- Note: upload: true (`src/collections/Media.ts:15`). Only custom field is `alt`. Remaining fields are Payload upload-injected.
- Record count (dev DB): **346**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| alt | text | true | false | false | — | — | — | — | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| url | text | false | false | false | — | — | — | — | — | — | — | afterRead(1), beforeChange(1) | — |
| thumbnailURL | text | false | false | false | — | — | — | — | — | — | — | afterRead(1) | — |
| filename | text | false | false | true | — | — | — | — | — | — | — | — | — |
| mimeType | text | false | false | false | — | — | — | — | — | — | — | — | — |
| filesize | number | false | false | false | — | — | — | — | — | — | — | — | — |
| width | number | false | false | false | — | — | — | — | — | — | — | — | — |
| height | number | false | false | false | — | — | — | — | — | — | — | — | — |
| focalX | number | false | false | false | — | — | — | — | — | — | — | — | — |
| focalY | number | false | false | false | — | — | — | — | — | — | — | — | — |

### `tags`

- File: `src/collections/Tags.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Record count (dev DB): **64**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| name | text | true | true | false | — | — | — | — | — | — | — | — | — |
| slug | text | true | false | true | — | — | — | — | — | — | — | beforeDuplicate(1) | — |
| description | text | false | true | false | — | — | — | — | One-line amenity description reused on room detail grids. Amenity tags only. | data=>data.type==="amenity" | — | — | — |
| lucideIcon | text | false | false | false | — | — | — | — | Pick a Lucide icon. Leave blank for no icon. | data=>data.type==="amenity" | — | — | — |
| type | select | true | false | false | — | ["category", "medium", "theme", "amenity", "neighbourhood"] | — | — | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `rooms`

- File: `src/collections/Rooms.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Note: `homepageTeaser.teaserImage` admin description states it is unused for display (`src/collections/Rooms.ts:169`). Only custom `validate` in the project: max 4 featured amenities (`src/collections/Rooms.ts:186`).
- Record count (dev DB): **11**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| name | text | true | true | false | — | — | — | — | — | — | — | — | — |
| slug | text | true | false | true | — | — | — | — | — | — | — | beforeDuplicate(1) | — |
| shortDescription | textarea | false | true | false | — | — | — | — | Max 160 chars. AI citation length. | — | — | — | — |
| description | richText | false | true | false | — | — | — | — | — | — | — | — | — |
| fromPrice | number | false | false | false | — | — | — | — | From-price in EUR | — | — | — | — |
| currency | text | false | false | false | EUR | — | — | — | — | — | — | — | — |
| floorSizeM2 | number | false | false | false | — | — | — | — | Floor area in m² | — | — | — | — |
| bedConfiguration | group | false | false | false | — | — | — | — | — | — | — | — | — |
| bedConfiguration.type | select | false | false | false | — | ["double", "queen", "king", "king-freestanding", "twin", "bunk"] | — | — | — | — | — | — | — |
| bedConfiguration.details | text | false | false | false | — | — | — | — | — | — | — | — | — |
| occupancy | group | false | false | false | — | — | — | — | — | — | — | — | — |
| occupancy.maxAdults | number | false | false | false | — | — | — | — | — | — | — | — | — |
| occupancy.maxChildren | number | false | false | false | — | — | — | — | — | — | — | — | — |
| occupancy.maxTotal | number | false | false | false | — | — | — | — | — | — | — | — | — |
| childAgeMin | number | false | false | false | — | — | — | — | e.g. 5 for bunk beds. Leave blank if no child restriction. | — | — | — | — |
| bathroomLabel | select | false | false | false | — | ["shower", "rain-shower", "bath-shower", "spa-bathroom"] | — | — | Short label shown in spec strip on homepage and room cards. | — | — | — | — |
| bathroomDescription | text | false | false | false | — | — | — | — | Used on the room detail page. e.g. "Mini SPA bathroom — 2 basins, freestanding tub, walk-in rain shower, makeup table" | — | — | — | — |
| hasBalcony | checkbox | false | false | false | false | — | — | — | Some Premium rooms only. | — | — | — | — |
| hasSauna | checkbox | false | false | false | false | — | — | — | Studio 45 only. | — | — | — | — |
| hasSeparateLiving | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| isAccessible | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| accessibilityFeatures | richText | false | false | false | — | — | — | — | — | data=>Boolean(data.isAccessible) | — | — | — |
| amenities | relationship → tags | false | false | false | — | — | tags | true | — | — | — | — | — |
| images | array | false | false | false | — | — | — | — | — | — | — | — | — |
| images[].image | upload → media | true | false | false | — | — | media | — | — | — | — | — | — |
| images[].alt | text | true | false | false | — | — | — | — | — | — | — | — | — |
| images[].caption | text | false | false | false | — | — | — | — | — | — | — | — | — |
| images[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| socialImage | upload → media | false | false | false | — | — | media | — | Optional og:image / twitter:image override. Falls back to the first gallery image if empty. | — | — | — | — |
| bookingUrl | text | false | false | false | — | — | — | — | Radisson booking deep-link for this room type | — | — | — | — |
| featured | checkbox | false | false | false | false | — | — | — | Legacy homepage flag — prefer Homepage teaser → Enabled. | — | — | — | — |
| displayOrder | number | false | false | false | — | — | — | — | Order on rooms index page | — | — | — | — |
| homepageTeaser | group | false | false | false | — | — | — | — | Controls the Sleep & Relax rotation on the homepage (Outside_short.pdf). | — | — | — | — |
| homepageTeaser.enabled | checkbox | false | false | false | false | — | — | — | Include this room in the homepage teaser rotation. | — | — | — | — |
| homepageTeaser.order | number | false | false | false | — | — | — | — | Rotation sequence (lower first). | — | — | — | — |
| homepageTeaser.teaserImage | upload → media | false | false | false | — | — | media | — | Unused for display — homepage always uses the room’s first gallery image. Kept for legacy CMS data only. | — | — | — | — |
| homepageTeaser.featuredAmenities | relationship → tags | false | false | false | — | — | tags | true | Curated amenity subset for the compact teaser (max ~4). | — | reject >4 related tags (`src/collections/Rooms.ts:186`) | — | — |
| storyConnection | group | false | false | false | — | — | — | — | You, Me & Berlin — insider story link | — | — | — | — |
| storyConnection.hasStory | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| storyConnection.storyTeaser | text | false | true | false | — | — | — | — | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `meeting-rooms`

- File: `src/collections/MeetingRooms.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Record count (dev DB): **21**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| name | text | true | true | false | — | — | — | — | — | — | — | — | — |
| slug | text | true | false | true | — | — | — | — | Same slug for /meetings/[slug] and /tagungen/[slug]. | — | — | beforeDuplicate(1) | — |
| area | select | true | false | false | — | ["saal", "bereich-a", "bereich-b", "bereich-c", "sonderflaeche"] | — | — | — | — | — | — | — |
| displayOrder | number | true | false | false | — | — | — | — | — | — | — | — | — |
| floorSizeM2 | number | true | false | false | — | — | — | — | Floor area in m² (brief sizeM2). | — | — | — | — |
| ceilingHeightM | number | false | false | false | — | — | — | — | — | — | — | — | — |
| hasDaylight | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| isDivisible | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| hasScreen | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| hasProjector | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| combinableWith | relationship → meeting-rooms | false | false | false | — | — | meeting-rooms | true | Self-referencing — e.g. Berlin 1 combinable with Berlin 2 + Berlin 3. | — | — | — | — |
| capacity | group | false | false | false | — | — | — | — | Leave any field blank if that layout isn't offered — renders as "–", not 0. | — | — | — | — |
| capacity.theater | number | false | false | false | — | — | — | — | — | — | — | — | — |
| capacity.classroom | number | false | false | false | — | — | — | — | — | — | — | — | — |
| capacity.banquet | number | false | false | false | — | — | — | — | — | — | — | — | — |
| capacity.uShape | number | false | false | false | — | — | — | — | — | — | — | — | — |
| capacity.cabaret | number | false | false | false | — | — | — | — | — | — | — | — | — |
| capacity.reception | number | false | false | false | — | — | — | — | — | — | — | — | — |
| capacity.block | number | false | false | false | — | — | — | — | — | — | — | — | — |
| images | array | false | false | false | — | — | — | — | — | — | — | — | — |
| images[].image | upload → media | true | false | false | — | — | media | — | — | — | — | — | — |
| images[].alt | text | true | true | false | — | — | — | — | — | — | — | — | — |
| images[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| teaserImage | upload → media | false | false | false | — | — | media | — | Optional. Falls back to the first gallery image if empty. | — | — | — | — |
| shortDescription | textarea | true | true | false | — | — | — | — | Card / teaser copy. Keep ~160 chars. | — | — | — | — |
| description | richText | false | true | false | — | — | — | — | — | — | — | — | — |
| featured | checkbox | false | false | false | false | — | — | — | Show on homepage Meet & Work teaser if used. | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `meeting-documents`

- File: `src/collections/MeetingDocuments.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Record count (dev DB): **10**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | text | true | true | false | — | — | — | — | Localized — set DE and EN titles by switching the locale toggle. | — | — | — | — |
| generateSlug | checkbox | false | false | false | true | — | — | — | When enabled, the slug will auto-generate from the title field on save and autosave. | — | — | beforeChange(1) | — |
| key | text | true | false | true | — | — | — | — | — | — | — | beforeDuplicate(1) | — |
| file | upload → media | true | true | false | — | — | media | — | PDF preferred. Localized — upload the German file with locale=DE, English with locale=EN. | — | — | — | — |
| category | select | true | false | false | — | ["general", "floor-plan", "hybrid", "sustainability"] | — | — | — | — | — | — | — |
| area | select | false | false | false | — | ["saal", "bereich-a", "bereich-b", "bereich-c"] | — | — | Floor plans only — links this PDF on matching room detail pages. | (_,siblingData)=>siblingData?.category==="floor-plan" | — | — | — |
| pageRole | select | false | false | false | none | ["none", "hybrid-teaser", "banquet-teaser"] | — | — | Optional. Marks this file as the CTA target for a page teaser. At most one document should use each role. | — | — | — | — |
| sortOrder | number | true | false | false | 100 | — | — | — | Lower numbers appear first in the document library. | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `meeting-inquiries`

- File: `src/collections/MeetingInquiries.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Note: Collection hook `afterChange` sends enquiry emails (`src/collections/MeetingInquiries.ts:95`).
- Record count (dev DB): **0**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| company | text | false | false | false | — | — | — | — | — | — | — | — | — |
| contactPerson | text | true | false | false | — | — | — | — | — | — | — | — | — |
| email | email | true | false | false | — | — | — | — | — | — | — | — | — |
| phone | text | true | false | false | — | — | — | — | — | — | — | — | — |
| startDate | date | true | false | false | — | — | — | — | — | — | — | — | — |
| endDate | date | true | false | false | — | — | — | — | — | — | — | — | — |
| eventType | text | true | false | false | — | — | — | — | Free text mirroring meetings.eventTypes — historical submissions stay stable if options change. | — | — | — | — |
| guestCount | number | false | false | false | — | — | — | — | — | — | — | — | — |
| roomCount | number | false | false | false | — | — | — | — | Overnight / contingent room count. | — | — | — | — |
| overnightGuestCount | number | false | false | false | — | — | — | — | Guests staying overnight (room block). | — | — | — | — |
| stayDuration | text | false | false | false | — | — | — | — | Free-text duration of stay, e.g. 2 nights. | — | — | — | — |
| roomOfInterest | relationship → meeting-rooms | false | false | false | — | — | meeting-rooms | — | Pre-filled when the form is reached via a room detail page CTA. | — | — | — | — |
| isRoomBlock | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| notes | textarea | false | false | false | — | — | — | — | — | — | — | — | — |
| privacyAccepted | checkbox | true | false | false | false | — | — | — | Privacy policy checkbox. | — | — | — | — |
| consentGiven | checkbox | true | false | false | false | — | — | — | Data-processing consent checkbox. | — | — | — | — |
| locale | select | true | false | false | — | ["en", "de"] | — | — | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `venues`

- File: `src/collections/Venues.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Record count (dev DB): **5**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| name | text | true | true | false | — | — | — | — | — | — | — | — | — |
| slug | text | true | false | true | — | — | — | — | — | — | — | beforeDuplicate(1) | — |
| venueType | select | true | false | false | — | ["Restaurant", "Bar", "ArtGallery", "SportsActivityLocation", "EventVenue", "LocalBusiness"] | — | — | — | — | — | — | — |
| tagline | text | false | true | false | — | — | — | — | — | — | — | — | — |
| description | richText | false | true | false | — | — | — | — | — | — | — | — | — |
| shortDescription | textarea | false | true | false | — | — | — | — | — | — | — | — | — |
| location | text | false | false | false | — | — | — | — | e.g. "B2 Basement", "Ground Floor", "Lützowplatz 17" | — | — | — | — |
| spotlightLocation | text | false | false | false | — | — | — | — | Short in-building location for spotlight/hero secondary meta, e.g. "B2 Basement" | — | — | — | — |
| telephone | text | false | false | false | — | — | — | — | — | — | — | — | — |
| email | email | false | false | false | — | — | — | — | — | — | — | — | — |
| website | text | false | false | false | — | — | — | — | — | — | — | — | — |
| instagramUrl | text | false | false | false | — | — | — | — | — | — | — | — | — |
| venueMonogram | upload → media | false | false | false | — | — | media | — | Optional SVG/logo mark for SpotlightCard identity row | — | — | — | — |
| openingHours | array | false | false | false | — | — | — | — | — | — | — | — | — |
| openingHours[].dayOfWeek | text | false | false | false | — | — | — | — | e.g. Mo-Su, Mo-Fr, Sa-Su, or Thursday | — | — | — | — |
| openingHours[].opens | text | false | false | false | — | — | — | — | e.g. 10:00 | — | — | — | — |
| openingHours[].closes | text | false | false | false | — | — | — | — | Clock time, e.g. 22:30 or 01:00. Required for open/closed status. | — | — | — | — |
| openingHours[].isOpenEnded | checkbox | false | false | false | false | — | — | — | No advertised close — still store a clock bound in `closes` so status can be derived. The UI renders the i18n “open end” phrase. | — | — | — | — |
| openingHours[].segment | text | false | false | false | — | — | — | — | Grouping label for open/closed status, e.g. "Bar" / "Kitchen" / "Breakfast". Multiple rows may share a segment. | — | — | — | — |
| openingHours[].note | text | false | false | false | — | — | — | — | Optional status note, e.g. "Kitchen closes 22:30" | — | — | — | — |
| openingHours[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| servesCuisine | text | false | false | false | — | — | — | — | Restaurant only. e.g. Italian, International | — | — | — | — |
| reservationUrl | text | false | false | false | — | — | — | — | — | — | — | — | — |
| menuUrl | text | false | false | false | — | — | — | — | — | — | — | — | — |
| priceRange | text | false | false | false | — | — | — | — | — | — | — | — | — |
| isOpenToPublic | checkbox | false | false | false | true | — | — | — | — | — | — | — | — |
| isGuestFacing | checkbox | false | false | false | true | — | — | — | — | — | — | — | — |
| heroImage | upload → media | false | false | false | — | — | media | — | — | — | — | — | — |
| images | array | false | false | false | — | — | — | — | — | — | — | — | — |
| images[].image | upload → media | true | false | false | — | — | media | — | — | — | — | — | — |
| images[].alt | text | true | false | false | — | — | — | — | — | — | — | — | — |
| images[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| tags | relationship → tags | false | false | false | — | — | tags | true | — | — | — | — | — |
| sameAs | array | false | false | false | — | — | — | — | — | — | — | — | — |
| sameAs[].url | text | false | false | false | — | — | — | — | — | — | — | — | — |
| sameAs[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| featured | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| displayOrder | number | false | false | false | — | — | — | — | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `hero-slides`

- File: `src/collections/HeroSlides.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist. Checkbox `enabled` instead (`src/collections/HeroSlides.ts`).
- Note: No `status` select. Publish-style flag is checkbox `enabled` (`src/collections/HeroSlides.ts`).
- Record count (dev DB): **4**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| adminTitle | text | false | false | false | — | — | — | — | Internal label for the admin list (not shown on the site). | — | — | — | — |
| image | upload → media | true | false | false | — | — | media | — | — | — | — | — | — |
| altText | text | true | true | false | — | — | — | — | Descriptive alt text — required for both DE and EN. | — | — | — | — |
| venue | relationship → venues | false | false | false | — | — | venues | — | Optional. When set, caption is derived from venue name + floor/location. | — | — | — | — |
| captionOverride | text | false | true | false | — | — | — | — | Optional. Used when the slide is not tied to a venue, or needs custom wording. | — | — | — | — |
| credit | text | false | false | false | — | — | — | — | Photographer/agency credit — feeds ImageObject.creditText. | — | — | — | — |
| context | select | true | false | false | homepage | ["homepage", "here"] | — | — | Which hero this slide appears in. Existing slides default to homepage. Duplicate a slide (same image) to show it in both heroes. | — | — | — | — |
| order | number | true | false | false | 0 | — | — | — | Controls rotation sequence (lower first). | — | — | — | — |
| enabled | checkbox | false | false | false | true | — | — | — | Uncheck to pause this slide without deleting it. | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `faqs`

- File: `src/collections/FAQs.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Record count (dev DB): **57**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| question | text | true | true | false | — | — | — | — | Write as someone would ask an AI assistant. Not "Check-in procedures" but "What time can I check in at Hotel Berlin?" | — | — | — | — |
| answer | textarea | true | true | false | — | — | — | — | Plain text, not richText. Keep it to 1–3 sentences — this ships verbatim into FAQPage JSON-LD acceptedAnswer.text. If a question needs links or lists, summarize here and point to a policy page. | — | — | — | — |
| context | select | true | false | false | — | ["prospect", "guest"] | — | — | prospect = /faq and mini blocks on outside pages. guest = /here/faq and mini blocks on /here. No "both" — duplicate the record if needed. | — | — | — | — |
| category | select | true | false | false | — | ["rooms-booking", "checkin-checkout", "dining", "meetings", "accessibility", "getting-here", "pets-parking", "general", "wifi-tech", "guest-services", "neighbourhood-guest", "arrival-departure", "in-room", "money-paym… | — | — | Use a category that matches this record’s context. Taxonomy is provisional until real questions land. | — | — | — | — |
| relevantPages | relationship → pages | false | false | false | — | — | pages | true | Optional pin — forces this question into a page’s mini block regardless of category. Use sparingly; category matching covers most cases. | — | — | — | — |
| order | number | true | false | false | 0 | — | — | — | Display order within a category, and tiebreaker for mini-block fallback fill. | — | — | — | — |
| slug | text | true | false | true | — | — | — | — | Anchor id for deep links, e.g. /faq#pet-policy. | — | — | beforeDuplicate(1) | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `artists`

- File: `src/collections/Artists.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Record count (dev DB): **2**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| name | text | true | false | false | — | — | — | — | — | — | — | — | — |
| generateSlug | checkbox | false | false | false | true | — | — | — | When enabled, the slug will auto-generate from the title field on save and autosave. | — | — | beforeChange(1) | — |
| slug | text | true | false | true | — | — | — | — | — | — | — | beforeDuplicate(1) | — |
| alias | text | false | false | false | — | — | — | — | — | — | — | — | — |
| bio | richText | false | true | false | — | — | — | — | — | — | — | — | — |
| shortBio | textarea | false | false | false | — | — | — | — | — | — | — | — | — |
| portrait | upload → media | false | false | false | — | — | media | — | — | — | — | — | — |
| website | text | false | false | false | — | — | — | — | — | — | — | — | — |
| instagram | text | false | false | false | — | — | — | — | — | — | — | — | — |
| nationality | text | false | false | false | — | — | — | — | — | — | — | — | — |
| basedIn | text | false | false | false | — | — | — | — | — | — | — | — | — |
| medium | text | false | false | false | — | — | — | — | — | — | — | — | — |
| tags | relationship → tags | false | false | false | — | — | tags | true | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `artworks`

- File: `src/collections/Artworks.ts`
- `versions`: false · `drafts`: false
- Status-style select: `status` options ['available', 'sold', 'not-for-sale'] (`src/collections/Artworks.ts:33`)
- Record count (dev DB): **0**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | text | true | false | false | — | — | — | — | — | — | — | — | — |
| generateSlug | checkbox | false | false | false | true | — | — | — | When enabled, the slug will auto-generate from the title field on save and autosave. | — | — | beforeChange(1) | — |
| slug | text | true | false | true | — | — | — | — | — | — | — | beforeDuplicate(1) | — |
| artist | relationship → artists | true | false | false | — | — | artists | — | — | — | — | — | — |
| editionNumber | text | false | false | false | — | — | — | — | — | — | — | — | — |
| medium | text | false | false | false | — | — | — | — | — | — | — | — | — |
| dimensions | text | false | false | false | — | — | — | — | — | — | — | — | — |
| year | number | false | false | false | — | — | — | — | — | — | — | — | — |
| description | richText | false | true | false | — | — | — | — | — | — | — | — | — |
| locationInBuilding | text | false | false | false | — | — | — | — | Floor + wing for /here art wall captions, e.g. "Floor 4 · near the lifts". Blank shows Location TBC. | — | — | — | — |
| images | array | false | false | false | — | — | — | — | — | — | — | — | — |
| images[].image | upload → media | true | false | false | — | — | media | — | — | — | — | — | — |
| images[].alt | text | true | false | false | — | — | — | — | — | — | — | — | — |
| images[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| status | select | false | false | false | — | ["available", "sold", "not-for-sale"] | — | — | — | — | — | — | — |
| tags | relationship → tags | false | false | false | — | — | tags | true | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `exhibitions`

- File: `src/collections/Exhibitions.ts`
- `versions`: false · `drafts`: false
- Status-style select: `status` options ['upcoming', 'current', 'permanent', 'past'] (`src/collections/Exhibitions.ts:25`)
- Record count (dev DB): **1**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | text | true | false | false | — | — | — | — | — | — | — | — | — |
| generateSlug | checkbox | false | false | false | true | — | — | — | When enabled, the slug will auto-generate from the title field on save and autosave. | — | — | beforeChange(1) | — |
| slug | text | true | false | true | — | — | — | — | — | — | — | beforeDuplicate(1) | — |
| subtitle | text | false | false | false | — | — | — | — | — | — | — | — | — |
| description | richText | false | true | false | — | — | — | — | — | — | — | — | — |
| startDate | date | false | false | false | — | — | — | — | — | — | — | — | — |
| endDate | date | false | false | false | — | — | — | — | — | — | — | — | — |
| location | text | false | false | false | — | — | — | — | — | — | — | — | — |
| venue | relationship → venues | false | false | false | — | — | venues | — | Hosting venue — required for SpotlightCard venue resolver | — | — | — | — |
| heroImage | upload → media | false | false | false | — | — | media | — | — | — | — | — | — |
| artists | relationship → artists | false | false | false | — | — | artists | true | — | — | — | — | — |
| artworks | relationship → artworks | false | false | false | — | — | artworks | true | — | — | — | — | — |
| status | select | false | false | false | — | ["upcoming", "current", "permanent", "past"] | — | — | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `events`

- File: `src/collections/Events.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Record count (dev DB): **4**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| name | text | true | true | false | — | — | — | — | — | — | — | — | — |
| generateSlug | checkbox | false | false | false | true | — | — | — | When enabled, the slug will auto-generate from the title field on save and autosave. | — | — | beforeChange(1) | — |
| slug | text | true | false | true | — | — | — | — | — | — | — | beforeDuplicate(1) | — |
| description | richText | false | true | false | — | — | — | — | — | — | — | — | — |
| shortDescription | textarea | false | true | false | — | — | — | — | — | — | — | — | — |
| startDate | date | true | false | false | — | — | — | — | — | — | — | — | — |
| endDate | date | false | false | false | — | — | — | — | — | — | — | — | — |
| category | select | false | false | false | — | ["Art", "Music", "Sport", "Food", "Community", "Neighbourhood", "Other"] | — | — | — | — | — | — | — |
| venue | relationship → venues | false | false | false | — | — | venues | — | — | — | — | — | — |
| isFree | checkbox | false | false | false | false | — | — | — | Show as free entry rather than unpriced. Independent of price = 0. | — | — | — | — |
| price | number | false | false | false | — | — | — | — | — | — | — | — | — |
| currency | select | false | false | false | EUR | ["EUR"] | — | — | — | (_,siblingData)=>!siblingData?.isFree | — | — | — |
| bookingRequired | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| bookingNote | text | false | true | false | — | — | — | — | e.g. "ohne Buchung, ohne Dresscode" | — | — | — | — |
| ticketUrl | text | false | false | false | — | — | — | — | — | — | — | — | — |
| heroImage | upload → media | false | false | false | — | — | media | — | — | — | — | — | — |
| tags | relationship → tags | false | false | false | — | — | tags | true | — | — | — | — | — |
| featured | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| isRecurring | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| recurrenceRule | text | false | false | false | — | — | — | — | iCal RRULE subset, e.g. FREQ=DAILY, FREQ=WEEKLY;BYDAY=TH, FREQ=MONTHLY;BYDAY=-1TH (last Thursday). Used with startDate time for next occurrence. | (_,siblingData)=>Boolean(siblingData?.isRecurring) | — | — | — |
| recurrenceNote | text | false | false | false | — | — | — | — | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `people`

- File: `src/collections/People.ts`
- `versions`: false · `drafts`: false
- Status-style select: `status` options ['draft', 'published'] (`src/collections/People.ts:122`)
- Record count (dev DB): **16**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| name | text | true | false | false | — | — | — | — | — | — | — | — | — |
| generateSlug | checkbox | false | false | false | true | — | — | — | When enabled, the slug will auto-generate from the title field on save and autosave. | — | — | beforeChange(1) | — |
| slug | text | true | false | true | — | — | — | — | — | — | — | beforeDuplicate(1) | — |
| jobTitle | text | false | false | false | — | — | — | — | — | — | — | — | — |
| shortBio | textarea | false | false | false | — | — | — | — | AI citation length — 2–3 sentences. | — | — | — | — |
| bio | richText | false | true | false | — | — | — | — | The full "You, Me & Berlin" letter/story. Write natively per locale, du register. | — | — | — | — |
| quote | text | false | false | false | — | — | — | — | Pull quote / signature line. | — | — | — | — |
| video | text | false | false | false | — | — | — | — | YouTube/Vimeo embed URL, optional. | — | — | — | — |
| portrait | upload → media | false | false | false | — | — | media | — | — | — | — | — | — |
| website | text | false | false | false | — | — | — | — | — | — | — | — | — |
| instagram | text | false | false | false | — | — | — | — | — | — | — | — | — |
| roomNumber | text | false | false | false | — | — | — | — | Physical room where their welcome letter is placed. | — | — | — | — |
| roomConfirmed | checkbox | false | false | false | false | — | — | — | Guest-facing room pill. Only when the hotel has confirmed this number. Disagreeing source files must not print a room. | — | — | — | — |
| basedIn | text | false | false | false | — | — | — | — | e.g. "Neukölln" | — | — | — | — |
| type | select | true | false | false | — | ["artist", "curator", "host", "partner", "staff", "local"] | — | — | — | — | — | — | — |
| tags | relationship → tags | false | false | false | — | — | tags | true | — | — | — | — | — |
| relatedVenue | relationship → venues | false | false | false | — | — | venues | — | — | — | — | — | — |
| authority | group | false | false | false | — | — | — | — | — | — | — | — | — |
| authority.identifier | array | false | false | false | — | — | — | — | — | — | — | — | — |
| authority.identifier[].propertyID | select | true | false | false | — | ["Wikidata", "GND", "VIAF", "GoogleKG"] | — | — | — | — | — | — | — |
| authority.identifier[].value | text | true | false | false | — | — | — | — | — | — | — | — | — |
| authority.identifier[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| authority.sameAs | array | false | false | false | — | — | — | — | — | — | — | — | — |
| authority.sameAs[].url | text | true | false | false | — | — | — | — | — | — | — | — | — |
| authority.sameAs[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| picks | join | false | false | false | — | — | — | — | Read-only — auto-populated from neighbourhoodPlaces.endorsements. Do not hand-maintain. (Payload join field — confirmed on 3.85) | — | — | — | — |
| featured | checkbox | false | false | false | false | — | — | — | — | — | — | — | — |
| displayOrder | number | false | false | false | — | — | — | — | — | — | — | — | — |
| status | select | true | false | false | draft | ["draft", "published"] | — | — | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `neighbourhood-places`

- File: `src/collections/NeighbourhoodPlaces.ts`
- `versions`: false · `drafts`: false
- Status-style select: `status` options ['active', 'inactive'] (`src/collections/NeighbourhoodPlaces.ts:313`)
- Note: Collection hooks: `beforeChange` geocodes / writes walkingMinutes; `afterChange` revalidates (`src/collections/NeighbourhoodPlaces.ts:15`).
- Record count (dev DB): **21**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| name | text | true | false | false | — | — | — | — | — | — | — | — | — |
| slug | text | true | false | true | — | — | — | — | — | — | — | beforeDuplicate(1) | — |
| category | select | true | false | false | — | ["Art", "Bar", "Kids", "Museum", "Parks and Nature", "Party", "Restaurant", "Shopping", "Sightseeing"] | — | — | — | — | — | — | — |
| secondaryCategory | select | false | false | false | — | ["Art", "Bar", "Kids", "Museum", "Parks and Nature", "Party", "Restaurant", "Shopping", "Sightseeing"] | — | — | xlsx “Also” column. Stored as a tag; primary `category` drives card colour and the map pin. | — | — | — | — |
| schemaType | select | true | false | false | — | ["TouristAttraction", "LocalBusiness", "Museum", "Park", "Restaurant", "BarOrPub", "ShoppingCenter"] | — | — | Drives the JSON-LD @type — apply the category→schemaType mapping at seed time, not by editor judgment. | — | — | — | — |
| address | group | false | false | false | — | — | — | — | — | — | — | — | — |
| address.streetAddress | text | false | false | false | — | — | — | — | — | — | — | — | — |
| address.addressLocality | text | true | false | false | Berlin | — | — | — | — | — | — | — | — |
| address.postalCode | text | false | false | false | — | — | — | — | — | — | — | — | — |
| geo | group | false | false | false | — | — | — | — | — | — | — | — | — |
| geo.latitude | number | false | false | false | — | — | — | — | — | — | — | — | — |
| geo.longitude | number | false | false | false | — | — | — | — | — | — | — | — | — |
| walkingMinutes | number | false | false | false | — | — | — | — | — | — | — | — | — |
| transit | group | false | false | false | — | — | — | — | Optional — render the transit row in PlaceInfoCard only when this is populated. Do not block launch on backfilling this for all places. | — | — | — | — |
| transit.minutes | number | false | false | false | — | — | — | — | — | — | — | — | — |
| transit.station | text | false | false | false | — | — | — | — | e.g. "Wittenbergplatz" | — | — | — | — |
| transit.line | text | false | false | false | — | — | — | — | e.g. "U1" — free text, not a select, since S-Bahn/bus lines don't fit a clean enum. | — | — | — | — |
| distanceTier | select | false | false | false | — | ["walkable", "short-transit", "further-out"] | — | — | Default filter on /nachbarschaft is "walkable". | — | — | — | — |
| indoorOutdoor | select | false | false | false | — | ["indoor", "outdoor", "both"] | — | — | — | — | — | — | — |
| targetAudience | array | false | false | false | — | — | — | — | xlsx "Zielgruppe" column — e.g. Alle, Kunstinteressierte, Freunde & Paare. | — | — | — | — |
| targetAudience[].label | text | false | false | false | — | — | — | — | — | — | — | — | — |
| targetAudience[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| description | textarea | false | true | false | — | — | — | — | — | — | — | — | — |
| endorsements | array | false | false | false | — | — | — | — | hasMany by design — one place can be endorsed by multiple people (e.g. Schloss Charlottenburg). | — | — | — | — |
| endorsements[].person | relationship → people | true | false | false | — | — | people | — | — | — | — | — | — |
| endorsements[].quote | text | true | false | false | — | — | — | — | Becomes reviewBody. Per-endorsement, not per-place. | — | — | — | — |
| endorsements[].associatedRoom | text | false | false | false | — | — | — | — | xlsx "Room" column — this endorsement's letter location. | — | — | — | — |
| endorsements[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| website | text | false | false | false | — | — | — | — | — | — | — | — | — |
| openingHours | text | false | false | false | — | — | — | — | — | — | — | — | — |
| priceRange | text | false | false | false | — | — | — | — | — | — | — | — | — |
| image | upload → media | false | false | false | — | — | media | — | — | — | — | — | — |
| imageCredit | group | false | false | false | — | — | — | — | Populate whenever image is not the hotel's own photography — required for any CC-licensed source (e.g. Wikimedia Commons), optional/blank for licensed stock or original photography where no visible credit is contractu… | — | — | — | — |
| imageCredit.creditText | text | false | false | false | — | — | — | — | e.g. "Photo: Jane Doe, CC BY-SA 4.0" | — | — | — | — |
| imageCredit.creditUrl | text | false | false | false | — | — | — | — | Link to the source/license page. | — | — | — | — |
| imageCredit.license | select | false | false | false | — | ["CC-BY", "CC-BY-SA", "licensed-stock", "original", "other"] | — | — | — | — | — | — | — |
| authority | group | false | false | false | — | — | — | — | — | — | — | — | — |
| authority.identifier | array | false | false | false | — | — | — | — | — | — | — | — | — |
| authority.identifier[].propertyID | select | true | false | false | — | ["Wikidata", "GND", "GoogleKG", "GooglePlaceID"] | — | — | — | — | — | — | — |
| authority.identifier[].value | text | true | false | false | — | — | — | — | — | — | — | — | — |
| authority.identifier[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| authority.sameAs | array | false | false | false | — | — | — | — | — | — | — | — | — |
| authority.sameAs[].url | text | true | false | false | — | — | — | — | — | — | — | — | — |
| authority.sameAs[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| homepageTeaser | group | false | false | false | — | — | — | — | Independent from hereTeaser. Fallback if featuredOrder is empty — prefer featuredOrder 1–15 for the paginated homepage map. | — | — | — | — |
| homepageTeaser.enabled | checkbox | false | false | false | false | — | — | — | Include this place on the homepage map teaser. | — | — | — | — |
| homepageTeaser.order | number | false | false | false | — | — | — | — | Display order (lower first). | — | — | — | — |
| hereTeaser | group | false | false | false | — | — | — | — | Independent from homepageTeaser — feature a different set of places on the /here map teaser. | — | — | — | — |
| hereTeaser.enabled | checkbox | false | false | false | false | — | — | — | Include this place on the /here map teaser. | — | — | — | — |
| hereTeaser.order | number | false | false | false | — | — | — | — | Display order (lower first). | — | — | — | — |
| featuredOrder | number | false | false | false | — | — | — | — | Homepage map pagination order (1–15). Non-null includes the place; pages of 5 in featuredOrder sequence. Used by getFeaturedOrderPlaces / getMapTeaserPlaces. | — | — | — | — |
| status | select | true | false | false | active | ["active", "inactive"] | — | — | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `places`

- File: `src/collections/Places.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Note: Collection hook `afterChange` revalidates (`src/collections/Places.ts:13`). `shortDescriptionDE` exists as a separate non-localized field (`src/collections/Places.ts:99`).
- Record count (dev DB): **14**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| name | text | true | false | false | — | — | — | — | Display name shown on map and cards | — | — | — | — |
| slug | text | true | false | true | — | — | — | — | URL-safe identifier — auto-generated from name, editable | — | — | beforeDuplicate(1) | — |
| context | select | true | false | false | — | ["outside", "inside", "both"] | — | — | Controls which map this place appears on. "Both" = hotel concierge picks visible to all. | — | — | — | — |
| type | select | true | false | false | — | ["monument", "concierge", "in-building"] | — | — | Monument = static editorial content. Concierge = team voice, updated seasonally. In the building = Lütze, KTTK, FKKB etc. | — | — | — | — |
| category | select | true | false | false | — | ["park", "museum", "gallery", "culture", "restaurant", "bar", "cafe", "shop", "transport", "sport", "other"] | — | — | — | — | — | — | — |
| shortDescription | text | true | false | false | — | — | — | — | One line — shown in map popup and card previews. Max 120 characters. Write in the hotel voice — direct, specific, no superlatives. | — | — | — | — |
| shortDescriptionDE | text | false | false | false | — | — | — | — | German version of short description. Write natively — do not translate. | — | — | — | — |
| fullDescription | richText | false | false | false | — | — | — | — | Used on detail pages and expanded card views. Optional for monuments, recommended for concierge picks. | — | — | — | — |
| location | group | false | false | false | — | — | — | — | — | — | — | — | — |
| location.lat | number | true | false | false | — | — | — | — | Latitude — e.g. 52.5027 | — | — | — | — |
| location.lng | number | true | false | false | — | — | — | — | Longitude — e.g. 13.3583 | — | — | — | — |
| address | text | false | false | false | — | — | — | — | Street address — shown in popup. Optional for parks and landmarks. | — | — | — | — |
| walkingMinutes | number | false | false | false | — | — | — | — | Walking time from hotel in minutes. Fill this in manually — the team knows whether it is a nice walk or not. Leave empty for in-building places. | data=>data.type!=="in-building" | — | — | — |
| walkingNote | text | false | false | false | — | — | — | — | Optional note on the walk — e.g. "Nice route along the canal". Keep it short. | data=>data.type!=="in-building" | — | — | — |
| floor | text | false | false | false | — | — | — | — | For in-building places only — e.g. "Ground floor", "B2 Basement", "Every floor". Replaces walking time in the UI. | data=>data.type==="in-building" | — | — | — |
| website | text | false | false | false | — | — | — | — | Full URL including https:// | — | — | — | — |
| hours | text | false | false | false | — | — | — | — | Opening hours as a simple string — e.g. "Daily 10:00–22:00" or "Thu–Sun from 18:00" | — | — | — | — |
| image | upload → media | false | false | false | — | — | media | — | Used in card views and detail pages. Not shown on the map itself. | — | — | — | — |
| pinIcon | select | false | false | false | auto | ["auto", "building", "park", "music", "cafe", "shop", "gallery", "waves", "arch", "sport"] | — | — | Overrides the automatic icon set by category. Leave as "auto" unless you need something specific. | — | — | — | — |
| schemaType | select | false | false | false | TouristAttraction | ["LodgingBusiness", "TouristAttraction", "LocalBusiness", "Restaurant", "CafeOrCoffeeShop", "BarOrPub", "Park", "ArtGallery", "Museum", "SportsActivityLocation"] | — | — | Schema.org type used in JSON-LD output. Defaults to TouristAttraction — change for restaurants, bars etc. | — | — | — | — |
| featured | checkbox | false | false | false | false | — | — | — | Featured places are shown on the homepage MapTeaser. Keep to 6–8 maximum. | — | — | — | — |
| active | checkbox | false | false | false | true | — | — | — | Uncheck to hide from maps and lists without deleting the record. | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `pages`

- File: `src/collections/Pages.ts`
- `versions`: false · `drafts`: false
- Status-style select: `status` options ['skeleton', 'in-progress', 'live'] (`src/collections/Pages.ts:47`)
- Record count (dev DB): **26**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | text | true | true | false | — | — | — | — | — | — | — | — | — |
| slug | text | true | false | true | — | — | — | — | e.g. "rooms" → /rooms · "here/art" → /here/art (no leading slash) | — | — | beforeDuplicate(1) | — |
| context | select | true | false | false | — | ["outside", "inside", "both", "policy"] | — | — | — | — | — | — | — |
| status | select | false | false | false | skeleton | ["skeleton", "in-progress", "live"] | — | — | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### `legal-documents`

- File: `src/collections/LegalDocuments.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Note: Collection hook `afterChange` revalidates (`src/collections/LegalDocuments.ts:29`).
- Record count (dev DB): **5**

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| slug | select | true | false | true | — | ["imprint", "privacy", "terms", "cookies", "disclaimer"] | — | — | Locks this document to a site URL (e.g. imprint → /imprint, /de/impressum). Do not change after create. | — | — | beforeDuplicate(1) | — |
| title | text | true | true | false | — | — | — | — | Page heading, e.g. “Privacy Policy” / “Datenschutzerklärung”. | — | — | — | — |
| updatedLabel | text | false | true | false | — | — | — | — | Optional date line shown under the heading, e.g. “24th April 2026”. Leave empty to hide. | — | — | — | — |
| lede | textarea | false | true | false | — | — | — | — | Optional intro under the heading (used on privacy). Not shown on Terms. | — | — | — | — |
| body | richText | true | true | false | — | — | — | — | Full legal text. Use headings (H2/H3), numbered or bullet lists, and links. Edit German and English separately with the locale switcher. | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### global `hotel`

- File: `src/globals/Hotel.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Record count: 1 (global)

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| name | text | true | false | false | — | — | — | — | — | — | — | — | — |
| legalName | text | false | false | false | — | — | — | — | — | — | — | — | — |
| description | richText | false | true | false | — | — | — | — | — | — | — | — | — |
| shortDescription | textarea | false | true | false | — | — | — | — | Max 160 chars. Used for meta descriptions and AI citation. | — | — | — | — |
| url | text | false | false | false | — | — | — | — | — | — | — | — | — |
| telephone | text | false | false | false | — | — | — | — | — | — | — | — | — |
| conferencePhone | text | false | false | false | — | — | — | — | — | — | — | — | — |
| email | email | false | false | false | — | — | — | — | — | — | — | — | — |
| address | group | false | false | false | — | — | — | — | — | — | — | — | — |
| address.streetAddress | text | false | false | false | — | — | — | — | — | — | — | — | — |
| address.addressLocality | text | false | false | false | — | — | — | — | — | — | — | — | — |
| address.postalCode | text | false | false | false | — | — | — | — | — | — | — | — | — |
| address.addressCountry | text | false | false | false | — | — | — | — | — | — | — | — | — |
| geo | group | false | false | false | — | — | — | — | — | — | — | — | — |
| geo.latitude | number | false | false | false | — | — | — | — | — | — | — | — | — |
| geo.longitude | number | false | false | false | — | — | — | — | — | — | — | — | — |
| hasMap | text | false | false | false | — | — | — | — | Google Maps URL | — | — | — | — |
| directionsUrl | text | false | false | false | — | — | — | — | “Get directions” link — Google Maps directions URL. Falls back to hasMap, then coords. | — | — | — | — |
| mapBounds | group | false | false | false | — | — | — | — | Viewport for neighbourhood map and homepage map teaser. | — | — | — | — |
| mapBounds.north | number | false | false | false | — | — | — | — | — | — | — | — | — |
| mapBounds.south | number | false | false | false | — | — | — | — | — | — | — | — | — |
| mapBounds.west | number | false | false | false | — | — | — | — | — | — | — | — | — |
| mapBounds.east | number | false | false | false | — | — | — | — | — | — | — | — | — |
| checkinTime | text | false | false | false | — | — | — | — | — | — | — | — | — |
| checkoutTime | text | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay | group | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.wifiNetwork | text | false | false | false | — | — | — | — | Guest WiFi SSID — shown in monospace pill. Not localised. | — | — | — | — |
| guestStay.wifiPassword | text | false | false | false | — | — | — | — | Guest WiFi password — shown in monospace pill. Not localised. | — | — | — | — |
| guestStay.checkout | group | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.checkout.valueDE | text | false | false | false | 12:00 | — | — | — | — | — | — | — | — |
| guestStay.checkout.valueEN | text | false | false | false | 12:00 | — | — | — | — | — | — | — | — |
| guestStay.checkout.noteDE | text | false | false | false | Später auf Anfrage | — | — | — | — | — | — | — | — |
| guestStay.checkout.noteEN | text | false | false | false | Later on request | — | — | — | — | — | — | — | — |
| guestStay.breakfast | group | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.breakfast.valueDE | text | false | false | false | 06:30 – 10:00 | — | — | — | — | — | — | — | — |
| guestStay.breakfast.valueEN | text | false | false | false | 06:30 – 10:00 | — | — | — | — | — | — | — | — |
| guestStay.breakfast.noteDE | text | false | false | false | Lütze, Erdgeschoss | — | — | — | — | — | — | — | — |
| guestStay.breakfast.noteEN | text | false | false | false | Lütze, ground floor | — | — | — | — | — | — | — | — |
| guestStay.parking | group | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.parking.valueDE | text | false | false | false | 4 € / Std. | — | — | — | — | — | — | — | — |
| guestStay.parking.valueEN | text | false | false | false | €4 / hour | — | — | — | — | — | — | — | — |
| guestStay.parking.noteDE | text | false | false | false | Tiefgarage · max. 25 €/Tag | — | — | — | — | — | — | — | — |
| guestStay.parking.noteEN | text | false | false | false | Underground · max. €25/day | — | — | — | — | — | — | — | — |
| guestStay.luggage | group | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.luggage.valueDE | text | false | false | false | Rezeption | — | — | — | — | — | — | — | — |
| guestStay.luggage.valueEN | text | false | false | false | Reception | — | — | — | — | — | — | — | — |
| guestStay.luggage.noteDE | text | false | false | false | Auch nach dem Check-out | — | — | — | — | — | — | — | — |
| guestStay.luggage.noteEN | text | false | false | false | Also after check-out | — | — | — | — | — | — | — | — |
| guestStay.more | group | false | false | false | — | — | — | — | Wundermart, Bett & Bike, Sauna, pets — render only when a value is set. Leave blank to hide. | — | — | — | — |
| guestStay.more.wundermart | group | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.more.wundermart.valueDE | text | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.more.wundermart.valueEN | text | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.more.wundermart.noteDE | text | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.more.wundermart.noteEN | text | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.more.bettAndBike | group | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.more.bettAndBike.valueDE | text | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.more.bettAndBike.valueEN | text | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.more.bettAndBike.noteDE | text | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.more.bettAndBike.noteEN | text | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.more.saunaFitness | group | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.more.saunaFitness.valueDE | text | false | false | false | 24/7 | — | — | — | — | — | — | — | — |
| guestStay.more.saunaFitness.valueEN | text | false | false | false | 24/7 | — | — | — | — | — | — | — | — |
| guestStay.more.saunaFitness.noteDE | text | false | false | false | Sauna · Fitness | — | — | — | — | — | — | — | — |
| guestStay.more.saunaFitness.noteEN | text | false | false | false | Sauna · gym | — | — | — | — | — | — | — | — |
| guestStay.more.pets | group | false | false | false | — | — | — | — | — | — | — | — | — |
| guestStay.more.pets.valueDE | text | false | false | false | €30 / Tag | — | — | — | — | — | — | — | — |
| guestStay.more.pets.valueEN | text | false | false | false | €30 / day | — | — | — | — | — | — | — | — |
| guestStay.more.pets.noteDE | text | false | false | false | Hunde willkommen | — | — | — | — | — | — | — | — |
| guestStay.more.pets.noteEN | text | false | false | false | Dogs welcome | — | — | — | — | — | — | — | — |
| guestStay.checkoutNote | text | false | true | false | — | — | — | — | Legacy — use checkout.noteDE / noteEN | — | — | — | — |
| guestStay.breakfastLocation | text | false | true | false | — | — | — | — | Legacy — use breakfast.noteDE / noteEN | — | — | — | — |
| guestStay.parkingSummary | text | false | true | false | — | — | — | — | Legacy — use parking.value / note | — | — | — | — |
| guestStay.luggageNote | text | false | true | false | — | — | — | — | Legacy — use luggage.value / note | — | — | — | — |
| bridgeNav | group | false | false | false | — | — | — | — | Row-2 door between outside (home) and /here. Full string; the last caps word becomes the boxed button. | — | — | — | — |
| bridgeNav.toHereLabelEN | text | false | false | false | Already in the house? ENTER → | — | — | — | — | — | — | — | — |
| bridgeNav.toHereLabelDE | text | false | false | false | Schon im Haus? ENTER → | — | — | — | — | — | — | — | — |
| bridgeNav.toStayLabelEN | text | false | false | false | Not here yet? STAY → | — | — | — | — | — | — | — | — |
| bridgeNav.toStayLabelDE | text | false | false | false | Noch nicht hier? BLEIB → | — | — | — | — | — | — | — | — |
| starRating | number | false | false | false | — | — | — | — | — | — | — | — | — |
| priceRange | text | false | false | false | — | — | — | — | — | — | — | — | — |
| totalRooms | number | false | false | false | — | — | — | — | — | — | — | — | — |
| foundingDate | text | false | false | false | — | — | — | — | — | — | — | — | — |
| brand | text | false | false | false | — | — | — | — | — | — | — | — | — |
| parentOrganization | text | false | false | false | — | — | — | — | — | — | — | — | — |
| wikidataId | text | false | false | false | — | — | — | — | e.g. Q1630833 | — | — | — | — |
| sameAs | array | false | false | false | — | — | — | — | — | — | — | — | — |
| sameAs[].url | text | false | false | false | — | — | — | — | — | — | — | — | — |
| sameAs[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| amenityFeature | array | false | false | false | — | — | — | — | — | — | — | — | — |
| amenityFeature[].name | text | false | false | false | — | — | — | — | — | — | — | — | — |
| amenityFeature[].value | checkbox | false | false | false | true | — | — | — | — | — | — | — | — |
| amenityFeature[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| certifications | array | false | false | false | — | — | — | — | — | — | — | — | — |
| certifications[].name | text | false | false | false | — | — | — | — | — | — | — | — | — |
| certifications[].url | text | false | false | false | — | — | — | — | — | — | — | — | — |
| certifications[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| openingHours | group | false | false | false | — | — | — | — | Legacy flat strings — kept so Postgres columns are not renamed. Use Hours rows. | — | — | — | — |
| openingHours.reception | text | false | false | false | — | — | — | — | — | — | — | — | — |
| openingHours.breakfast | text | false | false | false | — | — | — | — | — | — | — | — | — |
| hours | array | false | false | false | — | — | — | — | Same row shape as venues. Reception, breakfast (weekday/weekend), and any other hotel-wide hours. | — | — | — | — |
| hours[].dayOfWeek | text | false | false | false | — | — | — | — | e.g. Mo-Su, Mo-Fr, Sa-Su, or Thursday | — | — | — | — |
| hours[].opens | text | false | false | false | — | — | — | — | e.g. 10:00 | — | — | — | — |
| hours[].closes | text | false | false | false | — | — | — | — | Clock time, e.g. 22:30 or 01:00. Required for open/closed status. | — | — | — | — |
| hours[].isOpenEnded | checkbox | false | false | false | false | — | — | — | No advertised close — still store a clock bound in `closes` so status can be derived. The UI renders the i18n “open end” phrase. | — | — | — | — |
| hours[].segment | text | false | false | false | — | — | — | — | Grouping label for open/closed status, e.g. "Bar" / "Kitchen" / "Breakfast". Multiple rows may share a segment. | — | — | — | — |
| hours[].note | text | false | false | false | — | — | — | — | Optional status note, e.g. "Kitchen closes 22:30" | — | — | — | — |
| hours[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| breakfastPricing | group | false | false | false | — | — | — | — | A–Z breakfast prices. Shown on the guest hub dining band, not hardcoded. | — | — | — | — |
| breakfastPricing.adultPrice | number | false | false | false | — | — | — | — | Adult price in EUR, e.g. 23 | — | — | — | — |
| breakfastPricing.childPrice | number | false | false | false | — | — | — | — | Child price in EUR, e.g. 12 | — | — | — | — |
| breakfastPricing.childAgeFrom | number | false | false | false | — | — | — | — | Children from this age pay the child price, e.g. 6 | — | — | — | — |
| roomService | group | false | false | false | — | — | — | — | Guest hub dining band states this plainly. Default is no room service — collect at the bar. | — | — | — | — |
| roomService.offered | checkbox | false | false | false | false | — | — | — | Hotel offers in-room dining. Leave off to state that it does not. | — | — | — | — |
| roomService.note | text | false | true | false | — | — | — | — | Guest-facing line, e.g. "Kein Zimmerservice — Abholung an der Bar". | — | — | — | — |
| heroMapImage | upload → media | false | false | false | — | — | media | — | Circular map image in the homepage hero. Upload a square image (~600×600). Replaces the generated Mapbox preview when set. | — | — | — | — |
| getDirectionsLabel | text | false | true | false | — | — | — | — | Hero map CTA label, e.g. "Get Directions" / "Wegbeschreibung". | — | — | — | — |
| heroShortAddress | text | false | true | false | — | — | — | — | Short display address in the hero map badge hover pill (e.g. "Lützowplatz 17, Tiergarten"). Distinct from the full structured address. | — | — | — | — |
| meetAndWork | group | false | false | false | — | — | — | — | Homepage “Meet & Work” teaser — editable DE/EN copy and rotating photos. Links to /meetings. | — | — | — | — |
| meetAndWork.kicker | text | false | true | false | — | — | — | — | Section kicker, e.g. "Meet & Work" / "Tagen & Arbeiten". | — | — | — | — |
| meetAndWork.subhead | text | false | true | false | — | — | — | — | Bold subhead, e.g. "Serious business, playful spaces". | — | — | — | — |
| meetAndWork.body | textarea | false | true | false | — | — | — | — | Short pitch paragraph under the subhead. | — | — | — | — |
| meetAndWork.slides | array | false | false | false | — | — | — | — | Rotating photos (like Sleep & Relax). Each slide has an image and a typewriter caption (DE/EN). | — | — | — | — |
| meetAndWork.slides[].image | upload → media | true | false | false | — | — | media | — | — | — | — | — | — |
| meetAndWork.slides[].imageAlt | text | false | true | false | — | — | — | — | Descriptive alt text — AEO ImageObject.description. | — | — | — | — |
| meetAndWork.slides[].caption | text | false | true | false | — | — | — | — | Typewriter line under the body, e.g. room/space name. Localize DE + EN. | — | — | — | — |
| meetAndWork.slides[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| meetAndWork.ctaLabel | text | false | true | false | — | — | — | — | Line-CTA label, e.g. "All meeting rooms" / "Alle Meetingräume". | — | — | — | — |
| roomsPageIntro | group | false | false | false | — | — | — | — | Editable header for /rooms · /zimmer index page. | — | — | — | — |
| roomsPageIntro.title | text | false | true | false | — | — | — | — | Defaults to "Rooms & Suites" / "Zimmer & Suiten" if empty. | — | — | — | — |
| roomsPageIntro.body | textarea | false | true | false | — | — | — | — | Intro paragraph under the H1 (Laica A). | — | — | — | — |
| compareTable | group | false | false | false | — | — | — | — | Hide-dont-delete toggle for the /rooms comparison matrix. | — | — | — | — |
| compareTable.enabled | checkbox | false | false | false | true | — | — | — | Show the “Compare all rooms” section on the rooms index. | — | — | — | — |
| roomsSuitesCallout | group | false | false | false | — | — | — | — | Quote block on /rooms · /zimmer — shown after the room slug set in “Insert after”. | — | — | — | — |
| roomsSuitesCallout.enabled | checkbox | false | false | false | true | — | — | — | Show the suites callout on the rooms index. | — | — | — | — |
| roomsSuitesCallout.insertAfterSlug | text | false | false | false | premium | — | — | — | Room slug after which the callout appears (default: premium). | — | — | — | — |
| roomsSuitesCallout.quote | textarea | false | true | false | — | — | — | — | Pull quote — serif, shown above the title. | — | — | — | — |
| roomsSuitesCallout.title | text | false | true | false | — | — | — | — | Heading, e.g. "The Suites" / "Die Suiten". | — | — | — | — |
| roomsSuitesCallout.body | textarea | false | true | false | — | — | — | — | Short paragraph under the title. | — | — | — | — |
| eatAndDrink | group | false | false | false | — | — | — | — | Homepage Lütze / Eat & Drink teaser — Rooms-style layout (text + arch photo + one Sweep CTA). Links to /restaurant. | — | — | — | — |
| eatAndDrink.kicker | text | false | true | false | — | — | — | — | Small label above the heading, e.g. "Eat & Drink" / "Essen & Trinken". | — | — | — | — |
| eatAndDrink.heading | text | false | true | false | — | — | — | — | Serif headline, e.g. "The place to eat, play, and hang all day." | — | — | — | — |
| eatAndDrink.body | textarea | false | true | false | — | — | — | — | Short pitch paragraph under the heading. | — | — | — | — |
| eatAndDrink.image | upload → media | false | false | false | — | — | media | — | Arch-topped teaser photo (interior / terrace). | — | — | — | — |
| eatAndDrink.imageAlt | text | false | true | false | — | — | — | — | Descriptive alt text — AEO ImageObject.description. | — | — | — | — |
| eatAndDrink.ctaLabel | text | false | true | false | — | — | — | — | Sweep-CTA label, e.g. "Eat & Drink" / "Essen & Trinken". | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### global `homepage`

- File: `src/globals/Homepage.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Note: Global hook `afterChange` revalidates (`src/globals/Homepage.ts:10`).
- Record count: 1 (global)

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heroSlides | array | false | false | false | — | — | — | — | Deprecated — manage slides in the Hero slides collection instead. Kept empty after migration. | — | — | — | — |
| heroSlides[].image | upload → media | true | false | false | — | — | media | — | — | — | — | — | — |
| heroSlides[].alt | text | true | true | false | — | — | — | — | Descriptive alt text for the photo. | — | — | — | — |
| heroSlides[].caption | text | true | true | false | — | — | — | — | Short label over the photo, e.g. "LÜTZE · GROUND FLOOR". | — | — | — | — |
| heroSlides[].kbOrigin | select | true | false | false | bottom-left | ["bottom-left", "top-right", "top-left", "bottom-right"] | — | — | — | — | — | — | — |
| heroSlides[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| roomsTeaser | group | false | false | false | — | — | — | — | Homepage “Sleep & Relax” block — editable DE/EN copy. | — | — | — | — |
| roomsTeaser.heading | text | false | true | false | — | — | — | — | Section heading, e.g. "Sleep & Relax". | — | — | — | — |
| roomsTeaser.body | textarea | false | true | false | — | — | — | — | Supporting paragraph under the heading. | — | — | — | — |
| roomsTeaser.ctaLabel | text | false | true | false | — | — | — | — | Line-CTA label, e.g. "Discover our rooms" / "Zimmer entdecken". | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### global `navigation`

- File: `src/globals/Navigation.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Note: Global hooks: `beforeValidate` unique pages; `afterChange` revalidates (`src/globals/Navigation.ts:10`).
- Record count: 1 (global)

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| secondaryLinks | array | false | false | false | — | — | — | — | Drag to reorder. These become row 1 on /here. Maximum 5 links. | — | — | — | — |
| secondaryLinks[].page | relationship → pages | true | false | false | — | — | pages | — | Inside (/here) pages only. | — | — | — | — |
| secondaryLinks[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### global `footer`

- File: `src/globals/Footer.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Note: Global hook `afterChange` revalidates (`src/globals/Footer.ts:13`).
- Record count: 1 (global)

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| bookDirectStrip | group | false | false | false | — | — | — | — | Separate bar above the footer. Toggle visibility independently of the footer body. | — | — | — | — |
| bookDirectStrip.visible | checkbox | false | false | false | true | — | — | — | Uncheck to hide the book-direct CTA strip site-wide. | — | — | — | — |
| bookDirectStrip.message | text | false | true | false | — | — | — | — | — | (_,siblingData)=>Boolean(siblingData?.visible) | — | — | — |
| bookDirectStrip.ctaLabel | text | false | true | false | — | — | — | — | — | (_,siblingData)=>Boolean(siblingData?.visible) | — | — | — |
| bookDirectStrip.ctaUrl | text | false | false | false | /book | — | — | — | — | (_,siblingData)=>Boolean(siblingData?.visible) | — | — | — |
| contact | group | false | false | false | — | — | — | — | — | — | — | — | — |
| contact.sinceYear | text | false | false | false | 1958 | — | — | — | — | — | — | — | — |
| contact.addressLines | array | false | false | false | — | — | — | — | — | — | — | — | — |
| contact.addressLines[].line | text | true | false | false | — | — | — | — | — | — | — | — | — |
| contact.addressLines[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| contact.phone | text | false | false | false | — | — | — | — | — | — | — | — | — |
| contact.email | email | false | false | false | — | — | — | — | — | — | — | — | — |
| contact.transitLines | array | false | false | false | — | — | — | — | e.g. "Bus 100, 106, 187", "U Nollendorfplatz 7 min", "S+U Zoo 10 min" — rendered joined by " · ". | — | — | — | — |
| contact.transitLines[].line | text | true | true | false | — | — | — | — | — | — | — | — | — |
| contact.transitLines[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| columns | array | false | false | false | — | — | — | — | — | — | — | — | — |
| columns[].icon | text | false | false | false | — | — | — | — | Pick a Lucide icon. Leave blank for no icon. | — | — | — | — |
| columns[].title | text | true | true | false | — | — | — | — | — | — | — | — | — |
| columns[].links | array | false | false | false | — | — | — | — | — | — | — | — | — |
| columns[].links[].label | text | true | true | false | — | — | — | — | — | — | — | — | — |
| columns[].links[].linkType | radio | false | false | false | internal | ["internal", "external"] | — | — | — | — | — | — | — |
| columns[].links[].internalPage | relationship → pages | false | false | false | — | — | pages | — | CMS page (slug becomes the href). | (_,siblingData)=>siblingData?.linkType==="internal" | — | — | — |
| columns[].links[].externalUrl | text | false | false | false | — | — | — | — | Absolute URL or site path, e.g. https://… or /rooms | (_,siblingData)=>siblingData?.linkType==="external" | — | — | — |
| columns[].links[].showArrow | checkbox | false | false | false | false | — | — | — | Adds the "→" treatment used for Lütze / FKKB / KTTK — links that exit to a different venue frontend rather than a page within this site. | — | — | — | — |
| columns[].links[].dividerBefore | checkbox | false | false | false | false | — | — | — | Adds a small gap above this link — used to group related links within a column (e.g. before "Check-in/Check-out", or before "On the Walls"). | — | — | — | — |
| columns[].links[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| columns[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| alreadyHereColumn | group | false | false | false | — | — | — | — | — | — | — | — | — |
| alreadyHereColumn.title | text | true | true | false | — | — | — | — | — | — | — | — | — |
| alreadyHereColumn.icon | text | false | false | false | — | — | — | — | Pick a Lucide icon. Leave blank for no icon. | — | — | — | — |
| alreadyHereColumn.description | textarea | false | true | false | — | — | — | — | — | — | — | — | — |
| alreadyHereColumn.links | array | false | false | false | — | — | — | — | — | — | — | — | — |
| alreadyHereColumn.links[].label | text | true | true | false | — | — | — | — | — | — | — | — | — |
| alreadyHereColumn.links[].linkType | radio | false | false | false | internal | ["internal", "external"] | — | — | — | — | — | — | — |
| alreadyHereColumn.links[].internalPage | relationship → pages | false | false | false | — | — | pages | — | CMS page (slug becomes the href). | (_,siblingData)=>siblingData?.linkType==="internal" | — | — | — |
| alreadyHereColumn.links[].externalUrl | text | false | false | false | — | — | — | — | Absolute URL or site path, e.g. https://… or /rooms | (_,siblingData)=>siblingData?.linkType==="external" | — | — | — |
| alreadyHereColumn.links[].showArrow | checkbox | false | false | false | false | — | — | — | Adds the "→" treatment used for Lütze / FKKB / KTTK — links that exit to a different venue frontend rather than a page within this site. | — | — | — | — |
| alreadyHereColumn.links[].dividerBefore | checkbox | false | false | false | false | — | — | — | Adds a small gap above this link — used to group related links within a column (e.g. before "Check-in/Check-out", or before "On the Walls"). | — | — | — | — |
| alreadyHereColumn.links[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| awards | array | false | false | false | — | — | — | — | Sustainability certifications and award badges. Add, remove, or reorder freely. Uncheck “Show on website” to hide a logo without deleting it. | — | — | — | — |
| awards[].visible | checkbox | false | false | false | true | — | — | — | Uncheck to hide this logo on the public site without removing it from the CMS. | — | — | — | — |
| awards[].image | upload → media | true | false | false | — | — | media | — | — | — | — | — | — |
| awards[].altText | text | true | true | false | — | — | — | — | Accessible name for the logo (also used as fallback text if the image fails). | — | — | — | — |
| awards[].linkUrl | text | false | false | false | — | — | — | — | Optional URL opened in a new tab when the logo is clicked (e.g. certification page). Leave blank if not clickable. | — | — | — | — |
| awards[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| awardsHeading | text | false | true | false | — | — | — | — | Label above the awards row, e.g. "Awards & Recognition". | — | — | — | — |
| partnerLinks | array | false | false | false | — | — | — | — | “Part of …” strip under the awards. Add, remove, or reorder freely. Uncheck “Show on website” to hide a link without deleting it. | — | — | — | — |
| partnerLinks[].visible | checkbox | false | false | false | true | — | — | — | Uncheck to hide this partner link on the public site without removing it. | — | — | — | — |
| partnerLinks[].label | text | true | true | false | — | — | — | — | — | — | — | — | — |
| partnerLinks[].url | text | true | false | false | — | — | — | — | External URL opened in a new tab. | — | — | — | — |
| partnerLinks[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| legalLinks | array | false | false | false | — | — | — | — | Bottom bar links (Imprint, Privacy, Terms, …). Add, remove, or reorder freely. Uncheck “Show on website” to hide a link without deleting it. | — | — | — | — |
| legalLinks[].visible | checkbox | false | false | false | true | — | — | — | Uncheck to hide this link on the public site without removing it. | — | — | — | — |
| legalLinks[].label | text | true | true | false | — | — | — | — | — | — | — | — | — |
| legalLinks[].url | text | true | false | false | — | — | — | — | Site path or absolute URL, e.g. /imprint or https://… | — | — | — | — |
| legalLinks[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| copyrightEntity | text | false | false | false | Pandox Berlin GmbH | — | — | — | Year is generated at render time — do not include a year here. | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

### global `meetings`

- File: `src/globals/Meetings.ts`
- `versions`: false · `drafts`: false
- Status-style select: does not exist.
- Record count: 1 (global)

| path | type | required | localized | unique | default | options | relationTo | hasMany | admin.description | condition | validate | hooks | access |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heroKicker | text | false | true | false | — | — | — | — | Small line above the headline, e.g. “Award-winning business hotel in Berlin”. | — | — | — | — |
| heroHeadline | text | false | true | false | — | — | — | — | — | — | — | — | — |
| heroIntro | textarea | false | true | false | — | — | — | — | — | — | — | — | — |
| heroContactLabel | text | false | true | false | — | — | — | — | Label above phone/email, e.g. “Kontaktieren Sie uns:”. | — | — | — | — |
| heroSlides | array | false | false | false | — | — | — | — | Full-bleed hero rotation. Order = playback order. | — | — | — | — |
| heroSlides[].image | upload → media | true | false | false | — | — | media | — | — | — | — | — | — |
| heroSlides[].alt | text | true | true | false | — | — | — | — | — | — | — | — | — |
| heroSlides[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| contactPhone | text | false | false | false | +49 30 2605 2700 | — | — | — | — | — | — | — | — |
| contactEmail | text | false | false | false | meetings@hotel-berlin.de | — | — | — | — | — | — | — | — |
| eventTypesHeading | text | false | true | false | — | — | — | — | Section title above the format cards. Leave blank to hide the heading. | — | — | — | — |
| eventTypes | array | false | false | false | — | — | — | — | Add, reorder, or delete cards. Use a stable key matching the seed filename (meetings, conferences, fairs, exhibitions). | — | — | — | — |
| eventTypes[].key | text | false | false | false | — | — | — | — | Stable id for seeding photos, e.g. meetings → event-formats/meetings.jpg | — | — | — | — |
| eventTypes[].label | text | true | true | false | — | — | — | — | — | — | — | — | — |
| eventTypes[].description | textarea | true | true | false | — | — | — | — | — | — | — | — | — |
| eventTypes[].image | upload → media | false | false | false | — | — | media | — | Card photo. Prefer seeding from event-formats/{key}.jpg | — | — | — | — |
| eventTypes[].lucideIcon | text | false | false | false | — | — | — | — | Optional Lucide icon if no photo yet, e.g. Users, Presentation, Store, Frame. | — | — | — | — |
| eventTypes[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| hybridTeaser | group | false | false | false | — | — | — | — | — | — | — | — | — |
| hybridTeaser.kicker | text | false | true | false | — | — | — | — | — | — | — | — | — |
| hybridTeaser.headline | text | false | true | false | — | — | — | — | — | — | — | — | — |
| hybridTeaser.body | textarea | false | true | false | — | — | — | — | — | — | — | — | — |
| hybridTeaser.ctaLabel | text | false | true | false | — | — | — | — | — | — | — | — | — |
| hybridTeaser.image | upload → media | false | false | false | — | — | media | — | Wide photo for the split teaser. Suggested seed path: src/seed/assets/meet-and-work/teasers/hybrid.jpg | — | — | — | — |
| foodDrinkTeaser | group | false | false | false | — | — | — | — | — | — | — | — | — |
| foodDrinkTeaser.kicker | text | false | true | false | — | — | — | — | — | — | — | — | — |
| foodDrinkTeaser.headline | text | false | true | false | — | — | — | — | — | — | — | — | — |
| foodDrinkTeaser.body | textarea | false | true | false | — | — | — | — | — | — | — | — | — |
| foodDrinkTeaser.ctaLabel | text | false | true | false | — | — | — | — | — | — | — | — | — |
| foodDrinkTeaser.image | upload → media | false | false | false | — | — | media | — | Wide photo for the split teaser. Suggested seed path: src/seed/assets/meet-and-work/teasers/food-drink.jpg | — | — | — | — |
| facilities | array | false | false | false | — | — | — | — | — | — | — | — | — |
| facilities[].label | text | true | true | false | — | — | — | — | — | — | — | — | — |
| facilities[].description | textarea | true | true | false | — | — | — | — | — | — | — | — | — |
| facilities[].lucideIcon | text | true | false | false | — | — | — | — | Lucide icon name, e.g. Wifi, ParkingCircle. | — | — | — | — |
| facilities[].id | text | false | false | false | [function] ()=>new ObjectId().toHexString() | — | — | — | — | — | — | Payload array-row id: beforeChange(1), beforeDuplicate(1) | — |
| closingHeadline | text | false | true | false | — | — | — | — | — | — | — | — | — |
| closingCtaLabel | text | false | true | false | — | — | — | — | — | — | — | — | — |
| updatedAt | date | false | false | false | — | — | — | — | — | — | — | — | — |
| createdAt | date | false | false | false | — | — | — | — | — | — | — | — | — |

## Section 2 — Media configuration

### 1. `src/collections/Media.ts` in full

```1:16:src/collections/Media.ts
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
```

### 2. `imageSizes`

does not exist. `upload: true` with no `imageSizes` object (`src/collections/Media.ts:15`). Every image is served at whatever resolution was uploaded. Payload still stores `width` / `height` / `focalX` / `focalY` on the document (upload-injected).

### 3. `focalPoint` / `crop`

No `focalPoint` or `crop` keys on the Media collection config (`src/collections/Media.ts`). Payload upload still writes `focalX`/`focalY` on 323/346 records (dump). There is no admin crop UI configured beyond Payload defaults. `withoutEnlargement`, `position`, `fit`: does not exist in config.

### 4. `mimeTypes` / file-size limit

does not exist on the Media collection. No `upload.mimeTypes`, no `upload.limits`. `sharp` is registered at `src/payload.config.ts:85`.

### 5. `alt`

- `required: true` (`src/collections/Media.ts:12`).
- localized: **false** (field has no `localized: true`).
- Enforcement: Payload `required: true` at save; no extra custom validate. Empty string would fail required. Both-locales N/A because the field is not localized.

### 6. Storage adapter

- `plugins: []` (`src/payload.config.ts:86`) — no S3 / Vercel Blob / R2 plugin.
- Local disk: Payload default upload directory `media/` (project cwd). 346 files on disk match 346 media rows.
- URL shape: `/api/media/file/{filename}` (Next/Payload upload route). `next.config.ts` `images.localPatterns` allows `/api/media/file/**` (`next.config.ts:25-28`).
- R2 hostname is in `remotePatterns` (`next.config.ts:36`) but no storage plugin writes there.
- 16 Sept audit 404s: report only — config says local `/api/media/file/…`; this inventory does not fix routing.

### 7. `next.config.ts` images

- `localPatterns`: `/api/media/file/**`, `/images/**` (`next.config.ts:25-32`).
- `remotePatterns`: `*.r2.cloudflarestorage.com`, `images.unsplash.com`, `upload.wikimedia.org/wikipedia/commons/**`, `picsum.photos`, `fastly.picsum.photos` (`next.config.ts:33-55`).
- `domains`: does not exist.
- `formats`: does not exist (Next default).
- `deviceSizes`: does not exist (Next default).
- `imageSizes`: does not exist (Next default).
- `unoptimized`: does not exist anywhere in `next.config.ts`.

### 8. Alt fill

- Non-empty `alt`: **346/346**.
- Alt in both locales: N/A (`altLocalized: false`).
- `thumbnailURL`: 0/346 (no imageSizes). `width`/`height`: 326/346. `focalX`/`focalY`: 323/346.

## Section 3 — Every image slot in the UI

Walked components, not inferred from collections. `--site-max: 90rem` = 1440px (`src/app/globals.css:13`). Section padding: `px-section-x` 2.5rem, `px-section-sm` 1.25rem (`tailwind.config.ts:106-108`). `maxRenderedPx` is the largest CSS width that can be determined; `null` means the slot is viewport-unbounded or not a visual render.

| slot | component | source | fill or fixed | width × height | aspect-ratio | rendered width | sizes | priority | object-fit | placeholder | fallback | largest CSS width (px) | on a route? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| homepage hero photo | src/components/home/HeroPhotoSlider.tsx:98 | hero-slides.image (context homepage) via HomeHero; fallback Unsplash homepageImages | fill (native <img> absolute inset-0) | — | 1/0.75 <768; 2/1 768–1099; ≥1100 content-height of 1.45fr column (`src/app/globals.css:1098`, `src/app/globals.css:1356`) | mobile: 100% of .site-shell (max 90rem); md: 100% of .site-shell; xl: 1.45/2.45 of .site-shell at ≥1100 (`src/app/globals.css:1357`) | not set (native img, not next/image) | false | cover | none | fallbackHeroSlides Unsplash — src/components/home/heroSlides.ts:12 | 1440 | yes |
| homepage /here hero map circle | src/components/home/HeroMapTeaser.tsx:72 | hotel.heroMapImage; default /images/hero_map.png | fixed | 200×200 (HERO_MAP_BADGE_PX) | 1/1 circle | mobile: clamp(112px, calc(100vw - 250px), 200px) (`src/app/globals.css:1321`); md: 200px; xl: 200px | not set (native img) | false | cover | none | /images/hero_map.png — src/components/home/HeroMapTeaser.tsx:3 | 200 | yes |
| /here hero photo | src/components/home/HeroPhotoSlider.tsx:98 | hero-slides.image (context here, fallback homepage); optional events.heroImage override | fill (native <img>) | — | same .home-hero geometry as homepage (`src/app/globals.css:957`) | mobile: 100% of .site-shell; md: 100% of .site-shell; xl: 1.45/2.45 of .site-shell | not set | false | cover | none | fallbackHeroSlides — src/components/home/heroSlides.ts:12 | 1440 | yes |
| homepage rooms teaser photo | src/components/home/RoomsTeaser.tsx:109 | rooms.images[0] via pickTeaserImage (homepageTeaser.teaserImage ignored) | fill (native <img>) | — | 1/0.75 ≤550; 3/2 ≥551 (`src/components/home/RoomsTeaser.tsx:93`) | mobile: ~100% of site-shell (bleeds 15–35px); md: same; xl: 2/3 of site-shell at lg (`lg:grid-cols-[2fr_1fr]`) | not set | false | cover | none | Unsplash DEFAULT_ROOM_IMAGE — src/lib/rooms/roomHero.ts:9 | 1440 | yes |
| homepage Meet & Work teaser — mobile | src/components/home/MeetAndWorkTeaser.tsx:157 | hotel.meetAndWork.slides[].image | fill (native <img>) | — | 1/0.75 (`src/components/home/MeetAndWorkTeaser.tsx:144`) | mobile: ~100% of site-shell minus 15px bar; md: same until lg; xl: hidden (lg:hidden parent) | not set | false | cover / object-left | none | /images/meet-and-work.jpg — src/lib/payload/homepage.ts:232 | 1023 | yes |
| homepage Meet & Work teaser — desktop | src/components/home/MeetAndWorkTeaser.tsx:261 | hotel.meetAndWork.slides[].image | fill (native <img>) | — | 1.65/1 (`src/components/home/MeetAndWorkTeaser.tsx:248`) | mobile: hidden; md: hidden until lg; xl: 70% of site-shell (`grid-cols-[30%_70%]`) | not set | false | cover | none | /images/meet-and-work.jpg — src/lib/payload/homepage.ts:232 | 1008 | yes |
| homepage Lütze teaser photo | src/components/home/LutzeTeaser.tsx:55 | hotel.eatAndDrink.image | fill (native <img>) | — | 1/0.75 ≤550; 3/2 ≥551 (`src/components/home/LutzeTeaser.tsx:53`) | mobile: ~100% of site-shell; md: same; xl: 2/3 of site-shell (`lg:grid-cols-[1fr_2fr]`) | not set | false | cover | none | /images/food-interior.jpg (eatAndDrink copy fallback) | 1440 | yes |
| homepage Lütze logo | src/components/home/LutzeTeaser.tsx:93 | hardcoded /images/lutze-logo.svg | fill of 383/145 box | height calc(1rem+14px)=30px; width ≈79px (`src/components/home/LutzeTeaser.tsx:91`) | 383/145 | mobile: 79px; md: 79px; xl: 79px | not set | false | contain / object-right | none | does not exist — src is hardcoded | 79 | yes |
| event / spotlight card — hub strip + homepage happenings | src/components/spotlight/SpotlightCard.tsx:51 | events.heroImage / exhibitions.heroImage / venues.heroImage via resolvers; fallback Unsplash spotlightTeasers | fill | — | 5/6 (`src/components/spotlight/SpotlightCard.tsx:50`) | mobile: 100% of EventsRow (1 col below 520px row width); md: 1/2 from 520px, 1/3 from 760px (`src/components/events/EventsRow.tsx:18-22`); xl: 1/4 from 920px | (max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw | false | cover | none (no blur / blurDataURL) | src/lib/data/spotlightTeasers.ts:7 Unsplash URLs when Payload empty | 1360 | yes |
| spotlight identity mark / venue monogram | src/components/spotlight/SpotlightCard.tsx:82 | venues.venueMonogram | fixed 32×32 box; svg uses native img, else next/image fill | 32×32 (`src/components/spotlight/SpotlightCard.tsx:79`) | 1/1 | mobile: 32px; md: 32px; xl: 32px | 32px | false | contain | none | does not exist — mark omitted when null (`src/components/spotlight/SpotlightCard.tsx:76`) | 32 | yes |
| room index card gallery | src/components/rooms/RoomIndexCard.tsx:206 | rooms.images[] | fill | — | 4/3 (`src/components/rooms/RoomIndexCard.tsx:174`) | mobile: 100% of page (px-section gutters); md: 50% (`md:grid-cols-2`); xl: 50% of viewport minus gutters | (max-width: 768px) 100vw, 50vw | true | cover | none | Unsplash DEFAULT_ROOM_IMAGE via resolveRoomImages — src/lib/rooms/roomHero.ts:86 | null — Page is not capped at --site-max; md 50vw is viewport-relative. Do not guess a desktop px width. | yes |
| room / meeting-room / venue detail gallery | src/components/rooms/RoomGallery.tsx:234 | rooms.images[] / meeting-rooms.images[] / venues.images[] (+ venueGalleryImages may append hotel.eatAndDrink.image) | fixed width/height from asset, never upscaled past native (`src/components/rooms/RoomGallery.tsx:11`, `:167-173`) | width={w} height={h} with DEFAULT_W=650 DEFAULT_H=488 if missing (`src/components/rooms/RoomGallery.ts:40-41`) | native of active slide | mobile: min(88% of contained viewport, nativeW), min 240 (`src/components/rooms/RoomGallery.tsx:167-173`); md: full-bleed; slide = min(72% of viewport, nativeW); xl: same; unbounded with viewport | `${slideWidth}px` (runtime) | true | contain | none | venues: hotel.eatAndDrink.image — src/lib/venues/mapVenueToAeo.ts:87; rooms: Unsplash DEFAULT_ROOM_IMAGE | null — Desktop slide width is 0.72 × viewport and viewport is not capped. Native width is a per-asset cap, not a CSS max. | yes |
| awards carousel badges | src/components/layout/AwardsCarousel.tsx:59 | footer.awards[].image; else footerFallback /images/awards/* | fixed, height 34–72 from aspect (`src/components/layout/AwardsCarousel.tsx:17-34`) | width={size?.width ?? 160} height={size?.height ?? 72} | natural; wide ≥4:1 uses min height 34 | mobile: height≤72, width=height×aspect; md: same; xl: same | not set | false | contain | none | alt-text span when imageUrl empty (`src/components/layout/AwardsCarousel.tsx:78`); CMS-empty awards list uses src/lib/payload/footerFallback.ts:161 | null — Height is 34–72px (`src/components/layout/AwardsCarousel.tsx:17-34`). Width = height × natural aspect. Aspect is clamped only for the height formula (cap 4), not for width, so CSS width is not bounded. | yes |
| hub tip card media | src/components/here/TipCard.tsx:92 | neighbourhood-places.image via getHubTips + withPlaceImageFallback | fill | — | 4/3 (`src/app/globals.css:2261`) | mobile: 100% of hub-row (1 col ≤560); md: 50% 561–900; xl: 25% ≥901 (`src/app/globals.css:2001`) | (max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw | false | cover | none | grey name-block tip-card__nameblock — TipCard.tsx:100; image sourced via PLACE_IMAGE_FALLBACKS / HERE_IMAGES in getHubTips.ts:84 | 520 | yes |
| hub tip card endorser portrait | src/components/here/TipCard.tsx:51 | people.portrait | fill | — | circle (tip-card__avatar) | mobile: 40px (sizes attr); md: 40px; xl: 40px | 40px | false | cover | none | empty dashed ring — TipCard.tsx:60 | 40 | yes |
| hub amenity card photo | src/components/here/AmenityCard.tsx:50 | venues.heroImage / media pool via getInHouseAmenities; HERE_IMAGES.kttk / wallride overrides | fill | — | card 1/1; media flex 2/3 so photo 3:2 of a square (`src/app/globals.css:2042-2047`) | mobile: 100% hub-row 1-col; md: 50%; xl: 25% | (max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw | false | cover | none | Lucide icon in amenity-card__media--empty — AmenityCard.tsx:58 | 520 | yes |
| hub person card portrait (HerePeopleSection) | src/components/here/PersonCard.tsx:40 | people.portrait | fill | — | 1/1 (`src/app/globals.css:2212`) | mobile: hub-row 1-col; md: 50%; xl: 25% | (max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw | false | cover | none | empty beige square — person-card__media with no img (`src/components/here/PersonCard.tsx:38`) | 520 | no (HerePeopleSection is not imported on any route (`src/app/[locale]/here/page.tsx` has no people section).) |
| You, Me & Berlin index portrait | src/components/neighbourhood/PersonCard.tsx:34 | people.portrait | fill | — | 3/4 (`src/components/neighbourhood/PersonCard.tsx:31`) | mobile: 100% (1 col); md: 50% sm:grid-cols-2; xl: 25% xl:grid-cols-4 (`src/app/[locale]/you-me-berlin/page.tsx:223`) | (max-width: 768px) 100vw, 25vw | false | cover | none | InitialsAvatar size xl — PersonCard.tsx:42 | null — Page uses px-section gutters without --site-max. 1-col is ~100vw. Do not guess. | yes |
| entity identity portrait (person / event pages) | src/components/entity/EntityIdentity.tsx:78 | people.portrait (events typically none) | fill | — | 3/4; max-w-xs (20rem) mobile, md:w-64 (`src/components/entity/EntityIdentity.tsx:77`) | mobile: 100% up to 20rem=320px; md: 256px; xl: 256px | (max-width: 768px) 100vw, 256px | true | cover | none | quote hero or InitialsAvatar xl 104px — EntityIdentity.tsx:89-99 | 320 | yes |
| art wall mosaic tiles | src/components/here/ArtWall.tsx:58 | exhibitions.heroImage / venues.heroImage via getArtWall; murals HERE_IMAGES | fill | — | grid auto-rows 278px (220px ≤900) (`src/app/globals.css:2117`) | mobile: 100% 1-col ≤560; md: 50% 2-col ≤900 (spans forced to 1); xl: hero span 3/6 of full-bleed wall | (max-width: 560px) 100vw, (max-width: 900px) 50vw, 50vw | false | cover | none | tile renders no image when image null (`ArtWall.tsx:57`); data layer uses firstHereImage → HERE_IMAGES.fkkb / murals (`src/lib/here/getArtWall.ts:87`) | null — ArtWallSection is full-bleed (`src/components/here/ArtWallSection.tsx:11`). Hero tile is 3/6 of viewport at ≥901. Viewport unbounded. | yes |
| art location card ( /here/art ) | src/components/here/ArtLocationCard.tsx:22 | hardcoded HERE_IMAGES murals (`src/app/[locale]/here/art/page.tsx:50-78`) | fill | — | fixed height h-24 / md:h-28, width 100% of card | mobile: 50vw (grid); md: 50vw; xl: 25vw (`sizes`) | (max-width: 1024px) 50vw, 25vw | false | cover | none | does not exist — image prop is required | null — sizes uses vw; page not site-max capped in the card grid. | yes |
| TonightHeroCard (FKKB) | src/components/here/VenueCard.tsx:31 | exhibitions.heroImage via resolveTonightHero / HERE_IMAGES.fkkb | fill | — | h-24 / md:h-32 / lg:h-28, full card width | mobile: 100vw; md: 100vw; xl: 50vw (`sizes`) | (max-width: 1024px) 100vw, 50vw | false | cover | none | HERE_IMAGES.fkkb — src/lib/here/tonight.ts:99 | null — Component is not mounted on a route (only re-exported from src/components/here/index.ts:5). | no |
| /here dining band photo | src/components/here/HereDiningBand.tsx:63 | venues.heroImage (lutze) → venues.images[0] → hotel.eatAndDrink.image → HERE_IMAGES.lutzeInterior (`src/lib/here/getDiningBand.ts:164`) | fill | — | 1/0.75 ≤550; 3/2 ≥551 (`src/components/here/HereDiningBand.tsx:62`) | mobile: 100% site-shell; md: same; xl: 2/3 site-shell (`lg:grid-cols-[2fr_1fr]`) | (max-width: 1023px) 100vw, 67vw | false | cover | none | HERE_IMAGES.lutzeInterior — src/lib/here/images.ts:21 | 1440 | yes |
| editorial band (person letter / unmounted art+basement) | src/components/primitives/EditorialBand.tsx:64 | people.portrait on /you-me-berlin/[slug]; HERE_IMAGES on unmounted BasementSection / ArtInBuildingSection | fill | — | editorial-band--2-1 or --1-2 CSS | mobile: 100vw; md: 67vw (`sizes`); xl: 67vw | (max-width: 1023px) 100vw, 67vw | false | cover | none; `placeholder` prop only adds a label overlay, not a photo (`EditorialBand.tsx:23`) | does not exist — component requires image (`EditorialBand.tsx:37`) | null — sizes is 100vw / 67vw; mounted letter band is inside page gutters not site-shell. Viewport-relative. | yes |
| neighbourhood PlaceCard photo | src/components/neighbourhood/PlaceCard.tsx:49 | neighbourhood-places.image (picsum.photos URLs rejected at PlaceCard.tsx:40) | fill | — | 4/3 (`src/components/neighbourhood/PlaceCard.tsx:46`) | mobile: 100%; md: 50% sm:grid-cols-2; xl: 33% lg:grid-cols-3 (`src/app/[locale]/neighbourhood/page.tsx:231`) | (max-width: 768px) 100vw, 33vw | false | cover | none | PlaceImageFallback name-block — PlaceCard.tsx:57 (not a photo) | null — Page not --site-max capped; 1-col is 100vw minus gutters. | yes |
| map PlaceInfoCard image — person emphasis | src/components/map/PlaceInfoCard.tsx:274 | neighbourhood-places.image / PLACE_IMAGE_FALLBACKS via toMapPlace | fill | — | h-20 × full card (~268px) | mobile: 268px; md: 268px; xl: 268px | 268px | false | cover | none | image block omitted when image.src empty (`PlaceInfoCard.tsx:272`) | 268 | yes |
| map PlaceInfoCard image — default | src/components/map/PlaceInfoCard.tsx:323 | neighbourhood-places.image / PLACE_IMAGE_FALLBACKS | fill | — | h-36 × full card (~268px) | mobile: 268px; md: 268px; xl: 268px | 268px | false | cover | none | omitted when no src | 268 | yes |
| InitialsAvatar portrait (map pins, chips, person fallback) | src/components/people/InitialsAvatar.tsx:42 | people.portrait | fixed via size classes | sm 20; md 32; lg 48; xl 112/md 144; pin 32; pinActive 36 (`src/components/people/InitialsAvatar.tsx:14-20`) | 1/1 circle | mobile: varies by size prop; md: xl = 144px; xl: 144px | not set (native img) | false | cover | none | initials on HOTEL_PIN_COLOR disc — InitialsAvatar.tsx:50 | 144 | yes |
| homepage / neighbourhood map fallback still | src/components/map/HomepageMapTeaser.tsx:183 | hardcoded /images/hotel-berlin-berlin-luetzowplatz-satellite.jpg (fallbackImageSrc) | fill of mapHeight box | — | h-[min(70vh,640px)] default; compact 160/220 (`src/components/map/HomepageMapTeaser.tsx:174-178`) | mobile: 100%; md: 100% or 1.1fr of split at ≥1024; xl: 1.1/2.5 of row (`grid-cols-[1.1fr_1.4fr]`) | not set | false | cover | none | this slot IS the fallback when Mapbox token missing (`HomepageMapTeaser.tsx:209`) | null — Full-bleed map height/width follow viewport. Compact homepage split is not --site-max on the map column alone. | yes |
| meetings hero | src/components/meetings/MeetingsHero.tsx:103 | meetings.heroSlides[].image | fill (native <img>) | — | section min-h-[70vh]; photo absolute inset-0 (`src/components/meetings/MeetingsHero.tsx:79`) | mobile: 100vw; md: from max-w-6xl left edge to viewport right (`md:left-[max(0px,calc((100%-72rem)/2))]`); xl: viewport minus left inset | not set | false | cover | none | empty region when images[] empty | null — Full-bleed to the right viewport edge. Unbounded. | yes |
| meetings event-type tile | src/components/meetings/EventTypeTile.tsx:37 | meetings.eventTypes[].image | fill (native <img>) | — | 4/3 (`src/components/meetings/EventTypeTile.tsx:35`) | mobile: 100% of max-w-6xl; md: 50% sm:grid-cols-2; xl: 33% lg:grid-cols-3 (`src/app/[locale]/meetings/page.tsx:181`) | not set | false | cover | none | AmenityIcon if no image — EventTypeTile.tsx:43 | 1152 | yes |
| meetings hybrid / food teaser split | src/components/meetings/MeetingsTeaserSplit.tsx:52 | meetings.hybridTeaser.image / meetings.foodDrinkTeaser.image | fill (native <img>) | — | 4/3 (`src/components/meetings/MeetingsTeaserSplit.tsx:49`) | mobile: 100% of max-w-6xl; md: 50% (`md:grid-cols-2`); xl: 50% of 72rem | not set | false | cover | none | empty grey box when image.src empty (`MeetingsTeaserSplit.tsx:50`) | 1152 | yes |
| meeting-room finder card | src/components/meetings/RoomFinderCard.tsx:70 | meeting-rooms.teaserImage \|\| images[0] (`src/lib/meetings/meetingPage.ts:78`) | fill | — | 4/3 (`src/components/meetings/RoomFinderCard.tsx:68`) | mobile: 100% max-w-6xl; md: 50%; xl: 33% lg:grid-cols-3 | (max-width: 768px) 100vw, 33vw | false | cover | none | empty 4/3 box when teaserImage null (`RoomFinderCard.tsx:69`) | 1152 | yes |
| room detail Open Graph / Twitter image | src/app/[locale]/rooms/[slug]/page.tsx:88 (generateMetadata, not a visual <Image>) | rooms.socialImage \|\| rooms.images[0] | OG metadata | — | does not exist in CSS | mobile: n/a; md: n/a; xl: n/a | not set | false | n/a | none | metadata omits images when both empty (`rooms/[slug]/page.tsx:86`) | null — Not rendered in the UI. Crawlers pick their own size. | yes |
| unmounted HeroSection KenBurns | src/components/primitives/KenBurnsSlider.tsx:118 (via src/components/sections/HeroSection.tsx:14) | hardcoded heroImages Unsplash (`src/lib/data/homepageImages.ts:1`) | fill | — | video / md:21/9 (`HeroSection.tsx:13`) | mobile: 100vw; md: 100vw; xl: 100vw | (max-width: 768px) 100vw, 55vw (KenBurnsSlider default) | false | cover | none | does not exist | null — Not on a route. If mounted would be unbounded 100vw. | no |
| unmounted RoomSlider KenBurns | src/components/home/RoomSlider.tsx:77 → KenBurnsSlider.tsx:118 | rooms.images via RoomHeroItem | fill | — | from RoomSlider layout | mobile: n/a; md: n/a; xl: n/a | (max-width: 768px) 100vw, 55vw | false | cover | none | Unsplash DEFAULT_ROOM_IMAGE | null — RoomSlider is not imported by any page. | no |
| unmounted MapTeaser MapboxStaticImage | src/components/map/MapboxStaticImage.tsx:30 (via src/components/sections/MapTeaser.tsx:35) | Mapbox Static API URL or fallback mapBackgroundImage Unsplash | fixed width/height props | passed in by MapTeaser | from width/height props | mobile: n/a; md: n/a; xl: n/a | not set | false | from className | none | mapBackgroundImage Unsplash — src/lib/data/homepageImages.ts:35 | null — MapTeaser is not imported by any page. | no |
| unmounted CultureSection ContentCard | src/components/primitives/ContentCard.tsx:55 | src/lib/data/cultureCards.ts hardcoded | fill | — | from ContentCard layout | mobile: 100vw; md: 50vw; xl: 50vw | (max-width: 768px) 100vw, 50vw | false | cover | none | does not exist | null — CultureSection is not imported by any page. | no |

### Images the site renders that do not come from Payload

| asset | kind | used by |
|---|---|---|
| `HERE_IMAGES.*` (`src/lib/here/images.ts:4`) | local `/images/here/*`, `/images/food-interior.jpg`, Unsplash courtyard + skate | getArtWall, getDiningBand, getHubTips, getInHouseAmenities, tonight.ts, `/here/art` ArtLocationCard, unmounted BasementSection / ArtInBuildingSection |
| `fallbackHeroSlides` / `heroImages` (`src/components/home/heroSlides.ts:12`, `src/lib/data/homepageImages.ts:1`) | Unsplash | HomeHero / HereHero when hero-slides empty; unmounted HeroSection |
| `lutzeImages` (`src/lib/data/homepageImages.ts:20`) | Unsplash | does not exist on a mounted route (grep: only defined) |
| `mapBackgroundImage` (`src/lib/data/homepageImages.ts:35`) | Unsplash | unmounted MapTeaser |
| `satelliteImage` (`src/lib/data/homepageImages.ts:38`) | Unsplash | unmounted HeroSection |
| `DEFAULT_ROOM_IMAGE` (`src/lib/rooms/roomHero.ts:9`) | Unsplash | RoomsTeaser / RoomIndexCard / RoomGallery when gallery empty |
| `spotlightTeasers` (`src/lib/data/spotlightTeasers.ts:7`) | Unsplash | EventsRow when Payload spotlight empty |
| `PLACE_IMAGE_FALLBACKS` (`src/lib/places/teaserImageFallbacks.ts:12`) | Wikimedia + Unsplash | map cards / hub tips when neighbourhood-places.image empty |
| `/images/hero_map.png` | local public | HeroMapTeaser default |
| `/images/lutze-logo.svg` | local public | LutzeTeaser |
| `/images/meet-and-work.jpg` | local public | Meet & Work teaser fallback |
| `/images/food-interior.jpg` | local public | eatAndDrink / HERE_IMAGES.lutzeInterior |
| `/images/hotel-berlin-berlin-luetzowplatz-satellite.jpg` | local public | HomepageMapTeaser token-missing fallback |
| `/images/awards/*.png` | local public | footerFallback awards |
| PlaceImageFallback | CSS name-block, not a photo | PlaceCard / TipCard when no image |


Homepage uses `HomeHero` / `HeroPhotoSlider`, not `HeroSection`. `/here` has no `HerePeopleSection`.

## Section 4 — Localisation matrix

Config: locales `de`/`en`, default `de`, `fallback: true` (`src/payload.config.ts:66-69`). Dump compared DE vs EN with fallback off, so empty DE does not inherit EN in these counts.

Buckets: `de === en` (same non-empty string — likely untranslated), `de` empty, `de` genuinely different, plus `en` empty while DE filled.

### `users` (1 records)

No localized fields on `users`.


### `media` (346 records)

No localized fields on `media`.


### `tags` (64 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `name` | 49 | 15 | 0 | 0 | yes |
| `description` | 0 | 15 | 49 | 0 | no |

Fields where more than half of records are `de === en` or `de` empty: `name`.


### `rooms` (11 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `name` | 7 | 0 | 4 | 0 | yes |
| `shortDescription` | 0 | 0 | 11 | 0 | no |
| `description` | 0 | 10 | 1 | 0 | yes |
| `storyConnection.storyTeaser` | 0 | 11 | 0 | 0 | yes |

Fields where more than half of records are `de === en` or `de` empty: `name`, `description`, `storyConnection.storyTeaser`.


### `meeting-rooms` (21 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `name` | 8 | 0 | 13 | 0 | no |
| `images[].alt` | 0 | 0 | 0 | 21 | no |
| `shortDescription` | 0 | 0 | 21 | 0 | no |
| `description` | 0 | 0 | 21 | 0 | no |

No localized field has more than half of records in the first two buckets.


### `meeting-documents` (10 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `title` | 0 | 0 | 10 | 0 | no |
| `file` | 0 | 0 | 10 | 0 | no |

No localized field has more than half of records in the first two buckets.


### `meeting-inquiries` (0 records)

No localized fields on `meeting-inquiries`.


### `venues` (5 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `name` | 2 | 3 | 0 | 0 | yes |
| `tagline` | 0 | 4 | 1 | 0 | yes |
| `description` | 0 | 5 | 0 | 0 | yes |
| `shortDescription` | 0 | 3 | 2 | 0 | yes |

Fields where more than half of records are `de === en` or `de` empty: `name`, `tagline`, `description`, `shortDescription`.


### `hero-slides` (4 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `altText` | 0 | 0 | 4 | 0 | no |
| `captionOverride` | 0 | 0 | 4 | 0 | no |

No localized field has more than half of records in the first two buckets.


### `faqs` (57 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `question` | 0 | 10 | 47 | 0 | no |
| `answer` | 0 | 10 | 47 | 0 | no |

No localized field has more than half of records in the first two buckets.


### `artists` (2 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `bio` | 0 | 2 | 0 | 0 | yes |

Fields where more than half of records are `de === en` or `de` empty: `bio`.


### `artworks` (0 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `description` | 0 | 0 | 0 | 0 | no |

No localized field has more than half of records in the first two buckets.


### `exhibitions` (1 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `description` | 0 | 0 | 1 | 0 | no |

No localized field has more than half of records in the first two buckets.


### `events` (4 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `name` | 3 | 0 | 1 | 0 | yes |
| `description` | 0 | 0 | 4 | 0 | no |
| `shortDescription` | 0 | 0 | 4 | 0 | no |
| `bookingNote` | 0 | 0 | 4 | 0 | no |

Fields where more than half of records are `de === en` or `de` empty: `name`.


### `people` (16 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `bio` | 0 | 16 | 0 | 0 | yes |

Fields where more than half of records are `de === en` or `de` empty: `bio`.


### `neighbourhood-places` (21 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `description` | 0 | 0 | 10 | 11 | no |

No localized field has more than half of records in the first two buckets.


### `places` (14 records)

No localized fields on `places`.


### `pages` (26 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `title` | 2 | 0 | 24 | 0 | no |

No localized field has more than half of records in the first two buckets.


### `legal-documents` (5 records)

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `title` | 1 | 0 | 4 | 0 | no |
| `updatedLabel` | 0 | 3 | 2 | 0 | yes |
| `lede` | 0 | 4 | 1 | 0 | yes |
| `body` | 0 | 0 | 5 | 0 | no |

Fields where more than half of records are `de === en` or `de` empty: `updatedLabel`, `lede`.


### global `hotel`

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `description` | 0 | 1 | 0 | 0 | yes |
| `shortDescription` | 0 | 1 | 0 | 0 | yes |
| `guestStay.checkoutNote` | 0 | 1 | 0 | 0 | yes |
| `guestStay.breakfastLocation` | 0 | 1 | 0 | 0 | yes |
| `guestStay.parkingSummary` | 0 | 1 | 0 | 0 | yes |
| `guestStay.luggageNote` | 0 | 1 | 0 | 0 | yes |
| `roomService.note` | 0 | 0 | 1 | 0 | no |
| `getDirectionsLabel` | 0 | 1 | 0 | 0 | yes |
| `heroShortAddress` | 0 | 1 | 0 | 0 | yes |
| `meetAndWork.kicker` | 0 | 0 | 1 | 0 | no |
| `meetAndWork.subhead` | 0 | 0 | 1 | 0 | no |
| `meetAndWork.body` | 0 | 0 | 1 | 0 | no |
| `meetAndWork.slides[].imageAlt` | 1 | 0 | 0 | 0 | yes |
| `meetAndWork.slides[].caption` | 1 | 0 | 0 | 0 | yes |
| `meetAndWork.ctaLabel` | 0 | 0 | 1 | 0 | no |
| `roomsPageIntro.title` | 0 | 1 | 0 | 0 | yes |
| `roomsPageIntro.body` | 0 | 1 | 0 | 0 | yes |
| `roomsSuitesCallout.quote` | 0 | 0 | 1 | 0 | no |
| `roomsSuitesCallout.title` | 0 | 0 | 1 | 0 | no |
| `roomsSuitesCallout.body` | 0 | 0 | 1 | 0 | no |
| `eatAndDrink.kicker` | 0 | 0 | 1 | 0 | no |
| `eatAndDrink.heading` | 0 | 0 | 1 | 0 | no |
| `eatAndDrink.body` | 0 | 0 | 1 | 0 | no |
| `eatAndDrink.imageAlt` | 0 | 0 | 1 | 0 | no |
| `eatAndDrink.ctaLabel` | 0 | 0 | 1 | 0 | no |

Fields where more than half of records are `de === en` or `de` empty: `description`, `shortDescription`, `guestStay.checkoutNote`, `guestStay.breakfastLocation`, `guestStay.parkingSummary`, `guestStay.luggageNote`, `getDirectionsLabel`, `heroShortAddress`, `meetAndWork.slides[].imageAlt`, `meetAndWork.slides[].caption`, `roomsPageIntro.title`, `roomsPageIntro.body`.


### global `homepage`

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `heroSlides[].alt` | 0 | 1 | 0 | 0 | yes |
| `heroSlides[].caption` | 0 | 1 | 0 | 0 | yes |
| `roomsTeaser.heading` | 0 | 1 | 0 | 0 | yes |
| `roomsTeaser.body` | 0 | 1 | 0 | 0 | yes |
| `roomsTeaser.ctaLabel` | 0 | 1 | 0 | 0 | yes |

Fields where more than half of records are `de === en` or `de` empty: `heroSlides[].alt`, `heroSlides[].caption`, `roomsTeaser.heading`, `roomsTeaser.body`, `roomsTeaser.ctaLabel`.


### global `navigation`

No localized fields on `navigation`.


### global `footer`

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `bookDirectStrip.message` | 0 | 0 | 1 | 0 | no |
| `bookDirectStrip.ctaLabel` | 0 | 0 | 1 | 0 | no |
| `contact.transitLines[].line` | 1 | 0 | 0 | 0 | yes |
| `columns[].title` | 1 | 0 | 0 | 0 | yes |
| `columns[].links[].label` | 1 | 0 | 0 | 0 | yes |
| `alreadyHereColumn.title` | 0 | 0 | 1 | 0 | no |
| `alreadyHereColumn.description` | 0 | 0 | 1 | 0 | no |
| `alreadyHereColumn.links[].label` | 1 | 0 | 0 | 0 | yes |
| `awards[].altText` | 1 | 0 | 0 | 0 | yes |
| `awardsHeading` | 0 | 0 | 1 | 0 | no |
| `partnerLinks[].label` | 0 | 0 | 0 | 1 | no |
| `legalLinks[].label` | 0 | 0 | 0 | 1 | no |

Fields where more than half of records are `de === en` or `de` empty: `contact.transitLines[].line`, `columns[].title`, `columns[].links[].label`, `alreadyHereColumn.links[].label`, `awards[].altText`.


### global `meetings`

| path | de === en | de empty | de different | en empty / de filled | >50% untranslated or de-empty? |
|---|---|---|---|---|---|
| `heroKicker` | 0 | 1 | 0 | 0 | yes |
| `heroHeadline` | 0 | 0 | 1 | 0 | no |
| `heroIntro` | 0 | 0 | 1 | 0 | no |
| `heroContactLabel` | 0 | 0 | 1 | 0 | no |
| `heroSlides[].alt` | 0 | 1 | 0 | 0 | yes |
| `eventTypesHeading` | 0 | 0 | 1 | 0 | no |
| `eventTypes[].label` | 0 | 0 | 1 | 0 | no |
| `eventTypes[].description` | 0 | 0 | 1 | 0 | no |
| `hybridTeaser.kicker` | 0 | 0 | 1 | 0 | no |
| `hybridTeaser.headline` | 0 | 0 | 1 | 0 | no |
| `hybridTeaser.body` | 0 | 0 | 1 | 0 | no |
| `hybridTeaser.ctaLabel` | 0 | 0 | 1 | 0 | no |
| `foodDrinkTeaser.kicker` | 0 | 0 | 1 | 0 | no |
| `foodDrinkTeaser.headline` | 1 | 0 | 0 | 0 | yes |
| `foodDrinkTeaser.body` | 0 | 0 | 1 | 0 | no |
| `foodDrinkTeaser.ctaLabel` | 0 | 0 | 1 | 0 | no |
| `facilities[].label` | 0 | 0 | 1 | 0 | no |
| `facilities[].description` | 0 | 0 | 1 | 0 | no |
| `closingHeadline` | 0 | 0 | 1 | 0 | no |
| `closingCtaLabel` | 0 | 0 | 1 | 0 | no |

Fields where more than half of records are `de === en` or `de` empty: `heroKicker`, `heroSlides[].alt`, `foodDrinkTeaser.headline`.


### Fields with >50% in `de === en` or `de` empty (all collections/globals)

- `tags.name`
- `rooms.name`
- `rooms.description`
- `rooms.storyConnection.storyTeaser`
- `venues.name`
- `venues.tagline`
- `venues.description`
- `venues.shortDescription`
- `artists.bio`
- `events.name`
- `people.bio`
- `legal-documents.updatedLabel`
- `legal-documents.lede`
- `hotel.description`
- `hotel.shortDescription`
- `hotel.guestStay.checkoutNote`
- `hotel.guestStay.breakfastLocation`
- `hotel.guestStay.parkingSummary`
- `hotel.guestStay.luggageNote`
- `hotel.getDirectionsLabel`
- `hotel.heroShortAddress`
- `hotel.meetAndWork.slides[].imageAlt`
- `hotel.meetAndWork.slides[].caption`
- `hotel.roomsPageIntro.title`
- `hotel.roomsPageIntro.body`
- `homepage.heroSlides[].alt`
- `homepage.heroSlides[].caption`
- `homepage.roomsTeaser.heading`
- `homepage.roomsTeaser.body`
- `homepage.roomsTeaser.ctaLabel`
- `footer.contact.transitLines[].line`
- `footer.columns[].title`
- `footer.columns[].links[].label`
- `footer.alreadyHereColumn.links[].label`
- `footer.awards[].altText`
- `meetings.heroKicker`
- `meetings.heroSlides[].alt`
- `meetings.foodDrinkTeaser.headline`

Stand-out (not necessarily >50% but operational): `meeting-rooms.images[].alt` is 21/21 `enEmptyDeFilled` — German alts exist, English alts empty.

## Section 5 — Fill rate

Counted with Local API against the dev database, dump `2026-09-16T10:56:50.150Z`. Localized fillRate `n/total` is **English, fallback off**. A 0/total on a localized field can still be filled in DE — see `enEmptyDeFilled` in Section 4 (`meeting-rooms.images[].alt` is the proof). Checkboxes: a stored `false` counts as filled. Placeholders (`TBD`, `Lorem`, empty-string-on-required): dump `placeholders` arrays are all empty — **none found**. Select option value `double` on `rooms.bedConfiguration.type` is an enum member (`src/collections/Rooms.ts`), not placeholder copy.

### Unused / unread (defined, nothing or almost nothing reads them as authored photos or copy)

- `rooms.homepageTeaser.teaserImage` — Filled 11/11. `pickTeaserImage` never reads it — homepage uses `rooms.images[0]` (`src/lib/rooms/roomHero.ts:48-59`).
- `rooms.featured` — Still queried as a fallback in `getRoomsForHero` / `getFeaturedRooms` (`src/lib/payload/rooms.ts:20-24`, `src/lib/payload/rooms.ts:50-60`) after `homepageTeaser.enabled`.
- `rooms.images[].caption` — 0/11. RoomGallery accepts caption on its prop type; the mapper does not pass captions from this field.
- `people.bio` — 0/16 both locales. Read on `/you-me-berlin/[slug]` (`src/app/[locale]/you-me-berlin/[slug]/page.tsx:79`).
- `homepage.heroSlides` — Legacy array on the Homepage global (`src/globals/Homepage.ts:24`). Live heroes use collection `hero-slides`.
- `venues.heroImage` — 0/5. Dining band / galleries fall through to `hotel.eatAndDrink.image` or HERE_IMAGES.
- `venues.images` — 0/5.
- `neighbourhood-places.image` — 0/21. UI uses PLACE_IMAGE_FALLBACKS or PlaceImageFallback name-block.
- `places.image` — 0/14. `places` collection is not the neighbourhood map source.

### 0/total

- `users.resetPasswordToken 0/1`
- `users.resetPasswordExpiration 0/1`
- `users.salt 0/1`
- `users.hash 0/1`
- `users.loginAttempts 0/1`
- `users.lockUntil 0/1`
- `media.thumbnailURL 0/346`
- `rooms.accessibilityFeatures 0/11`
- `rooms.images[].caption 0/11`
- `rooms.socialImage 0/11`
- `meeting-rooms.ceilingHeightM 0/21`
- `meeting-rooms.images[].alt 0/21`
- `venues.description 0/5`
- `venues.telephone 0/5`
- `venues.openingHours[].note 0/5`
- `venues.menuUrl 0/5`
- `venues.heroImage 0/5`
- `venues.images 0/5`
- `venues.images[].image 0/5`
- `venues.images[].alt 0/5`
- `venues.images[].id 0/5`
- `venues.tags 0/5`
- `venues.sameAs 0/5`
- `venues.sameAs[].url 0/5`
- `venues.sameAs[].id 0/5`
- `hero-slides.venue 0/4`
- `hero-slides.credit 0/4`
- `faqs.relevantPages 0/57`
- `artists.bio 0/2`
- `artists.website 0/2`
- `artists.nationality 0/2`
- `artists.basedIn 0/2`
- `artists.tags 0/2`
- `exhibitions.location 0/1`
- `exhibitions.artworks 0/1`
- `events.ticketUrl 0/4`
- `events.tags 0/4`
- `people.bio 0/16`
- `people.video 0/16`
- `people.instagram 0/16`
- `people.tags 0/16`
- `people.relatedVenue 0/16`
- `people.authority 0/16`
- `people.authority.identifier 0/16`
- `people.authority.identifier[].propertyID 0/16`
- `people.authority.identifier[].value 0/16`
- `people.authority.identifier[].id 0/16`
- `people.authority.sameAs 0/16`
- `people.authority.sameAs[].url 0/16`
- `people.authority.sameAs[].id 0/16`
- `neighbourhood-places.website 0/21`
- `neighbourhood-places.openingHours 0/21`
- `neighbourhood-places.priceRange 0/21`
- `neighbourhood-places.image 0/21`
- `neighbourhood-places.imageCredit 0/21`
- `neighbourhood-places.imageCredit.creditText 0/21`
- `neighbourhood-places.imageCredit.creditUrl 0/21`
- `neighbourhood-places.imageCredit.license 0/21`
- `neighbourhood-places.authority 0/21`
- `neighbourhood-places.authority.identifier 0/21`
- `neighbourhood-places.authority.identifier[].propertyID 0/21`
- `neighbourhood-places.authority.identifier[].value 0/21`
- `neighbourhood-places.authority.identifier[].id 0/21`
- `neighbourhood-places.authority.sameAs 0/21`
- `neighbourhood-places.authority.sameAs[].url 0/21`
- `neighbourhood-places.authority.sameAs[].id 0/21`
- `places.fullDescription 0/14`
- `places.image 0/14`
- `hotel.description 0/1`
- `hotel.shortDescription 0/1`
- `hotel.directionsUrl 0/1`
- `hotel.mapBounds 0/1`
- `hotel.mapBounds.north 0/1`
- `hotel.mapBounds.south 0/1`
- `hotel.mapBounds.west 0/1`
- `hotel.mapBounds.east 0/1`
- `hotel.guestStay.more.wundermart 0/1`
- `hotel.guestStay.more.wundermart.valueDE 0/1`
- `hotel.guestStay.more.wundermart.valueEN 0/1`
- `hotel.guestStay.more.wundermart.noteDE 0/1`
- `hotel.guestStay.more.wundermart.noteEN 0/1`
- `hotel.guestStay.more.bettAndBike 0/1`
- `hotel.guestStay.more.bettAndBike.valueDE 0/1`
- `hotel.guestStay.more.bettAndBike.valueEN 0/1`
- `hotel.guestStay.more.bettAndBike.noteDE 0/1`
- `hotel.guestStay.more.bettAndBike.noteEN 0/1`
- `hotel.guestStay.checkoutNote 0/1`
- `hotel.guestStay.breakfastLocation 0/1`
- `hotel.guestStay.parkingSummary 0/1`
- `hotel.guestStay.luggageNote 0/1`
- `hotel.hours[].note 0/1`
- `hotel.getDirectionsLabel 0/1`
- `hotel.heroShortAddress 0/1`
- `hotel.roomsPageIntro 0/1`
- `hotel.roomsPageIntro.title 0/1`
- `hotel.roomsPageIntro.body 0/1`
- `homepage.heroSlides 0/1`
- `homepage.heroSlides[].image 0/1`
- `homepage.heroSlides[].alt 0/1`
- `homepage.heroSlides[].caption 0/1`
- `homepage.heroSlides[].kbOrigin 0/1`
- `homepage.heroSlides[].id 0/1`
- `homepage.roomsTeaser 0/1`
- `homepage.roomsTeaser.heading 0/1`
- `homepage.roomsTeaser.body 0/1`
- `homepage.roomsTeaser.ctaLabel 0/1`
- `footer.columns[].links[].internalPage 0/1`
- `footer.alreadyHereColumn.links[].internalPage 0/1`
- `footer.partnerLinks[].label 0/1`
- `footer.legalLinks[].label 0/1`

### `required: false` but filled total/total (excluding checkboxes, timestamps, generateSlug, array ids)

- `users.sessions 1/1`
- `users.sessions[].createdAt 1/1`
- `media.url 346/346`
- `media.filename 346/346`
- `media.mimeType 346/346`
- `media.filesize 346/346`
- `rooms.shortDescription 11/11`
- `rooms.fromPrice 11/11`
- `rooms.currency 11/11`
- `rooms.floorSizeM2 11/11`
- `rooms.bedConfiguration 11/11`
- `rooms.bedConfiguration.type 11/11`
- `rooms.bedConfiguration.details 11/11`
- `rooms.occupancy 11/11`
- `rooms.occupancy.maxAdults 11/11`
- `rooms.occupancy.maxChildren 11/11`
- `rooms.occupancy.maxTotal 11/11`
- `rooms.bathroomLabel 11/11`
- `rooms.bathroomDescription 11/11`
- `rooms.amenities 11/11`
- `rooms.images 11/11`
- `rooms.bookingUrl 11/11`
- `rooms.displayOrder 11/11`
- `rooms.homepageTeaser 11/11`
- `rooms.homepageTeaser.order 11/11`
- `rooms.homepageTeaser.teaserImage 11/11`
- `rooms.storyConnection 11/11`
- `meeting-rooms.capacity 21/21`
- `meeting-rooms.images 21/21`
- `meeting-rooms.teaserImage 21/21`
- `meeting-rooms.description 21/21`
- `meeting-documents.pageRole 10/10`
- `venues.shortDescription 5/5`
- `venues.location 5/5`
- `venues.displayOrder 5/5`
- `hero-slides.adminTitle 4/4`
- `hero-slides.captionOverride 4/4`
- `artists.alias 2/2`
- `artists.shortBio 2/2`
- `artists.portrait 2/2`
- `artists.instagram 2/2`
- `artists.medium 2/2`
- `exhibitions.subtitle 1/1`
- `exhibitions.description 1/1`
- `exhibitions.startDate 1/1`
- `exhibitions.endDate 1/1`
- `exhibitions.venue 1/1`
- `exhibitions.heroImage 1/1`
- `exhibitions.artists 1/1`
- `exhibitions.status 1/1`
- `events.description 4/4`
- `events.shortDescription 4/4`
- `events.endDate 4/4`
- `events.category 4/4`
- `events.venue 4/4`
- `events.price 4/4`
- `events.currency 4/4`
- `events.bookingNote 4/4`
- `events.heroImage 4/4`
- `events.recurrenceRule 4/4`
- `events.recurrenceNote 4/4`
- `people.picks 16/16`
- `neighbourhood-places.address 21/21`
- `neighbourhood-places.address.streetAddress 21/21`
- `neighbourhood-places.address.postalCode 21/21`
- `neighbourhood-places.geo 21/21`
- `neighbourhood-places.geo.latitude 21/21`
- `neighbourhood-places.geo.longitude 21/21`
- `neighbourhood-places.walkingMinutes 21/21`
- `neighbourhood-places.distanceTier 21/21`
- `neighbourhood-places.indoorOutdoor 21/21`
- `neighbourhood-places.targetAudience 21/21`
- `neighbourhood-places.targetAudience[].label 21/21`
- `neighbourhood-places.homepageTeaser 21/21`
- `neighbourhood-places.hereTeaser 21/21`
- `places.shortDescriptionDE 14/14`
- `places.location 14/14`
- `places.address 14/14`
- `places.pinIcon 14/14`
- `places.schemaType 14/14`
- `pages.status 26/26`
- `hotel.legalName 1/1`
- `hotel.url 1/1`
- `hotel.telephone 1/1`
- `hotel.conferencePhone 1/1`
- `hotel.email 1/1`
- `hotel.address 1/1`
- `hotel.address.streetAddress 1/1`
- `hotel.address.addressLocality 1/1`
- `hotel.address.postalCode 1/1`
- `hotel.address.addressCountry 1/1`
- `hotel.geo 1/1`
- `hotel.geo.latitude 1/1`
- `hotel.geo.longitude 1/1`
- `hotel.hasMap 1/1`
- `hotel.checkinTime 1/1`
- `hotel.checkoutTime 1/1`
- `hotel.guestStay 1/1`
- `hotel.guestStay.wifiNetwork 1/1`
- `hotel.guestStay.wifiPassword 1/1`
- `hotel.guestStay.checkout 1/1`
- `hotel.guestStay.checkout.valueDE 1/1`
- `hotel.guestStay.checkout.valueEN 1/1`
- `hotel.guestStay.checkout.noteDE 1/1`
- `hotel.guestStay.checkout.noteEN 1/1`
- `hotel.guestStay.breakfast 1/1`
- `hotel.guestStay.breakfast.valueDE 1/1`
- `hotel.guestStay.breakfast.valueEN 1/1`
- `hotel.guestStay.breakfast.noteDE 1/1`
- `hotel.guestStay.breakfast.noteEN 1/1`
- `hotel.guestStay.parking 1/1`
- `hotel.guestStay.parking.valueDE 1/1`
- `hotel.guestStay.parking.valueEN 1/1`
- `hotel.guestStay.parking.noteDE 1/1`
- `hotel.guestStay.parking.noteEN 1/1`
- `hotel.guestStay.luggage 1/1`
- `hotel.guestStay.luggage.valueDE 1/1`
- `hotel.guestStay.luggage.valueEN 1/1`
- `hotel.guestStay.luggage.noteDE 1/1`
- `hotel.guestStay.luggage.noteEN 1/1`
- `hotel.guestStay.more 1/1`
- `hotel.guestStay.more.saunaFitness 1/1`
- `hotel.guestStay.more.saunaFitness.valueDE 1/1`
- `hotel.guestStay.more.saunaFitness.valueEN 1/1`
- `hotel.guestStay.more.saunaFitness.noteDE 1/1`
- `hotel.guestStay.more.saunaFitness.noteEN 1/1`
- `hotel.guestStay.more.pets 1/1`
- `hotel.guestStay.more.pets.valueDE 1/1`
- `hotel.guestStay.more.pets.valueEN 1/1`
- `hotel.guestStay.more.pets.noteDE 1/1`
- `hotel.guestStay.more.pets.noteEN 1/1`
- `hotel.bridgeNav 1/1`
- `hotel.bridgeNav.toHereLabelEN 1/1`
- `hotel.bridgeNav.toHereLabelDE 1/1`
- `hotel.bridgeNav.toStayLabelEN 1/1`
- `hotel.bridgeNav.toStayLabelDE 1/1`
- `hotel.starRating 1/1`
- `hotel.priceRange 1/1`
- `hotel.totalRooms 1/1`
- `hotel.foundingDate 1/1`
- `hotel.brand 1/1`
- `hotel.parentOrganization 1/1`
- `hotel.wikidataId 1/1`
- `hotel.sameAs 1/1`
- `hotel.sameAs[].url 1/1`
- `hotel.amenityFeature 1/1`
- `hotel.amenityFeature[].name 1/1`
- `hotel.certifications 1/1`
- `hotel.certifications[].name 1/1`
- `hotel.certifications[].url 1/1`
- `hotel.openingHours 1/1`
- `hotel.openingHours.reception 1/1`
- `hotel.openingHours.breakfast 1/1`
- `hotel.hours 1/1`
- `hotel.hours[].dayOfWeek 1/1`
- `hotel.hours[].opens 1/1`
- `hotel.hours[].closes 1/1`
- `hotel.hours[].segment 1/1`
- `hotel.breakfastPricing 1/1`
- `hotel.breakfastPricing.adultPrice 1/1`
- `hotel.breakfastPricing.childPrice 1/1`
- `hotel.breakfastPricing.childAgeFrom 1/1`
- `hotel.roomService 1/1`
- `hotel.roomService.note 1/1`
- `hotel.heroMapImage 1/1`
- `hotel.meetAndWork 1/1`
- `hotel.meetAndWork.kicker 1/1`
- `hotel.meetAndWork.subhead 1/1`
- `hotel.meetAndWork.body 1/1`
- `hotel.meetAndWork.slides 1/1`
- `hotel.meetAndWork.slides[].imageAlt 1/1`
- `hotel.meetAndWork.slides[].caption 1/1`
- `hotel.meetAndWork.ctaLabel 1/1`
- `hotel.compareTable 1/1`
- `hotel.roomsSuitesCallout 1/1`
- `hotel.roomsSuitesCallout.insertAfterSlug 1/1`
- `hotel.roomsSuitesCallout.quote 1/1`
- `hotel.roomsSuitesCallout.title 1/1`
- `hotel.roomsSuitesCallout.body 1/1`
- `hotel.eatAndDrink 1/1`
- `hotel.eatAndDrink.kicker 1/1`
- `hotel.eatAndDrink.heading 1/1`
- `hotel.eatAndDrink.body 1/1`
- `hotel.eatAndDrink.image 1/1`
- `hotel.eatAndDrink.imageAlt 1/1`
- `hotel.eatAndDrink.ctaLabel 1/1`
- `navigation.secondaryLinks 1/1`
- `footer.bookDirectStrip 1/1`
- `footer.bookDirectStrip.message 1/1`
- `footer.bookDirectStrip.ctaLabel 1/1`
- `footer.bookDirectStrip.ctaUrl 1/1`
- `footer.contact 1/1`
- `footer.contact.sinceYear 1/1`
- `footer.contact.addressLines 1/1`
- `footer.contact.phone 1/1`
- `footer.contact.email 1/1`
- `footer.contact.transitLines 1/1`
- `footer.columns 1/1`
- `footer.columns[].icon 1/1`
- `footer.columns[].links 1/1`
- `footer.columns[].links[].linkType 1/1`
- `footer.columns[].links[].externalUrl 1/1`
- `footer.alreadyHereColumn 1/1`
- `footer.alreadyHereColumn.icon 1/1`
- `footer.alreadyHereColumn.description 1/1`
- `footer.alreadyHereColumn.links 1/1`
- `footer.alreadyHereColumn.links[].linkType 1/1`
- `footer.alreadyHereColumn.links[].externalUrl 1/1`
- `footer.awards 1/1`
- `footer.awards[].linkUrl 1/1`
- `footer.awardsHeading 1/1`
- `footer.partnerLinks 1/1`
- `footer.legalLinks 1/1`
- `footer.copyrightEntity 1/1`
- `meetings.heroKicker 1/1`
- `meetings.heroHeadline 1/1`
- `meetings.heroIntro 1/1`
- `meetings.heroContactLabel 1/1`
- `meetings.heroSlides 1/1`
- `meetings.contactPhone 1/1`
- `meetings.contactEmail 1/1`
- `meetings.eventTypesHeading 1/1`
- `meetings.eventTypes 1/1`
- `meetings.eventTypes[].key 1/1`
- `meetings.eventTypes[].image 1/1`
- `meetings.eventTypes[].lucideIcon 1/1`
- `meetings.hybridTeaser 1/1`
- `meetings.hybridTeaser.kicker 1/1`
- `meetings.hybridTeaser.headline 1/1`
- `meetings.hybridTeaser.body 1/1`
- `meetings.hybridTeaser.ctaLabel 1/1`
- `meetings.hybridTeaser.image 1/1`
- `meetings.foodDrinkTeaser 1/1`
- `meetings.foodDrinkTeaser.kicker 1/1`
- `meetings.foodDrinkTeaser.headline 1/1`
- `meetings.foodDrinkTeaser.body 1/1`
- `meetings.foodDrinkTeaser.ctaLabel 1/1`
- `meetings.foodDrinkTeaser.image 1/1`
- `meetings.facilities 1/1`
- `meetings.closingHeadline 1/1`
- `meetings.closingCtaLabel 1/1`

### Values that match a schema `defaultValue` and are 100% filled

These may be seed defaults rather than hotel-authored copy. Named from the field `defaultValue`, not from guessing DB contents.

- `users.sessions[].createdAt default="[function] ()=>new Date()"`
- `rooms.currency default="EUR"`
- `rooms.images[].id default="[function] ()=>new ObjectId().toHexString()"`
- `meeting-rooms.images[].id default="[function] ()=>new ObjectId().toHexString()"`
- `meeting-documents.pageRole default="none"`
- `events.currency default="EUR"`
- `neighbourhood-places.targetAudience[].id default="[function] ()=>new ObjectId().toHexString()"`
- `places.pinIcon default="auto"`
- `places.schemaType default="TouristAttraction"`
- `pages.status default="skeleton"`
- `hotel.guestStay.checkout.valueDE default="12:00"`
- `hotel.guestStay.checkout.valueEN default="12:00"`
- `hotel.guestStay.checkout.noteDE default="Später auf Anfrage"`
- `hotel.guestStay.checkout.noteEN default="Later on request"`
- `hotel.guestStay.breakfast.valueDE default="06:30 – 10:00"`
- `hotel.guestStay.breakfast.valueEN default="06:30 – 10:00"`
- `hotel.guestStay.breakfast.noteDE default="Lütze, Erdgeschoss"`
- `hotel.guestStay.breakfast.noteEN default="Lütze, ground floor"`
- `hotel.guestStay.parking.valueDE default="4 € / Std."`
- `hotel.guestStay.parking.valueEN default="€4 / hour"`
- `hotel.guestStay.parking.noteDE default="Tiefgarage · max. 25 €/Tag"`
- `hotel.guestStay.parking.noteEN default="Underground · max. €25/day"`
- `hotel.guestStay.luggage.valueDE default="Rezeption"`
- `hotel.guestStay.luggage.valueEN default="Reception"`
- `hotel.guestStay.luggage.noteDE default="Auch nach dem Check-out"`
- `hotel.guestStay.luggage.noteEN default="Also after check-out"`
- `hotel.guestStay.more.saunaFitness.valueDE default="24/7"`
- `hotel.guestStay.more.saunaFitness.valueEN default="24/7"`
- `hotel.guestStay.more.saunaFitness.noteDE default="Sauna · Fitness"`
- `hotel.guestStay.more.saunaFitness.noteEN default="Sauna · gym"`
- `hotel.guestStay.more.pets.valueDE default="€30 / Tag"`
- `hotel.guestStay.more.pets.valueEN default="€30 / day"`
- `hotel.guestStay.more.pets.noteDE default="Hunde willkommen"`
- `hotel.guestStay.more.pets.noteEN default="Dogs welcome"`
- `hotel.bridgeNav.toHereLabelEN default="Already in the house? ENTER →"`
- `hotel.bridgeNav.toHereLabelDE default="Schon im Haus? ENTER →"`
- `hotel.bridgeNav.toStayLabelEN default="Not here yet? STAY →"`
- `hotel.bridgeNav.toStayLabelDE default="Noch nicht hier? BLEIB →"`
- `hotel.sameAs[].id default="[function] ()=>new ObjectId().toHexString()"`
- `hotel.amenityFeature[].id default="[function] ()=>new ObjectId().toHexString()"`
- `hotel.certifications[].id default="[function] ()=>new ObjectId().toHexString()"`
- `hotel.hours[].id default="[function] ()=>new ObjectId().toHexString()"`
- `hotel.meetAndWork.slides[].id default="[function] ()=>new ObjectId().toHexString()"`
- `hotel.roomsSuitesCallout.insertAfterSlug default="premium"`
- `navigation.secondaryLinks[].id default="[function] ()=>new ObjectId().toHexString()"`
- `footer.bookDirectStrip.ctaUrl default="/book"`
- `footer.contact.sinceYear default="1958"`
- `footer.contact.addressLines[].id default="[function] ()=>new ObjectId().toHexString()"`
- `footer.contact.transitLines[].id default="[function] ()=>new ObjectId().toHexString()"`
- `footer.columns[].links[].linkType default="internal"`
- `footer.columns[].links[].id default="[function] ()=>new ObjectId().toHexString()"`
- `footer.columns[].id default="[function] ()=>new ObjectId().toHexString()"`
- `footer.alreadyHereColumn.links[].linkType default="internal"`
- `footer.alreadyHereColumn.links[].id default="[function] ()=>new ObjectId().toHexString()"`
- `footer.awards[].id default="[function] ()=>new ObjectId().toHexString()"`
- `footer.partnerLinks[].id default="[function] ()=>new ObjectId().toHexString()"`
- `footer.legalLinks[].id default="[function] ()=>new ObjectId().toHexString()"`
- `footer.copyrightEntity default="Pandox Berlin GmbH"`
- `meetings.heroSlides[].id default="[function] ()=>new ObjectId().toHexString()"`
- `meetings.contactPhone default="+49 30 2605 2700"`
- `meetings.contactEmail default="meetings@hotel-berlin.de"`
- `meetings.eventTypes[].key default=""`
- `meetings.eventTypes[].id default="[function] ()=>new ObjectId().toHexString()"`
- `meetings.facilities[].id default="[function] ()=>new ObjectId().toHexString()"`

Hotel guestStay locale-pair defaults live in `src/globals/Hotel.ts` (`localePair` helper). `places.pinIcon` default `auto` (`src/collections/Places.ts:192`). `places.schemaType` default `TouristAttraction` (`src/collections/Places.ts:213`). Navigation bridge strings default in `src/globals/Hotel.ts:186-201`. Footer `copyrightEntity` fallback `Pandox Berlin GmbH` (`src/lib/payload/footerFallback.ts:256`) if CMS empty.

### Per-collection fill tables

#### `users` (1)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| updatedAt | 1/1 | false | date | — |
| createdAt | 1/1 | false | date | — |
| email | 1/1 | true | email | — |
| resetPasswordToken | 0/1 | false | text | 0/total |
| resetPasswordExpiration | 0/1 | false | date | 0/total |
| salt | 0/1 | false | text | 0/total |
| hash | 0/1 | false | text | 0/total |
| loginAttempts | 0/1 | false | number | 0/total |
| lockUntil | 0/1 | false | date | 0/total |
| sessions | 1/1 | false | array | effectively required |
| sessions[].id | 1/1 | true | text | — |
| sessions[].createdAt | 1/1 | false | date | effectively required, schema defaultValue="[function] ()=>new Date()" |
| sessions[].expiresAt | 1/1 | true | date | — |

#### `media` (346)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| alt | 346/346 | true | text | — |
| updatedAt | 346/346 | false | date | — |
| createdAt | 346/346 | false | date | — |
| url | 346/346 | false | text | effectively required |
| thumbnailURL | 0/346 | false | text | 0/total |
| filename | 346/346 | false | text | effectively required |
| mimeType | 346/346 | false | text | effectively required |
| filesize | 346/346 | false | number | effectively required |
| width | 326/346 | false | number | — |
| height | 326/346 | false | number | — |
| focalX | 323/346 | false | number | — |
| focalY | 323/346 | false | number | — |

#### `tags` (64)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| name | 64/64 | true | text | — |
| slug | 64/64 | true | text | — |
| description | 49/64 | false | text | — |
| lucideIcon | 49/64 | false | text | — |
| type | 64/64 | true | select | — |
| updatedAt | 64/64 | false | date | — |
| createdAt | 64/64 | false | date | — |

#### `rooms` (11)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| name | 11/11 | true | text | — |
| slug | 11/11 | true | text | — |
| shortDescription | 11/11 | false | textarea | effectively required |
| description | 1/11 | false | richText | — |
| fromPrice | 11/11 | false | number | effectively required |
| currency | 11/11 | false | text | effectively required, schema defaultValue="EUR" |
| floorSizeM2 | 11/11 | false | number | effectively required |
| bedConfiguration | 11/11 | false | group | effectively required |
| bedConfiguration.type | 11/11 | false | select | effectively required |
| bedConfiguration.details | 11/11 | false | text | effectively required |
| occupancy | 11/11 | false | group | effectively required |
| occupancy.maxAdults | 11/11 | false | number | effectively required |
| occupancy.maxChildren | 11/11 | false | number | effectively required |
| occupancy.maxTotal | 11/11 | false | number | effectively required |
| childAgeMin | 2/11 | false | number | — |
| bathroomLabel | 11/11 | false | select | effectively required |
| bathroomDescription | 11/11 | false | text | effectively required |
| hasBalcony | 11/11 | false | checkbox | checkbox (false counts as filled) |
| hasSauna | 11/11 | false | checkbox | checkbox (false counts as filled) |
| hasSeparateLiving | 11/11 | false | checkbox | checkbox (false counts as filled) |
| isAccessible | 11/11 | false | checkbox | checkbox (false counts as filled) |
| accessibilityFeatures | 0/11 | false | richText | 0/total |
| amenities | 11/11 | false | relationship | effectively required |
| images | 11/11 | false | array | effectively required |
| images[].image | 11/11 | true | upload | — |
| images[].alt | 11/11 | true | text | — |
| images[].caption | 0/11 | false | text | 0/total |
| images[].id | 11/11 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| socialImage | 0/11 | false | upload | 0/total |
| bookingUrl | 11/11 | false | text | effectively required |
| featured | 11/11 | false | checkbox | checkbox (false counts as filled) |
| displayOrder | 11/11 | false | number | effectively required |
| homepageTeaser | 11/11 | false | group | effectively required |
| homepageTeaser.enabled | 11/11 | false | checkbox | checkbox (false counts as filled) |
| homepageTeaser.order | 11/11 | false | number | effectively required |
| homepageTeaser.teaserImage | 11/11 | false | upload | effectively required |
| homepageTeaser.featuredAmenities | 1/11 | false | relationship | — |
| storyConnection | 11/11 | false | group | effectively required |
| storyConnection.hasStory | 11/11 | false | checkbox | checkbox (false counts as filled) |
| storyConnection.storyTeaser | 2/11 | false | text | — |
| updatedAt | 11/11 | false | date | — |
| createdAt | 11/11 | false | date | — |

#### `meeting-rooms` (21)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| name | 21/21 | true | text | — |
| slug | 21/21 | true | text | — |
| area | 21/21 | true | select | — |
| displayOrder | 21/21 | true | number | — |
| floorSizeM2 | 21/21 | true | number | — |
| ceilingHeightM | 0/21 | false | number | 0/total |
| hasDaylight | 21/21 | false | checkbox | checkbox (false counts as filled) |
| isDivisible | 21/21 | false | checkbox | checkbox (false counts as filled) |
| hasScreen | 21/21 | false | checkbox | checkbox (false counts as filled) |
| hasProjector | 21/21 | false | checkbox | checkbox (false counts as filled) |
| combinableWith | 6/21 | false | relationship | — |
| capacity | 21/21 | false | group | effectively required |
| capacity.theater | 18/21 | false | number | — |
| capacity.classroom | 17/21 | false | number | — |
| capacity.banquet | 18/21 | false | number | — |
| capacity.uShape | 17/21 | false | number | — |
| capacity.cabaret | 13/21 | false | number | — |
| capacity.reception | 16/21 | false | number | — |
| capacity.block | 17/21 | false | number | — |
| images | 21/21 | false | array | effectively required |
| images[].image | 21/21 | true | upload | — |
| images[].alt | 0/21 | true | text | 0/total |
| images[].id | 21/21 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| teaserImage | 21/21 | false | upload | effectively required |
| shortDescription | 21/21 | true | textarea | — |
| description | 21/21 | false | richText | effectively required |
| featured | 21/21 | false | checkbox | checkbox (false counts as filled) |
| updatedAt | 21/21 | false | date | — |
| createdAt | 21/21 | false | date | — |

#### `meeting-documents` (10)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| title | 10/10 | true | text | — |
| generateSlug | 10/10 | false | checkbox | checkbox (false counts as filled) |
| key | 10/10 | true | text | — |
| file | 10/10 | true | upload | — |
| category | 10/10 | true | select | — |
| area | 4/10 | false | select | — |
| pageRole | 10/10 | false | select | effectively required, schema defaultValue="none" |
| sortOrder | 10/10 | true | number | — |
| updatedAt | 10/10 | false | date | — |
| createdAt | 10/10 | false | date | — |

#### `meeting-inquiries` (0)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| company | 0/0 | false | text | no rows |
| contactPerson | 0/0 | true | text | no rows |
| email | 0/0 | true | email | no rows |
| phone | 0/0 | true | text | no rows |
| startDate | 0/0 | true | date | no rows |
| endDate | 0/0 | true | date | no rows |
| eventType | 0/0 | true | text | no rows |
| guestCount | 0/0 | false | number | no rows |
| roomCount | 0/0 | false | number | no rows |
| overnightGuestCount | 0/0 | false | number | no rows |
| stayDuration | 0/0 | false | text | no rows |
| roomOfInterest | 0/0 | false | relationship | no rows |
| isRoomBlock | 0/0 | false | checkbox | no rows, checkbox (false counts as filled) |
| notes | 0/0 | false | textarea | no rows |
| privacyAccepted | 0/0 | true | checkbox | no rows, checkbox (false counts as filled) |
| consentGiven | 0/0 | true | checkbox | no rows, checkbox (false counts as filled) |
| locale | 0/0 | true | select | no rows |
| updatedAt | 0/0 | false | date | no rows |
| createdAt | 0/0 | false | date | no rows |

#### `venues` (5)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| name | 5/5 | true | text | — |
| slug | 5/5 | true | text | — |
| venueType | 5/5 | true | select | — |
| tagline | 4/5 | false | text | — |
| description | 0/5 | false | richText | 0/total |
| shortDescription | 5/5 | false | textarea | effectively required |
| location | 5/5 | false | text | effectively required |
| spotlightLocation | 1/5 | false | text | — |
| telephone | 0/5 | false | text | 0/total |
| email | 1/5 | false | email | — |
| website | 4/5 | false | text | — |
| instagramUrl | 1/5 | false | text | — |
| venueMonogram | 3/5 | false | upload | — |
| openingHours | 3/5 | false | array | — |
| openingHours[].dayOfWeek | 3/5 | false | text | — |
| openingHours[].opens | 3/5 | false | text | — |
| openingHours[].closes | 3/5 | false | text | — |
| openingHours[].isOpenEnded | 3/5 | false | checkbox | checkbox (false counts as filled) |
| openingHours[].segment | 2/5 | false | text | — |
| openingHours[].note | 0/5 | false | text | 0/total |
| openingHours[].id | 3/5 | false | text | — |
| servesCuisine | 1/5 | false | text | — |
| reservationUrl | 1/5 | false | text | — |
| menuUrl | 0/5 | false | text | 0/total |
| priceRange | 1/5 | false | text | — |
| isOpenToPublic | 5/5 | false | checkbox | checkbox (false counts as filled) |
| isGuestFacing | 5/5 | false | checkbox | checkbox (false counts as filled) |
| heroImage | 0/5 | false | upload | 0/total |
| images | 0/5 | false | array | 0/total |
| images[].image | 0/5 | true | upload | 0/total |
| images[].alt | 0/5 | true | text | 0/total |
| images[].id | 0/5 | false | text | 0/total |
| tags | 0/5 | false | relationship | 0/total |
| sameAs | 0/5 | false | array | 0/total |
| sameAs[].url | 0/5 | false | text | 0/total |
| sameAs[].id | 0/5 | false | text | 0/total |
| featured | 5/5 | false | checkbox | checkbox (false counts as filled) |
| displayOrder | 5/5 | false | number | effectively required |
| updatedAt | 5/5 | false | date | — |
| createdAt | 5/5 | false | date | — |

#### `hero-slides` (4)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| adminTitle | 4/4 | false | text | effectively required |
| image | 4/4 | true | upload | — |
| altText | 4/4 | true | text | — |
| venue | 0/4 | false | relationship | 0/total |
| captionOverride | 4/4 | false | text | effectively required |
| credit | 0/4 | false | text | 0/total |
| context | 4/4 | true | select | — |
| order | 4/4 | true | number | — |
| enabled | 4/4 | false | checkbox | checkbox (false counts as filled) |
| updatedAt | 4/4 | false | date | — |
| createdAt | 4/4 | false | date | — |

#### `faqs` (57)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| question | 57/57 | true | text | — |
| answer | 57/57 | true | textarea | — |
| context | 57/57 | true | select | — |
| category | 57/57 | true | select | — |
| relevantPages | 0/57 | false | relationship | 0/total |
| order | 57/57 | true | number | — |
| slug | 57/57 | true | text | — |
| updatedAt | 57/57 | false | date | — |
| createdAt | 57/57 | false | date | — |

#### `artists` (2)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| name | 2/2 | true | text | — |
| generateSlug | 2/2 | false | checkbox | checkbox (false counts as filled) |
| slug | 2/2 | true | text | — |
| alias | 2/2 | false | text | effectively required |
| bio | 0/2 | false | richText | 0/total |
| shortBio | 2/2 | false | textarea | effectively required |
| portrait | 2/2 | false | upload | effectively required |
| website | 0/2 | false | text | 0/total |
| instagram | 2/2 | false | text | effectively required |
| nationality | 0/2 | false | text | 0/total |
| basedIn | 0/2 | false | text | 0/total |
| medium | 2/2 | false | text | effectively required |
| tags | 0/2 | false | relationship | 0/total |
| updatedAt | 2/2 | false | date | — |
| createdAt | 2/2 | false | date | — |

#### `artworks` (0)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| title | 0/0 | true | text | no rows |
| generateSlug | 0/0 | false | checkbox | no rows, checkbox (false counts as filled) |
| slug | 0/0 | true | text | no rows |
| artist | 0/0 | true | relationship | no rows |
| editionNumber | 0/0 | false | text | no rows |
| medium | 0/0 | false | text | no rows |
| dimensions | 0/0 | false | text | no rows |
| year | 0/0 | false | number | no rows |
| description | 0/0 | false | richText | no rows |
| locationInBuilding | 0/0 | false | text | no rows |
| images | 0/0 | false | array | no rows |
| images[].image | 0/0 | true | upload | no rows |
| images[].alt | 0/0 | true | text | no rows |
| images[].id | 0/0 | false | text | no rows, schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| status | 0/0 | false | select | no rows |
| tags | 0/0 | false | relationship | no rows |
| updatedAt | 0/0 | false | date | no rows |
| createdAt | 0/0 | false | date | no rows |

#### `exhibitions` (1)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| title | 1/1 | true | text | — |
| generateSlug | 1/1 | false | checkbox | checkbox (false counts as filled) |
| slug | 1/1 | true | text | — |
| subtitle | 1/1 | false | text | effectively required |
| description | 1/1 | false | richText | effectively required |
| startDate | 1/1 | false | date | effectively required |
| endDate | 1/1 | false | date | effectively required |
| location | 0/1 | false | text | 0/total |
| venue | 1/1 | false | relationship | effectively required |
| heroImage | 1/1 | false | upload | effectively required |
| artists | 1/1 | false | relationship | effectively required |
| artworks | 0/1 | false | relationship | 0/total |
| status | 1/1 | false | select | effectively required |
| updatedAt | 1/1 | false | date | — |
| createdAt | 1/1 | false | date | — |

#### `events` (4)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| name | 4/4 | true | text | — |
| generateSlug | 4/4 | false | checkbox | checkbox (false counts as filled) |
| slug | 4/4 | true | text | — |
| description | 4/4 | false | richText | effectively required |
| shortDescription | 4/4 | false | textarea | effectively required |
| startDate | 4/4 | true | date | — |
| endDate | 4/4 | false | date | effectively required |
| category | 4/4 | false | select | effectively required |
| venue | 4/4 | false | relationship | effectively required |
| isFree | 4/4 | false | checkbox | checkbox (false counts as filled) |
| price | 4/4 | false | number | effectively required |
| currency | 4/4 | false | select | effectively required, schema defaultValue="EUR" |
| bookingRequired | 4/4 | false | checkbox | checkbox (false counts as filled) |
| bookingNote | 4/4 | false | text | effectively required |
| ticketUrl | 0/4 | false | text | 0/total |
| heroImage | 4/4 | false | upload | effectively required |
| tags | 0/4 | false | relationship | 0/total |
| featured | 4/4 | false | checkbox | checkbox (false counts as filled) |
| isRecurring | 4/4 | false | checkbox | checkbox (false counts as filled) |
| recurrenceRule | 4/4 | false | text | effectively required |
| recurrenceNote | 4/4 | false | text | effectively required |
| updatedAt | 4/4 | false | date | — |
| createdAt | 4/4 | false | date | — |

#### `people` (16)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| name | 16/16 | true | text | — |
| generateSlug | 16/16 | false | checkbox | checkbox (false counts as filled) |
| slug | 16/16 | true | text | — |
| jobTitle | 6/16 | false | text | — |
| shortBio | 2/16 | false | textarea | — |
| bio | 0/16 | false | richText | 0/total |
| quote | 1/16 | false | text | — |
| video | 0/16 | false | text | 0/total |
| portrait | 5/16 | false | upload | — |
| website | 6/16 | false | text | — |
| instagram | 0/16 | false | text | 0/total |
| roomNumber | 3/16 | false | text | — |
| roomConfirmed | 16/16 | false | checkbox | checkbox (false counts as filled) |
| basedIn | 1/16 | false | text | — |
| type | 16/16 | true | select | — |
| tags | 0/16 | false | relationship | 0/total |
| relatedVenue | 0/16 | false | relationship | 0/total |
| authority | 0/16 | false | group | 0/total |
| authority.identifier | 0/16 | false | array | 0/total |
| authority.identifier[].propertyID | 0/16 | true | select | 0/total |
| authority.identifier[].value | 0/16 | true | text | 0/total |
| authority.identifier[].id | 0/16 | false | text | 0/total |
| authority.sameAs | 0/16 | false | array | 0/total |
| authority.sameAs[].url | 0/16 | true | text | 0/total |
| authority.sameAs[].id | 0/16 | false | text | 0/total |
| picks | 16/16 | false | join | effectively required |
| featured | 16/16 | false | checkbox | checkbox (false counts as filled) |
| displayOrder | 6/16 | false | number | — |
| status | 16/16 | true | select | — |
| updatedAt | 16/16 | false | date | — |
| createdAt | 16/16 | false | date | — |

#### `neighbourhood-places` (21)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| name | 21/21 | true | text | — |
| slug | 21/21 | true | text | — |
| category | 21/21 | true | select | — |
| secondaryCategory | 1/21 | false | select | — |
| schemaType | 21/21 | true | select | — |
| address | 21/21 | false | group | effectively required |
| address.streetAddress | 21/21 | false | text | effectively required |
| address.addressLocality | 21/21 | true | text | — |
| address.postalCode | 21/21 | false | text | effectively required |
| geo | 21/21 | false | group | effectively required |
| geo.latitude | 21/21 | false | number | effectively required |
| geo.longitude | 21/21 | false | number | effectively required |
| walkingMinutes | 21/21 | false | number | effectively required |
| transit | 1/21 | false | group | — |
| transit.minutes | 1/21 | false | number | — |
| transit.station | 1/21 | false | text | — |
| transit.line | 1/21 | false | text | — |
| distanceTier | 21/21 | false | select | effectively required |
| indoorOutdoor | 21/21 | false | select | effectively required |
| targetAudience | 21/21 | false | array | effectively required |
| targetAudience[].label | 21/21 | false | text | effectively required |
| targetAudience[].id | 21/21 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| description | 10/21 | false | textarea | — |
| endorsements | 19/21 | false | array | — |
| endorsements[].person | 19/21 | true | relationship | — |
| endorsements[].quote | 19/21 | true | text | — |
| endorsements[].associatedRoom | 12/21 | false | text | — |
| endorsements[].id | 19/21 | false | text | — |
| website | 0/21 | false | text | 0/total |
| openingHours | 0/21 | false | text | 0/total |
| priceRange | 0/21 | false | text | 0/total |
| image | 0/21 | false | upload | 0/total |
| imageCredit | 0/21 | false | group | 0/total |
| imageCredit.creditText | 0/21 | false | text | 0/total |
| imageCredit.creditUrl | 0/21 | false | text | 0/total |
| imageCredit.license | 0/21 | false | select | 0/total |
| authority | 0/21 | false | group | 0/total |
| authority.identifier | 0/21 | false | array | 0/total |
| authority.identifier[].propertyID | 0/21 | true | select | 0/total |
| authority.identifier[].value | 0/21 | true | text | 0/total |
| authority.identifier[].id | 0/21 | false | text | 0/total |
| authority.sameAs | 0/21 | false | array | 0/total |
| authority.sameAs[].url | 0/21 | true | text | 0/total |
| authority.sameAs[].id | 0/21 | false | text | 0/total |
| homepageTeaser | 21/21 | false | group | effectively required |
| homepageTeaser.enabled | 21/21 | false | checkbox | checkbox (false counts as filled) |
| homepageTeaser.order | 5/21 | false | number | — |
| hereTeaser | 21/21 | false | group | effectively required |
| hereTeaser.enabled | 21/21 | false | checkbox | checkbox (false counts as filled) |
| hereTeaser.order | 10/21 | false | number | — |
| featuredOrder | 15/21 | false | number | — |
| status | 21/21 | true | select | — |
| updatedAt | 21/21 | false | date | — |
| createdAt | 21/21 | false | date | — |

#### `places` (14)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| name | 14/14 | true | text | — |
| slug | 14/14 | true | text | — |
| context | 14/14 | true | select | — |
| type | 14/14 | true | select | — |
| category | 14/14 | true | select | — |
| shortDescription | 14/14 | true | text | — |
| shortDescriptionDE | 14/14 | false | text | effectively required |
| fullDescription | 0/14 | false | richText | 0/total |
| location | 14/14 | false | group | effectively required |
| location.lat | 14/14 | true | number | — |
| location.lng | 14/14 | true | number | — |
| address | 14/14 | false | text | effectively required |
| walkingMinutes | 10/14 | false | number | — |
| walkingNote | 10/14 | false | text | — |
| floor | 3/14 | false | text | — |
| website | 8/14 | false | text | — |
| hours | 11/14 | false | text | — |
| image | 0/14 | false | upload | 0/total |
| pinIcon | 14/14 | false | select | effectively required, schema defaultValue="auto" |
| schemaType | 14/14 | false | select | effectively required, schema defaultValue="TouristAttraction" |
| featured | 14/14 | false | checkbox | checkbox (false counts as filled) |
| active | 14/14 | false | checkbox | checkbox (false counts as filled) |
| updatedAt | 14/14 | false | date | — |
| createdAt | 14/14 | false | date | — |

#### `pages` (26)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| title | 26/26 | true | text | — |
| slug | 26/26 | true | text | — |
| context | 26/26 | true | select | — |
| status | 26/26 | false | select | effectively required, schema defaultValue="skeleton" |
| updatedAt | 26/26 | false | date | — |
| createdAt | 26/26 | false | date | — |

#### `legal-documents` (5)

| path | n/total | required | type | flag |
|---|---|---|---|---|
| slug | 5/5 | true | select | — |
| title | 5/5 | true | text | — |
| updatedLabel | 2/5 | false | text | — |
| lede | 1/5 | false | textarea | — |
| body | 5/5 | true | richText | — |
| updatedAt | 5/5 | false | date | — |
| createdAt | 5/5 | false | date | — |

#### global `hotel`

| path | n/total | required | type | flag |
|---|---|---|---|---|
| name | 1/1 | true | text | — |
| legalName | 1/1 | false | text | effectively required |
| description | 0/1 | false | richText | 0/total |
| shortDescription | 0/1 | false | textarea | 0/total |
| url | 1/1 | false | text | effectively required |
| telephone | 1/1 | false | text | effectively required |
| conferencePhone | 1/1 | false | text | effectively required |
| email | 1/1 | false | email | effectively required |
| address | 1/1 | false | group | effectively required |
| address.streetAddress | 1/1 | false | text | effectively required |
| address.addressLocality | 1/1 | false | text | effectively required |
| address.postalCode | 1/1 | false | text | effectively required |
| address.addressCountry | 1/1 | false | text | effectively required |
| geo | 1/1 | false | group | effectively required |
| geo.latitude | 1/1 | false | number | effectively required |
| geo.longitude | 1/1 | false | number | effectively required |
| hasMap | 1/1 | false | text | effectively required |
| directionsUrl | 0/1 | false | text | 0/total |
| mapBounds | 0/1 | false | group | 0/total |
| mapBounds.north | 0/1 | false | number | 0/total |
| mapBounds.south | 0/1 | false | number | 0/total |
| mapBounds.west | 0/1 | false | number | 0/total |
| mapBounds.east | 0/1 | false | number | 0/total |
| checkinTime | 1/1 | false | text | effectively required |
| checkoutTime | 1/1 | false | text | effectively required |
| guestStay | 1/1 | false | group | effectively required |
| guestStay.wifiNetwork | 1/1 | false | text | effectively required |
| guestStay.wifiPassword | 1/1 | false | text | effectively required |
| guestStay.checkout | 1/1 | false | group | effectively required |
| guestStay.checkout.valueDE | 1/1 | false | text | effectively required, schema defaultValue="12:00" |
| guestStay.checkout.valueEN | 1/1 | false | text | effectively required, schema defaultValue="12:00" |
| guestStay.checkout.noteDE | 1/1 | false | text | effectively required, schema defaultValue="Später auf Anfrage" |
| guestStay.checkout.noteEN | 1/1 | false | text | effectively required, schema defaultValue="Later on request" |
| guestStay.breakfast | 1/1 | false | group | effectively required |
| guestStay.breakfast.valueDE | 1/1 | false | text | effectively required, schema defaultValue="06:30 – 10:00" |
| guestStay.breakfast.valueEN | 1/1 | false | text | effectively required, schema defaultValue="06:30 – 10:00" |
| guestStay.breakfast.noteDE | 1/1 | false | text | effectively required, schema defaultValue="Lütze, Erdgeschoss" |
| guestStay.breakfast.noteEN | 1/1 | false | text | effectively required, schema defaultValue="Lütze, ground floor" |
| guestStay.parking | 1/1 | false | group | effectively required |
| guestStay.parking.valueDE | 1/1 | false | text | effectively required, schema defaultValue="4 € / Std." |
| guestStay.parking.valueEN | 1/1 | false | text | effectively required, schema defaultValue="€4 / hour" |
| guestStay.parking.noteDE | 1/1 | false | text | effectively required, schema defaultValue="Tiefgarage · max. 25 €/Tag" |
| guestStay.parking.noteEN | 1/1 | false | text | effectively required, schema defaultValue="Underground · max. €25/day" |
| guestStay.luggage | 1/1 | false | group | effectively required |
| guestStay.luggage.valueDE | 1/1 | false | text | effectively required, schema defaultValue="Rezeption" |
| guestStay.luggage.valueEN | 1/1 | false | text | effectively required, schema defaultValue="Reception" |
| guestStay.luggage.noteDE | 1/1 | false | text | effectively required, schema defaultValue="Auch nach dem Check-out" |
| guestStay.luggage.noteEN | 1/1 | false | text | effectively required, schema defaultValue="Also after check-out" |
| guestStay.more | 1/1 | false | group | effectively required |
| guestStay.more.wundermart | 0/1 | false | group | 0/total |
| guestStay.more.wundermart.valueDE | 0/1 | false | text | 0/total |
| guestStay.more.wundermart.valueEN | 0/1 | false | text | 0/total |
| guestStay.more.wundermart.noteDE | 0/1 | false | text | 0/total |
| guestStay.more.wundermart.noteEN | 0/1 | false | text | 0/total |
| guestStay.more.bettAndBike | 0/1 | false | group | 0/total |
| guestStay.more.bettAndBike.valueDE | 0/1 | false | text | 0/total |
| guestStay.more.bettAndBike.valueEN | 0/1 | false | text | 0/total |
| guestStay.more.bettAndBike.noteDE | 0/1 | false | text | 0/total |
| guestStay.more.bettAndBike.noteEN | 0/1 | false | text | 0/total |
| guestStay.more.saunaFitness | 1/1 | false | group | effectively required |
| guestStay.more.saunaFitness.valueDE | 1/1 | false | text | effectively required, schema defaultValue="24/7" |
| guestStay.more.saunaFitness.valueEN | 1/1 | false | text | effectively required, schema defaultValue="24/7" |
| guestStay.more.saunaFitness.noteDE | 1/1 | false | text | effectively required, schema defaultValue="Sauna · Fitness" |
| guestStay.more.saunaFitness.noteEN | 1/1 | false | text | effectively required, schema defaultValue="Sauna · gym" |
| guestStay.more.pets | 1/1 | false | group | effectively required |
| guestStay.more.pets.valueDE | 1/1 | false | text | effectively required, schema defaultValue="€30 / Tag" |
| guestStay.more.pets.valueEN | 1/1 | false | text | effectively required, schema defaultValue="€30 / day" |
| guestStay.more.pets.noteDE | 1/1 | false | text | effectively required, schema defaultValue="Hunde willkommen" |
| guestStay.more.pets.noteEN | 1/1 | false | text | effectively required, schema defaultValue="Dogs welcome" |
| guestStay.checkoutNote | 0/1 | false | text | 0/total |
| guestStay.breakfastLocation | 0/1 | false | text | 0/total |
| guestStay.parkingSummary | 0/1 | false | text | 0/total |
| guestStay.luggageNote | 0/1 | false | text | 0/total |
| bridgeNav | 1/1 | false | group | effectively required |
| bridgeNav.toHereLabelEN | 1/1 | false | text | effectively required, schema defaultValue="Already in the house? ENTER →" |
| bridgeNav.toHereLabelDE | 1/1 | false | text | effectively required, schema defaultValue="Schon im Haus? ENTER →" |
| bridgeNav.toStayLabelEN | 1/1 | false | text | effectively required, schema defaultValue="Not here yet? STAY →" |
| bridgeNav.toStayLabelDE | 1/1 | false | text | effectively required, schema defaultValue="Noch nicht hier? BLEIB →" |
| starRating | 1/1 | false | number | effectively required |
| priceRange | 1/1 | false | text | effectively required |
| totalRooms | 1/1 | false | number | effectively required |
| foundingDate | 1/1 | false | text | effectively required |
| brand | 1/1 | false | text | effectively required |
| parentOrganization | 1/1 | false | text | effectively required |
| wikidataId | 1/1 | false | text | effectively required |
| sameAs | 1/1 | false | array | effectively required |
| sameAs[].url | 1/1 | false | text | effectively required |
| sameAs[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| amenityFeature | 1/1 | false | array | effectively required |
| amenityFeature[].name | 1/1 | false | text | effectively required |
| amenityFeature[].value | 1/1 | false | checkbox | checkbox (false counts as filled) |
| amenityFeature[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| certifications | 1/1 | false | array | effectively required |
| certifications[].name | 1/1 | false | text | effectively required |
| certifications[].url | 1/1 | false | text | effectively required |
| certifications[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| openingHours | 1/1 | false | group | effectively required |
| openingHours.reception | 1/1 | false | text | effectively required |
| openingHours.breakfast | 1/1 | false | text | effectively required |
| hours | 1/1 | false | array | effectively required |
| hours[].dayOfWeek | 1/1 | false | text | effectively required |
| hours[].opens | 1/1 | false | text | effectively required |
| hours[].closes | 1/1 | false | text | effectively required |
| hours[].isOpenEnded | 1/1 | false | checkbox | checkbox (false counts as filled) |
| hours[].segment | 1/1 | false | text | effectively required |
| hours[].note | 0/1 | false | text | 0/total |
| hours[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| breakfastPricing | 1/1 | false | group | effectively required |
| breakfastPricing.adultPrice | 1/1 | false | number | effectively required |
| breakfastPricing.childPrice | 1/1 | false | number | effectively required |
| breakfastPricing.childAgeFrom | 1/1 | false | number | effectively required |
| roomService | 1/1 | false | group | effectively required |
| roomService.offered | 1/1 | false | checkbox | checkbox (false counts as filled) |
| roomService.note | 1/1 | false | text | effectively required |
| heroMapImage | 1/1 | false | upload | effectively required |
| getDirectionsLabel | 0/1 | false | text | 0/total |
| heroShortAddress | 0/1 | false | text | 0/total |
| meetAndWork | 1/1 | false | group | effectively required |
| meetAndWork.kicker | 1/1 | false | text | effectively required |
| meetAndWork.subhead | 1/1 | false | text | effectively required |
| meetAndWork.body | 1/1 | false | textarea | effectively required |
| meetAndWork.slides | 1/1 | false | array | effectively required |
| meetAndWork.slides[].image | 1/1 | true | upload | — |
| meetAndWork.slides[].imageAlt | 1/1 | false | text | effectively required |
| meetAndWork.slides[].caption | 1/1 | false | text | effectively required |
| meetAndWork.slides[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| meetAndWork.ctaLabel | 1/1 | false | text | effectively required |
| roomsPageIntro | 0/1 | false | group | 0/total |
| roomsPageIntro.title | 0/1 | false | text | 0/total |
| roomsPageIntro.body | 0/1 | false | textarea | 0/total |
| compareTable | 1/1 | false | group | effectively required |
| compareTable.enabled | 1/1 | false | checkbox | checkbox (false counts as filled) |
| roomsSuitesCallout | 1/1 | false | group | effectively required |
| roomsSuitesCallout.enabled | 1/1 | false | checkbox | checkbox (false counts as filled) |
| roomsSuitesCallout.insertAfterSlug | 1/1 | false | text | effectively required, schema defaultValue="premium" |
| roomsSuitesCallout.quote | 1/1 | false | textarea | effectively required |
| roomsSuitesCallout.title | 1/1 | false | text | effectively required |
| roomsSuitesCallout.body | 1/1 | false | textarea | effectively required |
| eatAndDrink | 1/1 | false | group | effectively required |
| eatAndDrink.kicker | 1/1 | false | text | effectively required |
| eatAndDrink.heading | 1/1 | false | text | effectively required |
| eatAndDrink.body | 1/1 | false | textarea | effectively required |
| eatAndDrink.image | 1/1 | false | upload | effectively required |
| eatAndDrink.imageAlt | 1/1 | false | text | effectively required |
| eatAndDrink.ctaLabel | 1/1 | false | text | effectively required |
| updatedAt | 1/1 | false | date | — |
| createdAt | 1/1 | false | date | — |

#### global `homepage`

| path | n/total | required | type | flag |
|---|---|---|---|---|
| heroSlides | 0/1 | false | array | 0/total |
| heroSlides[].image | 0/1 | true | upload | 0/total |
| heroSlides[].alt | 0/1 | true | text | 0/total |
| heroSlides[].caption | 0/1 | true | text | 0/total |
| heroSlides[].kbOrigin | 0/1 | true | select | 0/total |
| heroSlides[].id | 0/1 | false | text | 0/total |
| roomsTeaser | 0/1 | false | group | 0/total |
| roomsTeaser.heading | 0/1 | false | text | 0/total |
| roomsTeaser.body | 0/1 | false | textarea | 0/total |
| roomsTeaser.ctaLabel | 0/1 | false | text | 0/total |
| updatedAt | 1/1 | false | date | — |
| createdAt | 1/1 | false | date | — |

#### global `navigation`

| path | n/total | required | type | flag |
|---|---|---|---|---|
| secondaryLinks | 1/1 | false | array | effectively required |
| secondaryLinks[].page | 1/1 | true | relationship | — |
| secondaryLinks[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| updatedAt | 1/1 | false | date | — |
| createdAt | 1/1 | false | date | — |

#### global `footer`

| path | n/total | required | type | flag |
|---|---|---|---|---|
| bookDirectStrip | 1/1 | false | group | effectively required |
| bookDirectStrip.visible | 1/1 | false | checkbox | checkbox (false counts as filled) |
| bookDirectStrip.message | 1/1 | false | text | effectively required |
| bookDirectStrip.ctaLabel | 1/1 | false | text | effectively required |
| bookDirectStrip.ctaUrl | 1/1 | false | text | effectively required, schema defaultValue="/book" |
| contact | 1/1 | false | group | effectively required |
| contact.sinceYear | 1/1 | false | text | effectively required, schema defaultValue="1958" |
| contact.addressLines | 1/1 | false | array | effectively required |
| contact.addressLines[].line | 1/1 | true | text | — |
| contact.addressLines[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| contact.phone | 1/1 | false | text | effectively required |
| contact.email | 1/1 | false | email | effectively required |
| contact.transitLines | 1/1 | false | array | effectively required |
| contact.transitLines[].line | 1/1 | true | text | — |
| contact.transitLines[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| columns | 1/1 | false | array | effectively required |
| columns[].icon | 1/1 | false | text | effectively required |
| columns[].title | 1/1 | true | text | — |
| columns[].links | 1/1 | false | array | effectively required |
| columns[].links[].label | 1/1 | true | text | — |
| columns[].links[].linkType | 1/1 | false | radio | effectively required, schema defaultValue="internal" |
| columns[].links[].internalPage | 0/1 | false | relationship | 0/total |
| columns[].links[].externalUrl | 1/1 | false | text | effectively required |
| columns[].links[].showArrow | 1/1 | false | checkbox | checkbox (false counts as filled) |
| columns[].links[].dividerBefore | 1/1 | false | checkbox | checkbox (false counts as filled) |
| columns[].links[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| columns[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| alreadyHereColumn | 1/1 | false | group | effectively required |
| alreadyHereColumn.title | 1/1 | true | text | — |
| alreadyHereColumn.icon | 1/1 | false | text | effectively required |
| alreadyHereColumn.description | 1/1 | false | textarea | effectively required |
| alreadyHereColumn.links | 1/1 | false | array | effectively required |
| alreadyHereColumn.links[].label | 1/1 | true | text | — |
| alreadyHereColumn.links[].linkType | 1/1 | false | radio | effectively required, schema defaultValue="internal" |
| alreadyHereColumn.links[].internalPage | 0/1 | false | relationship | 0/total |
| alreadyHereColumn.links[].externalUrl | 1/1 | false | text | effectively required |
| alreadyHereColumn.links[].showArrow | 1/1 | false | checkbox | checkbox (false counts as filled) |
| alreadyHereColumn.links[].dividerBefore | 1/1 | false | checkbox | checkbox (false counts as filled) |
| alreadyHereColumn.links[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| awards | 1/1 | false | array | effectively required |
| awards[].visible | 1/1 | false | checkbox | checkbox (false counts as filled) |
| awards[].image | 1/1 | true | upload | — |
| awards[].altText | 1/1 | true | text | — |
| awards[].linkUrl | 1/1 | false | text | effectively required |
| awards[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| awardsHeading | 1/1 | false | text | effectively required |
| partnerLinks | 1/1 | false | array | effectively required |
| partnerLinks[].visible | 1/1 | false | checkbox | checkbox (false counts as filled) |
| partnerLinks[].label | 0/1 | true | text | 0/total |
| partnerLinks[].url | 1/1 | true | text | — |
| partnerLinks[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| legalLinks | 1/1 | false | array | effectively required |
| legalLinks[].visible | 1/1 | false | checkbox | checkbox (false counts as filled) |
| legalLinks[].label | 0/1 | true | text | 0/total |
| legalLinks[].url | 1/1 | true | text | — |
| legalLinks[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| copyrightEntity | 1/1 | false | text | effectively required, schema defaultValue="Pandox Berlin GmbH" |
| updatedAt | 1/1 | false | date | — |
| createdAt | 1/1 | false | date | — |

#### global `meetings`

| path | n/total | required | type | flag |
|---|---|---|---|---|
| heroKicker | 1/1 | false | text | effectively required |
| heroHeadline | 1/1 | false | text | effectively required |
| heroIntro | 1/1 | false | textarea | effectively required |
| heroContactLabel | 1/1 | false | text | effectively required |
| heroSlides | 1/1 | false | array | effectively required |
| heroSlides[].image | 1/1 | true | upload | — |
| heroSlides[].alt | 1/1 | true | text | — |
| heroSlides[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| contactPhone | 1/1 | false | text | effectively required, schema defaultValue="+49 30 2605 2700" |
| contactEmail | 1/1 | false | text | effectively required, schema defaultValue="meetings@hotel-berlin.de" |
| eventTypesHeading | 1/1 | false | text | effectively required |
| eventTypes | 1/1 | false | array | effectively required |
| eventTypes[].key | 1/1 | false | text | effectively required, schema defaultValue="" |
| eventTypes[].label | 1/1 | true | text | — |
| eventTypes[].description | 1/1 | true | textarea | — |
| eventTypes[].image | 1/1 | false | upload | effectively required |
| eventTypes[].lucideIcon | 1/1 | false | text | effectively required |
| eventTypes[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| hybridTeaser | 1/1 | false | group | effectively required |
| hybridTeaser.kicker | 1/1 | false | text | effectively required |
| hybridTeaser.headline | 1/1 | false | text | effectively required |
| hybridTeaser.body | 1/1 | false | textarea | effectively required |
| hybridTeaser.ctaLabel | 1/1 | false | text | effectively required |
| hybridTeaser.image | 1/1 | false | upload | effectively required |
| foodDrinkTeaser | 1/1 | false | group | effectively required |
| foodDrinkTeaser.kicker | 1/1 | false | text | effectively required |
| foodDrinkTeaser.headline | 1/1 | false | text | effectively required |
| foodDrinkTeaser.body | 1/1 | false | textarea | effectively required |
| foodDrinkTeaser.ctaLabel | 1/1 | false | text | effectively required |
| foodDrinkTeaser.image | 1/1 | false | upload | effectively required |
| facilities | 1/1 | false | array | effectively required |
| facilities[].label | 1/1 | true | text | — |
| facilities[].description | 1/1 | true | textarea | — |
| facilities[].lucideIcon | 1/1 | true | text | — |
| facilities[].id | 1/1 | false | text | schema defaultValue="[function] ()=>new ObjectId().toHexString()" |
| closingHeadline | 1/1 | false | text | effectively required |
| closingCtaLabel | 1/1 | false | text | effectively required |
| updatedAt | 1/1 | false | date | — |
| createdAt | 1/1 | false | date | — |

## Section 6 — Relationships and computed values

### 1. Relationship map

Authored in the CMS (relationship / upload). Joins: does not exist on any collection config. Direction is always from the field’s collection toward `relationTo`.

| field | target | hasMany | type |
|---|---|---|---|
| `rooms.amenities` | `tags` | true | relationship |
| `rooms.images[].image` | `media` | — | upload |
| `rooms.socialImage` | `media` | — | upload |
| `rooms.homepageTeaser.teaserImage` | `media` | — | upload |
| `rooms.homepageTeaser.featuredAmenities` | `tags` | true | relationship |
| `meeting-rooms.combinableWith` | `meeting-rooms` | true | relationship |
| `meeting-rooms.images[].image` | `media` | — | upload |
| `meeting-rooms.teaserImage` | `media` | — | upload |
| `meeting-documents.file` | `media` | — | upload |
| `meeting-inquiries.roomOfInterest` | `meeting-rooms` | — | relationship |
| `venues.venueMonogram` | `media` | — | upload |
| `venues.heroImage` | `media` | — | upload |
| `venues.images[].image` | `media` | — | upload |
| `venues.tags` | `tags` | true | relationship |
| `hero-slides.image` | `media` | — | upload |
| `hero-slides.venue` | `venues` | — | relationship |
| `faqs.relevantPages` | `pages` | true | relationship |
| `artists.portrait` | `media` | — | upload |
| `artists.tags` | `tags` | true | relationship |
| `artworks.artist` | `artists` | — | relationship |
| `artworks.images[].image` | `media` | — | upload |
| `artworks.tags` | `tags` | true | relationship |
| `exhibitions.venue` | `venues` | — | relationship |
| `exhibitions.heroImage` | `media` | — | upload |
| `exhibitions.artists` | `artists` | true | relationship |
| `exhibitions.artworks` | `artworks` | true | relationship |
| `events.venue` | `venues` | — | relationship |
| `events.heroImage` | `media` | — | upload |
| `events.tags` | `tags` | true | relationship |
| `people.portrait` | `media` | — | upload |
| `people.tags` | `tags` | true | relationship |
| `people.relatedVenue` | `venues` | — | relationship |
| `neighbourhood-places.endorsements[].person` | `people` | — | relationship |
| `neighbourhood-places.image` | `media` | — | upload |
| `places.image` | `media` | — | upload |
| `hotel.heroMapImage` | `media` | — | upload |
| `hotel.meetAndWork.slides[].image` | `media` | — | upload |
| `hotel.eatAndDrink.image` | `media` | — | upload |
| `homepage.heroSlides[].image` | `media` | — | upload |
| `navigation.secondaryLinks[].page` | `pages` | — | relationship |
| `footer.columns[].links[].internalPage` | `pages` | — | relationship |
| `footer.alreadyHereColumn.links[].internalPage` | `pages` | — | relationship |
| `footer.awards[].image` | `media` | — | upload |
| `meetings.heroSlides[].image` | `media` | — | upload |
| `meetings.eventTypes[].image` | `media` | — | upload |
| `meetings.hybridTeaser.image` | `media` | — | upload |
| `meetings.foodDrinkTeaser.image` | `media` | — | upload |

FilterOptions (authored constraints, not joins): `rooms.homepageTeaser.featuredAmenities` → tags where `type=amenity` (`src/collections/Rooms.ts:182`). Other filterOptions: see dump `filterOptions` column in Section 1.

### 2. Computed, not authored

| value | function | file |
|---|---|---|
| Berlin Ortsteil / district from PLZ | `districtFromPostalCode` | `src/lib/places/district.ts:133` |
| open / closed / kitchen-soon segments | `deriveOpenClosed` | `src/lib/venue-time/deriveOpenClosed.ts:96` |
| guest dining status chips | `deriveGuestDiningStatus` | `src/lib/venue-time/deriveOpenClosed.ts` |
| RRULE occurrence expansion for listings | `getEventOccurrences → expandOccurrencesInWindow` | `src/lib/payload/getEventOccurrences.ts:27; src/lib/venue-time/recurrence.ts` |
| event schedule copy (weekday, always-on) | `src/lib/events/schedule.ts` | `src/lib/events/schedule.ts:40` |
| current exhibition for a venue | `selectCurrentExhibition` | `src/lib/venue-time/selectCurrentExhibition.ts` |
| walkingMinutes + distanceTier (on save, not render) | `enrichNeighbourhoodPlace / mapboxWalkingMinutes` | `src/lib/geocode/index.ts:24` |
| person initials | `personInitials` | `src/lib/people/initials.ts` |
| bridge nav prompt/action split | `splitBridgeLabel` | `src/lib/nav/bridge.ts:23` |
| footer copyright year | `new Date().getFullYear()` | `src/components/layout/SiteFooter.tsx:50` |
| room price label / m² / sleeps strings | `formatRoomPrice / mapRoomToHeroItem` | `src/lib/rooms/roomHero.ts:89` |
| JSON-LD Hotel on every locale layout | `inline hotelJsonLd + buildReserveAction` | `src/app/[locale]/layout.tsx:37` |
| JSON-LD graphs (place, person, event, FAQ, room) | `aeo-schema builders / mapToSchema` | `src/lib/aeo-schema/src/builders/*; src/lib/aeo/mapToSchema.ts` |
| slugs from titles | `Payload slugField generateSlug` | `injected on collections that call slugField()` |
| Berlin 'today' for booking widget | `berlinTodayIso` | `src/lib/booking/dates.ts:19` |
| first filled borrowed row for entity pages | `takeFilledRow` | `src/lib/entity/takeFilledRow.ts` |
| HERE image candidate chain | `firstHereImage` | `src/lib/here/images.ts:43` |
| room social URL absolutising | `resolveSocialImage` | `src/app/[locale]/rooms/[slug]/page.tsx:42` |
| legal Lexical → spans | `src/lib/legal/lexical.ts` | `src/lib/legal/lexical.ts` |
| breadcrumb trails on entity pages | `page-local, not a shared helper` | `src/app/[locale]/you-me-berlin/[slug]/page.tsx; happenings/[slug]; neighbourhood/[slug]` |

walkingMinutes **is stored** on neighbourhood-places after the geocode hook; editors do not type it. District is **not** stored — derived at read time from PLZ.

### 3. Authored fields overridden at render

- rooms.homepageTeaser.teaserImage is stored but pickTeaserImage always uses images[0] (`src/lib/rooms/roomHero.ts:48`).
- PlaceCard drops any imageUrl containing picsum.photos (`src/components/neighbourhood/PlaceCard.tsx:40`).
- getHubTips / toMapPlace inject PLACE_IMAGE_FALLBACKS and HERE_IMAGES when neighbourhood-places.image is empty (`src/lib/here/getHubTips.ts`, `src/lib/map/toMapPlace.ts`).
- venueGalleryImages prepends venues.heroImage then images[] then optional eatAndDrink fallback (`src/lib/venues/mapVenueToAeo.ts:87`).
- getDiningBand uses firstHereImage(hero, gallery[0], eatAndDrink.image, HERE_IMAGES.lutzeInterior) (`src/lib/here/getDiningBand.ts:164`).
- getInHouseAmenities forces HERE_IMAGES.kttk / wallride onto those cards (`src/lib/here/getInHouseAmenities.ts:317`).
- Footer awards: if CMS awards array is empty, footerFallback local PNGs are used (`src/lib/payload/footer.ts:211`).
- Hero slides: CMS empty → Unsplash fallbackHeroSlides (`src/components/home/heroSlides.ts:12`).
- Spotlight Payload empty → Unsplash spotlightTeasers (`src/lib/data/spotlightTeasers.ts:7`).
- hotel.getDirectionsLabel / heroShortAddress empty → code defaults in HomeHero.
- homepage.roomsTeaser copy empty → component/message defaults.
- homepage.heroSlides[] is labelled legacy; live heroes read the `hero-slides` collection (`src/globals/Homepage.ts:7-31`). Dump fill `heroSlides[].image` 0/1.
- Navigation bridge labels empty → splitBridgeLabel fallbacks (`src/lib/nav/bridge.ts:8`).
- people.roomNumber is hidden in hub tips unless roomConfirmed.

## Section 7 — Opinions

*This is the only judgement section.*

- Two place collections (`places` and `neighbourhood-places`) overlap; the live map/tips UI reads neighbourhood-places. `places.image` 0/14.
- `rooms.homepageTeaser.teaserImage` is filled for every room and explicitly unused — a content trap if the hotel is asked to pick teaser crops.
- Venue photos are empty (0/5 hero + gallery) while the dining band already looks finished via `hotel.eatAndDrink.image` / HERE_IMAGES. Asking for venue photography is real; the page will not look empty without it.
- `neighbourhood-places.image` 0/21. Every map/tip photo is a Wikimedia/Unsplash stand-in or a grey name-block. This is the largest hotel-photo hole.
- `people.bio` 0/16 and `people.portrait` 5/16. Entity pages fall back to initials / skip the letter band. `shortBio` 2/16.
- Media `alt` is required but not localized — German UI gets English (or whatever was typed) alts. Meeting-room gallery alts are DE-only (21 en empty).
- No `imageSizes`. Upload dimensions are whatever arrived; UI slots range from 32px monograms to unbounded full-bleed heroes. The photo spec cannot be a single number.
- Unmounted image components (`HeroSection`, `RoomSlider`, `MapTeaser`, `CultureSection`, `HerePeopleSection`, `TonightHeroCard`, `BasementSection`, `ArtInBuildingSection`) still contain Unsplash/HERE stand-ins. They are not live, but they are easy to re-mount accidentally.
- `hotel.description` and `hotel.shortDescription` are empty; layout JSON-LD still emits a Hotel node from other fields (`src/app/[locale]/layout.tsx:37`).
- `shortDescriptionDE` on `places` is a leftover parallel field next to localized `shortDescription` — name no longer matches the localisation model.
- Artworks collection is empty (0 records) while `/here` art wall captions still want `locationInBuilding`.
- `legal-documents` are seeded JSON, not hotel-typed; treat fill rate 5/5 as seed, not sign-off.

