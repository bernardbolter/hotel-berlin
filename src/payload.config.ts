import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Artists } from './collections/Artists'
import { Artworks } from './collections/Artworks'
import { Events } from './collections/Events'
import { Exhibitions } from './collections/Exhibitions'
import { FAQs } from './collections/FAQs'
import { HeroSlides } from './collections/HeroSlides'
import { Pages } from './collections/Pages'
import { Media } from './collections/Media'
import { MeetingRooms } from './collections/MeetingRooms'
import { People } from './collections/People'
import { Places } from './collections/Places'
import { Rooms } from './collections/Rooms'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { Venues } from './collections/Venues'
import { Hotel } from './globals/Hotel'
import { Homepage } from './globals/Homepage'
import { Navigation } from './globals/Navigation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Tags,
    Rooms,
    MeetingRooms,
    Venues,
    HeroSlides,
    FAQs,
    Artists,
    Artworks,
    Exhibitions,
    Events,
    People,
    Places,
    Pages,
  ],
  globals: [Hotel, Homepage, Navigation],
  editor: lexicalEditor(),
  localization: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: process.env.NODE_ENV !== 'production',
  }),
  sharp,
  plugins: [],
})
