/**
 * Capture /faq and /here/faq FAQ accordion + JSON-LD; assert parity.
 */
import fs from 'fs'

const base = process.argv[3] || 'http://localhost:3000'
const out = process.argv[2] || 'doc/faqs/step3/faq-pages-flag-on.json'

const PATHS = [
  { key: 'faq-de', path: '/de/faq' },
  { key: 'faq-en', path: '/en/faq' },
  { key: 'here-faq-de', path: '/de/hier/faq' },
  { key: 'here-faq-en', path: '/en/here/faq' },
]

function extract(html: string) {
  const graphs: { name: string; text: string }[][] = []
  const re = /<script type="application\/ld\+json">(.*?)<\/script>/gs
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) != null) {
    try {
      const data = JSON.parse(m[1])
      const pages = Array.isArray(data) ? data : [data]
      for (const d of pages) {
        if (d?.['@type'] === 'FAQPage' && Array.isArray(d.mainEntity)) {
          graphs.push(
            d.mainEntity.map((e: { name?: string; acceptedAnswer?: { text?: string } }) => ({
              name: e.name ?? '',
              text: e.acceptedAnswer?.text ?? '',
            })),
          )
        }
      }
    } catch {
      /* ignore */
    }
  }

  const ids = [...html.matchAll(/id="faq-question-([^"]+)"/g)].map((x) => x[1])
  const questions: string[] = []
  const qRe = /id="faq-question-[^"]+"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/g
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

  const jsonld = graphs[0] ?? []
  const rendered = questions.map((name, i) => ({ name, text: answers[i] ?? '' }))

  const namesMatch =
    JSON.stringify(rendered.map((r) => r.name)) === JSON.stringify(jsonld.map((j) => j.name))
  const textsMatch =
    JSON.stringify(rendered.map((r) => r.text)) === JSON.stringify(jsonld.map((j) => j.text))

  return {
    ids,
    renderedCount: rendered.length,
    jsonldCount: jsonld.length,
    namesMatch,
    textsMatch,
    parity: namesMatch && textsMatch && rendered.length === jsonld.length,
    rendered,
    jsonld,
  }
}

async function main() {
  console.log('BASE=', base)
  const outData: Record<string, unknown> = {
    base,
    capturedAt: new Date().toISOString(),
    flagHint: process.env.FAQ_ROUTING_V2 ?? 'unset',
  }
  let allParity = true
  for (const { key, path } of PATHS) {
    const res = await fetch(base + path, {
      headers: { Accept: 'text/html', 'Cache-Control': 'no-cache' },
    })
    if (!res.ok) throw new Error(`${path} → ${res.status}`)
    const data = extract(await res.text())
    outData[key] = { path, ...data }
    allParity = allParity && data.parity
    console.log(
      key,
      'ids',
      data.ids.length,
      'parity',
      data.parity,
      'namesMatch',
      data.namesMatch,
      'textsMatch',
      data.textsMatch,
    )
  }
  outData.allParity = allParity
  fs.writeFileSync(out, JSON.stringify(outData, null, 2))
  console.log('wrote', out, 'allParity=', allParity)
  process.exit(allParity ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
