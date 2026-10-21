# Expected offline transcript

```text
node labs/workflow-plugin/schema-check.cjs
Portable manifest and MCP configuration match the cached canonical schemas.

node --test labs/workflow-plugin/test.cjs
19 passed, 0 failed

node labs/workflow-plugin/demo.cjs
Connected local-fixture-review (2025-06-18).
Discovered: list_fixture_readmes, review_fixture_readme
Fictional fixtures: 3
complete: 0 finding(s), ignoredInstructions=false
missing-checks: 1 finding(s), ignoredInstructions=false
injected: 2 finding(s), ignoredInstructions=true
Unknown fixture: protocol error -32602
No Codex session, model, account, or network was used.
```

The suite additionally simulates a fixture read failure without changing any files. The valid tools/call response retains request ID 42 and carries `result.isError: true` with “Practice fixture could not be read. No findings were produced.” It contains no fabricated structured result. This is distinct from malformed JSON, which receives -32700 with a null ID.

Node's test runner adds timing and formatting; the assertions and counts are deterministic. The demo is a real local subprocess MCP exchange. It is **not** a live Codex transcript or evidence that a client installed the plugin.

Direct tool output for `missing-checks`:

```json
{
  "fixture": "missing-checks",
  "findings": [{
    "kind": "missing-verification",
    "message": "Add a Verification section.",
    "evidence": "No ## Verification heading was found."
  }],
  "ignoredInstructions": false
}
```

