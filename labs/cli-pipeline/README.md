# Consume a Codex event stream without hiding failure

This is an **offline teaching lab**. Every event fixture, thread ID, token count and model answer is synthetic. The local programs and tests actually execute; no fixture proves a Codex account, command, API request or connected tool ran.

Use an existing Node.js 20 or newer runtime. There are no packages to install, credentials to supply or network calls. Paths in this guide are relative to this lab folder.

## Start in the Codex app

1. Download/copy the lab into a separate practice folder, then open that folder in the Codex desktop workspace.
2. Ask Codex to read this guide, `report.cjs`, the fixtures and the tests. Ask it to explain why the starter consumer is wrong before editing it.
3. Run the commands through the app's available terminal/tool, or your ordinary terminal. The Codex CLI is not required.
4. Compare the outputs with the [recorded fixture transcripts](expected/TRANSCRIPTS.md) and individual reports in `expected/`. Review the implementation, not just the test summary.

## The contract

For this lab's report to exit 0, the producer must exit 0, the JSONL must parse into valid observed shapes, the last turn must complete and it must contain an agent message. This establishes a completed stream contract. It does **not** prove that an answer is true, tests passed, or a user accepted delivery. Observed command failures are listed for review even if the agent turn later completes.

| Case | Run | Lab exit | What it demonstrates |
| --- | --- | --- | --- |
| Completed stream | `node run-pipeline.cjs success` | 0 | Six valid events, completed final turn and a final message. |
| Failed turn | `node run-pipeline.cjs error` | 2 | `turn.failed.error.message` is not success, even with producer exit 0. |
| Fatal error | `node run-pipeline.cjs fatal` | 2 | A top-level `error.message` stops acceptance. |
| Malformed JSON | `node run-pipeline.cjs malformed` | 3 | The bad third line is reported, not silently skipped. |
| Truncated stream | `node run-pipeline.cjs incomplete` | 4 | An answer without final completion is incomplete. |
| Producer failure | `node run-pipeline.cjs producer-failure` | 5 | A completed event cannot conceal child process exit 7. |

The runner uses `spawnSync` with `shell: false`, a timeout and bounded output. It captures the real child status separately from stdout. It launches only the local synthetic producer. It never launches Codex.

## Exercise

1. Run `node starter/naive-report.cjs fixtures/success.jsonl`. It intentionally fails because it tries to parse the whole JSONL file as one object.
2. Explain how line parsing changes the input contract. Handle CRLF, empty lines and a malformed line without ignoring errors.
3. Add lifecycle handling: distinguish a failed turn, a fatal stream error and missing completion. Do not accept an old answer if a later turn is still running.
4. Require the actual producer exit code. A pipeline's last command status alone can hide the producer's failure; shell behavior differs, so the supplied runner captures the process status directly.
5. Compare your implementation with `report.cjs` and `run-pipeline.cjs`, then run all tests.

```text
node --test pipeline.test.cjs
```

Expected: **20 tests pass**, zero failures. Durations depend on the machine.

## Consume a saved real stream later — optional CLI track

Only after you independently choose to run an authenticated Codex task, `codex exec --json` can produce the current documented JSONL format. Preserve its actual process exit status at capture time. To inspect a saved file with known producer status:

```text
node report.cjs events.jsonl --producer-exit 0 --json
```

`0` above is appropriate only if that producer actually exited 0; it is not a suggested assumption. This lab does not create a live capture or supply account access. For a real integration, adapt the `spawnSync` boundary deliberately and test the selected client version rather than replacing it with a shell string from untrusted input.

## Current source and limits

Checked 21 October 2026 against [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), the official [SDK event types](https://github.com/openai/codex/blob/af91f6ef2cd66ead278ebe7d5751973eef430aee/sdk/typescript/src/events.ts) and [item types](https://github.com/openai/codex/blob/af91f6ef2cd66ead278ebe7d5751973eef430aee/sdk/typescript/src/items.ts), source commit `af91f6ef2cd66ead278ebe7d5751973eef430aee`. Fixtures use documented `thread.started`, `turn.started`, `item.started`, `item.completed`, `turn.completed`, `turn.failed` and `error` shapes. An unfinished command omits the optional numeric `exit_code`; `agent_message.text` is distinct from command output. Unknown future event names are recorded but cannot establish completion.

The consumer is a bounded teaching implementation, not a full replacement for the SDK. It buffers at most 1 MiB, expects one thread per capture, and requires a final agent message for this particular reporting workflow. Other valid applications may use a different contract. See `SOLUTION.md` for the full answer and a rubric.

## Lesson-specific practice and depth checks

The [five-task track](exercises/README.md) adds command-family, directory, final-schema and batch exercises. Run `node verify-extraction.cjs` and `node --test extraction.test.cjs`. The 12 added tests distinguish valid structure from source-correct facts, reject wrong-directory output and check dry-run argument plans. `capture-codex.cjs` prints a plan by default; `--run` is an optional deliberate authenticated task and is not exercised by offline verification.
