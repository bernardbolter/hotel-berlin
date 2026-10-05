/**
 * Step 3 merge sets — shared by seed and tests.
 * Survivors must not be overwritten with pre-merge seed text.
 * Absorbed slugs must not be recreated as published.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

type Step3Content = {
  merges: Array<{ survivor: string; absorbed: string }>
}

let cached: { survivors: Set<string>; absorbed: Set<string> } | null = null

export function loadFaqMergeSets(): { survivors: Set<string>; absorbed: Set<string> } {
  if (cached) return cached
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const file = path.join(root, 'doc/faqs/faq-step3-content.json')
  const content = JSON.parse(fs.readFileSync(file, 'utf8')) as Step3Content
  cached = {
    survivors: new Set(content.merges.map((m) => m.survivor)),
    absorbed: new Set(content.merges.map((m) => m.absorbed)),
  }
  return cached
}
