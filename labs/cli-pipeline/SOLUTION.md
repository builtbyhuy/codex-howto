# Reference solution and answer rubric

The complete runnable solution is `report.cjs` plus `run-pipeline.cjs`; no missing implementation is left for the reader to invent.

## Worked trace

For `success.jsonl`, the consumer sees a thread, starts a turn, observes a command item, collects the completed agent message and accepts the final completion. It then checks the actual producer status. The six events produce `Outcome: completed`, 1/1 completed turns and the Orbit Notes summary.

For `incomplete.jsonl`, the agent message is collected inside a running turn but never promoted to an accepted final answer. Exit 4 and `(No accepted final message.)` are the correct result.

For `producer-failure`, the synthetic child prints exactly the same successful events but exits 7. The runner passes that separate status to the consumer. The result is `Outcome: producer`, report exit 5 and a diagnostic saying the producer exited 7.

## What the reference does

1. Parse each nonblank line, preserving the line number for a malformed record.
2. Validate only the event/item fields needed by this lesson; record future event names without treating them as success or executing their text.
3. Track the current turn. A new turn invalidates an older final answer until it completes.
4. Distinguish `turn.failed.error.message` from top-level `error.message` and keep either as a failure.
5. Report observed command failures separately from turn completion. A completed turn is a lifecycle signal, not proof that the command failure was repaired.
6. Combine parse/lifecycle evidence with the producer's real exit code or terminating signal.

## Rubric

| Criterion | Acceptable evidence |
| --- | --- |
| Input handling | CRLF/BOM/blank lines work; malformed JSON and invalid shapes fail with a line number. |
| Lifecycle | Failed/fatal/incomplete and a last running turn cannot become success. |
| Process boundary | A nonzero child status is preserved despite a successful-looking last event. |
| Output | Final agent text is distinct from command output; diagnostics and exit codes agree. |
| Claims | Synthetic fixtures are labelled; completion is not called factual or business acceptance. |

A robust response explains all five categories with a concrete fixture. Passing only the success case is insufficient. The test suite also checks a missing executable, bounded input and CLI exit propagation. It does not exercise a live Codex service, authentication, network failures or every future event schema.
