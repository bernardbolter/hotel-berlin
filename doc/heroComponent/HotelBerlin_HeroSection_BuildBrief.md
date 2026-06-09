# Hotel Berlin, Berlin — Homepage Hero Section Build Brief
*For Cursor / Claude Opus*
*Component: `<HomeHero>`*
*Stack: Next.js 15 · Tailwind CSS · next-intl v4*

---

## What this is

The homepage hero section. Full-width, fixed height relative to viewport. Two visual zones — a teal background panel on the left carrying the headline, body copy, and satellite map; a rotating Ken Burns photo on the right. Both zones are unified by a single 1px amber border box that overlaps the photo and frames the content.

This is a **server component** except for the `<KenBurnsSlider>` which is a client component (`'use client'`) due to the rotation interval and animation state.

---

## Component file

```
components/
  home/
    HomeHero.tsx          ← main section (server component)
    KenBurnsSlider.tsx    ← image rotator (client component)
    MiniSatellite.tsx     ← satellite map panel (server component)
```

---

## Layout — desktop

The section background is solid teal `#2C6B7A` spanning full width. The photo comes in from the right with a top and bottom margin, sitting on top of the teal background. The amber border box overlaps the photo. The teal text box and satellite box are inset children of the amber box.

### Layer order (back to front)

```
1. Section background          — solid teal #2C6B7A, full width/height
2. KenBurnsSlider              — photo, positioned right, margin top + bottom
3. Amber border box            — 1px solid #B87A2E, #FBFBFB at 10% opacity fill,
                                 overlaps photo, independent positioning
4. Teal text box               — solid #2C6B7A, inset 1px from amber box top-left,
                                 fills from top-left corner downward
5. MiniSatellite box           — solid #2C6B7A, inset 1px from amber box bottom-left,
                                 fills from bottom-left corner upward
6. Slide caption               — bottom-right inside amber box, over the photo
7. SlideDotsNav                — bottom-right of photo area, outside amber box
```

### Sizing logic

The photo is the flexible element. The teal text box and satellite box hold their size — the photo expands and contracts around them on resize. The amber box is the pivot point that links them.

```
┌─────────────────────────────────────────────────────┐  ← section bg: full teal
│                                                     │
│  ┌──────────────────────────┐                       │  ← amber border box (1px #B87A2E)
│  │┌────────────┐            │  ╔═══════════════════╗│  ← photo (right, margin t/b)
│  ││            │            │  ║                   ║│
│  ││ Teal text  │   (photo   │  ║   Ken Burns       ║│
│  ││ box        │   shows    │  ║   photo           ║│
│  ││            │   through  │  ║                   ║│
│  │├────────────┤   #FBFBFB  │  ║                   ║│
│  ││            │   10% bg)  │  ║      LÜTZE ·      ║│
│  ││ Satellite  │            │  ║      GROUND FLOOR ║│
│  ││ box        │            │  ╚═══════════════════╝│
│  │└────────────┘            │                    ●●●│  ← SlideDotsNav
│  └──────────────────────────┘                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Key alignment rules

- Amber box top-left corner = teal text box top-left corner (inset 1px)
- Amber box bottom-left corner = satellite box bottom-left corner (inset 1px)
- Teal text box and satellite box share the same left edge and width
- The amber box right edge terminates before the photo right edge — the photo bleeds beyond it to the right
- Photo has a fixed top and bottom margin from the section edges (suggest `32px` each)
- `SlideDotsNav` sits bottom-right of the photo, outside the amber box, vertically centred on the photo's bottom margin zone

### Responsive behaviour — desktop only for now

Mobile layout is not specified yet — do not attempt to define mobile breakpoints. Build for desktop (`lg:` and above). At narrower viewports the layout may break — that is acceptable at this stage and will be addressed in a separate brief.

The photo is the flex element. As viewport width decreases the photo narrows. The teal text box and satellite box do not reflow. A `min-width` on the section (suggest `900px`) prevents the layout from collapsing below a readable state.

---

## Section height

Fixed height based on the teal text box content + satellite box height + internal padding. Do **not** use `100vh`. The section height is driven by content, not viewport — the photo uses `height: 100%` with `object-fit: cover` to fill whatever height the content establishes.

Suggested internal padding inside the amber box: `40px` top and bottom, `48px` left.

---

## Teal text box

Solid `#2C6B7A`. Sits inset 1px from the amber box top-left. Contains:

```
[headline]
[body copy]
[Book Now CTA]
```

### Headline

```
Let's start your
Berlin story
```

Lora · display weight · white `#FFFFFF` · ~48px desktop. Line breaks as shown — two lines. This is the page `<h1>`.

German:
```
Deine Berliner
Geschichte beginnt hier
```

### Body copy

```
Hotel Berlin, Berlin is where travellers,
locals, and ideas naturally meet.

Sunlight fills the courtyard,
artists make real work,
and the hum of Berlin is never far away.
```

Lora · regular · white `#FFFFFF` · ~16px · line-height 1.6. Slight opacity reduction — `rgba(255,255,255,0.85)` — so it reads as secondary to the headline without disappearing.

German:
```
Das Hotel Berlin, Berlin ist der Ort, an dem
Reisende, Einheimische und Ideen aufeinandertreffen.

Die Sonne füllt den Innenhof,
Künstler schaffen echte Werke,
und das Summen Berlins ist nie weit entfernt.
```

### Book Now CTA

Amber `#B87A2E` background · white text · Archivo Narrow · no border radius (consistent with system — `border-radius: 0`) · padding `12px 28px`.

Label: "Book Now" / "Jetzt buchen"

Links to Radisson booking URL — use `#` as placeholder for now.

```tsx
<a
  href="#"
  className="..."
  target="_blank"
  rel="noopener noreferrer"
>
  Book Now
  <span className="sr-only"> at Hotel Berlin, Berlin (opens booking page)</span>
</a>
```

---

## MiniSatellite box

Solid `#2C6B7A`. Sits inset 1px from the amber box bottom-left. Same width as the teal text box above it. Contains the satellite image with the directions overlay.

### Satellite image

Static JPG served from `/public/images/hotel-berlin-berlin-luetzowplatz-satellite.jpg`.

- Display size: fills the satellite box width · fixed height (suggest `200px`)
- `object-fit: cover` · `object-position: center`
- No Next.js `<Image>` — use a regular `<img>` tag, the file is already an optimised `@2x` JPG
- The image is a link — the entire image is wrapped in `<a>` pointing to Google Maps

```tsx
<a
  href="https://www.google.com/maps/dir/?api=1&destination=Hotel+Berlin+Berlin&destination_place_id=ChIJYcbvb-9RqEcRhD94S5F0Nw0"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Get directions to Hotel Berlin, Berlin at Lützowplatz 17, Tiergarten (opens Google Maps)"
  className="relative block overflow-hidden"
>
  <img
    src="/images/hotel-berlin-berlin-luetzowplatz-satellite.jpg"
    alt="Aerial satellite view of Hotel Berlin, Berlin at Lützowplatz 17, Tiergarten"
    width={800}
    height={600}
    className="w-full h-[200px] object-cover object-center"
  />
  {/* directions overlay — see below */}
</a>
```

### Directions overlay

Sits over the bottom-left of the satellite image. A dark pill `rgba(0,0,0,0.55)` containing the address and directions link text.

**Desktop behaviour:** pill shows icon only by default. On hover the pill expands to reveal full text. CSS `max-width` transition — no JS needed.

**Always-visible (persistent) state:**
```
↗
```
Arrow icon only. Small dark pill, bottom-left of the image.

**Hover-expanded state:**
```
↗  Lützowplatz 17, Tiergarten · Get directions
```

Implementation:

```tsx
<div className="
  absolute bottom-3 left-3
  flex items-center gap-2
  bg-black/55 text-white
  px-3 py-1.5
  overflow-hidden whitespace-nowrap
  max-w-[2rem] hover:max-w-[20rem]
  transition-[max-width] duration-300 ease-in-out
  cursor-pointer
">
  <span aria-hidden="true">↗</span>
  <span className="text-xs" style={{ fontFamily: 'Archivo Narrow, sans-serif', letterSpacing: '0.04em' }}>
    Lützowplatz 17, Tiergarten · Get directions
  </span>
</div>
```

The `<a>` wrapper on the whole image means the entire tile is clickable — the pill is a visual affordance only, not a separate link.

### Address line below satellite image

Below the image, inside the satellite box, in the teal area:

```
Lützowplatz 17, Tiergarten
```

Archivo Narrow · 12px · white `rgba(255,255,255,0.7)` · padding `8px 12px`.

This is the always-visible text label — it exists independently of the hover state on the image so the address is readable even without interaction.

---

## KenBurnsSlider

Client component. Rotates through 4 slides. Each slide has an image URL, alt text, a caption string (EN + DE), and a Ken Burns origin point.

### Slide data — hardcoded for now

```typescript
// components/home/KenBurnsSlider.tsx

type HeroSlide = {
  src: string
  alt: string
  captionEN: string
  captionDE: string
  kbOrigin: 'bottom-left' | 'top-right' | 'top-left' | 'bottom-right'
}

const slides: HeroSlide[] = [
  {
    src: 'https://www.hotel-berlin.de/wp-content/uploads/2023/03/hotel-berlin-berlin-courtyard.jpg',
    alt: 'The inner courtyard of Hotel Berlin, Berlin — Lützowplatz 17, Tiergarten, with lush greenery and terrace seating',
    captionEN: 'COURTYARD · TIERGARTEN',
    captionDE: 'INNENHOF · TIERGARTEN',
    kbOrigin: 'bottom-left',
  },
  {
    src: 'https://www.hotel-berlin.de/wp-content/uploads/2023/03/luetze-bar-restaurant-hotel-berlin.jpg',
    alt: 'Lütze bar and restaurant at Hotel Berlin, Berlin — warm interior with terracotta seating and tropical wallpaper',
    captionEN: 'LÜTZE · GROUND FLOOR',
    captionDE: 'LÜTZE · ERDGESCHOSS',
    kbOrigin: 'top-right',
  },
  {
    src: 'https://www.hotel-berlin.de/wp-content/uploads/2023/03/hotel-berlin-berlin-room.jpg',
    alt: 'A guest room at Hotel Berlin, Berlin — designed interior with artwork on the walls',
    captionEN: 'ROOMS · ON THE WALLS',
    captionDE: 'ZIMMER · ON THE WALLS',
    kbOrigin: 'top-left',
  },
  {
    src: 'https://www.hotel-berlin.de/wp-content/uploads/2023/03/fkkb-gallery-hotel-berlin.jpg',
    alt: 'FKKB gallery at Hotel Berlin, Berlin — exhibition space with large-scale contemporary artworks',
    captionEN: 'FKKB · GALLERY',
    captionDE: 'FKKB · GALERIE',
    kbOrigin: 'bottom-right',
  },
]
```

**Note:** These image URLs are placeholders pointing to the existing hotel-berlin.de site. They may 404 — that is fine for now. Replace with actual asset paths once photos are in `/public/images/`. The slide data structure is what matters.

### Rotation timing

- Each slide visible for `7000ms`
- Crossfade transition: `1500ms` ease-in-out opacity
- Ken Burns animation: `20s` CSS keyframe, `ease-in-out`, `alternate` — one direction per slide based on `kbOrigin`

### Ken Burns keyframes — one per origin

```css
@keyframes kb-bottom-left {
  from { transform: scale(1) translate(0, 0); }
  to   { transform: scale(1.08) translate(2%, -1%); }
}
@keyframes kb-top-right {
  from { transform: scale(1) translate(0, 0); }
  to   { transform: scale(1.08) translate(-2%, 1%); }
}
@keyframes kb-top-left {
  from { transform: scale(1) translate(0, 0); }
  to   { transform: scale(1.08) translate(2%, 1%); }
}
@keyframes kb-bottom-right {
  from { transform: scale(1) translate(0, 0); }
  to   { transform: scale(1.08) translate(-2%, -1%); }
}
```

Apply the matching keyframe to each slide's `<img>` based on `kbOrigin`.

### `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  .kb-image { animation: none; }
}
```

Also stop the slide rotation interval — show slide 0 only, static.

### Slide caption

Rendered inside the amber box, bottom-right corner, over the photo area. Transitions with the slide — fade out with the outgoing image, fade in with the incoming.

```
LÜTZE · GROUND FLOOR
```

Archivo Narrow · 11px · `rgba(255,255,255,0.65)` · `letter-spacing: 0.1em` · no background, no pill. Sits directly over the photo with a subtle `text-shadow: 0 1px 3px rgba(0,0,0,0.4)` for legibility.

Rendered as `<figcaption>` inside a `<figure>` wrapping each slide image.

### SlideDotsNav

Bottom-right of the photo area, outside the amber box — aligned to the photo's bottom margin zone.

- One dot per slide
- Active dot: filled amber `#B87A2E`
- Inactive dots: `rgba(255,255,255,0.4)` outline only
- Each dot is a `<button>` with `aria-label="Go to slide [n]"` and `aria-current="true"` on active
- Dot size: `8px` · gap: `6px`
- Clicking a dot jumps to that slide immediately (no crossfade skip — use the same crossfade)

---

## Accessibility

- Section is `<section aria-label="Hero">` — not `<header>`, that is the nav
- Headline is `<h1>` — one per page, this is it
- The `<KenBurnsSlider>` wrapper has `role="region" aria-label="Hotel photos"` and `aria-live="off"` — do not announce slide changes to screen readers automatically
- Each slide image has a unique descriptive `alt` — never empty
- `<figcaption>` is visually positioned but is read by screen readers as part of the `<figure>`
- The satellite `<a>` has a full `aria-label` including destination and "(opens Google Maps)"
- The directions pill text is inside the `<a>` so it is readable by screen readers even though it is visually hidden until hover
- All interactive elements (CTA button, satellite link, dot buttons) have visible focus rings: `outline: 2px solid #B87A2E; outline-offset: 2px`
- `prefers-reduced-motion` stops both Ken Burns animation and slide rotation

---

## i18n

All user-facing strings use `next-intl` `useTranslations`. Namespace: `hero`.

| Key | EN | DE |
|---|---|---|
| `hero.headline` | Let's start your Berlin story | Deine Berliner Geschichte beginnt hier |
| `hero.body` | Hotel Berlin, Berlin is where travellers… | Das Hotel Berlin, Berlin ist der Ort… |
| `hero.cta` | Book Now | Jetzt buchen |
| `hero.address` | Lützowplatz 17, Tiergarten | Lützowplatz 17, Tiergarten |
| `hero.directions` | Get directions | Wegbeschreibung |
| `hero.satelliteAlt` | Aerial satellite view of Hotel Berlin, Berlin at Lützowplatz 17, Tiergarten | Satellitenansicht des Hotel Berlin, Berlin am Lützowplatz 17, Tiergarten |

Slide `captionEN` / `captionDE` are accessed directly from the hardcoded `slides` array using the active locale — no translation file needed for captions.

---

## Token reference

```
Background teal:     #2C6B7A
Amber border:        #B87A2E
Amber CTA bg:        #B87A2E
Overlay fill:        rgba(251, 251, 251, 0.10)   ← #FBFBFB at 10%
Directions pill:     rgba(0, 0, 0, 0.55)
White full:          #FFFFFF
White muted:         rgba(255, 255, 255, 0.85)   ← body copy
White dim:           rgba(255, 255, 255, 0.65)   ← caption
White label:         rgba(255, 255, 255, 0.70)   ← address line
Headline font:       Lora
UI font:             Archivo Narrow
Border radius:       0 throughout
```

---

## Definition of done

- [ ] Section background is solid teal `#2C6B7A` full width
- [ ] Photo sits right-aligned with top and bottom margin from section edges
- [ ] Photo height fills section height via `object-fit: cover`
- [ ] Amber border box (1px `#B87A2E`) overlaps photo, independent of photo dimensions
- [ ] Amber box fill is `#FBFBFB` at 10% opacity — not white, not transparent
- [ ] Teal text box top-left corner is 1px inside amber box top-left corner (butts against border)
- [ ] Satellite box bottom-left corner is 1px inside amber box bottom-left corner
- [ ] Teal text box and satellite box share the same left edge and width
- [ ] Headline renders in Lora, two lines, white, correct size
- [ ] Body copy renders in Lora regular, muted white, correct line-height
- [ ] Book Now CTA is amber, no border radius, links to `#` placeholder
- [ ] Satellite image loads from `/public/images/hotel-berlin-berlin-luetzowplatz-satellite.jpg`
- [ ] Entire satellite tile is wrapped in `<a>` to Google Maps directions URL
- [ ] Directions pill shows arrow icon only by default
- [ ] Directions pill expands on hover to show address + "Get directions" text
- [ ] Pill expansion is CSS `max-width` transition, no JS
- [ ] Address line visible below satellite image at all times
- [ ] KenBurnsSlider rotates through 4 slides, 7s per slide, 1.5s crossfade
- [ ] Each slide has correct Ken Burns direction from `kbOrigin`
- [ ] Slide caption fades in/out with slide transition, bottom-right of amber box
- [ ] SlideDotsNav renders bottom-right of photo, amber active dot, ghost inactive dots
- [ ] Dot buttons have `aria-label` and `aria-current`
- [ ] `prefers-reduced-motion` stops animation and rotation, shows slide 0 static
- [ ] `<h1>` is the headline — one per page
- [ ] Satellite `<a>` has full `aria-label`
- [ ] All focus rings visible, amber colour, no suppressed outlines
- [ ] EN/DE strings via `next-intl`, namespace `hero`
- [ ] No mobile breakpoints defined — desktop only at this stage
