# Hotel Berlin, Berlin — Content Schema & Image Spec Extraction

*For Cursor · 16 September 2026*
*Report only. Nothing in the repo changes except the two output files.*
*Feeds: the content requirements reference the hotel team will fill content against.*

---

## What this is for, so you can judge edge cases

We are writing the document the hotel gets handed: *"here is every piece of content and every photo we need from you, per thing."* This pass gathers the raw material. **It does not decide what is required** — a field being `required: false` in Payload says nothing about whether a page looks finished without it. That judgement happens after, against the page designs. Your job is to report what exists, at what size it renders, and how much of it is actually filled in today.

Three sources, not one. The fields are in the collections. **The photo dimensions are not in the backend at all** — they come from the Media config, the `next/image` calls and the CSS aspect ratios in the components. Section 3 is the one that takes real work; do not skip it or answer it from the collection configs.

---

## Rules

```
Audit and report. CHANGE NOTHING except the two output files named at the end.

Every answer carries file:line. Where something does not exist, write "does
not exist" — do not describe what could be added.

Do not judge whether a field should be required, should be renamed, or is
well designed. Report it. Opinions go in one clearly marked section at the
very end and nowhere else.

Where a field is defined but nothing reads it, say so — that is a finding.
Where a component renders an image from a source that is not a collection
field (hardcoded import, Unsplash URL, local file), say so — that is also
a finding.
```

---

## Section 1 — Every field, every collection and global

For **all 18 collections and 5 globals**. One table per collection, with a row per field including nested fields inside groups, arrays, tabs and blocks. Use dotted paths for nesting (`address.postalCode`, `endorsements[].person`).

| Column | Meaning |
|---|---|
| `path` | dotted field path |
| `type` | Payload field type |
| `required` | true / false, as declared |
| `localized` | true / false |
| `unique` | true / false |
| `default` | the `defaultValue`, verbatim, or — |
| `options` | for select/radio: every option value, verbatim |
| `relationTo` | for relationship/upload/join fields |
| `hasMany` | true / false |
| `admin.description` | the editor-facing help text, verbatim, or — |
| `condition` | any `admin.condition`, described in one clause |
| `validate` | any custom validate function, described in one clause |
| `hooks` | any field-level hook, named |
| `access` | any field-level access control |

Collections: `users`, `media`, `tags`, `rooms`, `meeting-rooms`, `meeting-documents`, `meeting-inquiries`, `venues`, `hero-slides`, `faqs`, `artists`, `artworks`, `exhibitions`, `events`, `people`, `neighbourhood-places`, `places`, `pages`, `legal-documents`.

Globals: `hotel`, `homepage`, `navigation`, `footer`, `meetings`.

Note per collection whether `versions` / `drafts` is enabled, and whether a `status`-style select exists instead (name it and list its options).

---

## Section 2 — Media configuration

This is where the answerable half of "what size should the photos be" lives.

1. Paste `src/collections/Media.ts` in full.
2. **`imageSizes`** — every generated size: name, width, height, `position`, `fit`, `withoutEnlargement`, and the output format/quality. If `imageSizes` is not configured, say so plainly — it means every image is served at whatever resolution was uploaded.
3. **`focalPoint`** — enabled or not. **`crop`** — enabled or not.
4. **`mimeTypes`** — what uploads are accepted. Any file-size limit.
5. Is `alt` `required: true`? Is it localized? Does anything enforce a non-empty value at save, or only at type level?
6. **Storage adapter** — local disk, S3, Vercel Blob, other? Paste the config. Where does `/api/media/file/…` resolve from? *(Context: the 16 Sept audit found mass 404s on that path against 346 media rows. Report what the config says; do not fix it.)*
7. `next.config.ts` — `images.remotePatterns` / `domains`, `formats`, `deviceSizes`, `imageSizes`, and whether `unoptimized` is set anywhere.
8. How many of the 346 media records have a non-empty `alt`? How many have `alt` in both locales, if localized?

---

## Section 3 — Every image slot in the UI

**The important section.** One row per place an image is rendered anywhere on the site. Walk the components; do not infer this from the collections.

| Column | Meaning |
|---|---|
| `slot` | a name you give it, e.g. "event card — hub strip" |
| `component` | file:line of the `<Image>` / `<img>` |
| `source` | which collection.field feeds it — or `hardcoded` / `external URL` / `local import` |
| `fill or fixed` | `fill` + a sized parent, or explicit `width`/`height` |
| `width × height` | the explicit props, if fixed |
| `aspect-ratio` | the CSS `aspect-ratio` or equivalent on the container, e.g. `5/6` |
| `rendered width` | the CSS width the container actually resolves to, at each breakpoint you can determine — e.g. "mobile 100vw, ≥768 50vw, ≥1100 301px" |
| `sizes` | the `next/image` `sizes` attribute, verbatim, or "not set" |
| `priority` | true / false |
| `object-fit` | cover / contain / other |
| `placeholder` | blur / empty / none, and whether a `blurDataURL` is generated |
| `fallback` | what renders when the source is null — name the file:line |

Cover at minimum: homepage hero slider, `/here` hero, room index cards, room detail gallery, meeting room cards and galleries, event/spotlight cards, tip cards, person portraits (card size *and* any large size), amenity cards, art wall tiles, venue images, map pin avatars, awards carousel, footer imagery, OG/social images.

**Then, for each slot, state the largest CSS width it ever renders at.** That number × 2 is the minimum sensible upload width, and it is what the whole photo-dimensions question resolves to. Report the number; do not round it into a recommendation.

Also list every image the site renders that does **not** come from Payload — `HERE_IMAGES`, `teaserImageFallbacks.ts`, any Unsplash or Wikimedia URL, any `/public` file — with the component that uses it. These are the slots where a hotel-supplied photo currently has nowhere to go.

---

## Section 4 — Localisation matrix

Per collection: which fields are localized, and for each, how many records have a **German** value that differs from the English one.

Three buckets, with counts: `de === en` (suspicious — likely untranslated), `de` empty (falls back to English at render), `de` genuinely different.

List by name every field where more than half the records fall in the first two buckets. *(Context: the audit found 849/849 message-key parity alongside visible English on `/de`, because the English lives in the German values, not in missing keys. This section is how we find the rest of it.)*

---

## Section 5 — Fill rate

For every field in Section 1, against the dev database: **how many records have a non-empty value.** Express as `n/total`.

This is the section that tells us which optional fields are real and which are aspirational. Flag separately:

- fields at `0/total` — defined, never used
- fields at `total/total` that are `required: false` — effectively required in practice
- fields where the only values are the seed defaults (name the default)
- `required: true` fields holding placeholder-looking values (`"TBD"`, `"Lorem"`, `"double"`, an empty string that slipped past)

---

## Section 6 — Relationships and computed values

1. **Relationship map.** Every relationship, upload and join field, as `collection.field → target (hasMany?)`. Note which direction is authored and which is derived.
2. **What is computed, not authored** — every value the site derives at render or build time rather than reading from a field: walking times, open/closed status, next occurrence from an RRULE, breadcrumbs, JSON-LD, slugs, districts, anything from `venue-time`. Name the function. *(We must not ask the hotel for things the site works out itself — that creates busywork and a stale-data liability.)*
3. **Fields that look authored but are overridden at render** — anything a component ignores or replaces with a fallback.

---

## Section 7 — Opinions

One section, at the end, clearly marked. Anything you noticed that we would want to know: duplicated fields across collections, a field whose name no longer matches its use, a type that will not survive real content, a missing field the components clearly want. Keep it short and do not mix it into the tables above.

---

## Output

Two files, both new:

1. **`docs/content/schema-inventory.md`** — everything above, in the section order given, human-readable.
2. **`docs/content/schema-inventory.json`** — the same data, machine-readable, so the content requirements document can be generated from it rather than retyped. Shape:

```jsonc
{
  "generatedAt": "2026-09-16",
  "collections": [
    {
      "slug": "events",
      "file": "src/collections/Events.ts",
      "drafts": false,
      "statusField": { "path": "status", "options": ["scheduled", "cancelled"] },
      "recordCount": 4,
      "fields": [
        {
          "path": "name",
          "type": "text",
          "required": true,
          "localized": true,
          "unique": false,
          "default": null,
          "options": null,
          "relationTo": null,
          "hasMany": false,
          "description": "…",
          "fillRate": { "filled": 4, "total": 4 },
          "localeBuckets": { "same": 1, "deEmpty": 0, "different": 3 }
        }
      ]
    }
  ],
  "globals": [ /* same shape, recordCount omitted */ ],
  "imageSlots": [
    {
      "slot": "event card — hub strip",
      "component": "src/components/cards/SpotlightCard.tsx:41",
      "source": "events.heroImage",
      "mode": "fill",
      "aspectRatio": "5/6",
      "renderedWidths": { "mobile": "100vw", "md": "50vw", "xl": "301px" },
      "maxRenderedPx": 649,
      "sizes": "(max-width: 768px) 100vw, 301px",
      "priority": false,
      "objectFit": "cover",
      "fallback": "neutral block — TipCard.tsx:88"
    }
  ],
  "mediaConfig": { "imageSizes": [], "focalPoint": false, "altRequired": true },
  "computed": [ { "value": "walking minutes", "function": "…", "file": "…" } ]
}
```

Where a value cannot be determined, use `null` and say why in the markdown — do not guess a number into the JSON.
