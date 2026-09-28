# Hotel Berlin, Berlin — Production Infrastructure & Launch Path

*19 September 2026 · decisions log + open items · media decision updated 20 September 2026*

## Decided

- **Launch mode:** soft launch first (hotel-owned subdomain, not indexed), then switch hotel-berlin.de.
- **Scope:** everything goes live on the soft-launch site: the pages outside the hotel, the /hier guest hub, neighbourhood and people pages, venues and events.
- **Content entry:** Bernard enters content into Payload from material the hotel supplies. Enter it on **production**, not on the local machine.
- **Target:** as soon as possible. No fixed date.
- **Hosting model:** managed. **The hotel owns the accounts and pays for them. Bernard is invited as admin.**

- **19 Sept, confirmed after the launch-readiness audit:** Vercel stays. The Netcup VPS plan in the repo (`deploy/netcup/`, whose DEPLOY.md said to switch off Vercel) is superseded.
- **20 Sept:** production media lives on **Cloudflare R2**, not Vercel Blob. No egress charges, EU jurisdiction, and `@payloadcms/storage-s3` supports browser-direct uploads.

## Production stack

| Layer | Choice | Notes |
|---|---|---|
| App + Payload admin | Vercel **Pro** team (hotel-owned) | Hobby is non-commercial only. Functions region `fra1` (Frankfurt). |
| Database | Neon Postgres, Frankfurt (`aws-eu-central-1`) | Pooled URL for runtime, direct URL for migrations. Paid plan for point-in-time restore. Separate Neon branch for preview deploys so previews never touch real content. |
| Media | Cloudflare R2 via `@payloadcms/storage-s3` | `clientUploads: true` because serverless request bodies are capped at 4.5 MB. Public URLs come from `NEXT_PUBLIC_MEDIA_URL` (config, never stored on the record). Temporary `*.r2.dev` now; `media.hotel-berlin.de` later. Local disk remains the fallback when R2 credentials are unset. |
| Email | Resend, **EU region** domain | Send from a subdomain (e.g. `mail.hotel-berlin.de`). Needs SPF/DKIM DNS records. |
| Maps | Mapbox, hotel-owned account | Public token restricted by URL. |
| Environments | Production (`main`) + Preview (PRs) | The soft-launch site sends `noindex` (env-controlled) and sits behind basic auth in middleware. |

Data-processing agreements (DPA/AVV) are needed with Vercel, Neon, Cloudflare, Resend and Mapbox. List them in the Datenschutzerklärung. **Hotel/Pandox data protection officer to confirm.**

## Launch path

1. **Now, in parallel:**
   - request the accounts, the DNS contact and the DPO contact from the hotel
   - run `HotelBerlin_LaunchReadiness_Audit.md` in Cursor
   - switch Payload media to the R2 adapter locally
2. **Stand up production:**
   - create the accounts
   - Neon DB + migrations
   - R2 bucket (CORS for browser-direct uploads; see `doc/dev/MEDIA.md`)
   - environment variables
   - first deploy to `*.vercel.app`: noindex + basic auth
3. **Content + fixes:**
   - enter content on production
   - work through the code blockers from the audit
4. **Soft launch** on the hotel subdomain (e.g. `neu.hotel-berlin.de`). Needs DNS.
5. **Domain switch:**
   - redirect map from the old Galaxy URLs
   - indexing on
   - Search Console
   - Galaxy switched off
   - /hier QR codes printed against the final URL only

## Open

- **Who controls DNS for hotel-berlin.de?** This is on the critical path for the soft-launch subdomain, the Resend records and the final switch.
- The hotel's billing entity for Vercel / Neon / Cloudflare / Mapbox (Pandox Berlin GmbH?) and a card or invoice arrangement.
- Whether Pandox/Radisson group IT has hosting or security policies that apply.
- Galaxy/TravelClick contract end date and notice period. Galaxy stays up until the domain switch.
