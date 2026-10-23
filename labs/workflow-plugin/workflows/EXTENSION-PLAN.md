# Worked plan: a new fixture, before implementation

## Outcome

Add a fictional README fixture named missing-both. The review must return two distinct evidence-backed findings: missing-running and missing-verification. Do not broaden access to arbitrary paths.

## Observed baseline

- The tool currently allows complete, missing-checks, and injected.
- missing-checks returns exactly one missing-verification finding.
- Unknown IDs return an explicit error.
- A real local MCP exchange exercises initialization, discovery, and calls.

## Two approaches

1. Add a fixture to the existing allowlist and reuse the deterministic checker.
2. Add arbitrary text/path arguments to the tool.

Choose option 1. It meets the exercise without creating broader filesystem access or changing the trust model.

## Bounded implementation

1. Add fixtures/missing-both.md containing only a title and description.
2. Extend IDS and the fixture label map in tools/review-fixture.cjs. The exported enum used by server.cjs should follow IDS.
3. Add a direct-tool assertion and a stdio call assertion for two finding kinds.
4. Rerun all package tests, schema checks, and the deterministic demo.
5. Review the skill's description and expected-output documentation.
6. Add the new fixture ID to workflows/review-result.schema.json and rerun artifact checks; the standalone headless output contract has its own enum.

## Acceptance

- All preexisting tests remain green.
- The new fixture returns exactly the two missing-heading findings.
- Path traversal, extra fields, and tool calls before initialization remain rejected.
- No network, account, schedule, installation, or publication was added.

## Status

This file is a complete worked plan. The extension is intentionally not implemented in the baseline package. It is not a transcript of a Codex planning session.

