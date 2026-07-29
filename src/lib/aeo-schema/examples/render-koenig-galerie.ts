// Run with: tsx examples/render-koenig-galerie.ts
// Prints the exact JSON-LD that would render in <script type="application/ld+json">
// on /nachbarschaft/koenig-galerie and /you-me-and-berlin/kristiane-kegelmann.

import { buildPersonPageGraph, buildPlacePageGraph } from '../src/builders/graph';
import { defaultConfig } from '../src/lib/config';
import { koenigGalerie, kristiane } from '../test/fixtures';

console.log('--- /de/nachbarschaft/koenig-galerie ---\n');
console.log(JSON.stringify(buildPlacePageGraph(koenigGalerie, defaultConfig), null, 2));

console.log('\n--- /de/you-me-and-berlin/kristiane-kegelmann ---\n');
console.log(
  JSON.stringify(
    buildPersonPageGraph(
      kristiane,
      [{ place: koenigGalerie, quote: 'Its spaces are unbelievable.' }],
      defaultConfig,
    ),
    null,
    2,
  ),
);
