# Howto codex — a practical field guide

An independent app-first Codex course: **10 modules, 60 detailed English lessons and 7 downloadable practice projects**. This source package is **version 2.6**. Publication status is verified separately; no visual equality with Claude How-To or measured learner outcome is claimed.

The field-guide interface uses a light cool canvas, Fraunces display headings and Manrope body/UI text, JetBrains Mono code, restrained cobalt accents and a **Task → Change → Check** workbench. The workbench illustrates the bundled Orbit Notes task, reference change and six-check result. It never executes Codex or checks your local files.

**[Open the course](https://builtbyhuy.github.io/codex-howto/)** · [Read all 60 lessons without JavaScript](assets/reading/index.html) · [First reading lesson](assets/reading/s01-01.html) · [Report a lesson problem](https://github.com/builtbyhuy/codex-howto/issues/new)

**[Choose a dependency-aware path](LEARNING-ROADMAP.md)** · [Browse lessons on GitHub](CATALOG.md) · [Focused study and optional Codex coach](study/README.md) · [Website study sessions](https://builtbyhuy.github.io/codex-howto/#study)

**[Learn by doing](https://builtbyhuy.github.io/codex-howto/#learn/s01-01):** explore an original interactive 3D workspace, inspect the actual course sources, try bounded module activities and check your reasoning. All sixty lessons have source-derived Understand / Inspect / Try / Check stages. Ten module activities are shared browser practice; they do not run Codex or certify practical skill. Text controls and source inspection also work without WebGL. Exercise drafts stay in this open tab; only your explicit completion choice updates course progress.

Prerequisites: a browser for reading; existing Node.js 20+ for offline labs. Native Codex practice is optional and requires your own supported client/access. Outcomes: inspect source facts, make a bounded change, verify its result and explain recovery boundaries.

## Read, practise and keep your place

Start with a small search bug, then work through project guidance, skills, MCP, delegation, hooks and plugins. The desktop app comes first; CLI and IDE differences are explained where relevant. Each lesson includes an objective, explanation, diagram text, examples, exercise, checks, reference answer, troubleshooting and a knowledge check.

The home includes a readable curriculum snapshot, and all sixty lessons have static HTML pages. Native disclosures reveal reference answers without JavaScript. JavaScript is needed for saved completion, copy controls, interactive quizzes, workbench tabs and the app-style navigation. The static reading edition does not read or save progress. Interactive progress and quiz choices stay in your browser, with export/import backups. There is no learner account or analytics endpoint.

**Getting-started guides:** [English](docs/guides/en/README.md), [Tiếng Việt](docs/guides/vi/README.md), [中文](docs/guides/zh/README.md), [日本語](docs/guides/ja/README.md), [Українська](docs/guides/uk/README.md). These introductions are translated. The sixty detailed lessons, quizzes and practice files remain in English; full-course translation and native-speaker acceptance are not claimed.

## A first useful result

From a clone, run `node labs/project-workflow/create-workspace.cjs`, then open the returned disposable path and follow [the lab instructions](labs/project-workflow/README.md). Its deliberately broken search starts at **4 passing and 2 failing checks**. Ask Codex to fix case and surrounding-space handling while preserving unrelated files. Inspect the edit; the target is **6 passing checks**, with the actual matching notes. Commands, fictional inputs, synthetic events, deterministic helpers and optional native-client activation are labeled.

## Run locally

With Node.js 20+ already installed, run this from the exported source directory containing index.html:

~~~text
node scripts/server.cjs
~~~

Open http://127.0.0.1:4173/ and keep the terminal running. No package installation or framework build is required to read the supplied website. Stop the server with Ctrl+C. The repository source and Pages publication are synchronized separately by the maintainer. Individual labs have their own course-relative commands; run them in disposable practice copies.

After changing lesson data or the home renderer, regenerate and verify the static reading output:

~~~text
node scripts/build-reading-fallback.cjs
node scripts/build-home-snapshot.mjs
node scripts/build-reading-fallback.cjs --check
node scripts/build-home-snapshot.mjs --check
node scripts/build-study.cjs
node scripts/build-study.cjs --check
node tests/repo-level.cjs
node tests/repo-level.cjs --controls
node tests/guided-activities.cjs
~~~

The generators use existing course data and no additional dependency. The home generator changes only the contents of the root main element; interactive application code remains separate.

## Sources and current limits

The learning structure and topic purposes were adapted from [Claude How-To](https://luongnv.com/claude-howto/), MIT © 2024 luongnv89. Codex commands, configuration, examples and exercises were researched and rewritten. The earlier green reference implementation remains under assets/reference with its full notice; the active home, motion and style system is under assets/atelier.

[Linear Method](https://linear.app/method), [Framer Academy](https://www.framer.com/academy/) and [CodeCrafters](https://codecrafters.io/) informed editorial navigation, app-first onboarding and staged practice. Their official pages were inspected on **22 October 2026** for those principles. No proprietary artwork, code or paid resource was reused.

Official product sources were checked on **21 October 2026**. Availability varies by client, version, platform, account and policy. Current scoped Chrome checks are described in the verification report. The 2.6 self-checks do not constitute user acceptance or a measured learning outcome; earlier 2.4 checks describe the previous presentation. The website now includes quick/full knowledge checks, local full-text search and a field reference. Full-course translations remain outside the English-course scope. This is a community course with no OpenAI affiliation, certification or guaranteed learning outcome.

Read [content provenance](docs/content-provenance.md), [design sources](docs/design-sources.md), [verification and limits](docs/verification.md), [contributing](CONTRIBUTING.md) and [third-party notices](THIRD-PARTY-NOTICES.md). The original MIT copyright and all other bundled licenses are retained. Public availability does not grant a new blanket license over newly authored course content.
