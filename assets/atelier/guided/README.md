# Interactive lessons

Open `index.html#learn/s01-01` through the local preview server, or choose **Learn** on the website. Select a module and any of its lessons. The four stages use that lesson's existing goal, source steps, exercise, checks and quiz.

The 3D project, files, request, change and evidence objects are selectable. Use the labeled text buttons for the same path, drag the scene to turn it, or use its rotate/zoom/reset controls. If WebGL is unavailable, every teaching control and source remains usable. Reduced motion changes are respected immediately; the scene has no idle rendering loop.

The module activity is explicitly shared browser practice. It compares supplied answers with fictional course fixtures; it does not execute arbitrary code, run Codex, inspect local projects or establish native activation. Open the full practical lab and use a disposable project for the real lesson exercise. References require an attempt or explicit reveal. Original quiz options and answers are unchanged.

Exercise drafts remain in this tab's memory across route changes and disappear on reload. Browser grading and quiz checks do not update saved reading progress. The completion button records only your explicit choice and keeps existing quiz answers intact.

Maintainers: run `node tests/guided-activities.cjs` from the repository root. It independently checks valid and invalid attempts, the sixty lesson mappings and byte equality of embedded fixture sources. When an authored lab changes, update its explicit source snapshot and bounded expected facts together, retaining negative controls. The private authoring browser suite additionally tests navigation, focus, GPU/resource cleanup, race conditions, storage and reduced motion.

This is an original reconstruction of interaction principles observed on Learn Arduino by Dilum Sanjaya, https://learn-arduino-red.vercel.app/. No artwork, model or application code was copied from that page. Three.js r180 is pinned and self-hosted under MIT; complete license and supply record are in `vendor/`. Original typeface/icon/source notices remain with the course.
