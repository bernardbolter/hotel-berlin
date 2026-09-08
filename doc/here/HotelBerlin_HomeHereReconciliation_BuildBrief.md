# Hotel Berlin, Berlin — Home ↔ `/here` Reconciliation Build Brief

*For Cursor*
*Audited against the live build at `hotel-berlin.bernardbolter.com` (`/de` and `/de/hier`), 2026-09-02, viewport 1440×900*
*Supersedes: `DESIGN.md` §1 accent assignment and §4 Navigation — see ⚠️ flags*
*Amends: `HotelBerlin_HerePage_BuildBrief.md`, `HotelBerlin_HereHero_Addendum.md`, `HotelBerlin_ResponsiveNav_BuildBrief.md`*

---

## 0. Client decisions taken (2026-09-02)

Three decisions were taken before this brief was written. They are settled — do not re-litigate them in code review, but **do** flag the consequences listed under each.

1. **Accent swap.** Outside/home context becomes the cool accent; `/here` becomes amber. This **inverts** `DESIGN.md` §1, which currently reads "outside = amber, `/here` = teal." `DESIGN.md` must be updated in the same PR or it becomes the next source of drift.
2. **True nav swap.** Row 1 carries the *current* context's own links. Row 2 carries **only** the bridge to the other context. No sub-links in row 2 on either page.
3. **`/here` restructured into photo-led 2:1 bands**, matching the home page's editorial rhythm. The current equal-column card grid is retired for content sections.

---

## ⚠️ Flagged conflicts — do not silently resolve

**F1 — Accent token vs. category token collision.**
`DESIGN.md` §1 defines category tokens driven by the CMS: `--cat-art` = `#2C6B7A` (teal), `--cat-sport` = `#F79B2E` (amber). Both are live on the homepage right now (`spotlight-card__badge` renders teal for ART, navy for COMMUNITY).

If the home context accent becomes teal, **context signal and category signal become the same hue** and the card system stops meaning anything. Same problem in reverse on `/here` with amber and `--cat-sport`.

**Recommendation (needs sign-off before build):** use **Navy `#216A95`** — already a brand token, Pantone 3015 U — as the home context accent rather than teal. It is the "blue" described in the decision, it is visibly distinct from `--cat-art` teal, and it measures 5.9:1 on white (AA pass, normal text). Teal then stays purely a category token. On `/here`, accept the amber/`--cat-sport` overlap or move `--cat-sport` to coral — flag either way, don't pick silently.

**F2 — Amber fails AA as small text, and the swap makes it worse.**
`#B87A2E` on white measures **3.58:1**. It is currently used as link text at 11–12px in the homepage's second nav row. That already fails WCAG 2.1 AA (4.5:1 for normal text) on an EAA-required site. The swap moves amber onto `/here` and increases its use.

**Fix, required in this PR:** add a text-safe amber and split the roles.

| Token | Hex | Contrast on white | Allowed use |
|---|---|---|---|
| `--amber-text` | `#9A6420` | **4.98:1** ✅ | Link text, labels, any type below 18.66px bold / 24px regular |
| `--amber-dark` | `#B87A2E` | 3.58:1 | Borders, rules, icon strokes, large display type only |
| `--amber` | `#F79B2E` | 2.6:1 | Solid fills only, always with Ink `#141414` text on top |

Never white text on `#F79B2E`. This is already called out in `DESIGN.md` §1 and is the most likely regression in this work.

**F3 — Two greens are live, and neither matches the docs.**
`--hbb-green` resolves to `#4A7A68` (used for the `/here` map card border `#4A7A68` / fill `#F0F6F0`, and the "JETZT GEÖFFNET" status dot). The home hero forest panel is hardcoded `#56674F`. `DESIGN.md` and `HotelBerlin_HeroSection_2to1Addendum.md` both assert `#56674F` is canonical and that `#4F674F` was a typo — but the *token* is a third value neither doc mentions. Audit and reconcile to one green before this work spreads it further.

**F4 — Blocker: the true swap promotes five unbuilt pages to primary nav.**
Decision 2 makes `/here`'s row 1 the primary nav: `Was ist los`, `So kommst du hin`, `Die Nachbarschaft`, `Galerie`, `Wallride`. Per `claude/HotelBerlin_HerePage_BuildStatus_v1.md`, **none of these have a `page.tsx`**:

`/here/events` · `/here/art` · `/here/explore` · `/here/getting-around` · `/here/gallery` · `/here/wallride`

Today they are demoted second-row links and a 404 is survivable. As primary nav on the guest hub it is not. **Sequencing rule: do not ship the nav swap until at least stub pages exist behind all five.** See §6.

**F5 — Both CTAs resolve to `/book`.**
`Jetzt buchen` (home) and `Komm wieder` (`/here`) both point at `/book`. "Come back" sending an in-house guest into the same first-time booking funnel is a content bug, not a styling one. Needs a destination decision from the client — rebooking/loyalty entry, or drop the CTA on `/here` entirely.

---

## 1. What is actually live today (audit)

Measured, not assumed. Use this as the before-state.

### Navigation

| | `/de` (home) | `/de/hier` |
|---|---|---|
| Row 1 links | Zimmer · Meetings · Essen & Trinken · Happenings · Nachbarschaft — `#6B6762` grey | **identical links, identical hrefs, identical grey** |
| Row 2 bridge | "Schon im Haus? **ENTER**" → `/de/hier`, `#B87A2E`, 1px border | "Noch nicht hier? **BLEIB**" → `/de`, `#2C6B7A`, 1px border |
| Row 2 sub-links | Was ist los · So kommst du hin · Die Nachbarschaft · Galerie · Wallride — all → `/de/hier/*`, `#B87A2E` | **same five links, same `/de/hier/*` hrefs**, but `#555` grey, not teal |
| CTA | Jetzt buchen → `/book` | Komm wieder → `/book` |

Three problems fall out of that table:

- The home page's second row is a set of **guest-hub deep links wearing amber** — it invites a visitor who hasn't arrived yet into the in-house hub.
- `/here`'s row 1 is the unmodified outside nav. A guest standing in the building is offered Zimmer / Meetings / Nachbarschaft as their primary navigation.
- The accent is inconsistent *within* `/here`: the bridge is teal, its five siblings are `#555`. On home, bridge and siblings are both amber. The contexts aren't distinguished by the rule the design system claims.

### Layout proportions at 1440

Home already honours the 2:1 rule in three of five content bands:

| Section | Grid | 2:1? |
|---|---|---|
| Hero | `475px / 950px` | ✅ 1:2 |
| Sleep & Relax | `879px / 440px` | ✅ 2:1 |
| Tagen & Arbeiten | `30% / 70%` and `45% / 55%` | ❌ outlier |
| Happenings | 4 × 301px card grid | n/a — card row |
| Essen & Trinken | `440px / 879px` | ✅ 1:2 |
| Nachbarschaft map | full-bleed 1425 × 630 | n/a — full-bleed |

`/here` honours it nowhere. `.here-grid` computes to **4 × 296px equal columns** inside a 1280px shell, with `here-full` items spanning all four. Every content block is a bordered box; there is effectively no photography below the hero. The hero is 280px tall against home's 594px.

### Map sections

| | Home | `/here` |
|---|---|---|
| Treatment | Full-bleed section, 1425 × 630 | Bordered `article`, 1232 × 330 |
| Heading | "Du bist im richtigen Teil Berlins" | none |
| CTA | "Nachbarschaft entdecken" → `/de/nachbarschaft` | none |
| Info card | Floating `PlaceInfoCard`, 268px, photo + Commons credit + walking time | not surfaced |
| Chrome | neutral | green `#4A7A68` border, `#F0F6F0` fill |
| Side panel / list | **not built** — confirms `HotelBerlin_HomepageMap_StylingList_Addendum.md` §0.4 | not built |

---

## 2. Part A — Context accent swap

Implement as a **context-level wrapper on the route group**, exactly the mechanism `DESIGN.md` §1 already describes for the `/here` swap and the Meet & Work exception. Not per-component overrides. One CSS custom property flips; every component reads it.

```css
/* outside context — default */
:root,
[data-context="outside"] {
  --ctx-accent:        #216A95; /* navy — see F1 */
  --ctx-accent-text:   #216A95; /* 5.9:1 on white, AA pass */
  --ctx-accent-quiet:  #EEF4F8;
}

/* guest hub */
[data-context="here"] {
  --ctx-accent:        #B87A2E; /* borders, rules, icon strokes, large type */
  --ctx-accent-text:   #9A6420; /* small type only — see F2 */
  --ctx-accent-quiet:  #FBF3E8;
}
```

- Set `data-context` once, on the layout element for each route group.
- **Every** component that currently hardcodes `#B87A2E`, `#2C6B7A`, `enter-btn--teal`, `book-now-btn--teal`, `sweep-cta--nav-amber` etc. must be converted to read `var(--ctx-accent)` / `var(--ctx-accent-text)`. The variant class names (`--teal`, `--nav-amber`) become misleading the moment the swap lands — rename them to `--ctx` rather than leaving a teal-named class rendering amber.
- **Category tokens are untouched.** `--cat-art`, `--cat-sport`, `--cat-music`, `--cat-food`, `--cat-nbhd`, `--cat-partner` stay CMS-driven per `DESIGN.md` §1. They must not be aliased to `--ctx-accent` under any circumstance — that is what F1 is guarding against.
- **Map pin palette is untouched.** The v2 pin table in `HotelBerlin_HomepageMap_StylingList_Addendum.md` §1 is independent of context accent. A pin does not change colour between `/de` and `/here`.

### Consequence for Meet & Work

`DESIGN.md` §1 carves out `/meetings` as a scoped teal exception inside an amber outside-context. Under the swap that carve-out no longer describes anything coherent — teal is no longer the `/here` accent, and the outside accent is navy. **Decide explicitly:** either `/meetings` folds back into the outside default (recommended — the exception existed only to differentiate it from amber), or it keeps teal as a deliberate third temperature and `DESIGN.md` says so in one sentence. Do not leave it as-is.

### Consequence for the `/here` hero

The `/here` hero is currently a flat teal block. Under the swap it needs a new ground. Do **not** simply repaint it `#B87A2E` full-bleed — a 280px amber slab at 3.58:1 is the worst possible outcome of this change. See §4 for the replacement treatment.

---

## 3. Part B — Navigation reconciliation

### Target model

Two rows on both pages. Row 1 = where you are. Row 2 = the door to the other place, and nothing else.

**`/de` (outside — you have not arrived yet)**

```
Row 1  [Hotel Berlin, Berlin]   Zimmer | Meetings | Essen & Trinken | Happenings | Nachbarschaft      DE|EN   [Jetzt buchen]
Row 2  Schon im Haus?  [ENTER →]
```

**`/de/hier` (inside — you are in the building)**

```
Row 1  [Hotel Berlin, Berlin]   Was ist los | So kommst du hin | Die Nachbarschaft | Galerie | Wallride   DE|EN   [Komm wieder]
Row 2  Noch nicht hier?  [BLEIB →]
```

### Rules

- **Wordmark is invariant.** "Hotel Berlin, Berlin" in full on both, per `DESIGN.md` §2 — never shortened, never swapped for "The hotel" (that instruction in `DESIGN.md` §4 is superseded by this brief; the bridge now does that job).
- **Row 1 links are context-local.** On `/de` all five point at outside routes. On `/de/hier` all five point at `/de/hier/*`. No cross-context links in row 1. Row 1 link colour stays neutral `#6B6762` on both — row 1 is not where the accent lives.
- **Row 2 holds the bridge only.** Prefix label + bordered button + arrow. The five sub-links currently in row 2 on both pages are **removed**. On `/de` they move nowhere (they were `/here` links a prospect shouldn't be offered); on `/de/hier` they are promoted to row 1.
- **The bridge is the one place the context accent appears in the header.** Prefix label and button border/text both use `var(--ctx-accent-text)` at 11–12px — which is precisely why F2's `#9A6420` matters.
- **Bridge copy comes from the `hotel` global**, per `HotelBerlin_HereHero_Addendum.md` §1 (`bridgeNav.labelEN` / `labelDE`). Add the mirrored outside-side pair in the same group rather than hardcoding "Schon im Haus? ENTER →":

```typescript
{
  name: 'bridgeNav',
  label: 'Bridge navigation',
  type: 'group',
  fields: [
    { name: 'toHereLabelEN',  type: 'text', defaultValue: 'Already in the house? ENTER →' },
    { name: 'toHereLabelDE',  type: 'text', defaultValue: 'Schon im Haus? ENTER →' },
    { name: 'toStayLabelEN',  type: 'text', defaultValue: 'Not here yet? STAY →' },
    { name: 'toStayLabelDE',  type: 'text', defaultValue: 'Noch nicht hier? BLEIB →' },
  ],
}
```

- **Row 2 background.** With only one item in it, the current full-width `#F3F3F3` bar reads as empty. Either drop the bar background and let the bridge sit on the page ground, or keep the bar and right-align the language toggle into it. Pick one and apply it identically to both contexts — the two pages must not differ in bar treatment, only in accent and copy.
- **Mobile.** The existing mobile disclosure (`nav-secondary flex flex-col`) currently duplicates the full second-row link set. Under this model it collapses to row 1's five links plus the single bridge. Simpler, not more complex — reuse the existing component, remove the duplicated set.
- **CTA.** `Jetzt buchen` / `Komm wieder` keep their position and both use the neutral Ink treatment they have now (not the context accent — a booking CTA competing with the bridge for the same colour weakens both). Destination of `Komm wieder` is open, see F5.

---

## 4. Part C — `/here` restructured into 2:1 photo bands

### The principle

Home reads as alternating full-width editorial bands: photo two-thirds, text one-third, side flipping band to band. `/here` should read the same way, with one carve-out: **a guest scanning for the WiFi password must not have to scroll past a hero photo to get it.** Utility keeps a compact treatment; everything else becomes a band.

### Container

`/here` currently sits in `max-w-7xl` (1280px) while home sections run to `site-shell` at 1425px full-bleed. **Move `/here` onto the same `site-shell` / `px-section-x` system as home.** This single change does more for "same site" than any colour work.

### Section-by-section target

| Section | Today | Target |
|---|---|---|
| Hero | 280px flat colour block | **1:2 band** — text panel left (day label, greeting, live-event subline, address), photo right. Matches `HomeHero`'s `1fr 2fr`. Photo is the live hotel interior shot, not a colour slab. Live clock overlays the photo top-right per `HereHero_Addendum` §4. |
| Dein Aufenthalt | `stay-info-card`, 688px bordered box | **Keep compact.** This is the WiFi/check-out/parking card — it stays a scannable bordered card, promoted to the top of the content flow directly under the hero. No photo. |
| Tonight | hero card + 2 compact cards | **2:1 band** — the FKKB spotlight becomes a photo band (photo left 2/3, event text right 1/3); the two venue compact cards drop below it as a 2-up row. |
| Gut zu wissen | full-width bordered box, 4 sub-columns | **Keep compact.** Practical A–Z. No photo. |
| Kunst im Haus | 4-up card grid, 1401px tall | **1:2 band per floor**, stacked — or one band for the current show plus a 4-up thumbnail row for the floor locations. This section is the strongest photography opportunity on the page; it should not stay a text grid. |
| Die Nachbarschaft | 330px bordered map article | **Full-bleed map section**, see §5. |
| Im Keller | 2 compact cards + dashed placeholder | **2:1 band** for KTTK and Wallride each (both have real subject matter — tables, halfpipe, skate history). Fingerboard placeholder stays a dashed box until the hotel team supplies content. |
| Häufig gefragt | bordered box | **Keep compact.** Accordion. No photo. |

### Band component

Build **one** `EditorialBand` component and use it in both contexts rather than forking a `/here` variant:

```
<EditorialBand
  ratio="2:1" | "1:2"        // photo-left or photo-right
  image={...}                 // required — a band with no image is a card, use the card
  eyebrow={...}               // section label, Archivo 10.5px uppercase 0.14em
  heading={...}
  body={...}
  cta={...}                   // Line-CTA
/>
```

- Alternate `ratio` down the page so photo side flips band to band, as home does.
- Rules and section labels use `var(--ctx-accent)` — this is where the amber shows up on `/here`, in thin rules and small caps, not in slabs.
- Reuse home's existing section-label and Line-CTA treatments verbatim. Do not author new ones.
- Retire `.here-grid` for content sections. Keep it (or a simple 2-up flex) only for the utility cards and the compact venue rows.

### Image manifest — blocking

The restructure cannot ship without photography. Required, none of which exists in the current `/here` build:

| Band | Image needed | Status |
|---|---|---|
| Hero | Hotel interior / lobby, landscape, ≥1600px | Likely reusable from `heroSlides` |
| Tonight (FKKB) | Current show installation shot | Check FKKB gallery assets |
| Kunst im Haus | One per floor location — atrium, and the three mural locations | **Missing.** Also blocked on the `locationInBuilding` field per BuildStatus v1 |
| Im Keller — KTTK | Tables in use, basement B2 | **Missing** |
| Im Keller — Wallride | Halfpipe | Skateboardmuseum Berlin may have licensed stock |

Sourcing follows `HotelBerlin_HomepageMap_StylingList_Addendum.md` §4: `picsum.photos` placeholders for layout testing only, never ad-hoc image search for production, `imageCredit` rendered wherever `creditText` is populated.

---

## 5. Part D — Map parity and the two map pages

### Same component, both pages

The map section renders **identically** on `/de` and `/de/hier`: full-bleed, same height band, same heading + Line-CTA structure, same `PlaceInfoCard` popup, same v2 pin palette. The green `#4A7A68` border and `#F0F6F0` fill on the `/here` instance are removed — that chrome exists nowhere else and is a third colour temperature on a page that is trying to have one.

Differences between the two instances are **content framing and CTA destination only**, driven by a single prop.

### The framing flip

Same underlying `neighbourhoodPlaces` + endorsement data, two readings of it:

| | Home — *places recommended by people* | `/here` — *people recommending places* |
|---|---|---|
| Index | Place-first | Person-first |
| Heading | "Du bist im richtigen Teil Berlins" | e.g. "Wem die Nachbarschaft gehört" — copy TBC with client |
| `PlaceInfoCard` | Photo of the place → place name → category → walking time → *"empfohlen von Jan H."* as a footer line | Endorser portrait + name + who they are → *"empfiehlt:"* → the place, with photo secondary |
| Pin cluster label | "Schloss Charlottenburg — 2 Empfehlungen" (place, count) | "Jan H. — 3 Orte" (person, count) |
| CTA | "Nachbarschaft entdecken →" | "Die Empfehlenden →" or similar — copy TBC |

Implement as `framing="place" | "endorser"` on the existing map section component. **Not** two components — the whole point is that a guest recognises it as the same map they saw before they arrived, read from the other end.

The multi-endorser pin work in `claude/HotelBerlin_MapSection_MultiEndorserPins_BuildBrief.md` already models the endorser relation; check whether the person-first index needs a new resolver or just a different grouping of the existing one before speccing data work.

### Dedicated map pages

| Context | Route | Index | Status |
|---|---|---|---|
| Home | `/de/nachbarschaft` | Places, filterable by category | **Exists**, linked and live |
| `/here` | `/de/hier/explore` | Endorsers, each expanding to their places | **Does not exist** — part of the F4 blocker |

Both pages carry their context's accent via the `data-context` wrapper. Neither reimplements the map — both embed the same component with the matching `framing` prop and a fuller side panel.

**Note:** the side panel / place list specced in `HomepageMapTeaser_BuildBrief.md` §2 and §4 has never shipped on either page (confirmed in this audit). It is out of scope for this brief, but `/de/hier/explore` will need it — coordinate with `HotelBerlin_HomepageMap_StylingList_Addendum.md` §3 rather than building a second, different list.

---

## 6. Sequencing

The nav swap is the last step, not the first. Shipping it early exposes five 404s as `/here`'s primary navigation (F4).

1. **Token layer** — introduce `--ctx-accent` / `--ctx-accent-text` / `--ctx-accent-quiet`, add `--amber-text: #9A6420`, resolve the green conflict (F3). Convert every hardcoded accent hex to a token read. No visual change yet if the outside default stays as-is on this commit.
2. **Flip the contexts** — set `data-context` on both route groups, swap the two values. Rename `--teal` / `--nav-amber` variant classes to `--ctx`.
3. **Stub the five `/here` deep pages** — `events`, `getting-around`, `explore`, `gallery`, `wallride` (plus `art`). Real routes, real headings, minimal content. This unblocks F4.
4. **`/here` container + hero** — move onto `site-shell`, rebuild the hero as a 1:2 band.
5. **`EditorialBand` component** + convert Tonight, Kunst im Haus, Im Keller. Placeholder imagery permitted at this step, real photography before launch.
6. **Map parity** — remove `/here`'s green chrome, promote to full-bleed, add `framing` prop, wire the endorser reading.
7. **Nav swap** — row 1 context-local, row 2 bridge-only, both contexts, plus the mobile disclosure simplification.
8. **`DESIGN.md` update** — §1 accent assignment inverted, §4 navigation rewritten, F1/F2/F3 resolutions recorded, Meet & Work exception decided.
9. **Contrast pass** — every accent-on-ground pairing on both pages, both contexts. The amber text/border split is the specific thing to verify.

---

## 7. Definition of done

**Accent**
- [ ] `--ctx-accent` / `--ctx-accent-text` / `--ctx-accent-quiet` defined; `data-context` set on both route groups
- [ ] Zero hardcoded `#B87A2E` / `#2C6B7A` remaining in nav, CTA, badge or callout components
- [ ] `--amber-text: #9A6420` in use for all amber type below large-text threshold; `#B87A2E` restricted to borders/rules/icons/large type
- [ ] No white text on `#F79B2E` anywhere
- [ ] Category tokens unchanged and not aliased to the context accent
- [ ] Map pin palette unchanged between contexts
- [ ] Variant class names no longer contradict the colour they render
- [ ] Green conflict (F3) resolved to one value, recorded in `DESIGN.md`
- [ ] Meet & Work teal exception explicitly kept or folded back, recorded in `DESIGN.md`

**Navigation**
- [ ] Row 1 on `/de` links only to outside routes; row 1 on `/de/hier` links only to `/de/hier/*`
- [ ] Row 2 on both pages contains the bridge and nothing else
- [ ] Wordmark reads "Hotel Berlin, Berlin" in full on both contexts
- [ ] Bridge copy reads from `hotel.bridgeNav`, all four locale/direction values, no hardcoded strings
- [ ] Bridge is the only accent-coloured element in the header; row 1 links neutral on both
- [ ] Row 2 bar treatment identical between contexts
- [ ] Mobile disclosure carries row 1 + bridge, no duplicated link set
- [ ] All five `/here` row-1 destinations resolve — no 404 in primary nav (F4)
- [ ] `Komm wieder` destination decided (F5)

**Layout**
- [ ] `/here` renders in the same `site-shell` container system as home
- [ ] `EditorialBand` is one shared component used by both contexts, not a `/here` fork
- [ ] Hero, Tonight, Kunst im Haus, Im Keller are 2:1 / 1:2 bands with alternating photo side
- [ ] Stay Info, Gut zu wissen, FAQ remain compact cards — no hero photography in front of the WiFi password
- [ ] `.here-grid` no longer governs content sections
- [ ] Every band has a real image or a clearly-marked placeholder; image manifest gaps logged, not silently filled by image search
- [ ] `imageCredit` renders wherever `creditText` is populated

**Map**
- [ ] Map section is visually identical on both pages — full-bleed, same height, same heading + CTA structure
- [ ] `/here` map's `#4A7A68` border and `#F0F6F0` fill removed
- [ ] `framing="place" | "endorser"` prop implemented on one component, not forked
- [ ] `/de/nachbarschaft` and `/de/hier/explore` both exist and both embed the shared component

---

## 8. Open items — do not resolve without client or hotel input

1. **F1** — home context accent: navy `#216A95` (recommended) vs teal `#2C6B7A`, and whether `--cat-sport` moves off amber
2. **F5** — `Komm wieder` destination: rebooking, loyalty, or drop the CTA on `/here`
3. Meet & Work: fold `/meetings` back into the outside default, or keep teal as a third temperature
4. `/here` map heading and CTA copy for the endorser framing — both TBC
5. Photography for Kunst im Haus floor locations, KTTK basement, Wallride halfpipe — no assets exist
6. `locationInBuilding` field on `artworks`, still outstanding from BuildStatus v1, still blocking the Kunst im Haus bands
7. Fingerboard ramps — still blocked on hotel team content
8. Whether row 2 keeps its `#F3F3F3` bar once it holds a single item
