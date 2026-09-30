# Section Background Rhythm — Build Brief

**Status:** Ready for Cursor
**Scope:** Home (`/`) and guest hub (`/here`) — light-section backgrounds only. No dark section, no copy, no layout changes.
**Reference comp:** `HotelBerlin_SectionBackground_Comp.html` (saved in project docs) — "Thematic" toggle state is the chosen direction.

---

## 1. Context

Every content section on both pages currently sits on one of three backgrounds: a dark hero/accent color, a dark footer, or plain white. The dark sections read fine, but the white sections in between make the page feel like a hard flip — dark → white → dark → white — with no rhythm across the light stretch.

Client ask: make the backgrounds between sections "a bit more colorful," alternating, but staying light. Two hard constraints from the discussion:

- Never introduce a new dark section, and never go dark → light in a way that isn't already there today. Only the currently-white sections change.
- The new colors have to come from the existing brand palette (`DESIGN.md` / `tokens.json`), not a new one.

The approach: a small family of light tints, each the same ~10% mix of a brand color into white that already produced `--teal-light` (`#EBF3F5`). These read as one system with what's already documented rather than a new palette, and each section is assigned the tint its content already owns via the category tokens (events → coral, dining → gold, neighbourhood → green), so the color isn't arbitrary — it reinforces what the section is about.

---

## 2. Token additions (`tokens.json` / `DESIGN.md` §1 Color tokens)

Two tokens already exist and are reused as-is: `--bg-subtle` (`#F4F6F7`) and `--teal-light` (`#EBF3F5`). Four are new:

| Token | Hex | Source | Usage |
|---|---|---|---|
| `--bg-subtle` | `#F4F6F7` | existing | neutral / calm baseline |
| `--amber-light` | `#FEF5EA` | new — ~10% `--amber` (`#F79B2E`) into white | sections tied to the main-site accent / sport category |
| `--coral-light` | `#FEEFEF` | new — ~10% `--coral` (`#F95D62`) into white | sections tied to events / music category |
| `--gold-light` | `#F9F2EA` | new — ~10% `--cat-food` (`#B87A2E`) into white | sections tied to dining / food category |
| `--green-light` | `#E7EAE6` | new — ~10–12% `--green` (`#56674F`) into white | sections tied to neighbourhood category |
| `--teal-light` | `#EBF3F5` | existing | `/here` accent-tinted sections |

Add the four new tokens next to the existing `--teal-light` entry in `DESIGN.md` §1 and `tokens.json`, with the same "derived — what components actually reference" framing as the rest of that table. `--forest` stays unassigned, untouched by this brief.

---

## 3. Section → background mapping (chosen: Thematic)

### Home (`/`)

| # | Section | Background | Change |
|---|---|---|---|
| 1 | Hero | dark (unchanged) | none |
| 2 | Sleep & Relax (Rooms teaser) | `--bg-subtle` `#F4F6F7` | white → neutral |
| 3 | Tagen & Arbeiten (Meetings) | dark (unchanged) | none |
| 4 | Happenings (Events) | `--coral-light` `#FEEFEF` | white → coral |
| 5 | Der Ort zum Essen, Spielen und Verweilen (Lütze) | `--gold-light` `#F9F2EA` | white → gold |
| 6 | Du bist im richtigen Teil Berlins (Neighbourhood / map) | `--green-light` `#E7EAE6` | white → green |
| 7 | Gute Fragen (FAQ) | `--amber-light` `#FEF5EA` | white → amber |
| 8 | Footer | dark (unchanged) | none |

Home closes on amber — the main site's primary accent — same logic as `/here` closing on teal below.

### Guest hub (`/here`)

| # | Section | Background | Change |
|---|---|---|---|
| 1 | Guten Morgen (hero widget) | unchanged — already tinted | none |
| 2 | Essen & Trinken | `--gold-light` `#F9F2EA` | white → gold |
| 3 | Im Haus (Amenities) | `--amber-light` `#FEF5EA` | white → amber |
| 4 | Wem die Nachbarschaft gehört | `--green-light` `#E7EAE6` | white → green |
| 5 | Häufig gefragt (FAQ) | `--teal-light` `#EBF3F5` | white → teal |
| 6 | Footer | dark (unchanged) | none |

Rule for both pages: no two adjacent sections share a background token, and no section drops back to plain white as a full-bleed background — white is now reserved for cards sitting on top of a tint (see §5).

---

## 4. Component contract

Rather than hand-setting a background color per section component, add a `background` prop to whatever shared section/container wrapper the codebase already uses (or introduce one if sections aren't currently wrapped in one) so the rhythm above is declared once, per page, in one place:

```ts
type SectionBackground =
  | 'dark-hero'       // hero — unchanged
  | 'dark-accent'      // Tagen & Arbeiten — unchanged
  | 'dark-footer'      // footer — unchanged
  | 'here-tan'         // /here Guten Morgen widget — unchanged, already tinted
  | 'surface'          // white — cards only, no longer used as a section bg
  | 'neutral-light'    // --bg-subtle    #F4F6F7
  | 'amber-light'      // --amber-light  #FEF5EA
  | 'coral-light'      // --coral-light  #FEEFEF
  | 'gold-light'       // --gold-light   #F9F2EA
  | 'green-light'      // --green-light  #E7EAE6
  | 'teal-light';      // --teal-light   #EBF3F5

interface SectionShellProps {
  background: SectionBackground;
  children: React.ReactNode;
  className?: string;
}
```

Then a single const map per page gives the resolver a home and makes the rhythm auditable at a glance, e.g.:

```ts
// app/(main)/page.tsx — or wherever the home sections are composed
const HOME_SECTION_BG: Record<HomeSectionId, SectionBackground> = {
  hero: 'dark-hero',
  rooms: 'neutral-light',
  meetings: 'dark-accent',
  events: 'coral-light',
  dining: 'gold-light',
  neighbourhood: 'green-light',
  faq: 'amber-light',
  footer: 'dark-footer',
};
```

`background` should have no default of `'surface'` silently applied to a listed section — every section in the map above gets an explicit value, so a future new section between two of these doesn't quietly inherit white and break the rhythm without a decision being made.

---

## 5. Definition of done

- [ ] Four new tokens (`--amber-light`, `--coral-light`, `--gold-light`, `--green-light`) added to `tokens.json` and `DESIGN.md` §1, alongside the existing `--bg-subtle` / `--teal-light`
- [ ] `SectionShell` (or the codebase's actual equivalent) takes a `background` prop per the contract in §4
- [ ] Home sections carry the backgrounds in §3, /here sections carry the backgrounds in §3
- [ ] Dark sections (Hero, Tagen & Arbeiten, `/here` Guten-Morgen widget, both footers) confirmed pixel-unchanged
- [ ] No two adjacent sections share a background token on either page
- [ ] Cards/photos sitting inside a tinted section keep a white card surface — checked for card-on-tint contrast, not just the section rhythm
- [ ] Body text (`--body-text` `#2A3540`) and dim text (`--dim` `#6B7C8D`) checked against every new tint, especially any badge or label sitting directly on the tint rather than on a white card
- [ ] EN and DE pages both checked
- [ ] Diffed against `hotel-berlin.bernardbolter.com` (live reference) before calling it done

---

## 6. Open items — do not silently resolve

- **Component names above are placeholders.** This brief was written without repo access this session, so "SectionShell" and the section ids in §4 are illustrative, not literal. Cursor should map the contract onto whatever the real section components and page-composition file are actually called.
- **Green Light (`#E7EAE6`) is the most desaturated of the four new tints**, because Forest Green itself is a muted, grayish hue — at a 10% mix it may read as barely-different-from-neutral once built. Flag to Bernard/client in review; if it's too subtle, push it to a 14–16% mix (~`#DEE2DE`) rather than switching to a different token.
- **Rooms teaser ("Sleep & Relax") was given neutral, not a color**, since it's the calm section right after the dark hero and doesn't have as strong a category-token association as Events/Dining/Neighbourhood. Worth confirming this reads right rather than flat.
- **The "Sequential" alternative shown in the comp (mechanical rotation, ignoring content) was considered and not chosen** — noting it here so it isn't forgotten if Thematic doesn't land in client review.

---

*Comp for visual reference: `HotelBerlin_SectionBackground_Comp.html`, saved in project docs.*
