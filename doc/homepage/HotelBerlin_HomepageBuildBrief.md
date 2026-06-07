# Hotel Berlin, Berlin — Homepage Build Brief
*For Cursor / Claude Opus*
*Goal: Build the homepage from tokens through all sections, production-ready*
*Prerequisites: Next.js 15 + Payload CMS + next-intl installed, Payload schema added*

---

## Guiding principles

These three principles govern every decision in this brief. They are not optional and they are not a post-build checklist. They apply at the point of writing each component.

**1. Semantic HTML first.**
Every element must be the correct HTML element for its purpose. A button that navigates is a `<a>`. A button that triggers an action is a `<button>`. A list of links is a `<ul>` with `<li>` children. Navigation is a `<nav>`. The page has one `<h1>`, section headings are `<h2>`, sub-headings within sections are `<h3>`. Never use a `<div>` where a semantic element exists. Never use a `<span>` as a button. Never use heading tags for visual size — use them for document structure.

**2. Accessible at build time.**
Accessibility is not added after the component is built. Every interactive element gets its aria attributes when it is first written. Every image gets its alt text when it is first placed. Every animation respects `prefers-reduced-motion` from the first commit. The European Accessibility Act (EAA) requires WCAG 2.1 AA compliance — this is a legal requirement for this site, not a nice-to-have.

**3. Tokens only.**
No raw hex values in any component. No hardcoded pixel sizes for colours, spacing, or typography outside of `tailwind.config.ts` and `globals.css`. Every visual decision references a named token. This is enforced from the first component.

---

## Stack

| | |
|---|---|
| Framework | Next.js 15, App Router |
| Styling | Tailwind CSS v4 |
| Fonts | Archivo Narrow (UI), Lora (editorial) via `next/font/google` |
| Icons | Lucide React |
| i18n | next-intl, `localePrefix: 'always'`, `de` default |
| Images | Next.js `<Image>` component throughout — never bare `<img>` |
| Accessibility | WCAG 2.1 AA — EAA compliant — built in, not bolted on |

---

## Semantic HTML — standing rules

These rules apply to every file in this project. No exceptions.

### Document structure
```html
<html lang="en">           <!-- switches to "de" on DE routes via next-intl -->
  <head>...</head>
  <body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <header>
      <nav aria-label="Primary navigation">...</nav>
    </header>
    <main id="main-content">
      <section aria-labelledby="section-id">
        <h2 id="section-id">Section title</h2>
        ...
      </section>
    </main>
    <footer>...</footer>
  </body>
</html>
```

### Skip link
The skip link must be the first focusable element on every page. Visually hidden by default, visible on focus.

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
  background: var(--hbb-dark);
  color: white;
  padding: 0.5rem 1rem;
  z-index: 9999;
  font-family: var(--font-archivo-narrow);
  font-size: 14px;
}
.skip-link:focus {
  top: 1rem;
}
```

### Heading hierarchy
```
<h1>  — One per page. Hero section headline only.
<h2>  — One per section. Section title (Sleep & Relax, Meet & Work, Arts & Culture etc.)
<h3>  — Sub-items within a section (room name, meeting room name, FAQ question text, card title)
<h4>  — Rarely needed. Sub-items within <h3> groups only.
```

Never use an `<h2>` for a visually large element that isn't structurally a section heading. Never skip levels (no jumping from `<h2>` to `<h4>`).

### Interactive elements
```
Navigation links         → <a href="...">
Buttons that submit/act  → <button type="button">
Accordion triggers       → <button type="button" aria-expanded aria-controls>
Slideshow controls       → <button type="button" aria-label>
Form inputs              → <input> with associated <label>
External links           → <a href target="_blank" rel="noopener noreferrer" aria-label="... (opens in new tab)">
```

Never use `<div onClick>` or `<span onClick>`. Never use `role="button"` on a non-button element — use an actual `<button>`.

### Lists
Any group of 3+ navigation links, card items, or list items must be wrapped in `<ul>` / `<ol>` with `<li>` children. This applies to:
- Nav link groups
- Footer link columns
- FAQ item groups
- Card grids (use `<ul role="list">` with `<li>` wrappers)

### Images
```typescript
// Content images — always descriptive alt
<Image src="..." alt="Superior room at Hotel Berlin, Berlin — king bed, natural light, teal door detail" />

// Decorative images — empty alt, aria-hidden
<Image src="..." alt="" aria-hidden="true" />

// Background/ambient slideshow images — empty alt on the img, aria-label on the container
<div aria-label="Hotel Berlin, Berlin photo gallery" role="img">
  <Image src="..." alt="" />
</div>

// Icons used as labels — always aria-label on the button/link, aria-hidden on the icon
<button aria-label="Play slideshow">
  <PauseIcon aria-hidden="true" />
</button>
```

### Forms and controls
Every `<input>`, `<select>`, and `<textarea>` must have an associated `<label>`. Never use `placeholder` as a label — it disappears on input and fails WCAG 1.3.1.

---

## Accessibility — standing rules

### Focus management
- Never suppress `outline` on focused elements. Use a custom focus ring that matches the brand instead of removing it.
- Focus ring style (apply globally in `globals.css`):
```css
:focus-visible {
  outline: 2px solid theme('colors.hbb-amber');
  outline-offset: 2px;
}
```
- After a modal, drawer, or dropdown closes, return focus to the trigger element.
- Keyboard trap inside modals and drawers — focus must not escape to the page behind.

### Colour contrast
Minimum ratios (WCAG 2.1 AA):
- Normal text (< 18pt / < 14pt bold): **4.5:1**
- Large text (≥ 18pt / ≥ 14pt bold): **3:1**
- UI components and graphical elements: **3:1**

Pre-verified combinations for this project:
| Foreground | Background | Ratio | Use |
|---|---|---|---|
| `#F0EDE8` | `#1E1530` | 14.2:1 ✓ | Footer primary text |
| `#BBBBBB` | `#1E1530` | 8.6:1 ✓  | Footer standard links |
| `#8A8A8A` | `#1E1530` | 4.6:1 ✓  | Footer muted links — minimum |
| `#F79B2E` | `#1E1530` | 7.2:1 ✓  | Footer amber headings |
| `#7AB8B0` | `#1E1530` | 4.9:1 ✓  | Footer teal links |
| `#141414` | `#FBFBFB` | 18.1:1 ✓ | Body text on page bg |
| `#FFFFFF` | `#1A3C40` | 11.3:1 ✓ | White text on teal bg |
| `#FFFFFF` | `#2C6B7A` | 7.1:1 ✓  | White text on teal |

**Hard rule:** Never use `#555`, `#444`, `#333` for any text on `#1E1530`. Minimum safe value is `#8A8A8A`.

### Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* KenBurnsSlider: disable transform, keep crossfade opacity */
  .ken-burns-active {
    transform: none !important;
    transition: opacity 0.5s ease !important;
  }
  /* All other animations: disable */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Apply `prefers-reduced-motion` in JavaScript too — check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before starting any JS-driven animation.

### Screen reader announcements
- Slideshow: when the slide changes automatically, announce to screen readers. Use a visually hidden live region:
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {`Slide ${currentIndex + 1} of ${images.length}: ${images[currentIndex].alt}`}
</div>
```
- Open status badge: the live badge content should be wrapped in `aria-live="polite"` since it updates client-side.
- FAQ accordion: no live region needed — the content is revealed by user action.

### ARIA patterns — reference implementations

**Accordion (FAQ):**
```tsx
<section aria-labelledby="faq-heading">
  <h2 id="faq-heading">Good questions.</h2>
  <ul role="list">
    {faqs.map((faq) => (
      <li key={faq.id}>
        <h3>
          <button
            type="button"
            aria-expanded={openId === faq.id}
            aria-controls={`faq-answer-${faq.id}`}
            id={`faq-btn-${faq.id}`}
            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
          >
            {faq.question}
          </button>
        </h3>
        <div
          id={`faq-answer-${faq.id}`}
          role="region"
          aria-labelledby={`faq-btn-${faq.id}`}
          hidden={openId !== faq.id}
        >
          <p>{faq.answer}</p>
        </div>
      </li>
    ))}
  </ul>
</section>
```

Note: use `hidden` attribute rather than CSS `display:none` for the collapsed state — it removes the content from the accessibility tree correctly. For the animation, use `max-height` transition on a wrapper inside the hidden div that becomes visible after the hidden attribute is removed.

**Navigation with dropdown:**
```tsx
<nav aria-label="Primary navigation">
  <ul role="list">
    <li>
      <a href="/rooms">Rooms</a>
    </li>
    <li>
      {/* "What's on" text link + separate chevron for dropdown */}
      <a href="/here">What's on</a>
      <button
        type="button"
        aria-expanded={dropdownOpen}
        aria-controls="nav-dropdown"
        aria-label="More navigation options"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <ChevronDownIcon aria-hidden="true" />
      </button>
      <ul
        id="nav-dropdown"
        role="list"
        hidden={!dropdownOpen}
      >
        <li><a href="/here/events">Events</a></li>
        <li><a href="/here/art">Art</a></li>
        <li><a href="/here/dining">Dining</a></li>
        <li><a href="/here/explore">Explore</a></li>
        <li><a href="/here/faq">FAQ</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

Dropdown closes on: outside click, Escape key, focus leaving the dropdown. Focus returns to the chevron button on close.

**Slideshow:**
```tsx
<section aria-label="Hotel Berlin, Berlin photo gallery" aria-roledescription="carousel">
  <div aria-live="polite" aria-atomic="true" className="sr-only">
    {`Image ${currentIndex + 1} of ${images.length}: ${images[currentIndex].alt}`}
  </div>
  <div aria-hidden="true">
    {/* Images — decorative in this context, described by live region above */}
    {images.map((img, i) => (
      <Image key={i} src={img.src} alt="" />
    ))}
  </div>
  <button
    type="button"
    aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
    onClick={() => setPaused(!paused)}
  >
    {paused ? <PlayIcon aria-hidden="true" /> : <PauseIcon aria-hidden="true" />}
  </button>
  <div role="tablist" aria-label="Select slide">
    {images.map((_, i) => (
      <button
        key={i}
        type="button"
        role="tab"
        aria-selected={i === currentIndex}
        aria-label={`Slide ${i + 1}`}
        onClick={() => goTo(i)}
      />
    ))}
  </div>
</section>
```

---

## Step 1 — Tailwind token file

Update `tailwind.config.ts`. Every component in this project references these tokens by name — never raw hex values in any component file.

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {

      colors: {
        // ── Brand palette ──────────────────────────────
        'hbb-teal':       '#2C6B7A',  // primary brand — outside context
        'hbb-amber':      '#F79B2E',  // action / eat & drink / warm accent
        'hbb-green':      '#4A7A68',  // sustainability / nature
        'hbb-coral':      '#F95D62',  // alert / accent
        'hbb-purple':     '#6A5870',  // footer / FAQ / inside context accent
        'hbb-gold':       '#A08C38',  // awards / prestige
        'hbb-dark':       '#1E1530',  // hotel disc pin / footer background
        'hbb-black':      '#141414',  // near-black text

        // ── Section backgrounds ────────────────────────
        'hbb-page':       '#FBFBFB',  // page background
        'hbb-warm':       '#F5F0EB',  // warm off-white — FAQ section bg
        'hbb-amber-wash': '#FDF6EA',  // pale amber — Lütze section bg

        // ── Deep teal — Meet & Work, hero overlay ──────
        'hbb-teal-deep':  '#1A3C40',

        // ── Footer ─────────────────────────────────────
        'hbb-footer':     '#1E1530',

        // ── Footer text hierarchy ─── all AA compliant on #1E1530
        'hbb-footer-primary': '#F0EDE8',  // 14.2:1
        'hbb-footer-link':    '#BBBBBB',  // 8.6:1
        'hbb-footer-muted':   '#8A8A8A',  // 4.6:1 — minimum
        'hbb-footer-amber':   '#F79B2E',  // 7.2:1 — column headings
        'hbb-footer-teal':    '#7AB8B0',  // 4.9:1 — external links
      },

      fontFamily: {
        'ui':    ['var(--font-archivo-narrow)', 'sans-serif'],
        'serif': ['var(--font-lora)', 'Georgia', 'serif'],
      },

      fontSize: {
        // UI scale — Archivo Narrow
        'ui-xs':   ['11px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'ui-sm':   ['12px', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'ui-base': ['13px', { lineHeight: '1.5' }],
        'ui-md':   ['14px', { lineHeight: '1.5' }],
        'ui-lg':   ['16px', { lineHeight: '1.6' }],
        // Utility label scale — uppercase, tracked
        'label':   ['9.5px', { lineHeight: '1.3', letterSpacing: '0.12em' }],
        // Editorial scale — Lora
        'serif-sm':  ['15px', { lineHeight: '1.75' }],
        'serif-md':  ['18px', { lineHeight: '1.6'  }],
        'serif-lg':  ['22px', { lineHeight: '1.35' }],
        'serif-xl':  ['28px', { lineHeight: '1.25' }],
        'serif-2xl': ['36px', { lineHeight: '1.2'  }],
        'serif-3xl': ['48px', { lineHeight: '1.15' }],
      },

      borderRadius: {
        // Hard brand rule: border-radius: 0 everywhere EXCEPT pill badges
        'none': '0px',
        'sm':   '2px',
        'pill': '9999px',  // pill badges only
      },

      borderWidth: {
        DEFAULT: '0.5px',
        '1':     '1px',
        '2':     '2px',
      },

      spacing: {
        'section-x':  '2.5rem',  // 40px horizontal section padding desktop
        'section-y':  '3rem',    // 48px vertical section padding desktop
        'section-sm': '1.25rem', // tight section padding mobile
      },

      letterSpacing: {
        'ui-label': '0.12em',
        'ui-wide':  '0.08em',
        'ui-tight': '0.02em',
      },

    },
  },
  plugins: [],
}

export default config
```

---

## Step 2 — Font setup and globals

### 2a — Root layout font configuration

`src/app/[locale]/layout.tsx`:

```typescript
import { Archivo_Narrow, Lora } from 'next/font/google'

const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'],
  variable: '--font-archivo-narrow',
  weight: ['400', '500'],
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  weight: ['400', '500'],
  display: 'swap',
})

export default function RootLayout({ children, params: { locale } }) {
  return (
    <html
      lang={locale}
      className={`${archivoNarrow.variable} ${lora.variable}`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
```

### 2b — globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-archivo-narrow: 'Archivo Narrow', sans-serif;
  --font-lora: 'Lora', Georgia, serif;
}

/* Base */
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }

body {
  background-color: theme('colors.hbb-page');
  font-family: var(--font-archivo-narrow);
  color: theme('colors.hbb-black');
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
  background: theme('colors.hbb-dark');
  color: white;
  padding: 0.5rem 1rem;
  z-index: 9999;
  font-family: var(--font-archivo-narrow);
  font-size: 14px;
  text-decoration: none;
}
.skip-link:focus { top: 1rem; }

/* Focus ring — brand-consistent, never suppressed */
:focus-visible {
  outline: 2px solid theme('colors.hbb-amber');
  outline-offset: 2px;
}

/* Screen reader only utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Utility label pattern */
.label-tag {
  font-family: var(--font-archivo-narrow);
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: theme('colors.hbb-teal');
}

/* Section heading underline pattern */
.heading-underline {
  display: inline;
  border-bottom: 2px solid #c0392b;
  padding-bottom: 2px;
  line-height: 1.5;
}

/* Reduced motion — global */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  /* Exception: KenBurnsSlider — keep opacity crossfade, disable transform */
  .ken-burns-img {
    transform: none !important;
    transition: opacity 0.5s ease !important;
  }
}
```

---

## Step 3 — Shared primitives

Build each primitive independently before any section uses it. Each primitive must be accessible, typed, and have a defined prop interface.

---

### 3a — `<KenBurnsSlider>`

**Path:** `src/components/primitives/KenBurnsSlider.tsx`

**Purpose:** Reusable image crossfade with Ken Burns pan/zoom effect. Used in Hero, Rooms, Meetings, and Lütze sections.

**Props:**
```typescript
interface KenBurnsSliderProps {
  images: { src: string; alt: string }[]
  interval?: number           // ms between slides, default 5000
  className?: string
  'aria-label'?: string       // describes the gallery for screen readers
  children?: React.ReactNode  // overlay content (hero copy, Lütze content)
}
```

**Semantic structure:**
```tsx
<section
  aria-label={ariaLabel ?? 'Photo gallery'}
  aria-roledescription="carousel"
  className={...}
>
  {/* Screen reader live announcement */}
  <div aria-live="polite" aria-atomic="true" className="sr-only">
    {`Image ${currentIndex + 1} of ${images.length}`}
    {images[currentIndex]?.alt ? `: ${images[currentIndex].alt}` : ''}
  </div>

  {/* Image stack — decorative in carousel context */}
  <div aria-hidden="true" className="relative w-full h-full overflow-hidden">
    {images.map((img, i) => (
      <div
        key={i}
        className={`ken-burns-img absolute inset-0 transition-opacity duration-1000 ${
          i === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.04]'
        }`}
        style={{ transition: 'opacity 1s ease, transform 7s ease' }}
      >
        <Image src={img.src} alt="" fill style={{ objectFit: 'cover' }} />
      </div>
    ))}
  </div>

  {/* Overlay content (hero copy etc.) */}
  {children}

  {/* Controls */}
  <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
    <button
      type="button"
      aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
      onClick={() => setPaused(p => !p)}
      className="..."
    >
      {paused
        ? <PlayIcon aria-hidden="true" size={14} />
        : <PauseIcon aria-hidden="true" size={14} />
      }
    </button>
  </div>

  {/* Dot navigation */}
  <div role="tablist" aria-label="Gallery slides" className="...">
    {images.map((_, i) => (
      <button
        key={i}
        type="button"
        role="tab"
        aria-selected={i === currentIndex}
        aria-label={`Slide ${i + 1} of ${images.length}`}
        onClick={() => { goTo(i); resetTimer(); }}
        className={`h-[2px] transition-all ${
          i === currentIndex
            ? 'w-8 bg-hbb-amber'
            : 'w-[18px] bg-white/30'
        }`}
      />
    ))}
  </div>
</section>
```

**Behaviour:**
- Auto-advance every `interval` ms
- Pause on `paused` state or when page tab is hidden (`visibilitychange` event)
- `prefers-reduced-motion`: check on mount via `window.matchMedia`. If reduced motion, disable `transform` animation on images, keep opacity crossfade
- `goTo(index)` exposed to parent via `SlideDotsNav` for external navigation (Rooms, Meetings sections)

---

### 3b — `<SectionHeading>`

**Path:** `src/components/primitives/SectionHeading.tsx`

**Purpose:** Consistent heading pattern across every section. Handles the label / Lora title / red underline / subtitle hierarchy.

**Props:**
```typescript
interface SectionHeadingProps {
  label?: string       // "Sleep & Relax" — uppercase label above
  title: string        // "Room to spread out" — Lora serif, red underline
  subtitle?: string    // optional body intro line
  as?: 'h1' | 'h2'    // default 'h2' — use 'h1' for hero only
  id?: string          // for aria-labelledby on the parent section
  className?: string
}
```

**Semantic structure:**
```tsx
<div className={className}>
  {label && (
    <p className="label-tag mb-1">{label}</p>
  )}
  <Heading
    id={id}
    className="font-serif text-serif-lg font-medium text-hbb-black"
  >
    <span className="heading-underline">{title}</span>
  </Heading>
  {subtitle && (
    <p className="font-ui text-ui-sm text-gray-500 mt-2">{subtitle}</p>
  )}
</div>
```

Where `Heading` renders as the `as` prop value (`h1` or `h2`).

---

### 3c — `<ContentCard>`

**Path:** `src/components/primitives/ContentCard.tsx`

**Purpose:** Used in the Arts & Culture section (4 cards). Designed to scale to any grid.

**Props:**
```typescript
interface ContentCardProps {
  badge: string
  badgeColor?: 'teal' | 'amber' | 'green' | 'purple'
  title: string         // rendered as <h3>
  subtitle?: string
  date?: string
  price?: string
  body: string
  meta?: string
  ctaLabel: string
  ctaHref: string
  ctaExternal?: boolean
  image?: string
  imageAlt?: string
}
```

**Semantic structure:**
```tsx
<article className="border border-gray-200 flex flex-col">
  {image && (
    <div className="aspect-[4/3] overflow-hidden">
      <Image
        src={image}
        alt={imageAlt ?? ''}
        fill
        style={{ objectFit: 'cover' }}
      />
    </div>
  )}
  <div className="p-4 flex flex-col flex-1 gap-3">
    <div>
      <span className={`badge badge-${badgeColor}`}>{badge}</span>
      {subtitle && <p className="label-tag mt-1">{subtitle}</p>}
    </div>
    <h3 className="font-ui text-ui-md font-medium text-hbb-black">{title}</h3>
    {(date || price) && (
      <p className="font-ui text-ui-sm text-gray-500">
        {date}{date && price && ' · '}{price}
      </p>
    )}
    <p className="font-ui text-ui-sm text-gray-600 flex-1">{body}</p>
    {meta && (
      <p className="label-tag text-gray-400">{meta}</p>
    )}
    <a
      href={ctaHref}
      className="font-ui text-ui-sm font-medium text-hbb-teal flex items-center gap-1 mt-auto"
      {...(ctaExternal && {
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${ctaLabel} (opens in new tab)`,
      })}
    >
      {ctaLabel}
      {ctaExternal
        ? <ExternalLinkIcon aria-hidden="true" size={13} />
        : <ArrowRightIcon aria-hidden="true" size={13} />
      }
    </a>
  </div>
</article>
```

Note: `<article>` is the correct element for a self-contained card with a heading.

---

### 3d — `<FAQAccordion>`

**Path:** `src/components/primitives/FAQAccordion.tsx`

**Purpose:** Single FAQ item. Fully accessible accordion pattern.

**Props:**
```typescript
interface FAQAccordionProps {
  id: string
  question: string
  answer: string
  icon?: LucideIcon
  isOpen: boolean
  onToggle: () => void
}
```

**Semantic structure:**
```tsx
<div className="border-t border-gray-200 last:border-b">
  <h3>
    <button
      type="button"
      id={`faq-btn-${id}`}
      aria-expanded={isOpen}
      aria-controls={`faq-answer-${id}`}
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 py-4 text-left font-ui text-ui-md font-medium"
    >
      <span className="flex items-center gap-3">
        {icon && (
          <span
            aria-hidden="true"
            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              isOpen ? 'bg-hbb-amber/20' : 'bg-gray-100'
            }`}
          >
            <Icon size={14} className={isOpen ? 'text-hbb-amber' : 'text-gray-500'} />
          </span>
        )}
        <span className={isOpen ? 'text-hbb-amber' : 'text-hbb-black'}>
          {question}
        </span>
      </span>
      <ChevronDownIcon
        aria-hidden="true"
        size={16}
        className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  </h3>
  <div
    id={`faq-answer-${id}`}
    role="region"
    aria-labelledby={`faq-btn-${id}`}
    hidden={!isOpen}
  >
    <p className="font-ui text-ui-sm text-gray-600 pb-4 pl-10 leading-relaxed">
      {answer}
    </p>
  </div>
</div>
```

Note: the `hidden` attribute is used (not `display:none` via CSS) so the content is correctly removed from the accessibility tree when collapsed. For animation, wrap the `<p>` in a div that transitions `max-height` once the `hidden` attribute is removed.

---

### 3e — `<SlideDotsNav>`

**Path:** `src/components/primitives/SlideDotsNav.tsx`

**Purpose:** External dot navigation for Rooms and Meetings cycling panels.

```typescript
interface SlideDotsNavProps {
  count: number
  current: number
  labels: string[]      // room/space names for aria-label per dot
  onSelect: (index: number) => void
  className?: string
}
```

```tsx
<div
  role="tablist"
  aria-label="Room categories"
  className={`flex gap-1.5 ${className}`}
>
  {Array.from({ length: count }).map((_, i) => (
    <button
      key={i}
      type="button"
      role="tab"
      aria-selected={i === current}
      aria-label={labels[i]}
      onClick={() => onSelect(i)}
      className={`h-[2px] rounded-none transition-all duration-300 ${
        i === current
          ? 'w-8 bg-hbb-amber'
          : 'w-[18px] bg-hbb-teal/20'
      }`}
    />
  ))}
</div>
```

---

### 3f — `<OpenStatusBadge>`

**Path:** `src/components/primitives/OpenStatusBadge.tsx`

**Purpose:** Live Lütze open/closed status. Client component, Berlin timezone.

```tsx
'use client'

export function OpenStatusBadge() {
  const [status, setStatus] = useState<StatusResult>(getStatus())

  useEffect(() => {
    setStatus(getStatus())
    const interval = setInterval(() => setStatus(getStatus()), 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      className={`inline-flex items-center gap-1.5 text-ui-sm font-medium px-3 py-1 rounded-pill ${badgeClass[status.type]}`}
    >
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dotClass[status.type]}`} />
      {status.text}
    </div>
  )
}
```

Status logic (Europe/Berlin timezone via `Intl.DateTimeFormat`):
- Before 10:00 → `{ type: 'closed', text: 'Opens today at 10:00' }`
- 10:00–11:30 → `{ type: 'open', text: 'Open now — bar · kitchen opens 11:30' }`
- 11:30–15:00 → `{ type: 'open', text: 'Open now — kitchen & bar' }`
- 15:00–17:00 → `{ type: 'bar-only', text: 'Open — bar only · kitchen reopens 17:00' }`
- 17:00–22:00 → `{ type: 'open', text: 'Open now — kitchen & bar' }`
- 22:00–22:30 → `{ type: 'closing', text: 'Kitchen closing soon · bar stays open' }`
- 22:30+ → `{ type: 'bar-only', text: 'Open — bar until late' }`

---

### 3g — `<HotelDiscPin>` and `<HintDot>`

As specified in `HotelBerlin_MapTeaserBuildBrief.md`. Build here as primitives, import in `<MapTeaser>`.

Both are decorative visual elements — wrap in `aria-hidden="true"` containers in the map context since the map canvas itself is `aria-hidden`.

---

## Step 4 — Sections

Build each section in order. Every section is a `<section>` element with `aria-labelledby` pointing to its heading `id`.

---

### 4a — `<SiteNav>`

**Path:** `src/components/layout/SiteNav.tsx`

**Semantic structure:**
```tsx
<header>
  {/* Primary nav strip */}
  <nav aria-label="Primary navigation">
    <a href={`/${locale}`} aria-label="Hotel Berlin, Berlin — home">
      {/* Wordmark */}
    </a>
    <ul role="list">
      <li><a href={`/${locale}/rooms`}>Rooms</a></li>
      <li><a href={`/${locale}/meetings`}>Meetings</a></li>
      <li><a href={`/${locale}/restaurant`}>Eat & Drink</a></li>
      <li><a href={`/${locale}/happenings`}>Happenings</a></li>
      <li><a href={`/${locale}/neighbourhood`}>Neighbourhood</a></li>
    </ul>
    <div>
      {/* Language toggle */}
      <a href="/de" hrefLang="de" lang="de" aria-label="Deutsch">DE</a>
      <span aria-hidden="true">|</span>
      <a href="/en" hrefLang="en" lang="en" aria-label="English" aria-current="true">EN</a>
    </div>
    <a href="/book" className="btn-primary">Book Now</a>
  </nav>

  {/* Secondary strip */}
  <nav aria-label="Guest navigation">
    <a href={`/${locale}/here`}>
      In the Building? <span aria-hidden="true">ENTER</span>
      <span className="sr-only">— Enter guest hub</span>
    </a>
    <ul role="list">
      <li><a href={`/${locale}/here/events`}>What's on</a></li>
      <li><a href={`/${locale}/here/explore`}>Getting around</a></li>
      <li><a href={`/${locale}/here/explore`}>Local tips</a></li>
      <li><a href={`/${locale}/gallery`}>Gallery</a></li>
      <li><a href={`/${locale}/skateboard-museum`}>Skateboard Museum</a></li>
    </ul>
  </nav>

  {/* Mobile hamburger — appears at sm breakpoint */}
  <button
    type="button"
    aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
    aria-expanded={mobileOpen}
    aria-controls="mobile-nav"
    onClick={() => setMobileOpen(o => !o)}
  >
    {mobileOpen ? <XIcon aria-hidden="true" /> : <MenuIcon aria-hidden="true" />}
  </button>

  {/* Mobile drawer */}
  <div
    id="mobile-nav"
    hidden={!mobileOpen}
    role="dialog"
    aria-label="Navigation menu"
    aria-modal="true"
  >
    {/* Full nav links — same structure as desktop, stacked */}
  </div>
</header>
```

**Keyboard behaviour:**
- Mobile drawer traps focus while open
- Escape closes drawer, returns focus to hamburger button
- Active page link gets `aria-current="page"`

---

### 4b — `<HeroSection>`

**Path:** `src/components/sections/HeroSection.tsx`

**Semantic structure:**
```tsx
<section aria-label="Hotel Berlin, Berlin — welcome">
  <KenBurnsSlider
    images={heroImages}
    aria-label="Hotel Berlin, Berlin photo gallery"
    interval={5000}
  >
    {/* Overlay */}
    <div className="absolute inset-0 flex flex-col justify-end p-section-x pb-16">
      {/* h1 — only one on the entire page */}
      <h1 className="font-serif text-serif-3xl font-medium text-white leading-tight">
        Let's start your<br />Berlin story
      </h1>
      <p className="font-ui text-ui-lg text-white/80 mt-4 max-w-md">
        Hotel Berlin, Berlin is where travellers,<br />
        locals, and ideas naturally meet.
      </p>
      <p className="font-ui text-ui-sm text-white/60 mt-2">
        Sunlight fills the courtyard, artists make real work,<br />
        and the hum of Berlin is never far away.
      </p>
    </div>

    {/* Radisson Individuals mark — top right */}
    <div className="absolute top-4 right-4 opacity-80" aria-hidden="true">
      {/* Logo */}
    </div>

    {/* MiniSatellite — bottom right */}
    <a
      href="https://maps.google.com/?q=Lützowplatz+17,+10785+Berlin"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hotel Berlin, Berlin on Google Maps — get directions (opens in new tab)"
      className="absolute bottom-4 right-4 w-20 h-20 overflow-hidden border border-white/20"
    >
      <Image
        src="/images/hotel-satellite.png"
        alt="Satellite view of Hotel Berlin, Berlin at Lützowplatz 17"
        fill
        style={{ objectFit: 'cover' }}
      />
    </a>
  </KenBurnsSlider>
</section>
```

---

### 4c — `<RoomsSection>`

**Path:** `src/components/sections/RoomsSection.tsx`

**Semantic structure:**
```tsx
<section aria-labelledby="rooms-heading" className="bg-hbb-page">
  {/* Heading row — static */}
  <div className="grid grid-cols-2 gap-10 px-section-x pt-section-y pb-6">
    <SectionHeading
      id="rooms-heading"
      label="Sleep & Relax"
      title="Room to spread out"
    />
    <p className="font-serif text-serif-sm text-gray-600 self-center">
      Quiet, spacious, and genuinely comfortable. Whether you're here for
      one night or a week — your place to land. Thoughtful design details
      and a relaxed, home-like feel make every room a personal retreat.
    </p>
  </div>

  {/* Stage */}
  <div className="grid grid-cols-[1.15fr_1fr] border-t border-gray-200">

    {/* Image — KenBurnsSlider without its own dots (controlled externally) */}
    <KenBurnsSlider
      images={roomImages}
      aria-label="Hotel Berlin, Berlin room photos"
      interval={4500}
    />

    {/* Content panel */}
    <div className="px-7 py-7 flex flex-col justify-between border-l border-gray-200">

      <SlideDotsNav
        count={rooms.length}
        current={currentRoom}
        labels={rooms.map(r => r.name)}
        onSelect={setCurrentRoom}
        className="mb-6"
      />

      {/* Cycling content — name, price, icons */}
      <div className="flex-1 relative" aria-live="polite" aria-atomic="true">
        {rooms.map((room, i) => (
          <div
            key={room.name}
            aria-hidden={i !== currentRoom}
            className={`transition-opacity duration-400 ${
              i === currentRoom ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          >
            <h3 className="font-serif text-serif-lg font-medium text-hbb-black mb-1">
              {room.name}
            </h3>
            <p className="font-ui text-ui-sm text-gray-500 mb-5">
              {room.priceLabel}
            </p>
            {/* Icon cells */}
            <ul role="list" className="grid grid-cols-3 border border-gray-200">
              {room.icons.map(icon => (
                <li key={icon.label} className="flex flex-col items-center gap-1 py-3 border-r border-gray-200 last:border-r-0">
                  <icon.icon aria-hidden="true" size={16} className="text-gray-400" />
                  <span className="font-ui text-ui-xs text-gray-500 text-center">{icon.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Static CTAs */}
      <div className="flex items-center gap-4 pt-5 border-t border-gray-200">
        <a
          href={`/${locale}/rooms`}
          className="btn-primary flex items-center gap-1.5"
        >
          Discover our rooms
          <ArrowRightIcon aria-hidden="true" size={13} />
        </a>
        <a href="/book" className="font-ui text-ui-sm text-gray-500 border-b border-gray-300 pb-px">
          Check availability
        </a>
      </div>
    </div>

  </div>
</section>
```

Note: `aria-live="polite" aria-atomic="true"` on the cycling panel announces the room name change to screen readers without being disruptive.

---

### 4d — `<MeetingsSection>`

**Path:** `src/components/sections/MeetingsSection.tsx`

Same pattern as `<RoomsSection>` with these differences:
- Background: `hbb-teal-deep` — dark teal. All text white or white/opacity.
- `SectionHeading` label: "Meet & Work", title: "Serious business, playful spaces"
- Data source: `meetingRooms` array (3 items)
- Single CTA: "All meeting rooms →" → `/${locale}/meetings`
- Focus ring on dark bg: use `outline-color: hbb-amber` (already set globally)

---

### 4e — `<CultureSection>`

**Path:** `src/components/sections/CultureSection.tsx`

```tsx
<section aria-labelledby="culture-heading" className="bg-hbb-page px-section-x py-section-y">
  <SectionHeading
    id="culture-heading"
    label="Arts & Culture"
    title="The building is the programme"
    className="mb-8"
  />
  <ul
    role="list"
    className="grid grid-cols-2 gap-4"
    aria-label="Arts and culture at Hotel Berlin, Berlin"
  >
    {cultureCards.map(card => (
      <li key={card.title}>
        <ContentCard {...card} />
      </li>
    ))}
  </ul>
</section>
```

Note: card grid wrapped in `<ul role="list">` with `<li>` children. `<ContentCard>` renders `<article>` with `<h3>` inside.

---

### 4f — `<LutzeSection>`

**Path:** `src/components/sections/LutzeSection.tsx`

```tsx
<section
  aria-labelledby="lutze-heading"
  className="bg-hbb-amber-wash border-l-[3px] border-hbb-amber"
>
  <div className="grid grid-cols-2">

    {/* Image side */}
    <KenBurnsSlider
      images={lutzeImages}
      aria-label="Lütze restaurant and bar at Hotel Berlin, Berlin"
      interval={5500}
    />

    {/* Content side */}
    <div className="px-7 py-7 flex flex-col gap-4">

      {/* Wordmark row */}
      <div className="flex items-center gap-3">
        <span className="font-ui text-[28px] font-medium text-hbb-teal-deep">Lütze</span>
        <span className="font-ui text-[10px] tracking-ui-label uppercase text-hbb-amber border border-hbb-amber px-2 py-0.5 rounded-pill">
          For all good rebels
        </span>
      </div>

      <p className="label-tag">Italian deli-café · Bar · Garden · Lützowplatz 17</p>

      <h2 id="lutze-heading" className="font-serif text-serif-md font-medium text-hbb-teal-deep">
        The place to eat, play, and hang all day.
      </h2>

      <p className="font-serif text-serif-sm text-gray-600">
        In the heart of the hotel — open to guests and Berliners alike.
        Breakfast from the counter. Lunch on the terrace. Cocktails until
        the city stops. Happy hour isn't a time slot. It's a state of mind.
      </p>

      {/* Hours grid */}
      <dl className="grid grid-cols-2 gap-2">
        {[
          { term: 'Bar', detail: '10:00 – open end, daily' },
          { term: 'Kitchen', detail: '11:30–15:00 & 17:00–22:30' },
          { term: 'Vinyl Nights', detail: 'Every Monday from 18:00' },
          { term: 'KTTK', detail: '13:00–23:00 · 4 tables · €5/30 min' },
        ].map(({ term, detail }) => (
          <div key={term} className="flex items-start gap-2">
            <dt className="label-tag">{term}</dt>
            <dd className="font-ui text-ui-sm text-gray-600">{detail}</dd>
          </div>
        ))}
      </dl>

      <OpenStatusBadge />

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        <a
          href="https://luetze-berlin.de"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Lütze website (opens in new tab)"
          className="btn-primary flex items-center gap-1.5"
        >
          Visit Lütze
          <ExternalLinkIcon aria-hidden="true" size={12} />
        </a>
        <a href="/book-lutze" className="btn-outline">
          Reserve a table
        </a>
        <a
          href={`/${locale}/here/dining`}
          className="font-ui text-ui-xs text-gray-400 border-b border-gray-300 pb-px"
        >
          Staying with us? All dining →
        </a>
      </div>

    </div>
  </div>
</section>
```

Note: Hours use `<dl>/<dt>/<dd>` — the correct semantic pattern for a term/description list.

---

### 4g — `<MapTeaser>`

Follow `HotelBerlin_MapTeaserBuildBrief.md` exactly. Insert between `<LutzeSection>` and `<FAQSection>`.

---

### 4h — `<FAQSection>`

**Path:** `src/components/sections/FAQSection.tsx`

```tsx
<section
  aria-labelledby="faq-heading"
  className="bg-hbb-warm px-section-x py-section-y"
>
  {/* Header row */}
  <div className="flex items-baseline justify-between mb-6">
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="w-9 h-9 rounded-full border border-hbb-purple flex items-center justify-center flex-shrink-0"
      >
        <HelpCircleIcon size={16} className="text-hbb-purple" />
      </span>
      <h2
        id="faq-heading"
        className="font-serif text-serif-lg font-medium text-hbb-black"
      >
        Good questions.
      </h2>
    </div>
    {showAllLink && (
      <a
        href={`/${locale}/faqs`}
        className="font-ui text-ui-sm font-medium text-hbb-purple border-b border-hbb-purple pb-px flex items-center gap-1"
      >
        All FAQs
        <ArrowRightIcon aria-hidden="true" size={13} />
      </a>
    )}
  </div>

  {/* Accordion list */}
  <ul role="list" className="flex flex-col">
    {faqs.map((faq, i) => (
      <li key={faq.id}>
        <FAQAccordion
          {...faq}
          isOpen={openId === faq.id}
          onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
        />
      </li>
    ))}
  </ul>
</section>
```

FAQ data by page context — from `/lib/data/faqs.json`:

```typescript
const faqsByContext: Record<string, FAQ[]> = {
  homepage: [
    {
      id: 'checkin-time',
      icon: DoorOpenIcon,
      question: 'What are the check-in and check-out times?',
      answer: 'Check-in is from 15:00. Check-out is by 12:00 noon. Early check-in from 06:00 is available for €30 if your room is ready — or book the night before for guaranteed early access. Self-service kiosks are available in the lobby.',
    },
    {
      id: 'parking',
      icon: CarIcon,
      question: 'Is there parking at the hotel?',
      answer: 'Yes — underground parking with over 200 spaces. €4 per hour, maximum €25 per day. EV charging is available.',
    },
    {
      id: 'pets',
      icon: PawPrintIcon,
      question: 'Are pets welcome?',
      answer: 'Yes. Pets are welcome — a fee of €30 per night applies. They\'re also welcome at breakfast.',
    },
    {
      id: 'airport',
      icon: PlaneIcon,
      question: 'How do I get here from BER airport?',
      answer: 'Take the RE7 or RB14 to Zoologischer Garten, then Bus 100 to Lützowplatz — right outside the hotel. Around 45–55 minutes total.',
    },
  ],
  rooms: [
    {
      id: 'bed-types',
      icon: BedDoubleIcon,
      question: 'What bed configurations are available?',
      answer: 'All room categories are available with either a king bed or twin configuration. Request your preference at booking — subject to availability.',
    },
    {
      id: 'room-size',
      icon: RulerIcon,
      question: 'How large are the rooms?',
      answer: 'Superior rooms are 22–26 m². Comfort rooms are 26–32 m². Suites range from 40–65 m². Studio 45 is available on request.',
    },
    {
      id: 'cancellation',
      icon: CalendarXIcon,
      question: 'What is the cancellation policy?',
      answer: 'Flexible rate bookings can be cancelled free of charge until 18:00 on the day of arrival. Non-refundable rates are charged in full at time of booking.',
    },
    {
      id: 'extra-beds',
      icon: UsersIcon,
      question: 'Can extra beds or cots be added?',
      answer: 'Cots are available for children under 2 at no charge. Rollaway beds can be added to most room types for €30 per night, subject to availability.',
    },
  ],
  meetings: [
    {
      id: 'capacity',
      icon: UsersIcon,
      question: 'What is the largest event space?',
      answer: 'The Berliner Saal accommodates up to 600 guests in theatre configuration. Total event space across all rooms is over 4,000 m².',
    },
    {
      id: 'av-tech',
      icon: MonitorIcon,
      question: 'What AV and technology is included?',
      answer: 'All meeting rooms include high-speed Wi-Fi, screen or projection, and sound system. Full AV packages including live streaming and simultaneous translation are available.',
    },
    {
      id: 'catering',
      icon: CoffeeIcon,
      question: 'Is catering included in meeting packages?',
      answer: 'Day delegate packages include coffee breaks and lunch. Bespoke catering from Lütze is available for all events.',
    },
    {
      id: 'parking-meet',
      icon: CarIcon,
      question: 'Is parking available for day delegates?',
      answer: 'Underground parking is available at €4 per hour. Pre-bookable delegate parking rates are available — ask the events team when enquiring.',
    },
  ],
  restaurant: [
    {
      id: 'lutze-open',
      icon: ClockIcon,
      question: 'What are Lütze\'s opening hours?',
      answer: 'The bar is open daily from 10:00. The kitchen serves 11:30–15:00 and 17:00–22:30. Vinyl Nights are every Monday from 18:00.',
    },
    {
      id: 'reservations',
      icon: CalendarIcon,
      question: 'Do I need to book a table?',
      answer: 'Reservations are recommended for dinner but not required. Walk-ins are always welcome at the bar. For large groups of 8 or more, please book in advance.',
    },
    {
      id: 'dietary',
      icon: LeafIcon,
      question: 'Are dietary requirements catered for?',
      answer: 'Yes — vegan, vegetarian, and gluten-free options are available. Please mention any allergies or dietary requirements when booking.',
    },
    {
      id: 'kttk-book',
      icon: TableTennisIcon,
      question: 'Do I need to book a table tennis table?',
      answer: 'No booking needed — tables are available on a first-come basis during open hours. Thursday tournament nights are open to all. €5 entry.',
    },
  ],
}
```

---

### 4i — `<SiteFooter>`

**Path:** `src/components/layout/SiteFooter.tsx`

**Semantic structure:**
```tsx
<footer aria-label="Site footer">

  {/* Booking strip */}
  <div className="bg-hbb-amber px-section-x py-3 flex items-center justify-between gap-4">
    <p className="font-ui text-ui-sm font-medium text-hbb-dark">
      Best rate guaranteed when you book direct
    </p>
    <a href="/book" className="btn-dark flex items-center gap-1.5 text-ui-sm">
      Check availability
      <ArrowRightIcon aria-hidden="true" size={13} />
    </a>
  </div>

  {/* Main footer grid */}
  <div className="bg-hbb-footer px-section-x py-10">
    <div className="grid grid-cols-[1.6fr_0.5px_0.9fr] gap-0">

      {/* Left: brand + 3 nav columns */}
      <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] gap-6 pr-10">

        {/* Brand cell */}
        <div>
          <p className="font-ui text-ui-sm font-medium text-hbb-footer-primary mb-1">
            Hotel Berlin, Berlin
          </p>
          <address className="not-italic font-ui text-ui-xs text-hbb-footer-muted leading-relaxed mb-4">
            Lützowplatz 17<br />
            10785 Berlin, Germany<br />
            Since 1958
          </address>
          <ul role="list" className="flex flex-col gap-1.5 mb-4">
            <li>
              <a
                href="tel:+493026050"
                className="font-ui text-ui-xs text-hbb-footer-muted flex items-center gap-1.5 hover:text-hbb-footer-primary"
              >
                <PhoneIcon aria-hidden="true" size={11} className="text-hbb-footer-amber flex-shrink-0" />
                +49 (0)30 2605 0
              </a>
            </li>
            <li>
              <a
                href="mailto:info@hotel-berlin.de"
                className="font-ui text-ui-xs text-hbb-footer-muted flex items-center gap-1.5 hover:text-hbb-footer-primary"
              >
                <MailIcon aria-hidden="true" size={11} className="text-hbb-footer-amber flex-shrink-0" />
                info@hotel-berlin.de
              </a>
            </li>
            <li className="font-ui text-ui-xs text-hbb-footer-muted flex items-center gap-1.5">
              <TrainIcon aria-hidden="true" size={11} className="text-hbb-footer-amber flex-shrink-0" />
              Bus 100, 106, 187 · U Nollendorfplatz 7 min · S+U Zoo 10 min
            </li>
          </ul>
          {/* Social */}
          <ul role="list" className="flex gap-1.5" aria-label="Social media links">
            {socials.map(s => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label} (opens in new tab)`}
                  className="w-7 h-7 border border-white/15 rounded-full flex items-center justify-center text-hbb-footer-muted hover:text-hbb-footer-amber hover:border-hbb-footer-amber/40"
                >
                  <s.icon aria-hidden="true" size={12} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Stay column */}
        <nav aria-label="Stay navigation">
          <p className="font-ui text-label uppercase tracking-ui-label text-hbb-footer-amber mb-3 flex items-center gap-1.5">
            <BedDoubleIcon aria-hidden="true" size={11} />
            Stay
          </p>
          <ul role="list" className="flex flex-col gap-1">
            {stayLinks.map(link => (
              <li key={link.label}>
                <a href={link.href} className={`font-ui text-ui-xs hover:text-hbb-footer-primary ${link.muted ? 'text-hbb-footer-muted' : 'text-hbb-footer-link'}`}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Eat & meet column */}
        <nav aria-label="Eat and meet navigation">
          {/* Same pattern — column heading + link list */}
        </nav>

        {/* Help column */}
        <nav aria-label="Help navigation">
          {/* Same pattern */}
        </nav>

      </div>

      {/* Vertical divider */}
      <div className="bg-white/10" aria-hidden="true" />

      {/* Right: Already here? inside panel */}
      <div className="pl-10">
        <a
          href={`/${locale}/here`}
          className="inline-flex items-center gap-1.5 font-ui text-label uppercase tracking-ui-label text-hbb-footer-teal border border-hbb-footer-teal/30 bg-hbb-footer-teal/8 px-2 py-1 rounded-pill mb-3"
          aria-label="Already here? Enter guest hub"
        >
          <DoorOpenIcon aria-hidden="true" size={11} />
          Already here?
        </a>
        <p className="font-ui text-ui-xs text-hbb-footer-muted leading-relaxed mb-3">
          Your guest hub — events, dining, neighbourhood picks, and everything you need during your stay.
        </p>
        <ul role="list" aria-label="Guest hub links" className="flex flex-col">
          {insideLinks.map(link => (
            <li key={link.label} className="border-t border-white/8 last:border-b">
              <a
                href={link.href}
                className="flex items-center justify-between py-1.5 font-ui text-ui-xs text-hbb-footer-muted hover:text-hbb-footer-teal"
              >
                {link.label}
                <ArrowRightIcon aria-hidden="true" size={10} className="text-white/20" />
              </a>
            </li>
          ))}
        </ul>
      </div>

    </div>
  </div>

  {/* Awards row */}
  <div className="bg-hbb-footer border-t border-white/8 px-section-x py-4">
    <p className="sr-only">Awards and recognition</p>
    <ul role="list" className="flex items-center gap-4 flex-wrap">
      <li className="font-ui text-label uppercase tracking-ui-label text-white/30">Recognition</li>
      {awards.map(award => (
        <li key={award} className="font-ui text-[10.5px] text-hbb-footer-muted flex items-center gap-1.5">
          <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-hbb-footer-amber/30 flex-shrink-0" />
          {award}
        </li>
      ))}
    </ul>
  </div>

  {/* Legal row */}
  <div className="bg-hbb-footer border-t border-white/6 px-section-x py-3 flex items-center justify-between flex-wrap gap-2">
    <div className="flex items-center gap-3 flex-wrap">
      <span className="font-ui text-[9px] uppercase tracking-ui-label text-white/30">Part of</span>
      <a href="https://radissonhotels.com" target="_blank" rel="noopener noreferrer" className="font-ui text-[10.5px] text-hbb-footer-muted hover:text-hbb-footer-link">
        Radisson Individuals
        <span className="sr-only"> (opens in new tab)</span>
      </a>
      <a href="https://radissonhotels.com/rewards" target="_blank" rel="noopener noreferrer" className="font-ui text-[10.5px] text-hbb-footer-muted hover:text-hbb-footer-link">
        Radisson Rewards
        <span className="sr-only"> (opens in new tab)</span>
      </a>
      <a href="https://pandox.com" target="_blank" rel="noopener noreferrer" className="font-ui text-[10.5px] text-hbb-footer-muted hover:text-hbb-footer-link">
        Pandox
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    </div>
    <nav aria-label="Legal links">
      <ul role="list" className="flex items-center gap-2 flex-wrap">
        {legalLinks.map((link, i) => (
          <li key={link.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="text-white/20 text-[10px]">·</span>}
            <a href={link.href} className="font-ui text-[10.5px] text-white/30 hover:text-hbb-footer-muted">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
    <div className="flex items-center gap-3">
      <span className="font-ui text-[10.5px] text-white/20">© 2026 Pandox Berlin GmbH</span>
      <a href="https://smoothism.com" target="_blank" rel="noopener noreferrer" className="font-ui text-[10.5px] text-white/20 hover:text-white/40">
        design by: smoothism.com
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    </div>
  </div>

</footer>
```

Note: `<address>` is used for the hotel contact block — this is the correct semantic element. Nav columns each get their own `<nav aria-label="...">` so they are distinct landmarks. The legal link row is also a `<nav aria-label="Legal links">`.

**Mobile footer:** Each nav column (`<nav>`) collapses to an accordion on mobile. Use the same `<FAQAccordion>`-style pattern — `<button aria-expanded>` trigger, `hidden` attribute on the content, Escape closes. The "Already here?" panel becomes a full-width block below the accordion columns.

---

## Step 5 — Page assembly

### `src/app/[locale]/page.tsx`

```typescript
import { SiteNav }         from '@/components/layout/SiteNav'
import { HeroSection }     from '@/components/sections/HeroSection'
import { RoomsSection }    from '@/components/sections/RoomsSection'
import { MeetingsSection } from '@/components/sections/MeetingsSection'
import { CultureSection }  from '@/components/sections/CultureSection'
import { LutzeSection }    from '@/components/sections/LutzeSection'
import { MapTeaser }       from '@/components/sections/MapTeaser'
import { FAQSection }      from '@/components/sections/FAQSection'
import { SiteFooter }      from '@/components/layout/SiteFooter'

export default function HomePage() {
  return (
    <>
      <SiteNav context="outside" />
      <main id="main-content">
        <HeroSection />
        <RoomsSection />
        <MeetingsSection />
        <CultureSection />
        <LutzeSection />
        <MapTeaser />
        <FAQSection pageContext="homepage" />
      </main>
      <SiteFooter />
    </>
  )
}
```

### JSON-LD in layout

Add the hotel `LodgingBusiness` JSON-LD to `src/app/[locale]/layout.tsx`:

```typescript
const hotelJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  '@id': 'https://hotel-berlin.de/#hotel',
  name: 'Hotel Berlin, Berlin',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Lützowplatz 17',
    addressLocality: 'Berlin',
    postalCode: '10785',
    addressCountry: 'DE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 52.5027,
    longitude: 13.3583,
  },
  telephone: '+493026050',
  email: 'info@hotel-berlin.de',
  url: 'https://hotel-berlin.de',
  sameAs: ['https://www.wikidata.org/wiki/Q1630833'],
}

// In the layout:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd) }}
/>
```

---

## Step 6 — i18n strings

All user-facing strings go through `useTranslations()`. No hardcoded English strings in components after this step.

```json
// messages/en.json
{
  "nav": {
    "rooms": "Rooms",
    "meetings": "Meetings",
    "eatDrink": "Eat & Drink",
    "happenings": "Happenings",
    "neighbourhood": "Neighbourhood",
    "bookNow": "Book Now",
    "inBuilding": "In the Building?",
    "enter": "ENTER",
    "whatsOn": "What's on",
    "gettingAround": "Getting around",
    "localTips": "Local tips",
    "gallery": "Gallery",
    "skateboardMuseum": "Skateboard Museum",
    "openMenu": "Open navigation menu",
    "closeMenu": "Close navigation menu"
  },
  "hero": {
    "heading": "Let's start your Berlin story",
    "subtext": "Hotel Berlin, Berlin is where travellers, locals, and ideas naturally meet.",
    "detail": "Sunlight fills the courtyard, artists make real work, and the hum of Berlin is never far away.",
    "mapsLink": "Open Hotel Berlin, Berlin in Google Maps for directions"
  },
  "rooms": {
    "label": "Sleep & Relax",
    "title": "Room to spread out",
    "body": "Quiet, spacious, and genuinely comfortable. Whether you're here for one night or a week — your place to land. Thoughtful design details and a relaxed, home-like feel make every room a personal retreat.",
    "cta": "Discover our rooms",
    "ctaAvailability": "Check availability"
  },
  "meetings": {
    "label": "Meet & Work",
    "title": "Serious business, playful spaces",
    "body": "Business is in our DNA. With over 4,000 m² of flexible conference and meeting spaces, cutting-edge event technology, and a dedicated team, we ensure everything from conferences to workshops runs smoothly — leaving space for ideas and connections to take the lead.",
    "cta": "All meeting rooms"
  },
  "culture": {
    "label": "Arts & Culture",
    "title": "The building is the programme"
  },
  "lutze": {
    "tagline": "For all good rebels",
    "descriptor": "Italian deli-café · Bar · Garden · Lützowplatz 17",
    "heading": "The place to eat, play, and hang all day.",
    "body": "In the heart of the hotel — open to guests and Berliners alike. Breakfast from the counter. Lunch on the terrace. Cocktails until the city stops. Happy hour isn't a time slot. It's a state of mind.",
    "ctaVisit": "Visit Lütze",
    "ctaReserve": "Reserve a table",
    "ctaDining": "Staying with us? All dining →"
  },
  "map": {
    "label": "Neighbourhood",
    "title": "You're in the right part of Berlin",
    "subtitle": "Tiergarten, the canal, Ku'damm — all on foot",
    "cta": "Explore the neighbourhood",
    "walkNote": "Everything within 15 min on foot"
  },
  "faq": {
    "title": "Good questions.",
    "allFaqs": "All FAQs"
  },
  "footer": {
    "bookingStrip": "Best rate guaranteed when you book direct",
    "checkAvailability": "Check availability",
    "alreadyHere": "Already here?",
    "alreadyHereDesc": "Your guest hub — events, dining, neighbourhood picks, and everything you need during your stay.",
    "recognition": "Recognition",
    "partOf": "Part of",
    "copyright": "© 2026 Pandox Berlin GmbH",
    "designBy": "design by: smoothism.com"
  }
}
```

---

## Step 7 — Accessibility verification

This is a verification pass, not a build pass. Every item below should already be true from Steps 1–6. If any item fails, fix it before marking the build done.

### Document
- [ ] `<html lang={locale}>` switches correctly between `en` and `de` routes
- [ ] Skip to main content link is first focusable element, visible on focus
- [ ] One `<h1>` on the page — in `<HeroSection>` only
- [ ] `<h2>` for each section heading, `<h3>` for sub-items within sections
- [ ] `<header>`, `<main id="main-content">`, `<footer>` all present

### Navigation
- [ ] Primary `<nav aria-label="Primary navigation">`
- [ ] Secondary `<nav aria-label="Guest navigation">`
- [ ] Mobile hamburger: `aria-expanded`, `aria-controls`, `aria-label` changes on state
- [ ] Mobile drawer: `role="dialog"`, `aria-modal="true"`, `aria-label`
- [ ] Drawer closes on Escape, focus returns to hamburger button
- [ ] Active page link has `aria-current="page"`
- [ ] All nav lists use `<ul role="list"><li>` structure

### Hero
- [ ] `<KenBurnsSlider aria-label="Hotel Berlin, Berlin photo gallery">`
- [ ] `aria-roledescription="carousel"` on the slider container
- [ ] `aria-live="polite" aria-atomic="true"` live region announces slide change
- [ ] Pause/play button: `aria-label` updates on state change
- [ ] Ken Burns transform disabled when `prefers-reduced-motion: reduce`
- [ ] MiniSatellite link: `aria-label` includes "(opens in new tab)"

### Rooms and Meetings
- [ ] Cycling panel has `aria-live="polite" aria-atomic="true"`
- [ ] Hidden panels have `aria-hidden="true"` (not `display:none`)
- [ ] Dot nav buttons have `role="tab"`, `aria-selected`, `aria-label`
- [ ] Icon cells in room grid use `<ul role="list"><li>` — not `<div>`
- [ ] All Lucide icons have `aria-hidden="true"` — they are decorative

### Arts & Culture
- [ ] Card grid is `<ul role="list">` with `<li>` children
- [ ] Each card is `<article>` with `<h3>` title
- [ ] External CTAs have `aria-label="... (opens in new tab)"`

### Lütze
- [ ] Hours block uses `<dl><dt><dd>` — not a div grid
- [ ] `<OpenStatusBadge>` has `aria-live="polite"` and `role="status"`
- [ ] External link to luetze-berlin.de has `aria-label` with "(opens in new tab)"

### FAQ
- [ ] Each question is a `<button>` inside an `<h3>` inside a `<li>`
- [ ] `aria-expanded` on each button reflects open state
- [ ] `aria-controls` points to the matching answer `id`
- [ ] Answer has `role="region"` and `aria-labelledby` pointing to the button `id`
- [ ] `hidden` attribute (not CSS) used to hide collapsed answers
- [ ] Single-open: opening one closes the previous

### Footer
- [ ] `<footer aria-label="Site footer">`
- [ ] Each footer nav column is a `<nav aria-label="...">`
- [ ] Link lists are `<ul role="list"><li>`
- [ ] Contact block uses `<address>`
- [ ] Social list is `<ul role="list" aria-label="Social media links">`
- [ ] Awards list is `<ul role="list">` with `<p class="sr-only">` heading
- [ ] Legal nav is `<nav aria-label="Legal links">`
- [ ] All text on `#1E1530` meets AA — minimum `#8A8A8A`
- [ ] Mobile footer accordions follow same aria pattern as FAQ accordion

### Contrast
- [ ] Run axe DevTools or similar on `/en` and `/de` routes
- [ ] Zero WCAG AA contrast failures
- [ ] Focus rings visible on all interactive elements in both light and dark OS themes

---

## File structure

```
src/
  app/
    [locale]/
      layout.tsx              — fonts, lang, skip link, JSON-LD
      page.tsx                — homepage assembly
      rooms/page.tsx          — RoomsSection + FAQSection(rooms)
      meetings/page.tsx       — MeetingsSection + FAQSection(meetings)
      neighbourhood/page.tsx  — MapTeaser + NeighbourhoodMap (next brief)
      faqs/page.tsx           — full FAQ page
  components/
    layout/
      SiteNav.tsx
      SiteFooter.tsx
    sections/
      HeroSection.tsx
      RoomsSection.tsx
      MeetingsSection.tsx
      CultureSection.tsx
      LutzeSection.tsx
      MapTeaser.tsx
      FAQSection.tsx
    primitives/
      KenBurnsSlider.tsx
      SectionHeading.tsx
      ContentCard.tsx
      FAQAccordion.tsx
      SlideDotsNav.tsx
      OpenStatusBadge.tsx
      HotelDiscPin.tsx
      HintDot.tsx
    map/
      HotelDiscPin.tsx        — same as primitives, also used in MapTeaser
      HintDot.tsx
  lib/
    data/
      rooms.json
      faqs.json
      places.json
    map/
      staticPins.ts
    queries/
      places.ts
      faqs.ts
      rooms.ts
  messages/
    en.json
    de.json
  app/
    globals.css
  tailwind.config.ts
```

---

## Definition of done

### Build
- [ ] `tailwind.config.ts` complete — no raw hex in any component
- [ ] Archivo Narrow and Lora loading via `next/font/google`
- [ ] All 8 primitives built and rendering in isolation
- [ ] All 9 sections built and rendering on the homepage
- [ ] Homepage at `localhost:3000/en` — no errors, no warnings
- [ ] Mobile layout correct at 390px — all sections
- [ ] `npm run build` completes without TypeScript or lint errors

### Visual
- [ ] Ken Burns effect working — crossfade and slow pan
- [ ] `prefers-reduced-motion` disables transform, keeps crossfade
- [ ] OpenStatusBadge shows correct Berlin timezone status
- [ ] FAQ accordion single-open, smooth reveal animation
- [ ] SlideDotsNav animates correctly — width and colour
- [ ] MapTeaser renders hotel disc pin and hint dots at correct positions
- [ ] Footer correct on desktop — 5 columns + inside panel
- [ ] Footer accordion correct on mobile

### Semantic HTML
- [ ] One `<h1>` on the page
- [ ] All sections use `<section aria-labelledby>`
- [ ] Navigation uses `<nav>` with `aria-label`
- [ ] Lists of links use `<ul><li>` structure
- [ ] Cards use `<article>` with `<h3>`
- [ ] Hours block uses `<dl><dt><dd>`
- [ ] Contact uses `<address>`
- [ ] No `<div onClick>` or `<span>` as interactive element anywhere

### Accessibility
- [ ] Skip link present and functional
- [ ] Zero axe DevTools errors at WCAG AA level
- [ ] All interactive elements keyboard-navigable
- [ ] All images have appropriate alt text
- [ ] All external links labelled "(opens in new tab)"
- [ ] Focus ring visible in both light and dark OS modes
- [ ] Accordions (FAQ + mobile footer) correct aria pattern
- [ ] Carousel correct aria pattern with live region
- [ ] `<html lang>` correct per route
- [ ] All footer text on `#1E1530` meets 4.5:1 contrast minimum

---

## Notes for Cursor

- **Build in order.** Tokens → primitives → sections → pages. Do not combine steps.
- **No raw hex in components.** Every colour uses a Tailwind token from `tailwind.config.ts`.
- **No `border-radius` except pill badges.** This is a hard brand rule.
- **No `<div onClick>`.** Every interactive element is a `<button>` or `<a>`. No exceptions.
- **No suppressed focus rings.** The global `:focus-visible` rule provides the brand-consistent ring.
- **Semantic HTML is not optional.** The correct element for each context is specified above. Do not substitute a `<div>` for a `<section>`, `<nav>`, `<article>`, `<ul>`, `<dl>`, or `<address>`.
- **`hidden` attribute for accordion content** — not `display:none` via CSS. This is required for correct screen reader behaviour.
- **`aria-live` on cycling content** — Rooms and Meetings panels must announce slide changes.
- **`prefers-reduced-motion`** — check on mount in KenBurnsSlider. Do not skip this.
- **MapTeaser** has its own detailed brief (`HotelBerlin_MapTeaserBuildBrief.md`) — follow it exactly.
- **Footer text contrast** — minimum `#8A8A8A` on `#1E1530`. Never use `#555`, `#444`, or `#333` for any text in the footer.
- **Lucide icons** — all `aria-hidden="true"` on decorative icons. Icon-only buttons get `aria-label` on the button, not the icon.
- **Letter-spacing on small labels** — Archivo Narrow at ≤13px needs `letter-spacing: 0.08em` minimum. At 9.5px uppercase: `0.12em`.
- **No additional npm packages** beyond what is already installed.

---

*Hotel Berlin, Berlin — Homepage Build Brief · June 2026*
*Next: HotelBerlin_NeighbourhoodMapBrief.md — interactive Mapbox GL JS map*
