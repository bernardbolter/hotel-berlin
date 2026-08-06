/**
 * Seed test events + Magwie × CokyOne exhibition from
 * doc/cards/HotelBerlin_TestEventSeed_Data.md
 *
 * Maps brief fields onto the real schema (name not title, Capitalized categories,
 * startDate ISO with Berlin-local time embedded — no separate startTime field).
 * No hero images yet — attach those in a follow-up pass.
 *
 * Usage:
 *   npm run seed:test-events
 *   npm run seed:test-events -- --force   # update existing by slug
 */
import 'dotenv/config'

import { getPayload, type Payload } from 'payload'

import config from '../payload.config'
import { berlinLocalToUtc } from '../lib/venue-time/berlin'

const force =
  process.argv.includes('--force') || process.env.TEST_EVENTS_SEED_FORCE === '1'

function berlinIso(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): string {
  return berlinLocalToUtc(year, month, day, hour, minute, 0).toISOString()
}

function plainRichText(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [{ type: 'text', text, version: 1 }],
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

async function venueIdBySlug(payload: Payload, slug: string): Promise<number> {
  const { docs } = await payload.find({
    collection: 'venues',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const id = docs[0]?.id
  if (id == null) {
    throw new Error(`Venue "${slug}" not found — run the main venue seed first`)
  }
  return id as number
}

async function upsertBySlug(
  payload: Payload,
  collection: 'artists' | 'events' | 'exhibitions',
  slug: string,
  data: Record<string, unknown>,
  locale: 'en' | 'de' = 'en',
): Promise<{ id: number; created: boolean }> {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const existing = docs[0]

  if (existing && !force && locale === 'en') {
    console.log(`Skip ${collection}/${slug} (id ${existing.id}) — use --force to update`)
    return { id: existing.id as number, created: false }
  }

  if (existing) {
    const updated = await payload.update({
      collection,
      id: existing.id,
      data,
      locale,
      overrideAccess: true,
    })
    console.log(`Updated ${collection}/${slug} [${locale}] (id ${updated.id})`)
    return { id: updated.id as number, created: false }
  }

  if (locale !== 'en') {
    throw new Error(`Cannot create ${collection}/${slug} in ${locale} — create EN first`)
  }

  const created = await payload.create({
    collection,
    data: { ...data, slug },
    locale,
    overrideAccess: true,
  })
  console.log(`Created ${collection}/${slug} (id ${created.id})`)
  return { id: created.id as number, created: true }
}

/** Write EN then DE localized fields for an already-upserted doc. */
async function upsertLocalized(
  payload: Payload,
  collection: 'events' | 'exhibitions',
  slug: string,
  shared: Record<string, unknown>,
  localized: { en: Record<string, unknown>; de: Record<string, unknown> },
) {
  const result = await upsertBySlug(payload, collection, slug, {
    ...shared,
    ...localized.en,
  })
  if (force || result.created) {
    await payload.update({
      collection,
      id: result.id,
      data: localized.de,
      locale: 'de',
      overrideAccess: true,
    })
    console.log(`  ↳ DE copy for ${slug}`)
  }
  return result.id
}

async function main() {
  const payload = await getPayload({ config })

  const lutzeId = await venueIdBySlug(payload, 'lutze')
  const kttkId = await venueIdBySlug(payload, 'kttk')
  const fkkbId = await venueIdBySlug(payload, 'fkkb')
  console.log(`Venues: lutze=${lutzeId} kttk=${kttkId} fkkb=${fkkbId}`)

  // --- Artists (exhibition refs) ---
  const magwie = await upsertBySlug(payload, 'artists', 'magwie', {
    name: 'Magdalena Wiegner',
    alias: 'Magwie',
    generateSlug: false,
    slug: 'magwie',
    instagram: 'https://www.instagram.com/x.magwie.x/',
    medium: 'Illustration, mixed media',
    shortBio:
      'Magdalena Wiegner, known as Magwie, creates surreal dreamscapes filled with playful, beautifully imperfect characters that blur the line between fantasy and reality.',
  })

  const cokyone = await upsertBySlug(payload, 'artists', 'cokyone', {
    name: 'Andreas Ponto',
    alias: 'CokyOne',
    generateSlug: false,
    slug: 'cokyone',
    instagram: 'https://www.instagram.com/cokyone/',
    medium: 'Graffiti, nature-inspired imagery',
    shortBio:
      'Andreas Ponto, known as CokyOne, brings the energy of graffiti together with nature-inspired imagery, exploring our connection to the world around us.',
  })

  // --- Events ---
  // 1 Vinyl Nights — weekly Monday 18:00
  await upsertLocalized(
    payload,
    'events',
    'vinyl-nights',
    {
      generateSlug: false,
      slug: 'vinyl-nights',
      category: 'Music',
      venue: lutzeId,
      startDate: berlinIso(2026, 8, 3, 18, 0),
      endDate: berlinIso(2026, 8, 3, 22, 0),
      isRecurring: true,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
      recurrenceNote: 'Every Monday from 18:00',
      price: 0,
      featured: true,
    },
    {
      en: {
        name: 'Vinyl Nights',
        shortDescription:
          'Monday evenings at Lütze: local selectors on the decks, drinks flowing, no cover. Bring a friend, claim a corner of the bar, and stay until the last record runs out.',
        description: plainRichText(
          'Weekly vinyl night in the heart of the hotel. Guest DJs from across Berlin spin everything from jazz to leftfield electronic — no cover charge, just good sound and a full bar. Starts at 18:00 every Monday.',
        ),
      },
      de: {
        name: 'Vinyl Nights',
        shortDescription:
          'Montags bei Lütze: lokale DJs an den Decks, Drinks, kein Eintritt. Bring Freund:innen mit, schnapp dir eine Ecke an der Bar und bleib bis zur letzten Platte.',
        description: plainRichText(
          'Wöchentlicher Vinyl-Abend mitten im Hotel. Gast-DJs aus ganz Berlin spielen von Jazz bis Leftfield Electronic — kein Eintritt, nur guter Sound und eine volle Bar. Jeden Montag ab 18:00.',
        ),
      },
    },
  )

  // 2 Zeichenstammtisch — last Thursday monthly 19:00
  await upsertLocalized(
    payload,
    'events',
    'zeichenstammtisch',
    {
      generateSlug: false,
      slug: 'zeichenstammtisch',
      category: 'Community',
      venue: lutzeId,
      startDate: berlinIso(2026, 8, 27, 19, 0),
      endDate: berlinIso(2026, 8, 27, 22, 0),
      isRecurring: true,
      recurrenceRule: 'FREQ=MONTHLY;BYDAY=-1TH',
      recurrenceNote: 'Last Thursday of every month, from 19:00',
      price: 0,
      featured: true,
    },
    {
      en: {
        name: 'Zeichenstammtisch',
        shortDescription:
          'An open drawing table for illustrators, sketchers, and the merely curious. Bring your own materials, share the table, and leave with new lines — and maybe a new collaborator.',
        description: plainRichText(
          'Once a month the last Thursday is for drawing. No workshop structure, no critique circle — just a long table, good light, and people who like making marks. Sketchbooks welcome; conversation optional.',
        ),
      },
      de: {
        name: 'Zeichenstammtisch',
        shortDescription:
          'Offener Zeichentisch für Illustrator:innen, Sketcher:innen und Neugierige. Eigenes Material mitbringen, den Tisch teilen und mit neuen Linien — und vielleicht neuen Kontakten — nach Hause gehen.',
        description: plainRichText(
          'Einmal im Monat am letzten Donnerstag: Zeichnen. Kein Workshop, kein Kritikkreis — nur ein langer Tisch, gutes Licht und Leute, die gerne Spuren hinterlassen. Skizzenbücher willkommen; Gespräch optional.',
        ),
      },
    },
  )

  // 3 KTTK Open Play — always-on daily (hero exclusion case)
  await upsertLocalized(
    payload,
    'events',
    'kttk-open-play',
    {
      generateSlug: false,
      slug: 'kttk-open-play',
      category: 'Sport',
      venue: kttkId,
      startDate: berlinIso(2026, 8, 1, 13, 0),
      endDate: berlinIso(2026, 8, 1, 23, 0),
      isRecurring: true,
      recurrenceRule: 'FREQ=DAILY',
      recurrenceNote: 'Daily, 13:00–23:00',
      price: 0,
      featured: false,
    },
    {
      en: {
        name: 'KTTK Open Play',
        shortDescription:
          'Drop-in table tennis every day in the basement — four JOOLA tables, no booking, bats at the Lütze bar. Come for a quick rally or stay for the afternoon.',
        description: plainRichText(
          'Daily open play at KTTK. Guests and locals share the tables from 13:00 to 23:00. Equipment available upstairs at Lütze if you travel light.',
        ),
      },
      de: {
        name: 'KTTK Open Play',
        shortDescription:
          'Tischtennis ohne Anmeldung im Keller — vier JOOLA-Platten, Schläger an der Lütze-Bar. Kurz reinschauen oder den Nachmittag bleiben.',
        description: plainRichText(
          'Tägliches Open Play beim KTTK. Gäste und Berliner:innen teilen sich die Tische von 13:00 bis 23:00. Material gibt es oben bei Lütze, falls du leicht unterwegs bist.',
        ),
      },
    },
  )

  // 4 KTTK Tournament Night — one-off Thu 13 Aug
  await upsertLocalized(
    payload,
    'events',
    'kttk-tournament-night',
    {
      generateSlug: false,
      slug: 'kttk-tournament-night',
      category: 'Sport',
      venue: kttkId,
      startDate: berlinIso(2026, 8, 13, 19, 0),
      endDate: berlinIso(2026, 8, 13, 22, 0),
      isRecurring: false,
      price: 5,
      featured: true,
    },
    {
      en: {
        name: 'KTTK Tournament Night',
        shortDescription:
          'One-night knockout tournament in the basement. Sign up at the door, no dress code, bats provided. €5 entry — loud rallies and a packed room guaranteed.',
        description: plainRichText(
          'A single-elimination night open to anyone who shows up. Warm-up from 19:00, brackets fill fast. Spectators welcome at the rail.',
        ),
      },
      de: {
        name: 'KTTK Tournament Night',
        shortDescription:
          'Ein Abend Knockout-Turnier im Keller. Anmeldung an der Tür, kein Dresscode, Schläger gestellt. 5 € Eintritt — laute Ballwechsel und volles Haus inklusive.',
        description: plainRichText(
          'Einmaliges K.o.-Turnier für alle, die auftauchen. Aufwärmen ab 19:00, die Brackets füllen sich schnell. Zuschauer:innen am Geländer willkommen.',
        ),
      },
    },
  )

  // 5 Magwie × CokyOne exhibition
  await upsertLocalized(
    payload,
    'exhibitions',
    'magwie-x-cokyone',
    {
      generateSlug: false,
      slug: 'magwie-x-cokyone',
      venue: fkkbId,
      artists: [magwie.id, cokyone.id],
      startDate: berlinIso(2026, 8, 1, 0, 0),
      endDate: berlinIso(2026, 9, 30, 23, 59),
      status: 'current',
    },
    {
      en: {
        title: 'Magwie × CokyOne',
        subtitle: 'A duo show',
        description: plainRichText(
          'Magdalena Wiegner (Magwie) invites you into surreal dreamscapes filled with playful, imperfect characters that blur fantasy and reality. Andreas Ponto (CokyOne) brings graffiti energy together with nature-inspired imagery — two voices sharing the same walls through late September. Free entry, open during hotel hours.',
        ),
      },
      de: {
        title: 'Magwie × CokyOne',
        subtitle: 'Eine Duo-Ausstellung',
        description: plainRichText(
          'Magdalena Wiegner (Magwie) öffnet surreale Traumwelten voller verspielter, unperfekter Figuren zwischen Fantasie und Realität. Andreas Ponto (CokyOne) verbindet Graffiti-Energie mit naturinspirierten Bildern — zwei Stimmen an denselben Wänden bis Ende September. Freier Eintritt, geöffnet während der Hotelzeiten.',
        ),
      },
    },
  )

  console.log('\nDone. Re-run with hero images attached if needed.')
  console.log('Verify with: npm run seed:test-events:verify')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
