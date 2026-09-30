# Hotel Berlin, Berlin — Production Infrastructure & Launch Path

*19 September 2026 · decisions log + open items*

## Decided

- **Launch mode:** soft launch first (hotel-owned subdomain, not indexed), then switch hotel-berlin.de.
- **Scope:** everything goes live on the soft-launch site: the pages outside the hotel, the /hier guest hub, neighbourhood and people pages, venues and events.
- **Content entry:** Bernard enters content into Payload from material the hotel supplies. Enter it on **production**, not on the local machine.
- **Target:** as soon as possible. No fixed date.
- **Hosting model:** managed. **The hotel owns the accounts and pays for them. Bernard is invited as admin.**

- **19 Sept, confirmed after the launch-readiness audit:** Vercel stays. The Netcup VPS plan in the repo (`deploy/netcup/`, whose DEPLOY.md said to switch off Vercel) is superseded.

## Production stack

| Layer | Choice | Notes |
|---|---|---|
| App + Payload admin | Vercel **Pro** team (hotel-owned) | Hobby is non-commercial only. Functions region `fra1` (Frankfurt). |
| Database | Neon Postgres, Frankfurt (`aws-eu-central-1`) | Pooled URL for runtime, direct URL for migrations. Paid plan for point-in-time restore. Separate Neon branch for preview deploys so previews never touch real content. |
| Media | Vercel Blob, `fra1` store, via `@payloadcms/storage-vercel-blob` | `clientUploads: true` because serverless request bodies are capped at 4.5 MB, so photo uploads would fail without it. Replaces local disk, which is the likely cause of the 16 Sept media 404s. |
| Email | Resend, **EU region** domain | Send from a subdomain (e.g. `mail.hotel-berlin.de`). Needs SPF/DKIM DNS records. |
| Maps | Mapbox, hotel-owned account | Public token restricted by URL. |
| Environments | Production (`main`) + Preview (PRs) | The soft-launch site sends `noindex` (env-controlled) and sits behind basic auth in middleware. |

Data-processing agreements (DPA/AVV) are needed with Vercel, Neon, Resend and Mapbox. List them in the Datenschutzerklärung. **Hotel/Pandox data protection officer to confirm.**

## Launch path

1. **Now, in parallel:**
   - request the accounts, the DNS contact and the DPO contact from the hotel
   - run `HotelBerlin_LaunchReadiness_Audit.md` in Cursor
   - switch Payload media to the Blob adapter locally
2. **Stand up production:**
   - create the accounts
   - Neon DB + migrations
   - Blob store
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
- The hotel's billing entity for Vercel / Neon / Mapbox (Pandox Berlin GmbH?) and a card or invoice arrangement.
- Whether Pandox/Radisson group IT has hosting or security policies that apply.
- Galaxy/TravelClick contract end date and notice period. Galaxy stays up until the domain switch.
