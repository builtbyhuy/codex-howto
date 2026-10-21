# Skill workflow: README evidence review
Node.js 20+, no dependencies, network, accounts, or installation. Work in an extracted disposable copy. Commands below run from this folder; from the course repository prefix paths with labs/skill-workflow/.
## Run
```text
node --test review.test.cjs
node --test native-setup.test.cjs
node skill/scripts/review.cjs fixtures/broken
node skill/scripts/review.cjs fixtures/complete
node skill/scripts/review.cjs fixtures/missing-config
node skill/scripts/review.cjs fixtures/injection
```
Expected: thirteen helper/package checks pass. Broken and injection return UNKNOWN_SCRIPT at README line 4 plus MISSING_TEST_GUIDANCE. Complete returns no findings. Missing-config returns an unknown, not a false command defect. The helper never executes project scripts.

Five additional setup checks prepare a complete skill in a new scratch project, reject existing destinations, place the explicit-only policy correctly, perform a two-findings-to-none README repair and preserve the original fixtures. Run both test files for **18** checks in total. These are real file/helper operations, not model-selection tests.

## Complete native-client track

Read [native-client.md](native-client.md) for the current app, CLI and IDE steps. `node prepare-scratch.cjs ../readme-skill-practice` copies all skill/support files into the documented `.agents/skills/readme-evidence-review` path in a **new** sibling project and prints its resolved path. Add `--explicit-only` for a separate package carrying `agents/openai.yaml`. The program never overwrites an existing project or writes personal configuration; it starts no Codex client. Open the returned folder deliberately, test actual selection and output, and record observations in the supplied unfilled activation matrix.
## Learn, change, check
1. Read the complete skill, rubric and reference outputs. Predict each fixture result first.
2. Run the commands and reconcile every finding with its source line. Explain why declared scripts are not evidence of passing execution.
3. In a copy, change broken/README.md to document dev and test. Rerun the helper: findings should be empty. Keep original fixtures unchanged for regression tests.
4. Run the boundary fixtures: implicit-start recognizes the root server.js fallback without claiming it ran; check-guidance and named-verification accept declared verification commands without requiring a script literally named test. pnpm-guidance and unsupported-npm-flags remain unknown instead of producing false missing-guidance findings. Null/array package data and invalid script maps produce explicit shape unknowns.
5. For optional Codex testing, use the preparer or copy the whole skill directory into .agents/skills/readme-evidence-review in your own disposable project. Use the actual client selector, run the five requests in cases.json and grade against references/rubric.md. Record invocation separately from accuracy. The preparer creates a discoverable project package; it starts no client and performs no personal/global installation.
## Troubleshooting
No findings does not mean the app runs. A missing config is unknown. If an unrelated request invokes the skill, narrow its description; a helper test cannot diagnose client selection. If links break after copying, preserve the whole skill folder, not just SKILL.md.
## Evidence limits
These are executable deterministic checks and authored reference outputs. They do not simulate model judgment, prove implicit activation, or prove a client loaded a skill. No Codex setting or skill installation was changed by the author.

The helper recognizes selected npm syntax and common verification headings/script names; it is not a full Markdown, shell, package-manager or application validator. A heading's presence is not proof of adequate instructions. Unsupported syntax is unknown and commands remain unexecuted. npm's implicit start behavior is documented in [npm start](https://docs.npmjs.com/cli/v12/commands/npm-start/).


