import { chromium } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(dirname, '../doc/art/screenshots-a2')

const shots = [
  { slug: 'vogel', w: 1440, h: 900, name: 'vogel-1440.png' },
  { slug: 'vogel', w: 390, h: 844, name: 'vogel-390.png' },
  { slug: 'somari', w: 1440, h: 900, name: 'somari-1440.png' },
  { slug: 'somari', w: 390, h: 844, name: 'somari-390.png' },
]

async function main() {
  const browser = await chromium.launch()
  for (const shot of shots) {
    const page = await browser.newPage({ viewport: { width: shot.w, height: shot.h } })
    await page.goto(`http://localhost:3000/de/hier/art/${shot.slug}`, {
      waitUntil: 'networkidle',
    })
    await page.waitForTimeout(800)
    await page.screenshot({
      path: path.join(outDir, shot.name),
      fullPage: true,
    })
    await page.close()
    console.log('wrote', shot.name)
  }
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
