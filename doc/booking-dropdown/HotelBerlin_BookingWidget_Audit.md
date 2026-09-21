# Hotel Berlin, Berlin — Booking Dropdown Audit

*16 September 2026 · live site, both locales, inspected in-browser*
*Relates to: `HotelBerlin_ProjectBrief.md` (booking flow, open question), `HotelBerlin_ExtensionBrief.md` §5, `hotelberlinAEOaudit.pdf` §9, `HotelBerlin_RoomsPages_BuildBrief.md` §3.5/§4*

---

## Verdict in one paragraph

The mechanism is sound and worth keeping: a GET deep-link into the brand booking engine is the right shape for a Radisson Individuals property, and it is better than embedding a booking engine in an iframe. What is wrong is everything around it. The handoff is invisible to the machine layer — no `ReserveAction`, no `Offer`, no room entities anywhere on the site. The single price signal the site does emit is **`priceRange: "7480.00 €"`**, which is wrong by a factor of about a hundred and is live on every page in both locales. The meetings half of the widget is worse: it renders in English on the German site and discards two of the four fields the guest fills in. None of this needs the rebuild to fix — three of the findings are one-field changes on the live site today.

---

## 1. What it actually is

The live site runs on **Galaxy / TravelClick (Amadeus) Web Solutions** — `website_id 3285`, `cms_id 88747`, proxy at `tc.galaxy.tf`. The dropdown is Galaxy's stock "booking mask" component, with a second tab into which a third-party meetings widget is injected.

| | Rooms tab ("Zimmer" / "Rooms") | Events tab ("Events") |
|---|---|---|
| Owner | Galaxy CMS, native component | MeetingPackage, third-party script |
| Markup | `form.bm-form-container`, server-rendered | injected client-side by vendor script |
| Script | `cdn.galaxy.tf/asset-galaxy/js/gms-latest.min.js` | `meetingpackage.com/whitelabel/simplewidget/300747/en` |
| Not an iframe | correct — inline DOM | correct — inline DOM |
| Destination | `radissonhotels.com` | `hotelberlinberlin.meetingpackage.com` |

Both open in a **new tab via `window.open`**. Neither is an iframe, which is the one genuinely good structural decision here — the fields are real DOM, in the page, keyboard-reachable and styleable.

---

## 2. Rooms tab — the mechanism

The submit button carries `js-galaxy-book-body`; the destination lives in a data attribute on a wrapper div:

```
data-bm-booking-engine-provider-id="1"
data-bm-booking-mask-url="https://www.radissonhotels.com/de-de/hotels/radisson-individuals-berlin"
```

Submitting builds and opens:

```
https://www.radissonhotels.com/de-de/hotels/radisson-individuals-berlin
  ?datein=09/16/2026
  &dateout=09/17/2026
  &rooms=2
  &adults=3
  &children=2
  &languageid=7
  &_ga=2.229130780.1689289934…
```

**What works.** Every field the guest sets is carried across. `children` is correctly omitted when zero rather than sent as `0`. The locale swaps properly — the EN page uses `en-us` and `languageid=1`, the DE page `de-de` and `languageid=7`. GA cross-domain linking (`_ga`) is attached, so attribution survives the jump.

**What's off.**

- **Date format is `MM/DD/YYYY` on a `de-de` URL.** It works because Radisson parses it, but it is an American date format on a German-locale endpoint — fragile, and it will silently mis-parse the day someone changes the builder.
- **`en-us` for the English locale.** For a Berlin hotel serving mostly European English speakers, `en-gb` would land on the right currency and date conventions. Minor, but it is a default nobody chose.
- **No rate code, promo code or corporate code field.** Every direct booking lands on the public rate. For a property whose stated goal is reducing OTA dependency, there is no mechanism here to give a direct booker anything an OTA can't.
- **No room-type parameter.** Confirms the open item already flagged in `HotelBerlin_RoomsPages_BuildBrief.md` §3.5 — the per-room CTA cannot deep-link to a room type, so "Book this room" would be a lie. Keep it as "Verfügbarkeit prüfen".

---

## 3. Events tab — MeetingPackage

Whitelabel ID `300747`. Submitting opens:

```
https://hotelberlinberlin.meetingpackage.com/venue/hotel-berlin-berlin-2
  ?delegates=10&meeting-length=8&tab=room
```

Three real problems, in order of severity:

**3.1 — The form is English on the German site.** The script is hardcoded to `/en` on both locales. The German page shows a German tab label ("Events") wrapping an English form: *Book meeting rooms & packages · Date · Time · Meeting length · Delegates · SEARCH*. The Pikaday calendar inside it also renders `September 2026 / Mon Tue Wed…` rather than German. This is visible in the screenshots and it is the most obvious defect on the whole component — a German-speaking event planner meets English at the exact moment they're being asked for money.

**3.2 — Date and time are discarded at handoff.** In every submission observed, the outgoing URL carried only `delegates` and `meeting-length`. The Date and Time fields the guest fills in did not appear in the query string. So half the form is theatre: the planner sets a date, hits Search, and lands on a venue page that doesn't know their date. ⚠️ *Worth one manual confirmation before quoting this to the hotel — I set the date programmatically and via the picker, and neither produced a date parameter, but a human pass through the real UI would settle it beyond doubt.*

**3.3 — Empty date passes validation.** Submitting with the Date field blank is accepted and hands off anyway. There is no required-field check.

Also: `tab=room` is hardcoded in the outgoing URL, and the date input enforces `min="2026-09-18"` — a two-day lead time that is set by the vendor, not by the hotel, and that nobody on the project has agreed to.

---

## 4. How it sits in the site

- **The widget loads on every page** — including 404 pages. The MeetingPackage script, the Galaxy booking bundle, the rates proxy and two Pikaday instances are fetched site-wide, on roughly a hundred URLs, to serve a component that matters on the homepage, the rooms pages and the meetings pages.
- **22 third-party hosts, 79 requests** on the homepage. The booking stack is a minority of that; the rest is five Google Analytics measurement IDs, two GTM containers, Hotjar, Hotelchamp, DialogShift and Secure Privacy. Worth noting because the AEO audit rated page speed POOR, and the booking widget is being blamed for a problem it mostly didn't cause.
- **Two separate Pikaday instances** with different date formats and different languages, from two vendors, in one dropdown.
- **`jQuery 3.2.1` from cdnjs** — released 2017, with known CVEs. Not a booking issue as such, but it is in the same dependency chain.

---

## 5. AEO assessment

This is the part that matters most, and the news is worse than the interface suggests.

### 5.1 What the site actually emits

The homepage carries exactly two JSON-LD blocks: `BreadcrumbList` and `Hotel`. The `Hotel` node is:

```json
{
  "@type": "Hotel",
  "name": "Hotel Berlin, Berlin",
  "priceRange": "7480.00 €",
  "starRating": { "@type": "Rating", "ratingValue": "Unrated" },
  "description": "",
  "checkinTime": "",
  "checkoutTime": "",
  "telephone": "+493026050",
  "geo": { … }, "address": { … }, "sameAs": [ 5 profiles ],
  "image": [ 94 images ]
}
```

**Four defects in one node:**

| Field | Value | Problem |
|---|---|---|
| `priceRange` | `"7480.00 €"` | **The only price signal on the entire site, and it is wrong.** Real rates start at €72.25. An answer engine asked "what does Hotel Berlin, Berlin cost" has one number to work with and it says seven and a half thousand euros. |
| `starRating.ratingValue` | `"Unrated"` | `ratingValue` expects a number. A `Rating` object whose value is the string "Unrated" is invalid and worse than omitting the key. |
| `description` | `""` | Empty string emitted rather than the key omitted. |
| `checkinTime` / `checkoutTime` | `""` | Empty — while 15:00 and 12:00 sit in the FAQ as prose. These are among the most-asked hotel questions and the machine-readable answer is blank. |

### 5.2 What is missing entirely

- **No `potentialAction` / `ReserveAction`.** The dropdown's whole purpose is "you can book here", and there is no structured expression of it anywhere. Both `HotelBerlin_ProjectBrief.md` and `HotelBerlin_ExtensionBrief.md` already commit to this ("implement now, low cost, high future value for agentic search") — it has not been implemented.
- **No `makesOffer`, no `HotelRoom`, no `Offer` — anywhere.** `/en/sleep-relax/rooms-suites` emits **only `BreadcrumbList`**. The `Hotel` node exists on the homepage alone. So nothing on the site connects the hotel entity to a room, or a room to a price.
- **No `containsPlace`** for the meeting rooms, the restaurant, the gallery or the table-tennis club.

### 5.3 The AEO-shaped argument about the handoff

`hotelberlinAEOaudit.pdf` §9 recommends replacing the new-tab handoff with an on-domain booking path. That is the right instinct aimed at the wrong target. The transaction has to happen on Radisson's infrastructure — that is a commercial constraint, not a technical choice, and it is not going to change.

**The correct AEO response to a handoff is to describe the handoff.** schema.org has exactly the vocabulary for it:

```json
"potentialAction": {
  "@type": "ReserveAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "https://www.radissonhotels.com/de-de/hotels/radisson-individuals-berlin?datein={checkin}&dateout={checkout}&adults={adults}&rooms={rooms}",
    "inLanguage": "de",
    "actionPlatform": [
      "https://schema.org/DesktopWebPlatform",
      "https://schema.org/MobileWebPlatform"
    ]
  },
  "result": { "@type": "LodgingReservation", "name": "Zimmerbuchung" }
}
```

That single block turns an opaque JavaScript redirect into a documented booking entry point that an agent can read, fill and follow. It costs nothing, it needs no Radisson cooperation, and it is the difference between a site an agentic booker can transact with and one it can only read about. Nobody else in this hotel's competitive set will have it.

---

## 6. A contradiction in our own documents, now resolved

Two project docs disagree about whether the live site shows prices:

- `hotelberlinAEOaudit.pdf` §9: *"zero native room-rate text anywhere on-site — pricing is only accessible after the off-site booking flow."*
- `HotelBerlin_ExtensionBrief.md` §5: *"The rooms index page does display from-prices (e.g., Individual from €72.25)."*

**The ExtensionBrief is right; the AEO audit is wrong.** Prices are present and server-rendered in the raw HTML of the rooms index — €72.25, €80.75, €92.65, €97.75, €106.25, €122.40, €173.40, €389 — inside Galaxy custom elements:

```html
<glx-tc-lead-rate class="rate" config=''>
  <a href="/en/sleep-relax/rooms-suites/individual-room" class="no-deco">
    from <glx-tc-lead-rate-value>72,25</glx-tc-lead-rate-value>€
  </a>
</glx-tc-lead-rate>
```

Two things follow, and both matter more than the correction itself:

1. **`config=''` is empty and the number is hardcoded in the HTML.** These are not live rates. `rates-proxy.js` loads on every page but is not driving these values. They are static editorial numbers styled to look like a rate feed — precisely the maintenance-aware-defaults failure the rebuild's governing principles exist to prevent. Nobody knows how old €72.25 is.
2. **The prices are in the DOM but not in the schema.** Visible to a human, invisible as structured data. That is almost certainly why the audit tool reported zero — and it is the real finding underneath the wrong one.

There is also a straightforward content bug: one rate renders as **`from 97,75 €€`** — a double euro sign in the source HTML.

---

## 7. Is the current implementation the best it could be?

**Keep:** the deep-link pattern, the inline (non-iframe) form, the locale-aware destination URL, the GA cross-domain linker, the two-tab rooms/meetings split.

**Change:** everything listed below.

### Fix on the live site now — no rebuild needed

| # | Fix | Effort |
|---|---|---|
| 1 | `priceRange` → `"€€"` or a real band. Not `7480.00 €`. | one field |
| 2 | Drop `starRating` entirely, or set the real numeric value | one field |
| 3 | Fill `description`, `checkinTime` ("15:00"), `checkoutTime` ("12:00") — or omit the empty keys | one field each |
| 4 | Load the MeetingPackage widget as `/de` on German pages | one string |
| 5 | Fix `from 97,75 €€` | one character |
| 6 | Add `potentialAction`/`ReserveAction` to the Hotel node | one block |

Items 1 and 4 are the two a guest or an answer engine actually collides with today.

### Design into the rebuild

- **Own the URL builder.** One typed function — `buildRadissonBookingUrl({ checkin, checkout, adults, children, rooms, locale })` — with unit tests, ISO dates in, the vendor's format out, `en-gb` for English. Do not inherit Galaxy's builder or reimplement it per call site.
- **Emit `ReserveAction` from that same function's parameter list**, so the machine-readable entry point and the human button can never drift apart. This is the same render-time-projection principle the rest of `aeo-schema` already follows.
- **Real room entities with real Offers**, per `HotelBerlin_RoomsPages_BuildBrief.md` §4.1 — `HotelRoom` + `Offer` per room, `makesOffer` on the Hotel global. Prices from a Payload field with a visible `lastVerified` date, so a stale rate is a CMS problem someone can see rather than an invisible lie in the HTML. No fabricated prices: if a room has no verified rate, it emits no `Offer`.
- **Scope the widgets to their routes.** The meetings widget belongs on the meetings tree, not on every 404.
- **Reconsider the meetings tab entirely.** `HotelBerlin_MeetingsPage_BuildBrief.md` already specs an inquiry form for all 22 rooms. A German-language inquiry form we own will out-convert an English third-party widget that drops the date — and it feeds the Payload meeting-room data we're building anyway. Suggested split: our inquiry form as the primary path, MeetingPackage retained as the instant-book option for those who want it.
- **Decide the new-tab question deliberately.** `window.open` is currently inherited, not chosen. A new tab keeps the site open behind the booker, which has a real argument for it; it also severs the session. Whichever way it goes, it should be a logged decision.

---

## 8. Open items

- **Confirm the MeetingPackage date/time drop (§3.2)** with one manual pass before it goes to the hotel.
- **Where does `7480.00 €` come from?** Galaxy field, or a computed maximum? Determines whether fixing it is a CMS edit or a template change.
- **Who owns the hardcoded room rates**, and when were they last checked? This is a live commercial-accuracy risk, not just an AEO one.
- **Is a rate/promo code parameter available** on the Radisson endpoint? If yes, direct booking can carry a genuine advantage, which is the stated commercial goal of the whole rebuild.
- **`rates-proxy.js` is loaded but idle** — was live rating ever configured, and is the capability available to us? Direct input to the Radisson technical checkpoint already on the project's open list.
