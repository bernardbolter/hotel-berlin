# Guided entry: one page, one prompt, and catching the location

*For Cursor · 1 October 2026*
*Replaces the three-step structure in `claude/HotelBerlin_GuidedEntry_BuildBrief.md` and folds in `claude/HotelBerlin_GuidedEntry_Step2_Addendum.md`. The field rules, help strings and completeness rules are unchanged.*

---

## A. One page instead of three steps

`/admin/neues-werk` becomes a single scrolling page. Sections, not steps; no Weiter, no Zurück.

```
┌ Das Foto ────────────────────────────────┐   ← upload first; everything else
│  drop zone → preview → Kontextfoto        │     stays dimmed until a photo exists
├ Alles auf einmal ────────────────────────┤
│  [ Prompt kopieren ]  [ Antwort einfügen ]│   ← §B
├ Das Werk ────────────────────────────────┤
│  Alt DE* · Alt EN · Titel · Jahr          │
│  Technik · Untergrund · Art · Größe       │
│  Motive (Tags) · Geschichte               │
├ Wo ──────────────────────────────────────┤
│  Etage* (inkl. Außen) · Ort*              │
│  Standort (nur bei Außen)  → §C           │
├ Von wem ─────────────────────────────────┤
│  Künstler:in* + Identitätsfelder          │
├ Rechte ──────────────────────────────────┤
│  Freigabe · Bildnachweis                  │
└───────────────────────────────────────────┘
   Fehlt noch: …                    [ Speichern & nächstes ] [ Veröffentlichen ]
```

- **The photo stays first and stays required.** Until one is uploaded the rest is visible but disabled, with one line: *Zuerst ein Foto.*
- The bar at the bottom is **sticky** and always names what is still missing, in German, in the order of the page. Same completeness rules, just always on screen instead of on a step.
- `Speichern & nächstes Werk` keeps the level and the artist, as before, and scrolls back to the photo.
- Sections are `<section>` with real headings, so the keyboard and a screen reader move through them properly. On a phone each section is full width and the sticky bar stays visible.

---

## B. One prompt for everything the AI can help with

One block, one copy, one paste back. **But the JSON separates what the model can see from what it has to look up**, because those carry completely different risks:

- `gesehen` — from the photograph. The model is describing an image in front of it. Low risk.
- `recherchiert` — about the artist, from the web. **Every value needs a source URL, and `null` is the right answer when there isn't one.**

Keeping them in one JSON but two objects is what stops the model treating "this looks like spray paint on plaster" and "this artist's Wikidata ID is Q…" as the same kind of claim.

### The prompt (name interpolated when the artist is already typed)

```
Ich pflege die Website von Hotel Berlin, Berlin. Im Anhang ist das Foto
eines Kunstwerks im oder am Haus.

TEIL 1 — nur aus dem Foto (nichts dazuerfinden):
- Alt-Text auf Deutsch und Englisch: ein Satz, höchstens 120 Zeichen,
  beginnt mit dem Motiv, nicht mit der Wand. Keine Wertung.
- Art des Werks: Mural, Graffiti, Druck, Foto, Gemälde, Installation
  oder Skulptur.
- Technik (z. B. Sprühfarbe, Acryl) und Untergrund (z. B. Putz, Beton,
  Holz, Leinwand) — nur wenn im Foto erkennbar, sonst null.
- Motive: 2 bis 5 Schlagwörter, was dargestellt ist (z. B. Vogel,
  Porträt, Schriftzug, Architektur).
- Signatur oder Schriftzug im Bild, falls lesbar, wörtlich.

TEIL 2 — Recherche zu „{{name}}"{{, sonst: der Künstlerin oder dem
Künstler, falls im Bild eine Signatur lesbar ist}}:
- Nur Angaben, die du auf einer öffentlichen Quelle findest.
- Zu jeder Angabe die URL, auf der sie steht.
- Was du nicht findest: null. Rate nicht.
- Erfinde keine Wikidata-ID. Kein Eintrag vorhanden: null.
- Mehrere Personen mit dem Namen: lieber null als die falsche.

Gib ausschließlich dieses JSON zurück, ohne weiteren Text:

{
  "gesehen": {
    "altDe": null, "altEn": null,
    "artform": null, "medium": null, "surface": null,
    "subjects": [],
    "signatur": null
  },
  "recherchiert": {
    "name":        { "value": null, "source": null },
    "instagram":   { "value": null, "source": null },
    "website":     { "value": null, "source": null },
    "wikidataId":  { "value": null, "source": null },
    "realName":    { "value": null, "source": null },
    "nationality": { "value": null, "source": null },
    "basedIn":     { "value": null, "source": null },
    "shortBio":    { "de": null, "en": null, "source": null }
  }
}
```

**Deliberately not asked for:** title, year and dimensions. A model looking at a photograph will guess all three convincingly and be wrong, and they are exactly the facts that make the page authoritative. Those stay typed by a person, or stay empty.

### Pasting back

- One textarea, *Antwort einfügen*, at the top of the page. Tolerate a code fence around the JSON.
- Validate with zod. Malformed → a friendly message, nothing filled.
- Fill the `gesehen` values straight into their fields, **marked with a small ✦ until edited or saved**, so it is obvious which values came from a machine.
- `recherchiert` renders as rows with value, source link and checkbox, per the step 2 addendum: **Wikidata, Instagram, website and real name stay unchecked until their source link has been opened**, and a value without a source can't be accepted at all.
- `signatur` is never written to a field. It is shown as a note: *Im Bild lesbar: „…" — Künstler:in prüfen.* A signature is a hint for a person, not a fact.

---

## C. The location, caught where the work is

Three ways in, best first.

### C.1 From the photograph's own EXIF

A phone photo taken outdoors usually carries GPS coordinates. At upload, read them:

- If the work's level is `outside` (or not yet chosen) **and** the file has EXIF GPS, offer it: *Im Foto steckt ein Standort: 52,5061 · 13,3556 — übernehmen?* with a small map preview. Never filled silently.
- Ignore EXIF GPS for indoor works, where it is meaningless.
- **Strip EXIF from everything that gets stored and served.** The originals keep what they came with; the generated sizes carry no metadata. A guest downloading a photo from the site should not receive the camera's serial number.

This is the one that costs nothing: photograph the mural outdoors with location on, and the coordinates arrive by themselves.

### C.2 Standing in front of it, on the phone

A `Standort jetzt erfassen` button, using the browser's geolocation, shown only when the level is `outside`. It writes the coordinates plus the reported accuracy, and refuses anything worse than 50 m with *Zu ungenau — noch einmal versuchen oder auf der Karte setzen.*

Needs HTTPS; works on localhost for testing. In production it's fine.

### C.3 On a map

A small Mapbox picker centred on the hotel, drag a pin. The fallback for when neither of the above applies — and the only option on a desktop.

### C.4 The catch-up queue

Most works will be entered at a desk from photographs, so the coordinates will be missing. Add a view, `/admin/standorte`, listing outdoor works **without** geo: name, photo thumbnail, spot, and `Standort jetzt erfassen`. Open it on the phone, walk the outside of the building once, and clear the list.

The same view is where the needs-attention dashboard will link to later.

---

## Definition of done

- [ ] One page, no steps; the photo is first and gates the rest; the sticky bar always names what is missing
- [ ] `Speichern & nächstes Werk` keeps level and artist and returns to the top
- [ ] One prompt covers both jobs, with the artist's name interpolated when known; one paste fills the page
- [ ] `gesehen` values are marked as machine-suggested until touched
- [ ] `recherchiert` identity fields cannot be accepted without opening the source; no source, no acceptance
- [ ] The prompt never asks for title, year or dimensions, and a read-back signature is shown as a note, not written to a field
- [ ] EXIF GPS is offered, never applied silently, and only for outdoor works
- [ ] Stored derivatives carry no EXIF
- [ ] `Standort jetzt erfassen` works on a phone over HTTPS and rejects accuracy worse than 50 m
- [ ] `/admin/standorte` lists outdoor works without coordinates and can clear them one by one
- [ ] Keyboard-only pass through the whole page; axe clean; DE and EN strings
