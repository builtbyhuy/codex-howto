# Lab: a real, bounded PreToolUse policy

**Checked against official documentation on October 21, 2026.**

The offline patch guard runs with Node.js and performs no patch or target-file read. A separate Stop handler reads only a generated candidate and its evidence. The lab also includes a complete native-client track: generate a disposable project, review hook trust, observe covered edits and Stop behavior, then disable the scratch hooks.

## Run it

From the course root:

```text
node --test labs/hook-policy/test.cjs
node --test labs/hook-policy/test.cjs labs/hook-policy/depth.test.cjs
node labs/hook-policy/demo.cjs
node labs/hook-policy/stop-demo.cjs
node labs/hook-policy/create-config-draft.cjs
```

The original suite reports 13 passing tests; the combined suite reports 18. The policy demo's output is in EXPECTED.md. The Stop demo creates a new scratch directory and demonstrates missing, stale, fresh, and bounded-retry states. The config draft command only prints JSON.

To replay one fixture in PowerShell:

```powershell
Get-Content -Raw .\labs\hook-policy\fixtures\deny-protected.json | node .\labs\hook-policy\guard.cjs
```

Expected: exit 0 and a PreToolUse JSON response with `permissionDecision: "deny"`. Exit 0 means the response was produced successfully; it does not mean the proposed patch was allowed.

## Policy and input contract

- Supported tool: canonical `apply_patch` events only.
- Event: `PreToolUse`; patch text comes from `tool_input.command`.
- The fictional event's absolute `cwd` is the practice root.
- Inventory Add/Update/Delete File and Move to headers before permitting the operation.
- Deny root escape, root targets, `protected/` path segments, and environment filenames.
- Normalize lexical traversal and handle POSIX/Windows path syntax deliberately.
- Return no objection for allowed patches. This does not grant sandbox access.
- Return an empty object for irrelevant tools/events, with that coverage limit visible in the offline classifier.
- Catch invalid input and produce a supported denial response plus stderr diagnostics.

The algorithm is a **teaching policy, not a production filesystem security boundary**. It does not resolve symlinks, model every patch grammar variant, inspect the actual project, handle arbitrary shell writes, or guarantee interception of every Codex capability. A launch failure occurs before the program can return a denial. Runtime failures must be tested in the real client; never assume fail-closed behavior.

## Exercise and solution

The frozen working baseline in `guard.cjs` intentionally permits `generated/report.js`. Edit **learner.cjs**, a separate candidate wrapper, to protect a root-level `generated/` directory without blocking `src/generated-helper.js`. Keep `guard.cjs` and `test.cjs` unchanged: they document the baseline contract.

```text
node labs/hook-policy/exercise-check.cjs
node labs/hook-policy/exercise-check.cjs --solution
```

The first command checks the editable candidate against all baseline fixture classifications, the new generated-directory criterion, and the allowed lookalike. It intentionally exits 1 while the candidate is incomplete; after a correct learner edit it exits 0. The second runs the reference through that same gate and passes. An alternative candidate can be supplied with `--candidate <file>`; it must export evaluate(event).

After trying the exercise, inspect `solution/guard.cjs` and the `protectGenerated` reference branch in the frozen core. A custom candidate can instead add its own rule after baseline validation: inspect the normalized `result.paths` only for an allow result, deny a first path segment exactly equal to generated, and preserve every existing deny/invalid/irrelevant result. Avoid a substring rule that catches generated-helper.js.

Rubric: preserve all 13 suite checks, pass the candidate gate, deny the generated fixture, allow the lookalike filename, keep wire responses parseable, and state the symlink/tool-coverage limits. The suite permits an incomplete or correctly solved candidate but rejects baseline regressions; completing the separate gate is the exercise acceptance criterion.

## Real-client track in a disposable project

Follow [NATIVE-CLIENT.md](NATIVE-CLIENT.md) for executable setup, app and CLI steps, actual observation prompts, trust inspection, verification, and disabling/removal. Native activation is optional for an offline reader; it is required before claiming your own hook ran in Codex.

1. Use a separate scratch Git repository you own; never use the owner's personal config or production project for this exercise.
2. Run the draft generator and review the exact interpreter, handler path, event, matcher, and timeout. Regenerate after moving the lab.
3. Only if you choose activation and policy permits it, place the reviewed JSON in the scratch project's `.codex/hooks.json`.
4. Inspect `/hooks` in a supported CLI. Review project trust and exact hook-definition trust separately; do not bypass either.
5. Ask Codex to make one tiny allowed patch and one protected scratch-file patch. Inspect actual hook activity and changes. The second should be denied before a supported patch runs; compare the resulting diff.
6. Test an irrelevant tool path to understand scope rather than claiming universal prevention.
7. Remove only the scratch configuration through the reviewed local workflow when finished.

Record actual client/version/host observations separately. **The author did not run this activation procedure.**

## Sources

- https://learn.chatgpt.com/docs/hooks
- https://learn.chatgpt.com/docs/config-file/config-advanced

See the course source attribution and MIT notice for the adapted topic structure. All lab code and fixtures are original educational examples.

