# Codex How-To — learn by doing

An independent app-first Codex course: **10 modules, 60 detailed English lessons and 7 runnable practice packages**. Start with a small search bug; work toward project guidance, skills, MCP, delegation, hooks and plugins. CLI and IDE differences are stated where they matter.

**Getting-started guides:** [English](docs/guides/en/README.md), [Tiếng Việt](docs/guides/vi/README.md), [中文](docs/guides/zh/README.md), [日本語](docs/guides/ja/README.md), [Українська](docs/guides/uk/README.md). These introductory guides are translated; the 60 detailed lessons, quizzes and executable practice files remain in English. [Choose a guide on the website](https://codex-howto.hokhachuy1234.chatgpt.site/#languages).

**[Start the course](https://codex-howto.hokhachuy1234.chatgpt.site/)** · [First lesson](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s01-01) · [Practice labs](https://codex-howto.hokhachuy1234.chatgpt.site/#labs) · [Report a lesson problem](https://github.com/builtbyhuy/codex-howto/issues/new)

## A first useful result

Open the first lesson and download the Orbit Notes lab into a new practice folder. Its deliberately broken search starts at **4 passing and 2 failing checks**. Use Codex to fix case and surrounding-space handling while preserving unrelated files. Inspect the changes; the target is **6 passing checks**, with actual matching notes. Each lesson gives an explanation, copyable example, exercise, expected evidence, closed reference answer and a knowledge check.

No learner account is needed. Progress and quiz choices stay in your browser, with export/import backups. The website never runs Codex or your terminal commands. Fictional data, synthetic events, deterministic helpers and optional native activation are labeled.

## Run the website locally

With Git and Node.js 20+ already installed:

~~~text
git clone https://github.com/builtbyhuy/codex-howto.git
cd codex-howto
node scripts/server.cjs
~~~

Open http://127.0.0.1:4173/ and keep that terminal running. No package installation or build step is needed. JavaScript is required for the reader. The individual labs include their own commands; run them in disposable practice copies. Stop the server with Ctrl+C.

## Scope and sources

All 60 original roadmap topics were adapted from [Claude How-To](https://luongnv.com/claude-howto/); Codex commands, configuration and exercises were researched and rewritten. The landing now reuses the pinned MIT stylesheet and adapts its station roadmap, markup and interactions. Source attribution and the complete original license are retained; separate integration files connect that design to the Codex reader and existing progress. Official documentation was checked on **21 October 2026**. Availability can vary by client, platform, account and policy. This is a community guide, with no OpenAI affiliation, certification or guaranteed learning outcome.

Read [content provenance](docs/content-provenance.md), [verification and limits](docs/verification.md), [contributing](CONTRIBUTING.md) and [third-party notices](THIRD-PARTY-NOTICES.md). The original Claude source retains its MIT notice, copyright 2024 luongnv89; other bundled resources retain their own licenses. Public availability does not grant a new blanket license over newly authored course content.
