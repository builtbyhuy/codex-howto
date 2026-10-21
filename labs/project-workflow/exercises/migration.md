# Migrate a saved request into a project skill

The two-line `legacy-prompt.md` deliberately mixes inspection, an unsupported command and an automatic commit. Do not execute it. Compare it with `solution/.agents/skills/readme-check/SKILL.md`.

| Legacy assumption | Replacement | Why |
| --- | --- | --- |
| “Verify everything” | Inspect README.md, notes.cjs, checks.cjs and package.json availability | Names the evidence boundary |
| Always run npm test | Report that package.json is absent; identify node --test checks.cjs as the available check, and label it unrun until executed | A familiar command is not project evidence |
| Rewrite and commit | Return Claim / Evidence / Finding / Suggested correction | Separates an audit from a write workflow |
| Saved text with no trigger | Focused name/description plus one positive and one negative task | Makes selection testable |

## Make the migration

Copy the reference SKILL.md into `.agents/skills/readme-check/SKILL.md` in the fresh practice copy. Use a file editor or ask Codex to create exactly that file. Keep the name and description YAML at the top. In the desktop app, select the skill through the available selector. In CLI or IDE, `$readme-check Review README.md against the available source files; return findings only.` is explicit invocation.

Arguments are ordinary task text in this example. Do not carry Claude's `$ARGUMENTS`, shell-expansion blocks, `allowed-tools` or `context: fork` into the file as if they were Codex metadata. Optional Codex UI/invocation policy belongs in documented agents/openai.yaml and is covered later in the course.

Positive task: audit README setup claims. Negative task: change the search algorithm. The expected audit is `solution/README-REVIEW.md`; the negative task needs a separately scoped implementation request, rather than quietly turning the audit into an editor.

Saving the file and checking its metadata proves its local structure. Actual selector visibility, activation and output must be checked in the learner's installed client.
