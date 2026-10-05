import 'dotenv/config'
import { getFAQsForRoute } from '../src/lib/faq/getFaqsForRoute'
import type { FaqRouteKey } from '../src/lib/faq/routes'

async function main() {
  const routes: FaqRouteKey[] = ['home', 'rooms', 'here', 'faq', 'here-faq']
  for (const r of routes) {
    const { items, trimmedCount } = await getFAQsForRoute(r, 'en')
    console.log(
      r,
      items.length,
      'trimmed',
      trimmedCount,
      items.map((i) => i.slug).join(','),
    )
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
