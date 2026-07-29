import type { JsonLdNode, Person, SiteConfig } from '../types.js';
import { hotelNodeId, personNodeId } from '../lib/ids.js';
import { buildAuthorityProps } from '../lib/authority.js';
import { prune } from '../lib/prune.js';

/**
 * Lightweight reference to a Person — used wherever another node (a Place,
 * a Review) needs to point at a person without re-declaring their full
 * profile. Google explicitly supports this pattern for shared entities:
 * a bare `{"@id": ..., "@type": "Person", "name": ...}` is enough for
 * cross-page entity resolution once the full node exists somewhere with
 * the same @id.
 */
export function buildPersonRef(person: Person, config: SiteConfig): JsonLdNode {
  return prune({
    '@type': 'Person',
    '@id': personNodeId(person.slug, config),
    name: person.name,
  });
}

/**
 * The full Person node — rendered on the person's own profile page
 * (`/you-me-and-berlin/[slug]`). Carries every field we have, including
 * authority signals; `prune()` drops whatever's missing.
 */
export function buildPersonNode(person: Person, config: SiteConfig): JsonLdNode {
  const { sameAs: authoritySameAs, identifier } = buildAuthorityProps(person.authority);

  // `instagram` is its own editor-facing field (simpler to fill than an
  // array), but schema.org has no dedicated Instagram property — it's a
  // `sameAs` URL like any other verified profile. Merge it in here rather
  // than asking editors to duplicate it into the authority.sameAs array.
  const sameAs = mergeUnique(authoritySameAs, person.instagram ? [person.instagram] : undefined);

  return prune({
    '@type': 'Person',
    '@id': personNodeId(person.slug, config),
    name: person.name,
    jobTitle: person.jobTitle,
    description: person.shortBio,
    url: person.website,
    sameAs,
    identifier,
    affiliation: { '@id': hotelNodeId(config) },
  });
}

function mergeUnique(a: string[] | undefined, b: string[] | undefined): string[] | undefined {
  if (!a && !b) return undefined;
  return Array.from(new Set([...(a ?? []), ...(b ?? [])]));
}
