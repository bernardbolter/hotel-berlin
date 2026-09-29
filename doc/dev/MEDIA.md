# Media

Files live on **local disk** in development (`media/` at the repo root) until R2 credentials are set. Production serves them from **Cloudflare R2**. The public URL is always built from `NEXT_PUBLIC_MEDIA_URL` — it is never stored on the media record — so switching from `*.r2.dev` to `media.hotel-berlin.de` is a one-line env change.

See `claude/HotelBerlin_ProductionFoundation_BuildBrief.md` §F2.

## Where files live

| Environment | Storage | Serving URL |
|---|---|---|
| Local, R2 env unset | `media/` on disk | `/api/media/file/{filename}` |
| Production (R2 credentials set) | R2 bucket `R2_BUCKET` | `{NEXT_PUBLIC_MEDIA_URL}/{filename}` |

Do not delete `media/` after uploading to R2.

## R2 adapter

`@payloadcms/storage-s3@3.85.0` talks to R2's S3 API:

- endpoint `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
- `region: 'auto'`
- `forcePathStyle: true`
- `clientUploads: true` — the browser PUTs straight to R2, so files larger than Vercel's 4.5 MB function body still work

Enabled only when `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `R2_BUCKET` are all set.

## Bucket CORS (required for `clientUploads`)

In the Cloudflare dashboard → R2 → the bucket → Settings → CORS policy. Without this, admin uploads from the browser fail.

Allow the origins you actually use (local, Vercel preview, production, custom domain). Example:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://*.vercel.app",
      "https://hotel-berlin.de",
      "https://www.hotel-berlin.de"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

The bucket also needs a public development URL (`*.r2.dev`) or a custom domain bound as `NEXT_PUBLIC_MEDIA_URL`. Objects are not served through `/api/media/file/…` once R2 is on.

## One-time copy of local files

```bash
npm run media:to-r2
```

Uploads every file in `media/` (expected: 346 on a full checkout). For each object it checks that the key exists and the size matches. Safe to re-run: matching objects are skipped. Mismatches are printed and the process exits non-zero. **Local copies are never deleted.**

## Adding an image size

That is F3 (`imageSizes` on `Media`). After F3:

1. Edit the size table on the collection.
2. `npm run migrate:create` / `npm run migrate`.
3. Run the regeneration script from that brief so existing files get the new derivative.

Until F3, only originals are stored and served.

## Image sizes (F3)

Named sizes on `media`: `thumb`, `card`, `portrait` (1:1), `hero`, `og` (1200×630 cover). Card width is the largest Playwright-measured on-route card `<img>` CSS width at 1440 × 2:

| Size | CSS (measured @ 1440) | Payload size |
|---|---|---|
| `card` | 432 (borrowed band; spotlight 304, amenity 302, tip/place 323) | 864 |
| `hero` | 1440 (`--site-max`) | 2880 |
| `portrait` | 320 (entity identity; hub 520 is off-route) | 640×640 |

Admin upload copy states the card minimum as **864** (the size, not the CSS width). Slots request the named size, not the original. For width-only sizes (`card`, `hero`), Payload omits the derivative when the source is narrower than the size; `mediaSizedUrl` then falls back to the original URL. (`withoutEnlargement: true` is reserved for fixed-box sizes like `thumb` / `portrait` / `og`, where it caps rather than omits.)

After changing the size table:

```bash
npm run migrate:create add_media_image_sizes
npm run migrate
npm run media:regenerate-sizes
```

The regenerate script walks every media document, reads the original from disk or R2, and re-writes derivatives. It prints processed / skipped / failed counts and is safe to re-run.

