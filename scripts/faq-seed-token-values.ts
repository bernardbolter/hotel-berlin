/**
 * FAQ System Part B Step 2 — seed attested token source values.
 *
 * Reads doc/faqs/faq-tokens.json.
 * Writes ONLY tokens with seedNow=true.
 * seedNow=false and HOLD tokens are never written (sources stay empty / null).
 *
 * Usage:
 *   npx tsx scripts/faq-seed-token-values.ts           # dry-run
 *   npx tsx scripts/faq-seed-token-values.ts --write
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../src/payload.config'

type TokenRow = {
  token: string
  value: { en: string; de: string } | null
  sourceField: string
  seedNow: boolean
  status: string
}

type TokensFile = { tokens: TokenRow[] }

const write = process.argv.includes('--write')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const filePath = path.join(root, 'doc/faqs/faq-tokens.json')

function assertLocalDb() {
  const url = process.env.DATABASE_URL || ''
  console.log('DATABASE_URL=', url)
  if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
    throw new Error('Refusing to run: DATABASE_URL is not local (localhost/127.0.0.1).')
  }
}

/** Parse "€30" / "30 €" / "0,40 €" → number */
function parseEuro(display: string): number {
  const cleaned = display.replace(/[€\s]/g, '').replace(',', '.')
  const n = Number(cleaned)
  if (Number.isNaN(n)) throw new Error(`Cannot parse euro value: ${display}`)
  return n
}

function parsePercent(display: string): number {
  const n = Number(display.replace(/[%\s]/g, ''))
  if (Number.isNaN(n)) throw new Error(`Cannot parse percent: ${display}`)
  return n
}

function parseHeightM(display: string): number {
  // "1.80 m" / "1,80 m"
  const n = Number(display.replace(/\s*m$/i, '').replace(',', '.'))
  if (Number.isNaN(n)) throw new Error(`Cannot parse height: ${display}`)
  return n
}

function parseNoticeMinutes(display: string): number {
  const m = display.match(/(\d+)/)
  if (!m) throw new Error(`Cannot parse notice minutes: ${display}`)
  return Number(m[1])
}

async function main() {
  assertLocalDb()
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as TokensFile
  const payload = await getPayload({ config })

  const written: string[] = []
  const leftEmpty: string[] = []
  const hold: string[] = []
  const hotelPatch: Record<string, unknown> = {}
  let saunaNoticeMinutes: number | null = null

  console.log(`\n=== token seed mode=${write ? 'WRITE' : 'DRY-RUN'} ===`)

  for (const row of raw.tokens) {
    const name = row.token.replace(/^\{\{|\}\}$/g, '')
    if (row.status === 'HOLD' || row.value == null) {
      hold.push(name)
      console.log(`  HOLD/null  ${row.token} — never write`)
      continue
    }
    if (!row.seedNow) {
      leftEmpty.push(name)
      console.log(`  EMPTY     ${row.token} — seedNow=false, leave source empty`)
      continue
    }

    // seedNow=true — map to real fields
    switch (name) {
      case 'checkinTime':
        hotelPatch.checkinTime = row.value.en
        break
      case 'checkoutTime':
        hotelPatch.checkoutTime = row.value.en
        break
      case 'earlyCheckinFrom':
        hotelPatch.earlyCheckin = {
          ...((hotelPatch.earlyCheckin as object) || {}),
          from: row.value.en,
        }
        break
      case 'earlyCheckinFee':
        hotelPatch.earlyCheckin = {
          ...((hotelPatch.earlyCheckin as object) || {}),
          fee: parseEuro(row.value.en),
        }
        break
      case 'breakfastWeekday':
        // Step 3 override: keep leading zeros ("06:30–10:00")
        hotelPatch.guestStay = {
          ...((hotelPatch.guestStay as object) || {}),
          breakfast: {
            valueEN: '06:30–10:00',
            valueDE: '06:30–10:00',
          },
        }
        break
      case 'breakfastPrice':
        hotelPatch.breakfastPricing = {
          ...((hotelPatch.breakfastPricing as object) || {}),
          adultPrice: parseEuro(row.value.en),
        }
        break
      case 'breakfastChildMinAge':
        hotelPatch.breakfastPricing = {
          ...((hotelPatch.breakfastPricing as object) || {}),
          childAgeFrom: Number(row.value.en),
        }
        break
      case 'parkingSpaces':
        hotelPatch.parking = {
          ...((hotelPatch.parking as object) || {}),
          spaces: Number(row.value.en),
        }
        break
      case 'parkingHourly':
        hotelPatch.parking = {
          ...((hotelPatch.parking as object) || {}),
          hourly: parseEuro(row.value.en),
        }
        break
      case 'parkingDaily':
        hotelPatch.parking = {
          ...((hotelPatch.parking as object) || {}),
          dailyMax: parseEuro(row.value.en),
        }
        break
      case 'parkingMaxHeight':
        hotelPatch.parking = {
          ...((hotelPatch.parking as object) || {}),
          maxHeight: parseHeightM(row.value.en),
        }
        break
      case 'petFee':
        hotelPatch.petFee = parseEuro(row.value.en)
        break
      case 'saunaNotice':
        saunaNoticeMinutes = parseNoticeMinutes(row.value.en)
        break
      case 'cancelFlexibleUntil':
        hotelPatch.ratePolicy = {
          ...((hotelPatch.ratePolicy as object) || {}),
          flexibleCancelUntil: row.value.en,
        }
        break
      case 'noShowCharge':
        hotelPatch.ratePolicy = {
          ...((hotelPatch.ratePolicy as object) || {}),
          noShowPercent: parsePercent(row.value.en),
        }
        break
      case 'smokingFee':
        hotelPatch.smokingFee = parseEuro(row.value.en)
        break
      case 'phoneRateDomestic':
        hotelPatch.roomPhoneRates = {
          ...((hotelPatch.roomPhoneRates as object) || {}),
          domestic: parseEuro(row.value.en),
        }
        break
      case 'phoneRateIntlMin':
        hotelPatch.roomPhoneRates = {
          ...((hotelPatch.roomPhoneRates as object) || {}),
          intlMin: parseEuro(row.value.en),
        }
        break
      case 'phoneRateIntlMax':
        hotelPatch.roomPhoneRates = {
          ...((hotelPatch.roomPhoneRates as object) || {}),
          intlMax: parseEuro(row.value.en),
        }
        break
      case 'emailInfo':
        hotelPatch.email = row.value.en
        break
      case 'hotelAddress':
        // Existing structured address — do not overwrite street parts from a flat string
        console.log(`  SKIP-write ${row.token} — address already structured on hotel.address`)
        written.push(`${name} (existing address; not overwritten)`)
        continue
      default:
        throw new Error(`No seed mapping for seedNow token ${row.token}`)
    }
    written.push(name)
    console.log(`  WRITE     ${row.token} → ${row.sourceField}`)
  }

  if (write) {
    if (Object.keys(hotelPatch).length > 0) {
      // Merge nested groups with current hotel so we don't wipe siblings
      const current = await payload.findGlobal({
        slug: 'hotel',
        depth: 0,
        overrideAccess: true,
      })
      const data: Record<string, unknown> = { ...hotelPatch }
      if (hotelPatch.earlyCheckin) {
        data.earlyCheckin = {
          ...(current.earlyCheckin || {}),
          ...(hotelPatch.earlyCheckin as object),
        }
      }
      if (hotelPatch.parking) {
        data.parking = { ...(current.parking || {}), ...(hotelPatch.parking as object) }
      }
      if (hotelPatch.ratePolicy) {
        data.ratePolicy = {
          ...(current.ratePolicy || {}),
          ...(hotelPatch.ratePolicy as object),
        }
      }
      if (hotelPatch.roomPhoneRates) {
        data.roomPhoneRates = {
          ...(current.roomPhoneRates || {}),
          ...(hotelPatch.roomPhoneRates as object),
        }
      }
      if (hotelPatch.breakfastPricing) {
        data.breakfastPricing = {
          ...(current.breakfastPricing || {}),
          ...(hotelPatch.breakfastPricing as object),
        }
      }
      if (hotelPatch.guestStay) {
        const gs = current.guestStay || {}
        const patchGs = hotelPatch.guestStay as { breakfast?: object }
        data.guestStay = {
          ...gs,
          breakfast: { ...(gs.breakfast || {}), ...(patchGs.breakfast || {}) },
        }
      }
      await payload.updateGlobal({
        slug: 'hotel',
        data,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
      console.log('  updated hotel global')
    }
    if (saunaNoticeMinutes != null) {
      const sauna = await payload.find({
        collection: 'amenities',
        where: { slug: { equals: 'sauna' } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (!sauna.docs[0]) throw new Error('amenities sauna not found')
      await payload.update({
        collection: 'amenities',
        id: sauna.docs[0].id,
        data: { noticeMinutes: saunaNoticeMinutes },
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
      console.log(`  updated amenities/sauna noticeMinutes=${saunaNoticeMinutes}`)
    }
  }

  console.log('\n--- summary ---')
  console.log('written:', written.join(', ') || '(none)')
  console.log('left empty (seedNow=false):', leftEmpty.join(', ') || '(none)')
  console.log('HOLD (never write):', hold.join(', ') || '(none)')
  if (!write) console.log('\nDry-run only. Re-run with --write to apply.')
  else console.log('\nWRITE DONE')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
