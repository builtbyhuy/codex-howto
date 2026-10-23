# Graduated lab: a complete local workflow plugin

A portable package with one real skill, a dependency-free local MCP fixture server, and optional supported informational hooks. The course includes a complete native-client track and a bounded extension with an actual-file/protocol grader and readable reference. Native installation metadata was tested in a disposable profile; the owner's configuration, account and hook trust were not changed.

## Stage 1: use the deterministic tool directly

From the course root:

```text
node labs/workflow-plugin/tools/review-fixture.cjs missing-checks
```

Expected: one missing-verification finding with exact evidence. Try `complete` and `injected`. The latter reports two findings and `ignoredInstructions: true`. Unknown IDs and paths are rejected.

The tool checks headings and one deliberately planted instruction pattern. It does not judge all documentation quality or provide general prompt-injection detection.

## Stage 2: validate and exchange actual MCP messages

```text
node labs/workflow-plugin/schema-check.cjs
node --test labs/workflow-plugin/test.cjs
node --test labs/workflow-plugin/test.cjs labs/workflow-plugin/depth.test.cjs
node labs/workflow-plugin/demo.cjs
```

Expected: schema check passes, the original suite has 19 passing checks, the combined suite has 24, and the real local stdio exchange matches EXPECTED.md.

The server handles initialize, notifications/initialized, ping, tools/list, and tools/call using JSON-RPC 2.0 and protocol version 2025-06-18. It supports no sampling, resources, prompts, network transport, account access, or arbitrary file paths. This is a deliberately small tested subset, not a claim of full MCP conformance.

## Stage 3: inspect the portable package

- `plugin.json`: identity and OpenAI-specific local execution/hook declaration.
- `mcp.json`: portable stdio entry with `node`, `${PLUGIN_ROOT}/server.cjs`, and plugin-root cwd.
- `skills/fixture-review/SKILL.md`: discovery, fixture choice, evidence, failure handling.
- `hooks/hooks.json`: SessionStart and PostToolUse command-hook drafts.
- `hooks/context.cjs`: information-only event responses.
- `schemas/`: canonical portable schema snapshots with provenance.

The two schemas were fetched from the canonical URLs linked by the current OpenAI package guide. The local validator implements their exercised keywords and separately checks the OpenAI hook path. It does not validate every future schema or certify client behavior.

## Stage 4: optional real client, only in your disposable environment

Follow [NATIVE-CLIENT.md](NATIVE-CLIENT.md) for copyable workspace generation, complete catalog creation, child-only native CLI add/list/install/remove, and a separate app skill/tool/trust track. The helper never copies authentication or changes the parent process's CODEX_HOME. The app's normal profile is separate from that disposable CLI profile; don't expect a helper installation to appear there automatically.

1. Use a scratch Git repository and supported desktop client; the IDE extension does not support plugins.
2. Inspect all package files and ensure `node` is the existing runtime the host will launch. No external account or model is needed for the offline tools.
3. Place the package under `plugins/workflow-review-practice` and prepare the documented repo marketplace entry. Resolve source.path from the marketplace root.
4. If you choose installation, follow the current local marketplace workflow and start a new session. This changes only your intentionally selected scratch environment.
5. Inspect actual MCP startup and tools/list. Expected: exactly the two fixture tools, not broad filesystem access.
6. Select the packaged fixture-review skill. Ask it to list fixtures and review missing-checks. Expected: one finding with evidence, no file edits or sending.
7. Review hook definitions separately before trusting them. Expected SessionStart context and PostToolUse informational context should be inspected in actual activity. Tool names and client availability must be confirmed, not assumed.
8. Record actual client, host, version, tool calls, results, and hook trust observations. Remove only the scratch installation when finished.

**Observed by the author:** native catalog discovery, installation, enabled/version/cache metadata, and removal for starter 0.2.0 and completed reference 0.3.0 on Windows with Codex CLI 0.163.0-alpha.11. **Not run:** authenticated skill activation, MCP discovery inside a Codex conversation, hook trust/delivery, model inference, scheduling, publication, or cross-platform native behavior. The temporary-home CLI emitted a helper-alias warning and still completed the metadata operations; the guide does not suppress that protection.

## Exercise and rubric

Extend the tool with a fixture missing both headings. Add a fixture ID, deterministic findings, tool-schema enum, positive and negative tests, and update the skill's explanation if needed. Do not broaden path access.

Use [extension/README.md](extension/README.md). The starter intentionally fails its grader; the complete reference changes actual files, schema and both version fields in a second generated copy. The grader talks to that copy's real MCP server and rejects path traversal. Keep the existing suite unchanged: it preserves original fixture behavior while allowing a legitimate new bounded ID.

A strong solution keeps all 19 existing checks, returns two distinct evidence-backed missing-heading findings, rejects extra arguments and path traversal, preserves initialization order, and accurately labels the new fixture as fictional. See the lesson's solution rubric before comparing your work.

The suite also injects unavailable fixture data without changing files. A valid tools/call with request ID 42 must return an explicit isError tool result with ID 42 and no findings. Malformed JSON is a separate -32700 parse error with null ID; a missing fixture at execution time must never be mislabeled as malformed client JSON.

## Advanced workflow artifacts

The workflows/ folder supplies a complete worked extension plan, a real output schema and reference result, an intentionally incomplete synthetic candidate, a schedule proposal, a permission matrix, an inactive marketplace catalog, and a release-readiness record.

[NATIVE-WORKFLOWS.md](workflows/NATIVE-WORKFLOWS.md) is the primary native guide: Plan mode through an implemented artifact, exact model/effort controls and a fixed-input experiment, actual permission controls and a read-only boundary observation, structured codex exec output, and Scheduled creation/run/pause/removal. The JSON proposals below remain preparation aids; passing them does not complete those native tracks.

From the course root, run these offline checks:

```text
node labs/workflow-plugin/workflows/compare-candidates.cjs
node labs/workflow-plugin/workflows/validate-artifact.cjs review labs/workflow-plugin/workflows/expected-review-result.json
node labs/workflow-plugin/workflows/validate-artifact.cjs schedule labs/workflow-plugin/workflows/schedule-proposal.json
node labs/workflow-plugin/workflows/validate-artifact.cjs permissions labs/workflow-plugin/workflows/permissions-matrix.json
node labs/workflow-plugin/workflows/validate-artifact.cjs marketplace labs/workflow-plugin/workflows/marketplace-draft.json
node labs/workflow-plugin/workflows/validate-artifact.cjs release labs/workflow-plugin/workflows/release-review.json
```

Each valid artifact prints that local checks passed and no client action was performed. The comparison labels its two candidates synthetic/reference and explicitly says no model comparison ran. The schedule remains prepared-not-scheduled; the matrix remains a design, not an OS test; the release remains prepared-not-submitted.

The marketplace draft resolves ./ from this lab's declared marketplace root, so it finds the actual package in this folder. It is not an active catalog. For a different scratch layout, change the path and revalidate it rather than copying it blindly.

For an optional real headless Codex exercise, use workflows/HEADLESS-REQUEST.txt and workflows/review-result.schema.json in your own supported scratch session. Save its actual result separately and validate it. The supplied expected-review-result.json is a locally checked fixture reference, not a recorded Codex response. No live inference or client setting was exercised by these offline checks.

The full pipeline in NATIVE-WORKFLOWS.md uses workflows/review-prompt.txt and separates event JSONL, final JSON and stderr. [RELEASE.md](RELEASE.md) gives actual repo marketplace distribution, version inspection, update/rollback/removal and separate workspace/public publication paths.

## Honest distribution boundary

This package is for manual local practice. Its lifecycle hooks make it ineligible for the current public plugin submission path unchanged. Local stdio public submissions have separate eligibility requirements. RELEASE.md explains the complete supported distribution paths and required package adaptation; the fictional lab has not been externally published.

## Current references

Checked October 21, 2026:

- https://developers.openai.com/plugins/build/plugins
- https://developers.openai.com/plugins/deploy/desktop-only
- https://developers.openai.com/plugins/build/mcp-server
- https://learn.chatgpt.com/docs/hooks
- https://learn.chatgpt.com/docs/plugins
- MCP lifecycle/transports/tools specification, version 2025-06-18, linked by the OpenAI server guide.

Topic structure: luongnv89/claude-howto, MIT, Copyright (c) 2024 luongnv89. Original lab code and fictional fixtures were written for this adaptation. Keep the course's complete source MIT notice with distributed teaching materials.

