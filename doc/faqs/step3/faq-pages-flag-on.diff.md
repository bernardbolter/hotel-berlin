# Flag-ON FAQ pages — rendered list vs JSON-LD

**Content parity: PASS** (same Q&A multiset on all four surfaces).  
**Order: differs** — accordion is grouped by `category` in `FAQPageView`; JSON-LD is emitted in `getFAQsForRoute` order (full unfiltered set). Every rendered `{name, text}` appears in JSON-LD and vice versa.

| surface | path | accordion | jsonld | content multiset | same order |
|---|---|---|---|---|---|
| faq-de | `/de/faq` | 22 | 22 | identical | no |
| faq-en | `/en/faq` | 22 | 22 | identical | no |
| here-faq-de | `/de/hier/faq` | 39 | 39 | identical | no |
| here-faq-en | `/en/here/faq` | 39 | 39 | identical | no |

Raw capture: [`faq-pages-flag-on.json`](faq-pages-flag-on.json).

*Captured with `FAQ_ROUTING_V2=true` on localhost:3000 after clearing a corrupted `.next/dev/prerender-manifest.json`.*
