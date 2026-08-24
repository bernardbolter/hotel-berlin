# Hotel Berlin, Berlin — Publishing a place or a person
*For the hotel team. How this actually works in Payload today, not a redesign of the admin. Written 2026-08-24 against the live `hotel-berlin-de` schema.*

This is the public neighbourhood / You, Me & Berlin pipeline. It is not the rooms or venues flow.

---

## A new place (a destination on `/nachbarschaft`)

1. In Payload, open **Neighbourhood → Neighbourhood Places** and create a document.
2. **Required to save:** name, slug, category, schema type, city (Berlin is the default), status.
3. **Required to show on the map:** latitude and longitude. The grid on `/nachbarschaft` will still list a place without coordinates; the map will skip it.
4. **Recommended so the card looks finished:** short description, walking time, a photo, and at least one endorsement (a person + a quote). None of those are required. A place with zero recommenders is allowed — it just has no “recommended by” chips.
5. Set **status = Active** to go live. Inactive places 404 on their public URL and drop out of the listing.
6. Optional: tick **Homepage teaser → enabled** and set an order (1–5) to feature it on the homepage map. Same idea for **/here teaser** — a different five, independently.

**Coordinates.** You can type lat/long by hand. If you leave them blank and save, the site *tries* to fill them in from the name + street address (OpenStreetMap), and may also fill walking minutes from the hotel. That step fails quietly — the save still succeeds — so a miss means no pin until someone puts numbers in. Transit (which U-Bahn, how many minutes) is **always** typed by hand. There is no automatic transit lookup.

**Category → schema type.** The JSON-LD type (Museum, Restaurant, Park, …) is a separate field from the public category chip. Don’t guess — match the mapping table the content team already uses, or ask whoever seeded the first batch.

**Photos.** If the photo isn’t hotel photography, fill in **image credit** (text + link + licence). Creative Commons images need a visible credit.

**What you cannot do without a developer:** nothing day-to-day, unless geocoding fails and nobody on the team is comfortable pasting coordinates from a map, or you need a new category value added to the list.

---

## A new person (a profile on `/you-me-and-berlin`)

1. In Payload, open **Neighbourhood → People** and create a document.
2. **Required to save:** name, type (artist / curator / host / partner / staff / local), status (defaults to Draft).
3. Fill in whatever you have: job title, neighbourhood (`basedIn`), portrait, short bio, the full letter (`bio`), a pull quote, video URL, room number. Leave blanks blank — the public page hides empty sections. Do not invent a bio or quote to make the page look full.
4. Set **status = Published** to appear in the public listing. Draft profiles are hidden from the listing; a direct URL may still open for preview (with `noindex`). Publishing is the hotel-team step, not a code step.
5. **Picks** (the places they recommend) are **not typed on the person.** Add this person as an endorser on a place — person + quote on that place’s Endorsements list. The profile’s picks list fills in automatically. A person with zero endorsements is a valid empty profile: no map pins, and the page says recommendations are coming soon.

**Portrait.** If there isn’t one, the site shows initials on a dark ink circle. Never upload a stock headshot as a stand-in.

---

## Featuring something on a map teaser

Homepage and `/here` each show **five** places, picked with the teaser checkboxes on the place record — not “the first five in the database.” They can overlap. Order is the number field next to the checkbox.

---

## Checklist before you hit publish

**Place:** name, category, schema type, address, coordinates (or a successful auto-geocode), status Active. Photo + description + at least one real endorsement if you want the card to feel finished.

**Person:** name, type, status Published. Portrait and letter whenever they exist; otherwise leave empty. Then go to each place they recommend and add them as an endorser with their real quote — not `[TBC]`.
