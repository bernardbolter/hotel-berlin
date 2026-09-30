# Guided entry: „Neues Werk" (and the pattern for the rest)

*For Cursor · 1 October 2026*
*Part of the handoff kit (H.15a). Extends `claude/HotelBerlin_AdminAssistant_Plan_v2.md` layer 1. **No AI, no model, no external calls.***

---

## What this is

A step-by-step create flow in the Payload admin where **the photograph is uploaded as part of adding the work**, not beforehand in the media library. Built first for `artworks`, because twenty murals are being entered this week, and written so the same shell can wrap people, places and events later.

The normal edit form stays exactly as it is. This is an additional way in, for creating.

---

## The flow

Entry points: a `Neues Werk` button on the admin home page and on the artworks list.

### Step 1 — Das Foto

- A large drop zone. Drag a file, pick one, or **take one with the camera on a phone**.
- The file uploads immediately and creates the `media` record. Show the preview at the size the card will use, so a badly framed photo is obvious here rather than later.
- **Alt text DE** — required, with the help text: *Beschreibe das Foto für jemanden, der es nicht sehen kann. Nicht den Titel wiederholen.*
- **Alt EN** — optional at this point, and flagged later by the completeness rules.
- Focal point picker, defaulting to centre.
- Optional: *Kontextfoto* (the step-back shot), same treatment, no alt required until publish.

### Step 2 — Wo und von wem

- **Künstler:in** — a combo box over existing artists, matching name and alias. Typing a new name offers *„{Name}" neu anlegen*, which creates the artist inline with just the name. Everything else about the artist can be filled in later.
- **Etage** — Lobby, 1–10, Keller.
- **Ort** — free text, with the help text: *Wo genau? So, dass ein Gast es findet.*

**After step 2 the record is publishable.** Show that plainly: a green line saying *Kann veröffentlicht werden*, and three buttons:

- `Speichern & nächstes Werk` — saves as draft and returns to step 1
- `Speichern & veröffentlichen`
- `Weiter zu den Details`

### Step 3 — Details, all optional

Titel · Jahr · Technik (`medium`) · Größe (`dimensions`) · Geschichte (`description`, DE) · *Teil einer Ausstellung?* (a picker over exhibitions) · Detailfotos.

Each field says what happens if it's left empty, e.g. *Ohne Titel wird der Name der Künstlerin als Überschrift verwendet.*

### The bit that saves the most time

`Speichern & nächstes Werk` returns to step 1 **keeping the floor and the artist from the last record**, both clearly shown and one click to change. You walk a building floor by floor and an artist usually has several works in a row, so this removes most of the typing.

A small counter in the corner: *3 Werke in dieser Sitzung*.

---

## Rules

- **Nothing is created until step 1 is complete.** A half-finished flow that's abandoned leaves an orphan `media` record and no artwork — so the media record is created on upload, and the artwork only on the first save. Report orphaned media in the needs-attention list rather than trying to prevent it.
- Every save is an ordinary Payload save, attributed to the logged-in editor, with the usual version history.
- **Draft by default.** Publishing is an explicit button, and it is blocked by the completeness rules (photo, artist, floor, spot, alt DE) with a message naming exactly what is missing.
- Back and forward between steps never loses what's been typed.
- **It must work on a phone.** Someone standing in front of the work, photographing and entering it there, is the best version of this — for Bernard now and for the hotel later. Test at 390 px: the drop zone becomes a camera button, the steps stack, and nothing needs a hover.
- German throughout, with EN strings alongside for the language switch.

---

## Where it lives

- Custom admin view, route `/admin/neues-werk` (`admin.components.views`), plus the two entry buttons.
- Reuses Payload's own field components rather than hand-rolled inputs, so validation and localization behave as everywhere else.
- Uses the local API for saves and the standard upload endpoint for files.
- The publish check calls the same `src/lib/completeness/` rules as the sidebar panel. **One definition of "complete", used by the panel, the flow and the dashboard.**

## Later, same shell

`Neue Person`, `Neuer Ort`, `Neues Event`, `Neue Ausstellung` — the steps differ, the shell doesn't. Don't generalise it now; build it concretely for artworks, then lift it when the second one is needed.

## Definition of done

- [ ] A work can be created from nothing, photo included, without visiting the media library
- [ ] Alt DE is required before leaving step 1
- [ ] A new artist can be created inline by name alone
- [ ] After step 2 the record can be published; the button is blocked with a named reason when something required is missing
- [ ] `Speichern & nächstes Werk` keeps floor and artist, and the counter increments
- [ ] Everything works at 390 px, including taking a photo with the camera
- [ ] Saves appear in version history under the logged-in editor
- [ ] Abandoning the flow after an upload leaves a media record that the needs-attention list can find
- [ ] Twenty works can be entered in one sitting without touching the collection list
- [ ] axe clean on the view; `tsc` clean; `test:int` green
