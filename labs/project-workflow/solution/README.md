# Orbit Notes

Orbit Notes is a fictional, local note-search practice project.

## Project facts

- Four sample notes are stored in notes.json.
- Search matches a title substring without regard to case or surrounding spaces.
- Search preserves the note objects and their original order.

## Run

Use an existing Node.js 20 or newer installation. No dependencies or network access are needed.

```text
node cli.cjs "  REVIEW  "
```

Expected result:

```text
n1: Review launch checklist
n3: Review documentation
```

## Verify

```text
node --test checks.cjs
```

The complete reference implementation passes all six supplied checks. The original starter intentionally fails the case and surrounding-whitespace checks. This is a local reference result, not proof that Codex ran or that a real product was accepted.
