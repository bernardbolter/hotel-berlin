# Hero manager: two guided sections, sortable strip, one AI prompt

*For Cursor · 30 September 2026*
*Builds on the Step 0 audit of 30 September. Follows the pattern of `doc/art/HotelBerlin_GuidedEntry_OnePage_Addendum.md` (art entry). Extends `HotelBerlin_AdminAssistant_Plan_v2.md` layer 1. **No model calls from the server.** The AI step is copy prompt / paste reply, as for art.*

---

## 0. Decisions already made

| # | Decision |
|---|---|
| D1 | **Two separate admin sections**, same pattern and same code: *Hero Startseite* (`context = homepage`) and *Hero Hier* (`context = here`). Not tabs on one page. |
| D2 | **Ordering:** custom sortable strip (dnd-kit), order numbers **rewritten automatically**, so there are never gaps or duplicates. Not Payload `orderable`. |
| D3 | **Completeness.** Blocking: photo, alt DE, alt EN. Warnings: caption (venue or override), credit, description, keywords. |
| D4 | **Frontend gaps from the audit are fixed in this same brief:** locale-correct alt, focal point as `object-position`, credit rendered, `ImageObject` JSON-LD. |
| D5 | Admin language is **German**, like `/admin/neues-werk`. |
| D6 | Meetings `heroSlides` are **out of scope**. The copy-to-other-context button is **out of scope**. |

---

## 1. Schema changes to `hero-slides`

Keep every existing field. Keep the slug `hero-slides` (the V2 brief said `heroSlides`; the code wins). Add:

| Field | Type | Localized | Notes |
|---|---|---|---|
| `description` | textarea, max 300 | yes | Longer, factual description of the image. Feeds `ImageObject.description`. Not shown on the page. |
| `keywords` | text | yes | Comma-separated terms. Feeds `ImageObject.keywords`. |
| `aiNotes` | textarea | no | Optional. The raw `hinweise` from the AI reply (e.g. "Person erkennbar – Einwilligung?"), so the editor sees them on later edits. Admin-only. |

Do **not** add a focal-point field to the slide. The focal point stays on `media` (`focalX`, `focalY`). The hero manager edits it there.

### Alt text: one source of truth

`hero-slides.altText` stays authoritative for the hero. The guided flow writes the same two strings to `media.alt` (max 120) as well, so the media library is never worse than the slide. `altText` gets `maxLength: 120` to match.

### Hooks (new, there are none today)

- `beforeChange`: if `enabled` is being set to `true` and `checkCompleteness('hero-slides', doc)` has any **blocking** issue, throw a German error naming what is missing. Disabled slides can be saved incomplete.
- `afterChange` and `afterDelete`: revalidate the pages that read the collection. Use the same mechanism `globalCacheHooks('homepage')` uses (tag or path). Homepage context → `/` and `/de`; here context → `/here` and `/de/hier`. **Report back which one you used.**

---

## 2. Completeness

New `src/lib/completeness/heroSlides.ts`, added to the dispatcher in `completeness/index.ts` as `'hero-slides'`. Same issue shape as `artworks.ts`.

| Level | Rule | German message |
|---|---|---|
| blocking | no image | Foto fehlt |
| blocking | `altText` DE empty | Alt-Text Deutsch fehlt |
| blocking | `altText` EN empty | Alt-Text Englisch fehlt |
| warning | neither `venue` nor `captionOverride` | Keine Bildunterschrift (Ort oder eigener Text) |
| warning | `credit` empty | Bildnachweis fehlt |
| warning | `description` DE or EN empty | Beschreibung fehlt |
| warning | `keywords` DE or EN empty | Stichworte fehlen |

Wire `CompletenessPanel` into the collection's ordinary edit view too (UI field in the sidebar, as on artworks).

---

## 3. The two admin views

### Registration

In `payload.config.ts`, next to `neuesWerk` and `standorte`:

- `views.heroStartseite` → path `/hero-startseite`, `HeroManagerView` with `context="homepage"`
- `views.heroHier` → path `/hero-hier`, `HeroManagerView` with `context="here"`
- Two buttons in `beforeDashboard`: *Hero Startseite* and *Hero Hier*, each with a small count ("4 live · 1 pausiert")
- Add both to the admin nav. A button on the `hero-slides` list view links to both.

`HeroManagerView` is a server shell (`DefaultTemplate`, as `NeuesWerkView`). `HeroManagerClient` is the client UI. Both take `context` as a prop, so there is exactly one implementation. **Lift the sticky bar, section chrome and `HelpMore` usage out of `NeuesWerkClient` into shared components** (`GuidedSection`, `StickyMissingBar`) rather than copying them, and change `NeuesWerkClient` to use them. Do not change its behaviour. This is the "second one is needed" moment the original brief mentioned.

### Layout

```
┌ Hero Startseite ─────────────────────────────────────────┐
│  4 Fotos live · 1 pausiert            [ + Neues Foto ]    │
├ Reihenfolge ─────────────────────────────────────────────┤
│  ⠿ [img]  ⠿ [img]  ⠿ [img]  ⠿ [img]  ⠿ [img, grau]      │  ← drag to reorder
│   1        2        3        4        pausiert            │
│  caption  caption  caption  caption                       │
│  ⚠ Credit ⚠ Credit   ✓       ⚠ Stichw.  ✕ Alt EN         │
│  [live ⏽] [live ⏽]  [live ⏽]  [live ⏽]   [pausiert ⏽]    │
├ Vorschau ────────────────────────────────────────────────┤
│  desktop crop  |  mobile crop   (uses focal point)        │
├ Foto bearbeiten / Neues Foto ────────────────────────────┤
│  (the one-page form, §4, opens here when a card is chosen │
│   or + Neues Foto is pressed)                             │
└───────────────────────────────────────────────────────────┘
```

### The strip

- Cards show the `hero`-size thumbnail (or `card`), the derived caption, the order number, the completeness flags (✓ / ⚠ / ✕ with the German message on hover and focus), and an **enabled toggle**. Pausing never deletes.
- **dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`). Add to `package.json`. Keyboard sorting must work (the sensors' keyboard coordinates getter) with an `aria-live` announcement on each move, in German ("Foto 3 an Position 1"). This is an admin tool for a hotel team; it must be operable without a mouse.
- Disabled slides sit at the end of the strip, greyed, and are not draggable among the live ones. Re-enabling puts them last.
- **On drop:** optimistic reorder in the UI, then one call to a custom endpoint `POST /api/hero-slides/reorder` with `{ context, ids: [...] }`. The endpoint:
  1. requires a logged-in staff user (`payload.auth`)
  2. loads all `enabled` slides of that context and verifies the id set matches exactly
  3. writes `order = 1…n` in one transaction
  4. triggers the same revalidation as §1
  5. returns the new order. On failure the UI rolls back and shows *Reihenfolge konnte nicht gespeichert werden.*
- A one-time **normalise** (run when the view loads, or a small script): if a context has duplicate or missing order values, renumber in current `(order, createdAt)` order.
- Empty state, `homepage`: *Noch keine Fotos. Ohne Fotos zeigt die Startseite eine graue Fläche.*
- Empty state, `here`: *Noch keine eigenen Fotos. Die Gästeseite zeigt dann die Fotos der Startseite.* (This matches the fallback in `HereHero.tsx:71–72`. Do not change that behaviour, only say it.)

### The preview

Show the selected slide cropped at a desktop ratio and a mobile ratio, with the same object-fit and **focal point** the frontend will use (§6), and the caption overlay position. The focal-point picker lives here: click or drag on the image, writes `focalX` and `focalY` to the `media` record. Default is centre.

---

## 4. The form (same one page, same gating as art)

One scrolling form, `<section>` with real headings. Photo first; everything else is visible but dimmed with *Zuerst ein Foto.* until a photo exists.

```
┌ Das Foto ─────────────────────────────────┐  drop zone / camera / pick
│  preview at hero size · focal point        │  reuse the art upload + photoHelp strings
├ Alles auf einmal ─────────────────────────┤
│  [ Prompt kopieren ]  [ Antwort einfügen ] │  §5
├ Text ─────────────────────────────────────┤
│  Alt DE* · Alt EN*                         │  max 120, live character counter
│  Beschreibung DE · EN                      │
│  Stichworte DE · EN                        │
├ Ort und Bildunterschrift ─────────────────┤
│  Ort (venues combo)                        │  caption preview: "LÜTZE · GROUND FLOOR"
│  Eigene Bildunterschrift DE · EN (optional)│  "Nur nötig, wenn kein Ort passt."
├ Rechte ───────────────────────────────────┤
│  Bildnachweis                              │
└────────────────────────────────────────────┘
   Fehlt noch: …          [ Speichern ]  [ Speichern & live schalten ]
```

- Saving with blocking issues is allowed (as a paused slide). *Live schalten* is disabled until nothing blocking is missing, and the sticky bar names what is.
- New slides are created paused, appended at the end of the order. *Speichern & live schalten* also sets `enabled = true`.
- Help strings: reuse `photoHelp.ts` for the photo. **Hero-specific photo help (new)**, in DE with EN as the switch value: landscape, the important thing kept in the middle third because mobile crops hard, no flash, no text already in the image, no recognisable people, minimum width 2880 px ideally, original not resized. Keep it short; put the rest behind `HelpMore`.
- Client talks to the REST API with credentials, as `NeuesWerkClient` does. No server actions.
- Uploading creates the `media` record immediately, as art does. Abandoned uploads leave an orphan media record, which is the accepted behaviour from the art flow.

---

## 5. The prompt and the reply

New `src/lib/hero/combinedAiReply.ts`, mirroring `src/lib/art/combinedAiReply.ts`: `heroAiPrompt({ context, venues })` and `parseHeroAiReply(text)`.

**There is only `gesehen`. There is no `recherchiert`**: nothing here needs the web. One exception handled in the prompt: matching the photo to a venue is done against a list the prompt carries, not researched.

### Prompt (DE)

The prompt is interpolated with (a) the page the image is for and (b) the current list of venue names from the `venues` collection, so the model picks from real options.

```
Ich pflege die Website von Hotel Berlin, Berlin. Im Anhang ist ein Foto für
das große Titelbild der {Startseite | Gästeseite}. Es läuft dort im Wechsel
mit anderen Fotos und wird auf dem Handy stark zugeschnitten.

Antworte nur aus dem, was im Foto zu sehen ist. Erfinde nichts. Was du nicht
sicher erkennst, bekommt den Wert null.

Orte im Haus, aus denen du wählen darfst:
{Liste der Venue-Namen, ein Name pro Zeile}

Gib ausschließlich dieses JSON zurück, ohne Text davor oder danach:

{
  "gesehen": {
    "altDe": "ein Satz, höchstens 120 Zeichen, beginnt mit dem Motiv, keine Wertung",
    "altEn": "derselbe Satz auf Englisch",
    "beschreibungDe": "ein bis zwei Sätze, höchstens 300 Zeichen: was ist zu sehen, Licht, Tageszeit, Stimmung nur wenn sichtbar",
    "beschreibungEn": "dasselbe auf Englisch",
    "stichworteDe": ["5 bis 10 Begriffe, die ein Gast suchen würde"],
    "stichworteEn": ["dieselben Begriffe auf Englisch"],
    "ortVorschlag": "genau einer der Namen oben, oder null",
    "tageszeit": "morgens | tagsüber | abends | nachts | null",
    "sichtbarerText": "Schrift im Bild, wortgetreu, oder null",
    "fokuspunkt": { "x": 0-100, "y": 0-100 }
  },
  "hinweise": ["z. B. Person erkennbar – Einwilligung?", "Logo oder Marke sichtbar"]
}

Regeln: Alt-Text nie mit "Bild von" oder "Foto von" beginnen. Fokuspunkt =
die Stelle, die nach dem Zuschneiden auf keinen Fall fehlen darf, in Prozent
von links und von oben. Wenn eine Person erkennbar ist, schreibe das in
"hinweise".
```

### Parsing

- Strip a markdown fence, `JSON.parse`, then zod-validate (`heroAiReplySchema`). Import `zod` as art does, **and add `zod` as a direct dependency** (the audit found it only arrives transitively).
- Lengths enforced: altDe/altEn ≤ 120 (truncate with a visible warning, never silently), beschreibung ≤ 300, stichworte 3–12 items.
- `ortVorschlag` is matched to a venue by exact, case-insensitive name; no match → leave unset and say so.
- Invalid → fill nothing, show *Die Antwort konnte nicht gelesen werden.*, as art does.
- **Nothing is overwritten silently.** If a field already has text, the apply step shows old and new side by side with a checkbox per field, unchecked by default for fields that already have content. Fields that are empty fill directly.
- `fokuspunkt` is shown as a proposal on the picker (a hollow marker); the editor confirms or moves it.
- `hinweise` are shown in an amber box above the form and stored in `aiNotes`.
- `tageszeit` and `sichtbarerText` are **not stored**; `sichtbarerText` is offered as a suggestion to append to the description if it is short. Leave `tageszeit` out of the schema for now. (The model returns it; the parser ignores it. Note this in a comment so it isn't "fixed" later.)

### Privacy line

Same copy as the art flow: no photographs with recognisable people, and free AI services may use uploads for training.

---

## 6. Frontend fixes (D4)

All in the existing hero path. No visual redesign.

1. **Locale-correct alt.** `homepage.ts:46` currently maps EN only, although both locales are fetched. Map per locale so the `<img alt>` (and the sr-only figcaption) follows the active language.
2. **Focal point.** Pass `focalX`/`focalY` from the populated media through `mapCollectionSlide`, and set `object-position: {x}% {y}%` on the `<img>` in `HeroPhotoSlider.tsx:101`. Reuse the helper from `src/lib/art/floors.ts:92–95`; if it is art-specific, extract a shared `focalToObjectPosition(media)` and use it from both. Default is centre when unset.
3. **Credit.** Add `credit` to the rendered output in the sr-only figcaption. **No new visible overlay** (see open item O2).
4. **ImageObject JSON-LD.** Add a hero builder in `aeo-schema` next to the artwork one, emitted on the homepage and on `/here`. For each **enabled** slide of the page's context:
   - `@type: ImageObject`, `contentUrl` (hero size URL, absolute), `url`, `name` (the derived caption or alt), `description` (slide `description`, falling back to `altText`), `keywords`, `creditText` (credit), `inLanguage` (active locale)
   - `contentLocation` → `{ "@id": <the venue's Place @id> }` when a venue is set, so the venue's structured data and `sameAs` flow through, as the V2 brief intended
   - `representativeOfPage: true` on the first slide only
   - Attach as `image` entries on the page's `WebPage` node rather than as loose top-level nodes. Follow whatever the existing builders for artworks/rooms do; report the choice.
   - Omit empty properties rather than emitting empty strings.

---

## 7. Files

| New / changed | Path |
|---|---|
| change | `src/collections/HeroSlides.ts` (fields, hooks, completeness UI field) |
| new | `src/lib/completeness/heroSlides.ts`; change `completeness/index.ts` |
| new | `src/lib/hero/combinedAiReply.ts`, `src/lib/hero/copy.ts` (German strings) |
| new | `src/components/admin/HeroManagerView.tsx`, `HeroManagerClient.tsx`, `HeroStrip.tsx` |
| new (extracted) | `src/components/admin/guided/GuidedSection.tsx`, `StickyMissingBar.tsx`; change `NeuesWerkClient.tsx` to use them |
| new | `src/endpoints/heroSlidesReorder.ts` (registered on the collection) |
| change | `src/payload.config.ts` (two views, dashboard buttons, nav) |
| change | `src/app/(payload)/admin/importMap.js` (regenerate) |
| change | `src/lib/payload/homepage.ts`, `HeroPhotoSlider.tsx`, hero layouts (§6) |
| change | `aeo-schema` (hero builder) and the homepage + `/here` page metadata |
| change | `package.json` (`@dnd-kit/core`, `@dnd-kit/sortable`, `zod`) |

No migration of live data: the collection is empty. Schema additions are additive; generate and run the Payload migration as usual and report the file name.

---

## 8. Open items (flagged, not silently decided)

| # | Item | Default used in this brief |
|---|---|---|
| O1 | Caption source of truth | Keep "venue derives the caption, `captionOverride` wins". The AI suggests a **venue**, never caption text. |
| O2 | Credit visible on the page? | Screen-reader caption and JSON-LD only. No visible overlay until a design exists for it. |
| O3 | Seed | Do **not** restore `seed:hero-images`. Real photography goes in through the new flow. |
| O4 | `kbOrigin` / Ken Burns | Stays out. The live hero uses the hover zoom. Do not reintroduce `kbOrigin` on the collection. |
| O5 | `hereHero` global | Still spec-only. Nothing here depends on it. Greetings stay in next-intl. |
| O6 | Legacy `homepage.heroSlides` array and `fallbackHeroSlides` | Leave as they are. Do not remove in this pass. |

If anything in the audit's conflict list turns out to be wrong once you are in the code, stop and report it instead of resolving it.

---

## 9. Definition of done

- [ ] `hero-slides` has `description`, `keywords`, `aiNotes`; `altText` capped at 120; migration generated and applied locally
- [ ] Enabling an incomplete slide is refused with a German message; saving it paused works
- [ ] `/admin/hero-startseite` and `/admin/hero-hier` both load, list only their own context, and appear on the dashboard and in the nav
- [ ] Dragging reorders in the strip with mouse, touch **and keyboard**; reload shows the same order; `order` values are exactly 1…n with no gaps or duplicates
- [ ] A failed reorder rolls back visibly
- [ ] Uploading a photo creates the media record; the form is dimmed until then
- [ ] *Prompt kopieren* includes the live venue list; a valid reply fills empty fields, asks before overwriting filled ones, and proposes venue and focal point; an invalid reply fills nothing
- [ ] `hinweise` appear in the amber box and are stored in `aiNotes`
- [ ] Sticky bar names what is missing, in page order
- [ ] Preview shows desktop and mobile crops with the focal point; moving the point changes the preview and is saved on `media`
- [ ] Public pages: `alt` follows the locale; `object-position` follows the focal point; the credit is in the figcaption; `ImageObject` validates in the Rich Results / schema validator for one slide with and one without a venue
- [ ] A change to a slide is visible on the live page without a redeploy (revalidation works for both contexts)
- [ ] `NeuesWerk` behaves exactly as before after the extraction of the shared chrome
- [ ] `tsc`, lint and the existing tests pass; report what was added
- [ ] Report: which revalidation mechanism was used, where the `ImageObject` nodes attach, and any deviation from this brief
