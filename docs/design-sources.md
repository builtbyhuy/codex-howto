# Atelier field guide: design and source notes

The **2.6 field guide** presents the existing Codex curriculum with a light cool canvas, Fraunces display headings, Manrope body/UI typography, JetBrains Mono for code and restrained cobalt accents. The original app-style workbench uses **Task → Change → Check** to show the Orbit Notes brief, focused reference edit and illustrative six-check result. It does not execute Codex, contact a model or validate a learner's local work.

Active presentation files are home.mjs, motion.mjs, workbench.mjs, workbench.css, reader-base.css, site.css and refinements.css under assets/atelier. The reader foundation retains the existing course controls and responsive rules. On 23 October 2026, the Fraunces display roles, hero optical size and heading weights were restored from the live Claude How-To landing typography; the local layout and workbench remain distinct.

## Professional references

Official pages were inspected on **22 October 2026** for information structure and teaching principles:

- [Linear Method](https://linear.app/method): concise editorial introduction, grouped numbered articles and explicit onward navigation.
- [Framer Academy](https://www.framer.com/academy/): a discoverable first lesson, product-interface onboarding, visible duration and topic navigation.
- [CodeCrafters](https://codecrafters.io/): staged projects, concrete outcomes and checking the result in the learner's own environment.

These observations inform original layout and interaction decisions. No proprietary logo, artwork, code, paid template or paid service was reused. Reference-page reading is not a measurement of their rendered motion, device behavior or exact visual values.

## Retained learning source and licenses

The ten-module learning structure and source-topic purposes come from [Claude How-To](https://github.com/luongnv89/claude-howto), pinned at 188f468893231cbe4525f45e657d554746232072. Copyright (c) 2024 luongnv89, MIT. The earlier source-derived stylesheet/markup/motion remain under assets/reference as licensed historical implementation material, with [the full source notice](../assets/reference/SOURCE-NOTICE.md). This retention does not claim that the current Atelier design is the original site's interface.

Manrope, Fraunces and JetBrains Mono font files remain self-hosted under SIL OFL. Fraunces is used for display headings, Manrope for body/UI text and JetBrains Mono for code. Lucide icons retain ISC/MIT notices. Full semantic diagrams were generated using MIT-licensed Mermaid; compact desktop/mobile reading diagrams are original course artwork. See [third-party notices](../THIRD-PARTY-NOTICES.md).

## Reading and interaction scope

The root home contains a deterministic reading snapshot. [Sixty static HTML lessons and their index](../assets/reading/index.html) expose explanations, examples, exercises, answers, diagram text and practice downloads without JavaScript. All home snapshot modules are expanded. It has no saved-state claim; unavailable controls are disabled. The app replaces the snapshot at boot, restoring its existing progress and interactive controls.

JavaScript is required for saved completion, quiz submission, copy controls, workbench tabs and the app-style reader. Five language choices lead to introductory guides; they are not five complete course translations. Native-speaker review of Chinese, Japanese and Ukrainian remains outstanding.

Scoped desktop/mobile, keyboard and JavaScript-disabled checks of the 2.6 candidate are recorded in the verification report. The final 2.6 runtime has local functional, visual and motion self-checks; independent learner outcomes and user acceptance are separate. Earlier 2.4 checks are historical. Equality with or superiority to Claude How-To has not been established. Knowledge checks use the existing 60-question bank; the reference links every topic’s worked examples. This does not reproduce every repository adjunct of Claude How-To.
