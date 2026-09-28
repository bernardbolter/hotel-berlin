import 'dotenv/config'
import './guard'
import { getPayload } from 'payload'

import config from '../payload.config'

const calloutEn = {
  enabled: true,
  insertAfterSlug: 'premium',
  quote: 'Luxury must be comfortable, otherwise it is not luxury.',
  title: 'The Suites',
  body: 'Make Berlin your home in our generously sized and comfortable suites.',
}

const calloutDe = {
  quote: 'Luxus muss komfortabel sein, sonst ist es kein Luxus.',
  title: 'Die Suiten',
  body: 'Machen Sie Berlin zu Ihrem Zuhause in unseren großzügigen und komfortablen Suiten.',
}

async function seedRoomsSuitesCallout() {
  const payload = await getPayload({ config })

  await payload.updateGlobal({
    slug: 'hotel',
    locale: 'en',
    data: { roomsSuitesCallout: calloutEn },
  })

  await payload.updateGlobal({
    slug: 'hotel',
    locale: 'de',
    data: { roomsSuitesCallout: calloutDe },
  })

  console.log('Hotel roomsSuitesCallout updated (en + de).')
  process.exit(0)
}

seedRoomsSuitesCallout().catch((error) => {
  console.error('roomsSuitesCallout seed failed:', error)
  process.exit(1)
})
