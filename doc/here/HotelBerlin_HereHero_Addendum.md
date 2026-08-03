# Hotel Berlin, Berlin — `/here` Hero Addendum
*For Cursor*
*Amends: `HotelBerlin_HerePage_BuildBrief.md` — hero section and `hereHero` global*
*Reference: `here_Inside_mobile.pdf` mockup*

---

## What changed

The mobile mockup confirms most of the existing hero spec (live clock, time-of-day greeting, `hereHero` global driving content by day). This addendum covers four things the mockup surfaces that the original brief didn't yet account for.

---

## 1. Bridge link — now a Payload field, not hardcoded copy

Existing brief had "Not here yet? STAY →" as fixed copy. Confirmed wording is **"Not here yet? STAY →"** (mockup's "Not staying here yet?" was the outlier — going with the shorter version already in the brief). But it needs to be editable, since nav copy like this tends to get revised post-launch without a code change.

Add to the **`hotel` global** (not `hereHero` — this string appears in the `/here` nav generally, not just the hero):

```typescript
{
  name: 'bridgeNav',
  label: 'Bridge navigation (STAY link on /here)',
  type: 'group',
  fields: [
    { name: 'labelEN', type: 'text', defaultValue: 'Not here yet? STAY →' },
    { name: 'labelDE', type: 'text', defaultValue: 'Noch nicht hier? BLEIB →' },
  ],
},
```

---

## 2. Day label — computed, not editable

The mockup shows a small label ("THURSDAY") above the greeting, distinct from the greeting text itself. This is **not** a new Payload field — it's derived at render time from the same Berlin-time logic already computing which day slot to show:

```typescript
const dayLabel = berlinDate
  .toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', { weekday: 'long', timeZone: 'Europe/Berlin' })
  .toUpperCase();
// "THURSDAY" / "DONNERSTAG"
```

Typography: small label treatment, matching the existing section-label style (Archivo, uppercase, tracked) — sits directly above the greeting, not editable in Payload since it's just today's actual day name.

---

## 3. Live event subline — replaces manual per-day subline with resolved event data

The "Ping Pong Tournament starts tonight at 18:00 / KTTK - Ground floor across from the bar" subline is **not** hand-typed per day. It's the same underlying data as the `SpotlightCard` event resolver (`resolveEventSpotlight`), rendered as compact two-line text instead of a full card — same source, different design, per your note.

### Updated priority logic

This changes the existing `getHeroState` priority chain from the `/here` brief. Insert a new priority between the day slot and the FKKB/Lütze overrides:

```typescript
async function getHeroSubline(day: DaySlot) {
  const now = getBerlinNow();

  // Live/next event today, from the same events collection SpotlightCard reads
  const liveEvent = await getCurrentOrNextEventToday(now);
  if (liveEvent) {
    return {
      type: 'live-event',
      line1: `${liveEvent.title} starts ${liveEvent.relativeTime}`, // "starts tonight at 18:00"
      line2: `${liveEvent.venue.name} · ${liveEvent.venue.spotlightLocation}`, // "KTTK · Ground floor across from the bar"
    };
  }

  // Fall back to the manually-set day-slot subline
  if (day.sublineEN) {
    return { type: 'manual', line1: day.sublineEN, line2: null };
  }

  return { type: 'none' };
}
```

**⚠️ Open item:** confirm this is meant to sit *above* the FKKB/Lütze manual override priorities from the original `getHeroState` function, or alongside them — right now a live event and an FKKB override could both want the subline slot at the same time, and the original brief's "FKKB wins" rule doesn't yet account for a third contender.

**⚠️ Open item:** `relativeTime` phrasing ("starts tonight at 18:00" vs. "starts in 2 hours" vs. a fixed time) needs a formatting rule — is this always a fixed clock time, or does it get more casual close to the event start?

### Schema note

The existing `hereHero` global's per-day `sublineEN`/`sublineDE` fields stay as-is — they're now the *fallback*, not the primary source. No schema change needed here, just the resolver logic above sitting in front of them.

---

## 4. Clock position — unresolved, keep as-is for now

Mockup shows the clock top-right, overlaid on the hero photo. Current brief already specs a live clock (`aria-live="off"`, updates every 60s) but hasn't fixed its position. Leaving this open per your note — no change to build yet, just flagging it's still pending rather than decided.

---

## Confirmed — no change needed

The "During your stay" block (check-out, breakfast, WiFi, parking) in the mockup matches the existing `StayInfoCard` spec from the `/here` brief exactly — check-out time + note, breakfast hours + location, WiFi network/password as a monospace pill, parking rate + cap. All of it already reads from the `hotel` Payload global, not hardcoded, per the original brief. Nothing new required here — this addendum is confirmation, not a change.

---

## Open items — do not silently resolve

1. Live event subline vs. FKKB/Lütze override priority — which wins if both are active
2. `relativeTime` phrasing rule for the live event subline
3. Clock position — deferred, not decided

---

## Definition of done (additions to existing checklist)

- [ ] Bridge nav label reads from `hotel` global, both locales, not hardcoded
- [ ] Day label renders as today's actual weekday name in the active locale, computed — not a Payload field
- [ ] Hero subline resolves live/next event first, falls back to manual day-slot subline, matches the priority rule once confirmed
- [ ] Live event subline and FKKB/Lütze override do not silently conflict — explicit precedence implemented
