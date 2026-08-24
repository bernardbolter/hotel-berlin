# Hotel Berlin, Berlin — Multi-Endorser Pins — Follow-Up Build Brief
*For Cursor. Follow-up to `HotelBerlin_MapSection_BuildStatus_v2.md` — scoped separately, not blocking the current PR.*

---

## The gap

On the unfiltered `/you-me-and-berlin` recommendations map, a place endorsed by more than one person (currently: Schloss Charlottenburg — Alessandra Botts and Maike) renders as a single pin showing only the first published endorser's face. The second person is fully reachable — open the place's card, or filter `?person=slug` directly — just not visible as their own pin at rest. With only one confirmed multi-endorser place in the seed data today, this is a small edge case, but the seed data notes flag "likely more exist in the full 91-row set" once the complete dataset is seeded, so it's worth resolving before that scale hits rather than after.

## Options to propose against (pick one, or a better one — this isn't prescriptive)

1. **Stacked avatar cluster.** Two (or a few) small overlapping avatars at the one coordinate, front avatar interactive, rest peek out from behind. Works fine at 2–3 endorsers, needs a cutoff-plus-count treatment (see option 2) beyond that.
2. **Primary avatar + count badge.** First endorser's face as the pin, small "+1" (or "+N") badge at the corner. Opens the full list on click, same as today — this just makes the *existence* of more than one endorser visible at rest, without designing full multi-avatar stacking.
3. **Leave as is, but surface the count in the `aria-label` and in the always-hidden-until-hover label tag** (e.g. "Schloss Charlottenburg — 2 recommenders") so at least the information is discoverable via the same label-reveal interaction already built, without any new visual pin treatment.

Recommend evaluating against how common multi-endorser places turn out to be once more of the 91-row dataset is seeded — if it stays rare, option 2 or 3 is proportionate; if it turns out common, option 1 earns its complexity.

## Scope

- Pin component change only — `PlaceInfoCard`'s existing "all endorsers as chips" behavior already handles the multi-endorser case correctly once the card is open. This brief is about the pin's at-rest state, not the card.
- No schema change needed — `endorsements` is already `hasMany`.
- Should work for both the destinations view (category pin, if a place ever needs this treatment there too) and the person-filtered view.

## Not in scope

- Re-litigating whether `endorsements` should be hasMany (it's correct as built, per the seed data v1 schema fix).
- Anything about the consent gating / draft-404 / publishing items — unrelated, tracked separately.
