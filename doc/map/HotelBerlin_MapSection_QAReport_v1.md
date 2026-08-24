# Hotel Berlin, Berlin — Map Section — Pre-Merge QA Report v1
*Captured 2026-08-24, executed by Cursor via Playwright against a live Chromium instance (`localhost:3001`), closing out `HotelBerlin_MapSection_CursorPrompt_v4_PlaywrightQA.md`. Script: `scripts/qa-map-pass.ts`. Screenshots: `qa-screenshots/`. Machine log: `qa-screenshots/REPORT.md`. No product code changed in this pass.*

**Bottom line:** first real click-through of this work, and it mostly held up — touch interactions, mobile layout, fallbacks, and the multi-endorser badge all passed with screenshot evidence. Two genuine product issues surfaced that hadn't been caught by any prior 200-status/typecheck pass; both are now **fixed and re-verified** (see Update below), plus one test gap (no seed record with zero picks) and one expected non-issue (Schloss's badge isn't visible on the default map because it's a further-out place and that filter is off by default).

**Note on method:** to get a non-empty `/you-me-and-berlin` for this pass, the QA script temporarily published Kristiane, Maike, and Alessandra, then restored them to `draft` afterward. Worth a quick manual check in Payload that all three are actually back to `draft` before anyone assumes the "everyone's still unpublished" state still holds.

---

## Results by section

**Touch/pointer** — 6 of 7 pass. Category pin first/second tap, person pin first/second tap, keyboard focus + `aria-label`, and keyboard Enter-opens-card all confirmed with screenshots or DOM reads. **Tab-to-pin fails** — see issues below.

**Person-filtered map** — click-to-filter and direct `?person=slug` load both pass. **Clearing the filter is a partial fail** — see issues below.

**Mobile layout** — all 4 items pass: card-below-map on both listing pages, both compact detail-page maps, no overflow, correct placeholder art.

**Fallbacks** — initials avatar and no-image placeholder both pass. **Zero-picks state is untested**, not failed — every person currently in the Payload DB has at least one pick via the join, so there's no live record that exercises the "coming soon" copy.

**Multi-endorser badge** — all 3 checks pass: `+1` visible with `aria-label` including "2 recommenders," hover/focus label reads correctly, hotel's own pin confirmed to carry no badge.

---

## Real product issues found

1. **Keyboard Tab never reaches a map pin.** 40 Tabs from the map's `role="application"` container never land on a pin button — the Mapbox canvas itself is in the tab order (`tabindex="0"`) and appears to be intercepting/absorbing tab stops before reaching the actual pin buttons. Focusing a pin programmatically still works (Enter opens the card correctly once focused), so this isn't a broken handler — it's that a real keyboard user tabbing through the page can't reach a pin at all through normal navigation. This is worth weighing seriously: "every pin `focusable: true`... keyboard Tab + Enter to open popup" was called a non-negotiable accessibility requirement as far back as the original Neighbourhood Map and Nachbarschaft briefs, so this is a regression against a requirement that was explicitly flagged as not up for trade-off, not a new nice-to-have.
2. **Clearing `?person=` doesn't reset the open card.** The URL correctly returns to `/en/you-me-and-berlin` and "Everyone" becomes the selected filter chip, but the Maike/Schloss `PlaceInfoCard` stays on screen from before the filter was cleared — a stale-state bug, minor compared to #1 but a real visible glitch.

## Test gap, not a bug

3. **No zero-picks person exists in the seed data**, so the "Recommendations from [name] are coming soon" fallback has never actually been seen rendering — only confirmed to exist in the codebase as unused copy (`picksComingSoon`). Worth deliberately testing with a throwaway zero-pick record before trusting this path, since it's the one fallback state that's still unverified.

## Expected, not an issue

4. Schloss Charlottenburg's `+1` badge doesn't show on the default `/en/neighbourhood` view because Schloss is tagged `further-out` and that filter is off by default — this is the distance-tier default working as specced, not a badge bug.

---

## Update — both real issues fixed and re-verified (2026-08-24, same day)

Closes out `HotelBerlin_MapSection_CursorPrompt_v5_BugFix.md`. Re-checked via `npx tsx scripts/qa-map-pass.ts --fixes`; all 5 targeted checks passed.

**Bug 1 fix.** Root cause confirmed as suspected: the Mapbox canvas was itself a tab stop (`tabindex="0"`), and `role="application"` was making the browser treat Tab as a widget key rather than handing focus on to the marker buttons. Fixed by changing the map container to `role="region"` with `tabIndex={0}`, setting the canvas to `tabindex="-1"`, and disabling Mapbox's built-in keyboard-pan handler (zoom +/- controls remain). Result: **1 Tab from the map now lands directly on the hotel pin**, down from never reaching a pin in 40 tabs. Evidence: `qa-screenshots/05b-keyboard-tab-to-pin.png` — visible focus ring, correct `aria-label`; DOM confirms canvas `tabindex=-1`.

One side effect worth knowing about, not flagged as a problem: keyboard-driven map panning (arrow keys moving the camera) is now off, since that handler was disabled to stop it from swallowing Tab. The actual requirement — reaching and activating pins by keyboard — works; free-camera keyboard panning does not. Worth a conscious call on whether that trade is fine long-term, but it isn't blocking.

**Bug 2 fix.** `PlacesMapView` was preserving `selectedId` whenever that place remained in the still-visible (unfiltered) list. Selection now resets whenever the visible place set changes — including clearing back to "Everyone." Evidence: `qa-screenshots/08-filter-cleared.png` — Everyone selected, clean URL, no stale card.

**Unchanged:** the zero-picks fallback is still untested against live data (test gap, not a bug) — no seed record with zero picks exists to exercise the "coming soon" copy.

## Status

Both real product issues from the original pass are fixed and re-verified with evidence. No PR opened yet.
