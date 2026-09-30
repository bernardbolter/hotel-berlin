# Guided entry, step 2: places outside, and the artist's identity

*For Cursor · 1 October 2026*
*Amends `claude/HotelBerlin_GuidedEntry_BuildBrief.md` step 2 and the artwork schema. Related: `claude/HotelBerlin_ArtProgramme_Step0_Rulings_And_Build.md` R5.*

---

## A. The work isn't always in the building

`floor` currently offers Lobby, 1–10 and Keller. Murals on the outside of the building, by the car park, in the courtyard and on the Wallride have nowhere to go.

**Rename the concept** from *floor* to *place in the building* (`locationInBuilding.level`, keep the column, widen the enum):

| Value | DE label | EN label |
|---|---|---|
| `outside` | Außen | Outside |
| `basement` | Keller | Basement |
| `lobby` | Lobby | Lobby |
| `1` … `10` | 1. Etage … 10. Etage | Floor 1 … Floor 10 |

`outside` sorts **below** Keller everywhere, because the locator strip reads bottom-up.

**Knock-ons, all of which have to move together:**

- **Filter chips** on `/hier/art`: `Alle {n}` · **`Außen`** · `Lobby` · `1.–4. Etage` · `5.–10. Etage` · `Keller`.
- **The floor-variety rule** in the hub mosaic treats `outside` as its own group.
- **The floor locator** on the work page gains a bar under Keller, set apart by a small gap and labelled `Außen`. Outside is not floor zero.
- **„Mehr auf der {n}. Etage"** becomes **„Mehr draußen am Haus"** for outdoor works.
- The `spot` help text for outdoor works: *Wo genau? „Fassade zur Straße", „beim Parkplatz", „Hof, linke Wand".*

### Optional: coordinates for outdoor works

An outdoor mural can carry its own `geo` (a point field, shown **only** when the level is `outside`). It costs nothing to fill by dragging a pin, and it earns real AEO: the work becomes a thing at a location rather than a picture inside a hotel page, which is what "street art near Lützowplatz" queries match on. When `geo` is set, the JSON-LD adds a `Place` with those coordinates as `contentLocation` instead of the hotel's.

Not required. Never guessed.

---

## B. The artist panel in step 2

Today step 2 offers a name and „Create «deerBLN»". A name alone gives the AEO layer nothing to work with: the artist is the entity that connects this hotel's wall to the rest of that artist's work on the web, and `sameAs` is the whole of that connection.

When a **new** artist is created inline, or when an existing one is selected who is missing fields, show a compact panel under the picker:

```
Künstler:in · deerBLN                                    [ Daten ergänzen ▾ ]

Instagram        ○ fehlt
Website          ○ fehlt
Wikidata         ○ fehlt
Bürgerlicher Name  ○ fehlt        (optional — nur wenn öffentlich bekannt)
Kommt aus        ○ fehlt
Arbeitet in      ○ fehlt
Technik          ○ fehlt
Ein Satz         ○ fehlt
```

Nothing here blocks saving. A work publishes with a bare artist name.

### B.1 The copyable prompt, with the name already in it

Under `Daten ergänzen`, the same pattern as the alt-text prompt: an explanation, a box, a copy button. **The artist's name is interpolated into the prompt**, so copying is one click and pasting is one paste.

**Explanation (DE)**

> Du kannst die Angaben von einem KI-Chat suchen lassen. Text kopieren, in den Chat einfügen, die Antwort zurückkopieren. **Bitte jede Angabe über den Link prüfen** – KI-Antworten erfinden Profile und Wikidata-Nummern, die es nicht gibt. Was sich nicht prüfen lässt, bleibt leer. Das ist völlig in Ordnung: Die meisten Street-Art-Künstler:innen haben keinen Wikidata-Eintrag.

**The prompt**

```
Suche öffentlich verfügbare Angaben zu der Künstlerin oder dem Künstler
„{{name}}" (Street-Art / Kunst, Berlin).

Sehr wichtig:
- Gib nur an, was du auf einer öffentlichen Quelle tatsächlich findest.
- Zu jeder Angabe gehört die URL, auf der sie steht.
- Was du nicht findest, gibst du als null zurück. Rate nicht.
- Erfinde keine Wikidata-ID. Wenn es keinen Eintrag gibt: null.
- Bei gleichem Namen für mehrere Personen: lieber null als die falsche.

Gib ausschließlich dieses JSON zurück, ohne weiteren Text:

{
  "name": "{{name}}",
  "instagram":   { "value": null, "source": null },
  "website":     { "value": null, "source": null },
  "wikidataId":  { "value": null, "source": null },
  "realName":    { "value": null, "source": null },
  "nationality": { "value": null, "source": null },
  "basedIn":     { "value": null, "source": null },
  "medium":      { "value": null, "source": null },
  "shortBio":    { "de": null, "en": null, "source": null }
}

"shortBio": ein Satz, höchstens 140 Zeichen, nur Fakten
(was sie machen, seit wann, wo), keine Wertung.
```

### B.2 Pasting the answer back

A textarea: *Antwort hier einfügen*. On paste:

- Parse and validate against a zod schema. Anything malformed: a friendly message, nothing filled in. Tolerate the model wrapping the JSON in a code fence.
- Render **one row per field**: the proposed value, the source as a clickable link that opens in a new tab, and a checkbox.
- **Defaults:** ordinary fields (nationality, basedIn, medium, shortBio) are checked. **`wikidataId`, `instagram`, `website` and `realName` start unchecked and cannot be checked until their source link has been opened.** These four are identity claims, and the click is the verification step.
- A field with a `value` but no `source` is shown greyed with *ohne Quelle* and cannot be accepted.
- `Übernehmen` writes the checked fields into the artist record. Everything remains editable afterwards.
- Nothing is ever saved without the editor pressing Save.

**`realName` is optional and stays optional.** Many street artists work under an alias deliberately. If it isn't published by the artist themselves, it doesn't go in — and the help text says so.

### B.3 Validation that doesn't depend on the model

- `wikidataId` must match `^Q\d+$`.
- `instagram` is stored as a handle, displayed as a URL; reject anything that isn't an instagram.com link.
- `website` must parse as a URL.
- Trim, and strip tracking parameters from URLs before saving.

---

## C. What else earns its place for AEO, now that we're here

Add to `artworks`, all optional, all in step 3:

| Field | Why |
|---|---|
| `artform` — select: Mural · Graffiti · Druck · Foto · Gemälde · Installation · Skulptur | `VisualArtwork.artform`. A controlled list, so it stays consistent across twenty entries. |
| `surface` — text (Putz, Beton, Holz, Leinwand, Papier) | `artworkSurface`. Pairs with `medium` → `artMedium`, and together they describe a mural precisely. |
| `subjects` — tags | What is depicted: Vogel, Porträt, Schriftzug, Architektur. This is what a question like "welches Hotel in Berlin hat Vogel-Murals" matches on. `keywords` in the JSON-LD. |
| `permission` — select: erteilt · offen · abgelehnt, plus `permissionNote` | The artist's consent to publish the photograph (see the capture sheet). **`offen` and `abgelehnt` block publishing**, via the completeness rules. A legal fact the site has to carry. |
| `creditText` — text | Photo credit. `ImageObject.creditText` and `copyrightNotice` in the JSON-LD. |

And on `artists`, alongside R5's `wikidataId` and `sameAs`: `realName` (optional), `shortBio` (localized, one line, 140 chars).

**JSON-LD once these exist:**

```jsonc
"creator": {
  "@type": "Person",
  "@id": "…#artist-deerbln",
  "name": "deerBLN",
  "alternateName": "Christian Rothenhagen",   // only when realName is set
  "sameAs": ["https://instagram.com/…", "https://…"],
  "identifier": "Q…",                          // only when verified
  "description": "…"                           // shortBio
},
"artform": "Mural",
"artMedium": "Sprühfarbe",
"artworkSurface": "Putz",
"keywords": ["Vogel", "Architektur"],
"image": {
  "@type": "ImageObject",
  "contentUrl": "…",
  "creditText": "…",
  "copyrightNotice": "© deerBLN"
}
```

Every key omitted when its field is empty. No invented values, ever — the standing rule.

---

## Definition of done

- [ ] `outside` exists as a level, sorts below Keller, and appears in the filter chips, the locator strip, the mosaic's variety rule and the "more on this floor" band
- [ ] `geo` appears only for outdoor works and drives `contentLocation` when set
- [ ] The artist panel shows which identity fields are missing, and never blocks saving
- [ ] The prompt has the artist's name already in it and copies in one click
- [ ] Pasted JSON is validated; malformed input fills nothing
- [ ] Wikidata, Instagram, website and real name cannot be accepted until their source link has been opened; a value without a source cannot be accepted at all
- [ ] `wikidataId` matches `^Q\d+$`; Instagram and website reject non-matching hosts
- [ ] `permission` defaults to `offen` and blocks publishing until `erteilt`
- [ ] `artform`, `surface`, `subjects`, `creditText` land in the JSON-LD, and every empty field is omitted
- [ ] German and English strings; nothing hardcoded
