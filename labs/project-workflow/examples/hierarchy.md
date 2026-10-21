# Instruction-chain answer key

These are teaching file contents, not an assertion that a live Codex session loaded them.

## Root AGENTS.md

```markdown
Preserve WORK-NOTE.md and the original order of note objects.
Before a documentation edit, read docs/writing-guidelines.md.
```

## docs/AGENTS.md

```markdown
For documentation in this directory, use descriptive headings and label unverified commands.
```

## docs/AGENTS.override.md — optional second experiment

```markdown
For documentation in this directory, keep every heading under eight words.
```

Expected selection when a fresh session works in docs inside the same Git project:

1. Applicable global guidance, if any, remains part of the chain.
2. The root AGENTS.md still applies.
3. If docs/AGENTS.override.md exists and is nonempty, it is selected instead of docs/AGENTS.md at that directory.

It does not erase the root rule. A sibling folder's file is not automatically selected. Inspect the actual loaded source paths in the installed client rather than inferring discovery from a fluent answer.
