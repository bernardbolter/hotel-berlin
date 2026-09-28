import { createReadStream, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import 'dotenv/config'

import { r2Configured, r2Endpoint } from '../src/lib/media/r2'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const mediaDir = path.resolve(dirname, '../media')

function listFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.name.startsWith('.')) continue
    const full = path.join(dir, name.name)
    if (name.isDirectory()) {
      out.push(...listFiles(full))
    } else if (name.isFile()) {
      out.push(full)
    }
  }
  return out.sort()
}

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const byExt: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
  }
  return byExt[ext] || 'application/octet-stream'
}

async function headSize(client: S3Client, bucket: string, key: string): Promise<number | null> {
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return typeof head.ContentLength === 'number' ? head.ContentLength : null
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    if (name === 'NotFound' || name === 'NoSuchKey' || name === '404') return null
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
    if (status === 404) return null
    throw error
  }
}

async function main() {
  if (!r2Configured()) {
    console.error(
      'R2 credentials are missing. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET. Local files were not touched.',
    )
    process.exit(1)
  }

  const bucket = process.env.R2_BUCKET as string
  const client = new S3Client({
    region: 'auto',
    endpoint: r2Endpoint(),
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
  })

  const files = listFiles(mediaDir)
  if (files.length === 0) {
    console.error(`No files in ${mediaDir}`)
    process.exit(1)
  }

  let uploaded = 0
  let skipped = 0
  const mismatches: { key: string; local: number; remote: number | null }[] = []

  for (const filePath of files) {
    const key = path.relative(mediaDir, filePath).split(path.sep).join('/')
    const localSize = statSync(filePath).size
    const existing = await headSize(client, bucket, key)

    if (existing === localSize) {
      skipped += 1
      continue
    }

    if (existing !== null && existing !== localSize) {
      mismatches.push({ key, local: localSize, remote: existing })
      continue
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: createReadStream(filePath),
        ContentType: contentTypeFor(filePath),
        ContentLength: localSize,
      }),
    )

    const after = await headSize(client, bucket, key)
    if (after !== localSize) {
      mismatches.push({ key, local: localSize, remote: after })
      continue
    }

    uploaded += 1
  }

  console.log(`media-to-r2: ${files.length} local files, ${uploaded} uploaded, ${skipped} already matched.`)
  console.log('Local copies were not deleted.')

  if (mismatches.length > 0) {
    console.error(`Mismatches (${mismatches.length}):`)
    for (const row of mismatches) {
      console.error(`  ${row.key}  local=${row.local}  r2=${row.remote ?? 'missing'}`)
    }
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
