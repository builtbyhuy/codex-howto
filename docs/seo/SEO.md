# Howto codex: discovery and indexing

Howto codex is an independent OpenAI Codex guide hosted on GitHub, with a desktop-app-first course, 60 English lessons and seven practice projects. It is not official OpenAI documentation. The introductions in other languages are not complete translations of the course.

## Entry points and intent

| Reader intent | Entry point | What it actually offers |
| --- | --- | --- |
| Codex guide GitHub / OpenAI Codex tutorial | [Repository](https://github.com/builtbyhuy/codex-howto) and [course home](https://builtbyhuy.github.io/codex-howto/) | A course introduction, source package, lessons and practice projects |
| Learn Codex from the desktop app | [First lesson](https://builtbyhuy.github.io/codex-howto/assets/reading/s01-01.html) and [learning path](../../LEARNING-ROADMAP.md) | Read-only inspection first, then bounded practice and verification |
| Codex skills, MCP, delegation or CLI workflows | [Reading curriculum](https://builtbyhuy.github.io/codex-howto/assets/reading/index.html) and [GitHub lesson catalog](../../CATALOG.md) | Specific authored lessons, individual titles, examples and checks |

The home title and introduction describe that scope naturally. Individual lessons retain their actual titles and descriptions. There are no keyword-only landing pages, hidden text, fabricated ratings or full-course translation claims. GitHub About uses the actual GitHub Pages URL and relevant repository topics.

## Crawlable delivery

[sitemap.xml](https://builtbyhuy.github.io/codex-howto/sitemap.xml) lists the canonical home, reading curriculum and 60 HTML lessons. Hash routes are interactive navigation, not separate sitemap URLs. Lesson HTML contains readable authored content without JavaScript. The sitemap omits dates because this build has no authoritative per-page modification timestamps.

This project is served below `/codex-howto/`. Robots rules apply at the host root, `https://builtbyhuy.github.io/robots.txt`; a project-level robots file cannot control the host. This release does not edit other repositories to manage the host root. A missing robots file does not itself block crawling. Search Console sitemap submission and URL Inspection are separate recorded actions, not implied by creating XML.

Existing WebSite and BreadcrumbList data are retained. WebSite describes the site, but Google's site-name feature does not support subdirectory sites. Breadcrumbs match the real reading hierarchy. No retired HowTo/FAQ rich-result appearance is promised.

The home WebSite after this release is:

```json
{"@context":"https://schema.org","@type":"WebSite","@id":"https://builtbyhuy.github.io/codex-howto/#website","name":"Howto codex","url":"https://builtbyhuy.github.io/codex-howto/","inLanguage":"en","description":"Learn OpenAI Codex with 60 hands-on lessons and 7 practice labs. Start in the desktop app, explore CLI and IDE workflows, and verify what you build."}
```

The [prior schema record](../structured-data/SCHEMA-2026-10-25.md) retains the previous dated examples and validation scope. Actual Google indexing and submission status are recorded separately from vocabulary validity.

## Rebuild and verify

Use an existing Node.js 20+ installation from the source-package root. No package installation, account or paid API is needed for local checks:

```text
node scripts/build-seo.cjs
node scripts/build-home-snapshot.mjs
node scripts/build-reading-fallback.cjs
node scripts/build-seo.cjs --check
node scripts/build-home-snapshot.mjs --check
node scripts/build-reading-fallback.cjs --check
node tests/structured-data.cjs
node tests/schema-current.cjs
node tests/schema-generator.cjs
node tests/seo.cjs --controls
```

Metadata and home introductory copy originate in `assets/atelier/site-meta.mjs`. The Google verification value is public ownership proof for this exact deployment, not an account password or API key. Keep it on the original site to retain verification. Forks must remove/replace that verification value and use their own origin and Search Console property before deployment.

The SEO checker checks this site's metadata, canonical destinations, sitemap format and inventory. Its controls inject faults and valid variants only into disposable copies. It is not a universal HTML/XML validator or a ranking evaluator. The release also validates the actual XML with a separate XML parser and checks delivered bytes and browser flows.

## Evidence and limits

Keep crawlability, indexing, query visibility and ranking separate. Search results are observations for a particular query, language, region, session and time. An absent `site:` result is not definitive proof that Google has not indexed a URL. Search Console's indexed-page data differs from a live test of potential indexability. A sitemap accepted by Google or a submitted indexing request is not proof that a page is indexed or ranking.

The dated release evidence records the actual GitHub metadata, Google observations, verification/submission outcomes and live checks. These results do not certify learning effectiveness, broad accessibility conformance or design parity. No tracking endpoint or recurring monitoring task is added.

Official references checked for this release: [Google Search Essentials](https://developers.google.com/search/docs/essentials), [build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [robots.txt scope](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec), [URL Inspection](https://support.google.com/webmasters/answer/9012289), [site-name scope](https://developers.google.com/search/docs/appearance/site-names), [supported structured data](https://developers.google.com/search/docs/appearance/structured-data/search-gallery), and [GitHub topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics).
