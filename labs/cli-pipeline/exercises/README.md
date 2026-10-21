# Five CLI practice tasks with different finish conditions

Open this lab in the Codex app first. The offline files below need Node, not an authenticated Codex CLI. Optional Codex commands require a client/account you independently choose to use. The course does not run them for you.

| Lesson | Practice | Check the result |
| --- | --- | --- |
| s10-01 | Compare an ongoing app chat with a one-shot invocation plan | `node capture-codex.cjs --project red` prints resolved paths, fixed arguments and run:false; no child starts. |
| s10-02 | Fill the shell/composer control matrix; inspect the real installed help when available | Compare `control-matrix.md`; a resume picker or credential check is not a file rollback. |
| s10-03 | Plan a read-only extraction in red and blue folders, whose names and verification commands differ | `node capture-codex.cjs --project blue`; compare the two `--cd` values, source files and separate output directories. |
| s10-04 | Validate final JSON structure and facts, separately from JSONL lifecycle | `node validate-extraction.cjs --input exercises/answers/red-valid.json --source exercises/projects/red/README.md`; then use red-invented.json (exit 3). |
| s10-05 | Process two named local inputs with the same contract and a missing-input counterexample | `node verify-extraction.cjs` validates red and blue separately and rejects invented/empty/malformed/missing cases. Adapt only after inspecting the actual artifacts. |

## Optional actual capture

`capture-codex.cjs` prints a plan by default. Read it before deliberately adding `--run`. A run launches `codex exec` with argument boundaries, a read-only sandbox and no approval escalation. It creates a new results directory, saves JSONL, stderr, the last message and the real child status. It does not install/sign in/configure a client or schedule anything. The task uses the synthetic README and never includes owner project data. The global --ask-for-approval flag precedes exec; putting it after exec is rejected by the locally checked 0.163.0-alpha.11 client. --skip-git-repo-check is deliberate here because these two known read-only fixtures are not Git repositories; do not transfer that exception to an unfamiliar directory.

```text
node capture-codex.cjs --project red
node capture-codex.cjs --project blue
# Optional only after reviewing the plan and choosing an authenticated run:
node capture-codex.cjs --project red --run
```

After a real run, use the actual returned directory. Inspect process.json first. Pass its actual producerExitCode to `report.cjs`; do not assume zero. Validate final.json against that project's README with validate-extraction.cjs. A completed event stream, schema-conforming object and source-correct result are separate gates. The optional capture is not run by the course's offline verification.

## Three output contracts

* **Final text:** `codex exec -o ./summary.md "..."` writes a final answer; progress is a separate stream.
* **JSONL events:** `codex exec --json "..."` emits one event object per line; parse each line and inspect lifecycle plus process exit.
* **Final JSON object:** `--output-schema ./exercises/report-schema.json -o ./final.json` constrains shape; compare values with the actual source.

See `control-matrix.md`, `report-schema.json` and the complete answer examples. All files under answers/ are authored synthetic outputs, including deliberately wrong ones.
