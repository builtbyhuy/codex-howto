# Use the complete skill in a scratch Codex project

Checked against [Build skills](https://learn.chatgpt.com/docs/build-skills) on **21 October 2026**. Local skill discovery is documented for Codex desktop, CLI and IDE. Names and selector presentation can differ by release. This guide prepares a project package; the author has not run your authenticated client or changed your personal settings.

## 1. Prepare files that are ready to discover

From this extracted lab directory, choose a **new sibling** folder. The parent must exist. The program refuses an existing destination and copies the entire package, preserving its supporting files:

```text
node prepare-scratch.cjs ../readme-skill-practice
```

From the course root, the equivalent command is:

```text
node labs/skill-workflow/prepare-scratch.cjs ../readme-skill-practice
```

The receipt gives the resolved project/skill paths. Expected layout:

```text
readme-skill-practice/
  README.md
  package.json
  activation-results.csv
  .agents/skills/readme-evidence-review/
    SKILL.md
    references/rubric.md
    references/reference-outputs.md
    scripts/review.cjs
```

Run this **inside the new practice project**:

```text
node .agents/skills/readme-evidence-review/scripts/review.cjs .
```

Expect two findings: `UNKNOWN_SCRIPT` at README line 4 and `MISSING_TEST_GUIDANCE`. The program checks file evidence; it runs no package script. This is a real local helper result, not proof of Codex discovery.

## 2. Open and select the skill

**Codex desktop:** add/open the prepared project folder, start a local chat there, and use the skill selector available in the current app. In releases exposing dollar mentions, type `$` and select `readme-evidence-review`. Verify the selected source path is the prepared `.agents/skills` package. The desktop app's **Skills** sidebar also lets you inspect available skills.

**CLI:** change to that same project and run `codex`. Run `/skills` or type `$` and select the skill. **IDE:** open the prepared folder and select the skill with `/skills` or a dollar mention in the Codex composer. Do not type a slash command into an ordinary operating-system terminal and expect it to select a skill.

Send the explicit request in the Codex composer:

```text
$readme-evidence-review Review this project's README.md. Report grounded run/test guidance defects, exact source lines and unknowns. Do not edit or execute package scripts.
```

Compare the result with the two findings above. Inspect which skill source was read when the client exposes it; otherwise record that discovery evidence is unavailable rather than inferring activation from a good-looking answer. Populate `activation-results.csv` with the actual request, source evidence and result. Its `not_run` cells are deliberately not prefilled as successes.

## 3. Separate invocation from accuracy

Repeat in a fresh chat with the paraphrase “Is this README ready for a newcomer?” Then try “Change the button color.” The second request should not select a README review workflow. Correct invocation and correct findings are two different grades.

`cases.json` and all original fixtures remain in the **extracted lab directory**, not the new practice project. To reproduce its missing-file and embedded-instruction cases, run the following PowerShell steps from that extracted lab. Each destination must be new; the preparer refuses an existing folder. These steps replace only files in those newly created practice projects:

```powershell
& {
  $ErrorActionPreference = 'Stop'
  node prepare-scratch.cjs ../readme-skill-missing
  if ($LASTEXITCODE -ne 0) { throw 'Preparation failed; stop before changing case files.' }
  Copy-Item -LiteralPath ./fixtures/missing-config/README.md -Destination ../readme-skill-missing/README.md -ErrorAction Stop
  Remove-Item -LiteralPath ../readme-skill-missing/package.json -ErrorAction Stop
  node ../readme-skill-missing/.agents/skills/readme-evidence-review/scripts/review.cjs ../readme-skill-missing
  if ($LASTEXITCODE -ne 0) { throw 'Missing-input helper failed; inspect it before continuing.' }

  node prepare-scratch.cjs ../readme-skill-injection
  if ($LASTEXITCODE -ne 0) { throw 'Preparation failed; stop before changing case files.' }
  Copy-Item -LiteralPath ./fixtures/injection/README.md -Destination ../readme-skill-injection/README.md -ErrorAction Stop
  Copy-Item -LiteralPath ./fixtures/injection/package.json -Destination ../readme-skill-injection/package.json -ErrorAction Stop
  node ../readme-skill-injection/.agents/skills/readme-evidence-review/scripts/review.cjs ../readme-skill-injection
  if ($LASTEXITCODE -ne 0) { throw 'Injection-case helper failed; inspect the output.' }
}
```

The missing-file helper reports the unknown `package.json is missing; command existence is unknown`; it must not invent a script list. The injection helper still reports `UNKNOWN_SCRIPT` at README line 4 and `MISSING_TEST_GUIDANCE`. Open each new folder as the actual Codex project, explicitly select the skill, and repeat the corresponding request in the original `cases.json`. For the injection case, require Codex to treat the README's embedded instruction as file data and report the supported findings. Helper success does not certify the model's resistance to those instructions. The same copy/delete operations can be performed in your file manager on other platforms.

To compare an explicit-only package, prepare another new folder:

```text
node prepare-scratch.cjs ../readme-skill-explicit --explicit-only
```

Its `agents/openai.yaml` contains `policy.allow_implicit_invocation: false`. Explicit selection still works; a plain paraphrase should not implicitly select it. This changes selection policy, not command permissions. Codex detects skill edits automatically; restart if a changed package does not appear. Do not use Claude's `/reload-skills`, `context: fork` or `disable-model-invocation` fields as Codex configuration.

## 4. Fix one real defect and preserve a negative case

In the copied README, replace the unsupported `npm run start` with `npm run dev` and add `npm test` under a verification heading. Rerun the helper: zero findings. Independently repeat the actual Codex review on this changed input and verify it does not retain stale defects. The original lab fixtures must still produce their original results.

If a duplicate skill appears, inspect both paths; Codex does not merge same-name skills. If disabling a package is necessary, the documented personal `[[skills.config]]` entry uses the absolute `SKILL.md` path and `enabled = false`, followed by a restart. That is a separate deliberate user configuration change; this preparer neither writes it nor deletes installed skills.
