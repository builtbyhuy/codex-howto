# Expected offline observations

Run from the course repository:

```text
node --test labs/hook-policy/test.cjs
node labs/hook-policy/demo.cjs
node labs/hook-policy/exercise-check.cjs --solution
```

The suite reports **13 passed, 0 failed**.

The deterministic demo reports:

```text
allow.json: allow | All inventoried patch paths are inside the permitted practice area.
deny-protected.json: deny | Patch targets a protected directory or environment file.
deny-traversal.json: deny | Patch target is outside the practice root or is the root itself.
deny-move.json: deny | Patch targets a protected directory or environment file.
irrelevant.json: irrelevant | Tool is outside this apply_patch-only policy.
malformed-field.json: invalid | apply_patch requires tool_input.command as a string.
malformed JSON: deny | handler exit 0
missing handler: launch failed | exit 1 | no policy response
```

The final check with `--solution` prints:

```text
generated/report.js: deny
Extension criterion and candidate regression checks passed.
```

Running the exercise check **without** `--solution` initially exits 1 and prints an extension-pending message from the separate learner.cjs candidate. After a correct edit to that candidate it exits 0, while the frozen baseline suite remains green. This is the visible exercise baseline, not a broken reference lab.

No line above is a transcript of a live Codex session. The demo calls the handler or launches a local Node process with fictional stdin.

