# Review an AGENTS.md scaffold against the repository

Do not run initialization over an existing instruction file without reviewing it first. The supplied starter already has AGENTS.md. Create `AGENTS.proposed.md` for the first draft in your practice copy; that filename is a review artifact, not an automatically discovered instruction file.

## Proposed content

```markdown
# Orbit Notes guidance
Read README.md, notes.cjs and checks.cjs before a search change.
The local verification command is node --test checks.cjs.
Preserve notes.json, checks.cjs and WORK-NOTE.md.
Return original note objects in their original order.
Inspect the final diff and report observed check results.
```

## Review it

`node --test checks.cjs` exists because checks.cjs is present and uses the Node test runner. `npm test` is unsupported because there is no package.json. No framework, deployment target or package installation belongs in this scaffold.

Compare AGENTS.proposed.md with the existing AGENTS.md line by line. Integrate the useful factual command without dropping the existing boundaries. Open a fresh session in that practice directory and ask for loaded source paths and the test command. In the optional CLI track, `/init` generates a scaffold in the current directory, so first confirm the directory and existing file. It is not a command to run in the operating-system shell.

Pass: the final guidance names the correct files and check, retains existing project requirements and is actually observed in a new client session. An accurate file alone does not prove discovery.
