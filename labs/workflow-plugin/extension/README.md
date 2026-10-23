# Complete the bounded plugin extension

Start with a fresh generated workspace from `create-workspace.cjs`. Its package intentionally has three fixtures. The original extracted package remains your reference; edit only the printed `packageRoot` in the generated copy.

## Your task

Add the fictional fixture `missing-both` without opening arbitrary paths. It must have exactly two evidence-backed findings: `missing-running` and `missing-verification`. Update both native MCP discovery's enum and the separate headless output schema. Preserve the three original fixture results, rejection of path traversal/extra arguments and initialization order. Give the exercise build version `0.3.0` in both the package manifest and server metadata so you can tell a newly installed copy from starter version `0.2.0`.

The exported `IDS` feeds the MCP input enum, so you do not need a second hand-maintained list there. The server description deliberately says “bundled fixtures” rather than a fixed count. The baseline suite checks its original fixture behavior without rejecting a legitimate additional bounded fixture. Do not weaken those checks to accept the extension.

## Grade the actual files and protocol

Using the absolute generated root from the main guide:

```powershell
node labs/workflow-plugin/extension/check.cjs $pluginPracticeRoot
```

Before implementation this intentionally exits1 and says the starter is incomplete. After the correct edit it exits0 with the two finding kinds and version0.3.0. The grader loads the copied checker, exchanges real stdio messages with the copied server, checks advertised IDs, compares direct/tool output, and verifies that `../private` is rejected. It does not grade a self-reported claim.

Then run the copied package's existing `test.cjs`, `schema-check.cjs` and `demo.cjs` using its printed `packageRoot`. Keep that existing suite unchanged while you solve the task. The optional native-client lifecycle exercise can then install this new version in the same isolated profile. Inspect the returned installedPath and version; remove that scratch installation when finished.

## Reference change — after your attempt

Make a **second fresh workspace**, keeping your own attempt separate, then:

```powershell
$pluginReferenceRoot = node labs/workflow-plugin/create-workspace.cjs --path-only
node labs/workflow-plugin/extension/solution.cjs $pluginReferenceRoot
node labs/workflow-plugin/extension/check.cjs $pluginReferenceRoot
```

`solution.cjs` is a complete, readable reference change rather than a placeholder prompt. It refuses an already modified fixture list. It writes only to a generated temporary practice package, adds the actual fixture, updates the allowlist/label, output enum, manifest and server version, and records the changed file list. Inspect its code and compare your approach before reusing it.

Rubric: preserve all baseline behavior; return exactly two distinct findings with evidence; advertise the added fixture in the actual MCP tool; reject arbitrary paths; keep the standalone schema and versions synchronized; label the input fictional. Passing offline/runtime-transport checks is not proof that an authenticated Codex chat selected the skill or trusted its hooks.
