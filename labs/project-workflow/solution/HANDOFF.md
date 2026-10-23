# Reference handoff

## Problem and change

The original search compared raw strings. REVIEW and a space-padded query did not match the intended notes. The reference normalizes only the search string and comparison text; it preserves the returned note objects and their order. The README now gives the real dependency-free check command.

## Evidence

- Baseline: six checks, four passing and two deliberately failing.
- Reference: six checks passing.
- `node cli.cjs "  REVIEW  "` returns n1 and n3 in that order.
- notes.json, checks.cjs and WORK-NOTE.md remain unchanged.
- A narrow diff shows only notes.cjs and README.md for the implementation stage.

## Recovery

A rejected heading edit can be corrected without discarding the useful added paragraph. A whole-file restore would lose both. A new or forked Codex chat alone restores neither file.

## Limits

The sample data and checks are fictional. No Codex account, installation or external service was used for the reference verification. The exercise's optional Git stage uses a fresh disposable repository and an index baseline, not a commit or changed Git identity.
