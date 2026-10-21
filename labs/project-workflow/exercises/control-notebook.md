# Controls you can explain, rather than guess

Open a fresh Orbit Notes practice copy in the Codex desktop app. These are expected observations, not captured client responses.

| Task | Desktop | CLI composer | Ordinary terminal | What it cannot prove |
| --- | --- | --- | --- | --- |
| Inspect settings/context | Available status/menu control | `/status` | `codex --version` inspects the executable instead | Correct repository contents |
| Inspect candidate changes | Review tab; select each changed file | `/diff` | `git diff -- README.md notes.cjs` in the optional Git copy | Test success; normal Git diff omits untracked content |
| Plan a change | Available plan control, or a plain request for a plan | `/plan` | `codex` starts the client | Plan implementation |
| Start a clean conversation | New chat action | `/new` | `codex` starts another session | File restoration |
| Reuse a README audit | Select the available readme-check skill | `$readme-check` or `/skills` | A skill name is not a shell executable | Correct activation or truthful output |

## A concrete observation

Use a fresh --git copy if Git is already available and you want the repository review view. If it is unavailable, compare README.md directly with the shipped starter in an editor and label that file comparison instead of claiming a Git review.

In your disposable copy, change `# Orbit Notes` to `# Heading experiment` in README.md. Inspect the actual diff, start a fresh chat, then read README.md again. The heading is still changed. Correct only that heading. Do not stage or restore all files to make the notebook look clean.

Record the installed client/version, exact action, file state before/after and any unavailable control. Do not substitute a plausible transcript for an observed one.

## Extend the small reference deliberately

| CLI composer control | Typical use | Boundary |
| --- | --- | --- |
| `/init` | Draft AGENTS.md for the selected directory | Review the scaffold against files; preserve existing guidance |
| `/compact` | Reduce the current conversation context | Does not restore repository files |
| `/permissions` | Inspect or adjust execution permissions | This exercise only inspects; a setting is not task authorization |
| `/resume` | Continue saved conversation history | Verify directory and actual file state |
| `/fork` | Branch conversation history | Verify a separate checkout before parallel edits |
| `/skills` | Browse reusable workflows | Correct trigger/output still need testing |

Use the installed menu as the current inventory. The source site's large Claude table includes product-specific commands and version gates; this course links the official Codex reference rather than presenting copied aliases as equivalents.
