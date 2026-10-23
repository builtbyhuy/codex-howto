# Focused study and optional Codex coach

Open the website's **Study** link or read [the learning path](../LEARNING-ROADMAP.md). Pick any module, choose before/during/after reading, attempt recall and a changed case, then compare evidence with the linked lesson checks. Reading and study do not establish practical mastery.

Website sessions remain in page memory. Nothing is stored automatically. Export only deliberately entered study records; changing sessions or reloading discards unexported notes. The full module prompt includes lesson data and rubric and is copyable without clipboard permission or an API.

For optional native skill use, copy only `codex-study/` (including its references) into `.agents/skills/codex-study/` inside an owned disposable project. Keep real projects and user/global settings unchanged. Inspect the files first, use your client's supported project skill discovery, and explicitly request `codex-study`. If it is not discoverable, paste the website's complete prompt instead. No native activation is claimed by this repository.

The bundled `references/course.json` is generated from canonical lesson data by `node scripts/build-study.cjs`; freshness is checked with `--check`. The tutor reads it before questioning. It must ask one question at a time, accept skip/uncertainty, separate correctness from reasoning, adapt to a misconception and end with evidence plus one targeted practice. Judge actual behavior against that contract; a packaged workflow is not a model behavior guarantee or a learner study.

Copy-only integration does not copy labs. Each bundled milestone includes an explicit `readingUrls` mapping from stable lesson IDs to public reading pages, an absolute `practiceUrl`, and an authored `immediateTask`. Use those public URLs when the original checkout is unavailable; local practice paths require that original checkout. Do not turn source/sourceKey provenance into reading URLs. The first beginner task is a read-only inspection in a disposable Orbit Notes copy, reporting folder, n1–n4 and unknown deployment, not a generic personal README exercise. These files are not local to the scratch project.
