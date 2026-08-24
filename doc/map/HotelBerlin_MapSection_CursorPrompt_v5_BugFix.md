# Hotel Berlin, Berlin — Map Section — Fix Two QA Findings, Then Re-Verify
*Paste into Cursor. Follow-up to `HotelBerlin_MapSection_QAReport_v1.md`. Fix both issues below, then re-run (or extend) `scripts/qa-map-pass.ts` to confirm the fixes with the same screenshot-based evidence standard as that report — don't just claim it's fixed.*

---

## Bug 1 — keyboard Tab never reaches a pin (accessibility, treat as a real regression)

**Evidence from the QA report:** 40 sequential Tabs from the map's `role="application"` container never focused a `.hbb-map-pin-host button`. Programmatic focus on a pin still works correctly — Enter opens its card fine once focused — so the click/keyboard *handler* is sound. The problem is that a real keyboard user tabbing through the page in order can't reach a pin at all. The Mapbox GL canvas itself is `tabindex="0"` and sits in the tab sequence, and the report's working theory is it's intercepting or absorbing tab stops before they reach the actual pin buttons.

This requirement — "every pin `focusable: true`, keyboard Tab + Enter to open popup" — has been stated as non-negotiable since the original Neighbourhood Map and Nachbarschaft briefs. Treat this as a blocker, not a polish item.

**Investigate and fix the root cause**, likely one of:
- The Mapbox canvas/canvas-container shouldn't itself be a tab stop if it isn't the intended interactive element — keyboard users should tab through the actual pin marker buttons, not the canvas. Setting the canvas's own `tabindex` to `-1` (while leaving pan/zoom controls, if any, separately focusable) may be sufficient — verify this doesn't remove something else that needed to be reachable.
- Confirm the pin marker buttons are rendered in a DOM position/order a screen reader and keyboard user would expect (roughly matching visual left-to-right/top-to-bottom order), not appended somewhere tab order skips over.
- Check whether `role="application"` on the map container is itself changing how assistive tech and Tab behave here — this role has known quirks with how browsers/screen readers hand off focus to children. If it's contributing to the problem, confirm it's still the right role choice versus an alternative that plays better with standard Tab semantics, and don't remove it purely to work around the bug without understanding why it was chosen originally.

**Verify:** script a Tab sequence from a known starting point (e.g. the element right before the map in DOM order) and confirm a pin button receives focus within a small, predictable number of tabs — not 40 — with a screenshot showing the focus ring and label reveal, same as the other keyboard checks in the QA report.

## Bug 2 — clearing `?person=` leaves the previous card open

**Evidence:** clicking back to "Everyone" correctly clears the URL and updates the selected filter chip, but the `PlaceInfoCard` from the previously-selected person's pick stays visible on screen.

**Fix:** clearing the person filter should also clear whatever "selected pin / open card" state is driving `PlaceInfoCard`'s visibility — when the filter goes back to unfiltered, no card should be shown by default (same as the initial unfiltered load state, which doesn't show a card until something is clicked).

**Verify:** repeat the filter-then-clear sequence from the QA report, screenshot the state immediately after clearing, confirm no stale card is present.

---

## Re-verification

Extend or re-run `scripts/qa-map-pass.ts` for just these two items (no need to redo the whole checklist unless something else looks affected by the fix). Same evidence standard as the QA report: screenshots or DOM reads, not status claims. Update `HotelBerlin_MapSection_QAReport_v1.md`'s two open issues to reflect the fix, or report back if either turns out to be harder than expected so we can decide whether to still open the PR with one of them tracked as a fast-follow instead.
