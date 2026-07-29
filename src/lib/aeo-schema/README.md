# @hotel-berlin/aeo-schema

Pure, testable functions that turn Payload CMS data (`people`,
`neighbourhoodPlaces`) into the JSON-LD `@graph` for `/nachbarschaft/[slug]`,
`/you-me-and-berlin/[slug]`, and their listing pages.

## Principle

JSON-LD is a **render-time projection of Payload data**, not a stored,
hand-maintained blob. These functions take resolved CMS data in, and return
a plain object out — no database calls, no framework dependency, no side
effects. That's what makes them unit-testable without spinning up Payload
or Next.js, and it's what stops schema output quietly drifting out of sync
with the actual content as collections evolve.

## Usage (from a Next.js route)

```tsx
// app/[locale]/nachbarschaft/[slug]/page.tsx
import { buildPlacePageGraph, defaultConfig } from '@hotel-berlin/aeo-schema';

export default async function PlacePage({ params }: { params: { slug: string } }) {
  const place = await getResolvedPlace(params.slug); // your Payload fetch + endorsement.person resolve
  const graph = buildPlacePageGraph(place, defaultConfig);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
      {/* page content */}
    </>
  );
}
```

The caller is responsible for resolving relationships (turning a Payload
`recommendedBy`/`endorsements.person` id into the full `Person` object) —
these builders take fully-resolved data, they don't do fetching.

## Running tests

```
npm test        # runs the full suite via node:test + tsx
npm run example # prints real rendered JSON-LD for König Galerie + Kristiane
```

No install step needed beyond `tsx` (already available in this environment;
add it as a devDependency in the real repo).

## What's deliberately guarded by tests, not just convention

- **No `reviewRating` ever appears on a `Review` node.** There's no rating
  concept in this data — only editorial endorsement quotes. Fabricating a
  star rating to chase Google's rich-result snippet would misrepresent the
  content. `test/review.test.ts` has a standing guard test for this that
  should keep passing through any future refactor.
- **The same `Review` node, built two different ways** (starting from the
  place's endorsements array vs. starting from the person's resolved
  picks), **must be byte-identical.** See the `CONSISTENCY` test in
  `test/graph.test.ts` — this is what actually enforces "one fact, one
  place it's declared" rather than that just being a comment somewhere.
- **Listing pages never leak full nodes** — every item in an `ItemList` is
  an `@id`-only reference into the entity's own detail page. This is what
  keeps citation authority concentrated on the detail page rather than
  split across every page that happens to mention the same place.
- **The many-to-many endorsement case** (one place, multiple recommenders —
  confirmed in the real data via Schloss Charlottenburg / Maike +
  Alessandra Botts) falls out of the array shape with no special-casing,
  and is tested directly.
- **@id is always resolved against the canonical (German) locale**,
  regardless of which locale the page is rendered in — one real-world
  entity, one graph node, cross-locale linking handled by hreflang at the
  routing layer instead.

## What still needs a human decision before this ships

- Final DE slugs for `/rooms`, `/restaurant`, `/meetings`, `/about` — only
  `/nachbarschaft` and `/you-me-and-berlin` are locked so far. Update
  `src/lib/config.ts` once confirmed; nothing else needs to change.
- Whether `schemaType` needs more granular values than the 7 currently
  listed (`TouristAttraction | LocalBusiness | Museum | Park | Restaurant |
  BarOrPub | ShoppingCenter`) to cover all 9 xlsx categories cleanly.
