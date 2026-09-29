/**
 * Regenerate Payload imageSizes for every media document, driven by the
 * local `media/` tree (and R2 when a file is missing on disk).
 * Safe to re-run. Reports processed / failed counts.
 *
 * Usage: npm run media:regenerate-sizes
 */
import {
  createWriteStream,
  existsSync,
  readdirSync,
  rmSync,
  statSync,
  unlinkSync,
} from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import 'dotenv/config'
import { getPayload, type Payload } from 'payload'

import { r2Configured, r2Endpoint } from '../src/lib/media/r2'
import config from '../src/payload.config'
import type { Media } from '../src/payload-types'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const mediaDir = path.resolve(dirname, '../media')

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tif', '.tiff', '.avif'])
const SIZE_NAME_RE = /-(thumb|card|portrait|hero|og)(?:-\d+)?\./i

type MediaDoc = Media & { prefix?: string | null }

function isOriginalImage(filePath: string): boolean {
  const base = path.basename(filePath)
  const ext = path.extname(base).toLowerCase()
  if (!IMAGE_EXT.has(ext)) return false
  if (SIZE_NAME_RE.test(base)) return false
  return true
}

function listOriginals(dir: string): string[] {
  const out: string[] = []
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.name.startsWith('.')) continue
    const full = path.join(dir, name.name)
    if (name.isDirectory()) out.push(...listOriginals(full))
    else if (name.isFile() && isOriginalImage(full)) out.push(full)
  }
  return out.sort()
}

function r2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: r2Endpoint(),
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
  })
}

async function downloadFromR2(filename: string, prefix: string | null | undefined, destDir: string) {
  if (!r2Configured()) return null
  const key = [prefix, filename].filter(Boolean).join('/')
  const client = r2Client()
  const outPath = path.join(destDir, path.basename(filename))
  try {
    const res = await client.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET as string,
        Key: key,
      }),
    )
    if (!res.Body) return null
    await pipeline(res.Body as NodeJS.ReadableStream, createWriteStream(outPath))
    return outPath
  } catch (error) {
    console.error(`  R2 download failed for ${key}:`, error instanceof Error ? error.message : error)
    return null
  }
}

async function findByFilename(payload: Payload, filename: string): Promise<MediaDoc | null> {
  const result = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  return (result.docs[0] as MediaDoc | undefined) ?? null
}

async function ensureMediaDoc(
  payload: Payload,
  filePath: string,
): Promise<{ doc: MediaDoc; created: boolean }> {
  const filename = path.basename(filePath)
  const existing = await findByFilename(payload, filename)
  if (existing) return { doc: existing, created: false }

  const stem = path.parse(filename).name.replace(/[-_]+/g, ' ').trim() || filename
  const created = (await payload.create({
    collection: 'media',
    data: {
      alt: stem,
    },
    filePath,
    overwriteExistingFiles: true,
    overrideAccess: true,
  })) as MediaDoc

  return { doc: created, created: true }
}

async function regenerateOne(
  payload: Payload,
  doc: MediaDoc,
  sourcePath: string,
): Promise<void> {
  await payload.update({
    collection: 'media',
    id: doc.id,
    data: {},
    filePath: sourcePath,
    overwriteExistingFiles: true,
    overrideAccess: true,
  })
}

async function main() {
  const payload = await getPayload({ config })
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'hbb-regen-sizes-'))

  const originals = listOriginals(mediaDir)
  console.log(`Local original images: ${originals.length} in ${mediaDir}`)

  let processed = 0
  let created = 0
  let failed = 0
  const failures: { file: string; reason: string }[] = []
  const seen = new Set<string>()

  // 1) Walk local originals (the ~346-file case).
  for (const filePath of originals) {
    const basename = path.basename(filePath)
    try {
      const { doc, created: wasCreated } = await ensureMediaDoc(payload, filePath)
      if (wasCreated) created += 1
      // create() already generated sizes for new docs; re-run update so
      // existing docs pick up size-table changes.
      if (!wasCreated) {
        await regenerateOne(payload, doc, filePath)
      }
      if (doc.filename) seen.add(doc.filename)
      seen.add(basename)
      processed += 1
      if (processed % 25 === 0) console.log(`  … ${processed} processed`)
    } catch (error) {
      failed += 1
      failures.push({
        file: basename,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }

  // 2) Media docs whose originals are only on R2 (not in media/).
  let page = 1
  for (;;) {
    const result = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 50,
      page,
      pagination: true,
      overrideAccess: true,
    })

    for (const doc of result.docs as MediaDoc[]) {
      if (!doc.filename || seen.has(doc.filename)) continue
      if (!IMAGE_EXT.has(path.extname(doc.filename).toLowerCase())) continue
      if (SIZE_NAME_RE.test(doc.filename)) continue

      const local = path.join(mediaDir, doc.filename)
      let source: string | null = existsSync(local) ? local : null
      if (!source) source = await downloadFromR2(doc.filename, doc.prefix, tempDir)
      if (!source) {
        failed += 1
        failures.push({
          file: doc.filename,
          reason: 'original not found on disk or R2',
        })
        continue
      }

      try {
        await regenerateOne(payload, doc, source)
        processed += 1
        seen.add(doc.filename)
      } catch (error) {
        failed += 1
        failures.push({
          file: doc.filename,
          reason: error instanceof Error ? error.message : String(error),
        })
      }
    }

    if (!result.hasNextPage) break
    page += 1
  }

  try {
    for (const name of readdirSync(tempDir)) {
      try {
        unlinkSync(path.join(tempDir, name))
      } catch {
        /* ignore */
      }
    }
    rmSync(tempDir, { recursive: true, force: true })
  } catch {
    /* ignore */
  }

  const diskBytes = originals.reduce((sum, f) => sum + statSync(f).size, 0)
  console.log('')
  console.log(`Processed: ${processed}`)
  console.log(`Created as media docs: ${created}`)
  console.log(`Failed: ${failed}`)
  console.log(`Local originals scanned: ${originals.length} (${Math.round(diskBytes / 1024 / 1024)} MB)`)
  if (failures.length > 0) {
    console.log('Failures:')
    for (const f of failures.slice(0, 40)) {
      console.log(`  ${f.file}: ${f.reason}`)
    }
    if (failures.length > 40) console.log(`  … and ${failures.length - 40} more`)
  }

  process.exit(failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
