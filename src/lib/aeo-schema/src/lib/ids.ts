import type { SiteConfig } from '../types';

/**
 * Canonical URL for a place or person detail page.
 *
 * Deliberately always resolves against `config.canonicalLocale` (German),
 * regardless of which locale the page is being rendered in. Both locales
 * share the *same* @id — schema.org entities are language-agnostic; the
 * hreflang mechanism (handled at the page-routing layer, not here) is what
 * tells crawlers which localized page to serve. Baking a locale-specific
 * @id in here would split one real-world entity into two graph nodes.
 */
export function placeUrl(slug: string, config: SiteConfig): string {
  return `${config.baseUrl}${config.paths.neighbourhood[config.canonicalLocale]}/${slug}`;
}

export function personUrl(slug: string, config: SiteConfig): string {
  return `${config.baseUrl}${config.paths.peopleHub[config.canonicalLocale]}/${slug}`;
}

export function neighbourhoodListUrl(config: SiteConfig): string {
  return `${config.baseUrl}${config.paths.neighbourhood[config.canonicalLocale]}`;
}

export function peopleListUrl(config: SiteConfig): string {
  return `${config.baseUrl}${config.paths.peopleHub[config.canonicalLocale]}`;
}

export function placeNodeId(slug: string, config: SiteConfig): string {
  return `${placeUrl(slug, config)}#place`;
}

export function personNodeId(slug: string, config: SiteConfig): string {
  return `${personUrl(slug, config)}#person`;
}

/**
 * Review nodes live under the *place's* URL, per the graph shape agreed —
 * `#review-{personSlug}` — and are referenced by @id from the person's page
 * rather than re-declared there. One fact, one place it's declared.
 */
export function reviewNodeId(placeSlug: string, personSlug: string, config: SiteConfig): string {
  return `${placeUrl(placeSlug, config)}#review-${personSlug}`;
}

export function hotelNodeId(config: SiteConfig): string {
  return `${config.baseUrl}/#hotel`;
}
