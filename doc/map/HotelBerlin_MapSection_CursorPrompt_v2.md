# Hotel Berlin, Berlin — Map Section (Places ↔ People) — Cursor Prompt v2
*Paste this into Cursor against the `hotel-berlin-de` repo, as a follow-up to `HotelBerlin_MapSection_CursorPrompt_v1.md` Part A and `HotelBerlin_MapSection_BuildStatus_v1.md`.*
*Scope: the destinations/recommendations styling split (decided below), mobile styling, editorial add-flow docs, individual detail page layouts, filler-content fallback states. Consent gating, draft-record URL gating, and publishing the seeded people are tracked separately — not in scope for this pass.*

---

## Decision: map split is Option B

Confirmed against your Part A report and proposal: **one map component, reskinned and filtered by view — not a second map with its own people-location data.** Specifically:

- `/nachbarschaft` stays the destinations view: category-token pins (current addendum v2 palette — the v4 muted tokens in the original Neighbourhood Map brief never shipped and should be treated as superseded, not a target to build toward), category legend, `PlaceInfoCard`.
- `/you-me-and-berlin` gets a person-first view of the **same underlying map/pin plumbing**, not a new coordinate system. No new `basedIn` geo field. A person with zero `picks` simply doesn't render on a map — that's an acceptable empty state, not a bug to design around.
- Selecting a person (`?person=slug`) narrows the map to that person's picks — same place coordinates already on `neighbourhood-places`, filtered client-side or via query param the way `/nachbarschaft`'s existing filters already work.
- New pin variant: `MapPin variant="person"` — a reskin of the existing pin component (avatar/initials at the pick's existing lat/long instead of a category glyph), not a fork. Both variants share the same accessibility contract already built (`aria-label`, focus-visible label reveal, touch first-tap/second-tap) — don't rebuild that per variant.
- Card differentiation: destinations card leads with the place (name → category → description → who recommends it). Person-filtered card leads with the person (photo → name/role → their pick's name and quote) — same underlying `PlaceInfoCard`-style component, different field order/emphasis via a prop, not a second component.
- Person detail page (`/you-me-and-berlin/[slug]`) gets a small embedded instance of this same map, pre-filtered to that person, showing just their picks.

If this framing doesn't match what you had in mind when you scoped Option B, flag it before building rather than guessing further.

---

## 1. Styling differentiation

Build the two view-states so a user can tell at a glance which mode they're in, without them being visually two different products:

- Reuse the addendum v2 category tokens for the destinations view — don't reintroduce the v4 muted palette, since it was never signed off and isn't live anywhere else in the codebase.
- Person-first pins: consistent avatar treatment (portrait if present, initials-on-ink-color fallback if not — see the filler-content section below for the exact fallback rule).
- Legend: note from the status report that the homepage teaser currently has **no legend mounted at all** — not a responsive bug, just absent. If a legend is part of this work for either view, that's a from-scratch build, not a fix.
- Keep both variants documented together in the `MapPin`/`PlaceInfoCard` component files (props/variants, not parallel components) so future work doesn't fork them again the way `NeighbourhoodMap.tsx`/`NeighbourhoodMapCanvas.tsx` apparently already did — those two are confirmed-dead leftovers per the status report; safe to delete as part of this cleanup if nothing imports them.

## 2. Mobile styling

Card-below-map under `md` is confirmed working on the homepage (full) and `/nachbarschaft` instances — extend that same rule to the new person-filtered view rather than inventing a different mobile pattern. The `/here` compact variant has no card at all today (by design, per the brief) — leave that as is unless this work specifically touches `/here`.

## 3. Individual detail pages — build the real layout

Both `/nachbarschaft/[slug]` and `/you-me-and-berlin/[slug]` are currently the plain stubs the original brief asked for (name/description + JSON-LD). Build past them:

- `/nachbarschaft/[slug]`: hero image (with the filler fallback below if missing), name, category, full description, address/transit/walking time, all endorsements as chips (already working on the map card — reuse, don't reimplement), a small map showing just this place's pin, link back to `/nachbarschaft`.
- `/you-me-and-berlin/[slug]`: portrait (or fallback), name, `jobTitle`, `basedIn`, full `bio`, pull quote, video embed if present, their picks rendered as `PlaceCard`s, **plus the small embedded person-filtered map from the decision above**, link back to `/you-me-and-berlin`.
- Keep the existing JSON-LD wiring (`buildPlacePageGraph`/`buildPersonPageGraph`) untouched — this is a layout task on top of already-working schema output.

## 4. Filler content for thin records

Confirmed relevant right now, not hypothetical: every seeded person is currently `draft`, and several (Maike, Alessandra Botts) have no bio or photo at all. Define these fallback states on the detail pages (publishing/gating those records is being handled separately — this is just what the page *renders* when a field is empty):

- No portrait → initials avatar, ink/category-token fill — not a stock photo.
- No `bio`/`shortBio` → section collapses rather than showing an empty heading. If only a `quote` exists, lead with that alone.
- Zero `picks` → hide the "their picks" section, or a short "Recommendations from [name] are coming soon" line — no empty grid.
- Place with no `image` → reuse whatever placeholder pattern already exists for rooms/venues rather than inventing a new one (and drop the picsum-placeholder behavior currently on the teaser — that was noted as a stand-in, not an intended long-term pattern).
- Single-endorsement vs. multi-endorsement places shouldn't visibly break or look sparse at either end.

Do not write placeholder bios or quotes for real people — that instruction from the seed data still stands. Filler means UI gracefulness, not invented copy.

## 5. Editorial add-flow — document, don't necessarily change

Write up, in plain language for the hotel team, the actual current path:

- New place → `neighbourhood-places`, required fields, manual lat/long entry (confirmed still manual — flag this as a real ongoing gap, same as the seed data doc did), at least one `endorsements[]` entry, `status: active` to go live, optional `homepageTeaser`/`hereTeaser` flags to feature it.
- New person → `people`, required fields, `status: published` to go live, `picks` populate automatically via the working `join` field once they're added as an endorser somewhere — confirmed no `afterChange` hook exists or is needed.
- Flag anywhere this still requires a developer versus something the hotel team can do unassisted in Payload admin.

---

## Explicitly out of scope for this pass

- Cookie-consent gating on the homepage map (`mapConsent.ts` exists, unused — tracked separately)
- Gating draft-status people behind a real 404 instead of `noindex`-only (tracked separately)
- Actually publishing/flipping the seeded people to `published` (a content/hotel-team task, not a code task)

## Deliverable

A PR (or a few, split by section above) plus an updated note in `HotelBerlin_MapSection_BuildStatus_v1.md`-style format for anything that changes status. Flag any point above where the Option B framing doesn't hold up once you're actually in the pin/card components, rather than working around it silently.
