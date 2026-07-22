# Hotel Berlin, Berlin

Marketing site and CMS for [Hotel Berlin, Berlin](https://www.hotel-berlin.de) — Next.js App Router, Payload CMS 3, PostgreSQL, and next-intl (`en` / `de`).

Staging target: self-hosted on a VPS (Netcup). See [`deploy/netcup/DEPLOY.md`](deploy/netcup/DEPLOY.md).

## Stack

- **Next.js 16** + React 19
- **Payload CMS 3** (`@payloadcms/db-postgres`) — admin at `/admin`
- **next-intl** — locale routes under `/en` and `/de`
- **Mapbox** — static / vector maps (hero teaser, neighbourhood)
- **Tailwind CSS** — design tokens in `tailwind.config.ts`

## Local setup

1. Clone and install:

   ```bash
   git clone https://github.com/bernardbolter/hotel-berlin.git
   cd hotel-berlin
   npm install
   ```

2. Copy env and fill in secrets:

   ```bash
   cp .env.example .env
   ```

   Required:

   | Variable | Purpose |
   | --- | --- |
   | `DATABASE_URL` | PostgreSQL connection string |
   | `PAYLOAD_SECRET` | Payload encryption secret |
   | `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Public Mapbox token (maps) |

   Optional:

   | Variable | Purpose |
   | --- | --- |
   | `NEXT_PUBLIC_MAPBOX_STYLE_ID` | Map style (default `mapbox/light-v11`) |
   | `NEXT_PUBLIC_SHOW_FULL_HOMEPAGE` | Set `true` to show Meetings / Culture / Map / FAQ / Footer while V2 homepage work is in progress |
   | `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
   | `REVALIDATE_SECRET` | On-demand ISR revalidation |

3. Start Postgres, then:

   ```bash
   npm run dev
   ```

   - Site: [http://localhost:3000](http://localhost:3000)
   - Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Useful scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js + Payload dev server |
| `npm run build` / `npm start` | Production build & serve |
| `npm run seed` | Seed CMS content |
| `npm run seed:rooms` | Seed room types + amenities |
| `npm run seed:room-images` | Upload room gallery images |
| `npm run seed:hero-images` | Upload homepage hero slides |
| `npm run generate:types` | Regenerate `src/payload-types.ts` |
| `npm run lint` | ESLint |
| `npm test` | Unit + e2e |
| `npm run test:a11y` | Accessibility (axe) |

## Project layout

```
src/
  app/[locale]/     # Public pages (home, neighbourhood, …)
  app/(payload)/    # Payload admin & API
  collections/      # Rooms, Places, HeroSlides, FAQs, …
  globals/          # Homepage, Hotel, Navigation
  components/       # UI (home hero, rooms teaser, map, …)
  lib/              # Payload helpers, map config, room mappers
  seed/             # Seed scripts + JSON data
  messages/         # en.json / de.json
doc/                # Build briefs & component specs
```

Homepage V2 focuses on the hero (forest + photo, Mapbox directions circle) and the Sleep & Relax rooms teaser. Specs live under `doc/version2/` and `doc/roomsHero/`.

## Deploy (Netcup / VPS)

Prefer running the full app on a VPS so Postgres + media stay on one machine.

Full checklist (including how to **stop Vercel auto-deploys**): [`deploy/netcup/DEPLOY.md`](deploy/netcup/DEPLOY.md).

Short version:

```bash
git clone https://github.com/bernardbolter/hotel-berlin.git
cd hotel-berlin && npm install
cp .env.example .env   # set DATABASE_URL, PAYLOAD_SECRET, Mapbox, SITE_URL
npm run build && pm2 start deploy/netcup/ecosystem.config.cjs
# nginx: deploy/netcup/nginx.conf
```

Updates: `deploy/netcup/update.sh` (pull → build → `pm2 restart`).

## License

Private project for Hotel Berlin, Berlin.
