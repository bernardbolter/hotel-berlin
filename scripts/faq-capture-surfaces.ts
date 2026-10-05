/**
 * Capture FAQ accordion + FAQPage JSON-LD from rendered HTML surfaces.
 * Usage: npx tsx scripts/faq-capture-surfaces.ts [out.json] [baseUrl]
 */
import fs from 'fs'

const base = process.argv[3] || process.env.BASE_URL || 'http://localhost:3000'
const out = process.argv[2] || '/tmp/faq-capture.json'

const PATHS = [
  { key: 'home-de', path: '/de' },
  { key: 'home-en', path: '/en' },
  { key: 'rooms-de', path: '/de/zimmer' },
  { key: 'rooms-en', path: '/en/rooms' },
  { key: 'here-de', path: '/de/hier' },
  { key: 'here-en', path: '/en/here' },
]

function extract(html: string) {
  const graphs: unknown[] = []
  const re = /<script type="application\/ld\+json">(.*?)<\/script>/gs
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) != null) {
    try {
      const data = JSON.parse(m[1])
      if (data && typeof data === 'object') {
        if ((data as { '@type'?: string })['@type'] === 'FAQPage') graphs.push(data)
        if (Array.isArray(data)) {
          for (const d of data) {
            if (d && d['@type'] === 'FAQPage') graphs.push(d)
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  const ids = [...html.matchAll(/id="faq-question-([^"]+)"/g)].map((x) => x[1])
  // Question text: button > span
  const questions: string[] = []
  const qRe =
    /id="faq-question-[^"]+"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/g
  let qm: RegExpExecArray | null
  while ((qm = qRe.exec(html)) != null) {
    questions.push(qm[1].replace(/\s+/g, ' ').trim())
  }

  const answers: string[] = []
  const aRe = /id="faq-answer-[^"]+"[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g
  let am: RegExpExecArray | null
  while ((am = aRe.exec(html)) != null) {
    answers.push(am[1].replace(/\s+/g, ' ').trim())
  }

  const entities =
    graphs.length > 0
      ? (graphs[0] as { mainEntity?: { name?: string; acceptedAnswer?: { text?: string } }[] })
          .mainEntity?.map((e) => ({
            name: e.name ?? '',
            text: e.acceptedAnswer?.text ?? '',
          })) ?? []
      : []

  return { ids, questions, answers, jsonld: entities, faqpageCount: graphs.length }
}

async function fetchHtml(path: string): Promise<string> {
  const res = await fetch(base + path, {
    headers: { Accept: 'text/html', 'Cache-Control': 'no-cache' },
  })
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return res.text()
}

async function main() {
  console.log('BASE=', base, 'flag hint FAQ_ROUTING_V2=', process.env.FAQ_ROUTING_V2 ?? 'unset')
  const outData: Record<string, unknown> = { base, capturedAt: new Date().toISOString() }
  for (const { key, path } of PATHS) {
    const html = await fetchHtml(path)
    const data = extract(html)
    outData[key] = { path, ...data }
    console.log(
      key,
      'ids',
      data.ids.length,
      'q',
      data.questions.length,
      'ld',
      data.jsonld.length,
      data.ids.join(','),
    )
  }
  fs.writeFileSync(out, JSON.stringify(outData, null, 2))
  console.log('wrote', out)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
