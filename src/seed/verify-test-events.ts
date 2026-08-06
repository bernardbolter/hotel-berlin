/**
 * Smoke-check seeded test events against EventHelpers checklist.
 * Usage: npm run seed:test-events:verify
 */
import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../payload.config'
import { berlinLocalToUtc } from '../lib/venue-time/berlin'
import {
  getCurrentExhibitionForVenue,
  getCurrentOrNextEventToday,
  getNextEventForVenue,
} from '../lib/venue-time/queries'
import { resolveOccurrence } from '../lib/venue-time/recurrence'
import { mediaUrl } from '../lib/spotlight/media'

function atBerlin(isoLocal: string): Date {
  const [date, time = '00:00:00'] = isoLocal.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm, ss = '0'] = time.split(':')
  return berlinLocalToUtc(y!, m!, d!, Number(hh), Number(mm), Number(ss))
}

async function venueId(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'venues',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (!docs[0]) throw new Error(`Missing venue ${slug}`)
  return docs[0].id
}

async function main() {
  const lutze = await venueId('lutze')
  const kttk = await venueId('kttk')
  const fkkb = await venueId('fkkb')

  const checks: Array<{ name: string; ok: boolean; detail: string }> = []

  // Vinyl Nights — next Monday from a Tuesday
  {
    const now = atBerlin('2026-08-04T12:00:00') // Tue
    const next = await getNextEventForVenue(lutze, now)
    const ok = next?.event.name === 'Vinyl Nights'
    checks.push({
      name: 'getNextEventForVenue(lutze) → Vinyl Nights (next Mon)',
      ok: Boolean(ok),
      detail: next
        ? `${next.event.name ?? '(no name)'} slug=${(next.event as { slug?: string }).slug ?? '?'} @ ${next.occurrenceStart.toISOString()}`
        : 'null',
    })
  }

  // Zeichenstammtisch RRULE — isolate this event (Vinyl Nights is sooner at Lütze)
  {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'events',
      where: { slug: { equals: 'zeichenstammtisch' } },
      limit: 1,
      locale: 'en',
    })
    const event = docs[0]
    const now = atBerlin('2026-08-28T12:00:00')
    const occ = event
      ? resolveOccurrence(
          event.startDate,
          event.endDate,
          event.isRecurring,
          event.recurrenceRule,
          now,
        )
      : null
    const berlinDay = occ
      ? occ.start.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' })
      : null
    const ok = berlinDay === '2026-09-24'
    checks.push({
      name: 'Zeichenstammtisch next occurrence = 2026-09-24 (FREQ=MONTHLY;BYDAY=-1TH)',
      ok,
      detail: occ
        ? `${event?.name} @ ${occ.start.toISOString()} (Berlin ${occ.start.toLocaleString('en-GB', { timeZone: 'Europe/Berlin' })})`
        : 'null',
    })
  }

  // Open Play resolves for KTTK venue, but not hero on tournament day
  {
    const now = atBerlin('2026-08-10T15:00:00')
    const next = await getNextEventForVenue(kttk, now)
    checks.push({
      name: 'getNextEventForVenue(kttk) resolves Open Play (or tournament if nearer)',
      ok: Boolean(next),
      detail: next
        ? `${next.event.name} @ ${next.occurrenceStart.toISOString()}`
        : 'null',
    })
  }

  {
    const now = atBerlin('2026-08-13T17:00:00') // Thu tournament day, before 19:00
    const hero = await getCurrentOrNextEventToday(now)
    const ok = hero?.name === 'KTTK Tournament Night'
    checks.push({
      name: 'Aug 13 hero picks Tournament Night (excludes daily Open Play)',
      ok: Boolean(ok),
      detail: hero
        ? `${hero.name} relative=${hero.relativeTime.kind}`
        : 'null',
    })
  }

  // Exhibition for FKKB
  {
    const now = atBerlin('2026-08-10T12:00:00')
    const ex = await getCurrentExhibitionForVenue(fkkb, now)
    const url = mediaUrl(
      ex && 'heroImage' in ex
        ? (ex as { heroImage?: unknown }).heroImage as never
        : null,
    )
    checks.push({
      name: 'getCurrentExhibitionForVenue(fkkb) → Magwie × CokyOne',
      ok: ex?.title === 'Magwie × CokyOne',
      detail: ex
        ? `${ex.title} status=${ex.status} heroImage=${url ?? '(none yet — expected)'}`
        : 'null',
    })
  }

  console.log('\nVerification:')
  let failed = 0
  for (const c of checks) {
    console.log(`${c.ok ? '✓' : '✗'} ${c.name}`)
    console.log(`    ${c.detail}`)
    if (!c.ok) failed++
  }
  if (failed) {
    console.error(`\n${failed} check(s) failed`)
    process.exit(1)
  }
  console.log('\nAll checks passed.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
