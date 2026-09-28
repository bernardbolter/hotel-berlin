import 'dotenv/config'
import './guard'
import { getPayload } from 'payload'

import config from '../payload.config'
import { hotelSeed } from './data'

async function seedGuestStayLocales() {
  const payload = await getPayload({ config })

  await payload.updateGlobal({
    slug: 'hotel',
    data: { guestStay: hotelSeed.guestStay },
  })

  console.log('Hotel guestStay locale pairs updated.')
  process.exit(0)
}

seedGuestStayLocales().catch((error) => {
  console.error('guestStay locale seed failed:', error)
  process.exit(1)
})
