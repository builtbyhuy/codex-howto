> Current UI, 22 October 2026: the landing page directly adapts the MIT-licensed Claude How-To templates at commit `188f468893231cbe4525f45e657d554746232072`. `assets/reference/landing.css` is the unmodified upstream stylesheet; `home-render.mjs`, `reference-motion.mjs` and the adjacent fidelity styles adapt markup and behavior for this course. Copyright (c) 2024 luongnv89 and the complete MIT text are retained in [the source notice](assets/reference/SOURCE-NOTICE.md). The green landing direction supersedes the historical violet/graphite descriptions below. Introductory guide translations are original course material; the detailed course stays English.

# Third-party notices

## Claude How-To learning-topic and design reference

This community Codex learning website adapts the 60 learning topics, original module organization and learning-navigation principles of [Claude How-To](https://luongnv.com/claude-howto/) by [luongnv89](https://github.com/luongnv89/claude-howto). The current landing directly reuses the upstream stylesheet and adapts the HTML structure and JavaScript behavior, with Codex-specific teaching. Earlier violet and graphite designs are historical.

Source inspected: commit `188f468893231cbe4525f45e657d554746232072`, particularly `scripts/website_templates/landing.css`, `landing.js`, and `landing.html.j2`.

Copyright (c) 2024 luongnv89. Licensed under the MIT License. The complete original notice is included in [assets/licenses/claude-howto-MIT.txt](assets/licenses/claude-howto-MIT.txt).

The Codex curriculum is newly authored and is now presented in English following the user's revised direction. Names, commands, capabilities, and examples are checked against Codex sources rather than translated mechanically from the Claude lessons. The current interface preserves the source’s warm grid, green accents and Fraunces regular/italic display type with an explicitly illustrative Codex terminal. All source attribution and notices are retained. This site is not endorsed by or affiliated with the original author, OpenAI, or Anthropic.

## Self-hosted fonts

- **Fraunces**: Copyright 2018 The Fraunces Project Authors. [Official project](https://github.com/undercasetype/Fraunces). SIL Open Font License 1.1; full notice in [assets/licenses/fraunces-OFL.txt](assets/licenses/fraunces-OFL.txt).
- **Manrope**: Copyright 2018 The Manrope Project Authors. [Official project](https://github.com/googlefonts/manrope). SIL Open Font License 1.1; full notice in [assets/licenses/manrope-OFL.txt](assets/licenses/manrope-OFL.txt).
- **JetBrains Mono**: Copyright 2020 The JetBrains Mono Project Authors. [Official project](https://github.com/JetBrains/JetBrainsMono). SIL Open Font License 1.1; full notice in [assets/licenses/jetbrainsmono-OFL.txt](assets/licenses/jetbrainsmono-OFL.txt).

Font files are unmodified full variable TTFs from the official [Google Fonts repository](https://github.com/google/fonts), served locally with the site. No runtime Google Fonts request is needed. Source ref, filenames, glyph checks, and hashes are documented in [docs/design-sources.md](docs/design-sources.md).

All three families are active in version 2.4.0: Fraunces regular and italic for display, Manrope for interface and reading, and JetBrains Mono for code and technical labels. The font files and OFL notices were already present; the refinement does not introduce a new external font resource.

Source and license check date: 21 October 2026 (Asia/Bangkok). No paid asset, subscription, or specialist service was purchased.

## Lucide SVG icons

The interface can use local SVG icons from [Lucide](https://github.com/lucide-icons/lucide), obtained at commit `c29c276f16590cf017126671535ad8c792be64d8`. Copyright (c) 2026 Lucide Icons and Contributors, ISC License. Feather-derived icons additionally carry the MIT License, Copyright (c) 2013-present Cole Bemis. The complete original combined notice is included in [assets/licenses/lucide-LICENSE.txt](assets/licenses/lucide-LICENSE.txt).

Local files: `book-open.svg`, `route.svg`, `arrow-right.svg`, `chevron-down.svg`, `check.svg`, `search.svg`, `terminal.svg`, `sparkles.svg`, `git-branch.svg`, `plug.svg`, `shield.svg`, and `code-2.svg` (the last is upstream `code-xml.svg`, unchanged apart from the filename). Files are standalone SVGs, not an installed package or hosted API.

## Redesign references

[Linear Docs](https://linear.app/docs) and the [Boot.dev backend curriculum](https://www.boot.dev/paths/backend?tech=python-typescript) were inspected as composition and navigation references. Their code, logos, illustrations, textures and screenshots are not incorporated in this website. No license to those proprietary resources is implied by the reference links. The project-local design record identifies the mechanisms adapted and the earlier design decisions superseded.


## Mermaid — build-time semantic diagrams

The 60 original course diagrams are compiled with [Mermaid](https://mermaid.js.org/), pinned browser bundle **12.2.0** from the [official npm release](https://registry.npmjs.org/mermaid/-/mermaid-12.2.0.tgz). Mermaid is MIT licensed, Copyright (c) 2014–2022 Knut Sveidqvist. Its complete original notice is retained in [assets/licenses/mermaid-MIT.txt](assets/licenses/mermaid-MIT.txt). Sources and source hashes are in content/diagrams.json and evidence/diagram-build-report.json.

Mermaid is used only to build static SVGs. Its JavaScript bundle is not delivered as a runtime dependency or fetched by the learner. The SVGs carry original lesson-specific relationships and text, not proprietary reference artwork. Package/source terms were checked 21 October 2026; no cost, account, subscription or paid service is involved.

## Original compact diagrams and motion

The 120 compact overview SVGs in `assets/diagram-overviews/` are original project artwork generated by `scripts/build-overviews.cjs`: 60 lesson summaries with separate desktop and mobile layouts. They are not Mermaid-rendered outputs, screenshots, traced reference artwork, or an imported icon/diagram pack. Their full semantic counterparts remain in `assets/diagrams/` under the build-time Mermaid notice above. The summary catalog records the corresponding full-source hashes for maintenance.

`course-motion.mjs` and `course-motion.css` are original project code, with no third-party animation runtime or media asset. These files remain for lesson-reader behavior. The current landing uses the separately attributed source-derived reference-motion.mjs; its terminal is an illustration, not a recording, and does not execute Codex commands. Existing font/icon notices still apply wherever those resources appear in the illustration.

## Agent Plugins JSON schema snapshots

The two software schemas `labs/workflow-plugin/schemas/plugin.schema.json` and `mcp.schema.json` come from [Agent Plugins](https://github.com/agentplugins/agent-plugins-spec) at commit `ff8ab5e392cc87bd88d87c060815a87490e51003`, under `schemas/1.0.0/`. The pinned [licensing declaration](https://github.com/agentplugins/agent-plugins-spec/blob/ff8ab5e392cc87bd88d87c060815a87490e51003/LICENSE.md) assigns software schemas to Apache License 2.0. The full unchanged license is retained in [assets/licenses/agent-plugins-Apache-2.0.txt](assets/licenses/agent-plugins-Apache-2.0.txt) and within the downloadable lab at [labs/workflow-plugin/schemas/Apache-2.0.txt](labs/workflow-plugin/schemas/Apache-2.0.txt).

These schema files were previously reformatted with unchanged JSON values. The legal correction on October 21, 2026 restored their exact upstream bytes. Exact source URLs, local/upstream hashes and the modification/restoration history are in [SOURCE-NOTICE.md](labs/workflow-plugin/schemas/SOURCE-NOTICE.md), alongside the [schema README](labs/workflow-plugin/schemas/README.md). The complete pinned upstream tree contains no NOTICE-named file, and no separate per-file attribution header was removed. This scoped Apache notice applies to the two schema snapshots, not to the course's original lessons, validator or fictional fixtures, nor to differently licensed upstream documentation.
