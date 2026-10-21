# Recorded offline fixture transcripts

Recorded 21 October 2026 by actually executing the supplied local programs. Every event and producer answer is synthetic; no Codex service, account or model was called. These are expected lab outputs, not live Codex results. Run from the cli-pipeline lab directory. stdout and stderr are displayed separately; terminal interleaving may differ.

## success

Command: `node run-pipeline.cjs success`

Actual process exit: **0**

stderr:

```text
SYNTHETIC FIXTURE: no Codex service was called.
```

stdout:

```text
# Codex event report

Outcome: completed
Producer exit: 0
Events: 6
Turns completed: 1/1

## Final message

Orbit Notes is a fictional practice project. README.md does not define a verification command.

## Diagnostics

- No transport/lifecycle error found.

A completed agent turn is not proof of factual correctness or accepted delivery.
```

## error

Command: `node run-pipeline.cjs error`

Actual process exit: **2**

stderr:

```text
SYNTHETIC FIXTURE: no Codex service was called.
```

stdout:

```text
# Codex event report

Outcome: failed
Producer exit: 0
Events: 3
Turns completed: 0/1

## Final message

(No accepted final message.)

## Diagnostics

- Synthetic failure: the required documentation source could not be read.

A completed agent turn is not proof of factual correctness or accepted delivery.
```

## fatal

Command: `node run-pipeline.cjs fatal`

Actual process exit: **2**

stderr:

```text
SYNTHETIC FIXTURE: no Codex service was called.
```

stdout:

```text
# Codex event report

Outcome: failed
Producer exit: 0
Events: 2
Turns completed: 0/0

## Final message

(No accepted final message.)

## Diagnostics

- Synthetic fatal stream error.

A completed agent turn is not proof of factual correctness or accepted delivery.
```

## malformed

Command: `node run-pipeline.cjs malformed`

Actual process exit: **3**

stderr:

```text
SYNTHETIC FIXTURE: no Codex service was called.
```

stdout:

```text
# Codex event report

Outcome: invalid
Producer exit: 0
Events: 2
Turns completed: 0/1

## Final message

(No accepted final message.)

## Diagnostics

- Line 3: malformed JSON.

A completed agent turn is not proof of factual correctness or accepted delivery.
```

## incomplete

Command: `node run-pipeline.cjs incomplete`

Actual process exit: **4**

stderr:

```text
SYNTHETIC FIXTURE: no Codex service was called.
```

stdout:

```text
# Codex event report

Outcome: incomplete
Producer exit: 0
Events: 3
Turns completed: 0/1

## Final message

(No accepted final message.)

## Diagnostics

- Missing a completed final turn with an agent message.

A completed agent turn is not proof of factual correctness or accepted delivery.
```

## producer-failure

Command: `node run-pipeline.cjs producer-failure`

Actual process exit: **5**

stderr:

```text
SYNTHETIC FIXTURE: no Codex service was called.
```

stdout:

```text
# Codex event report

Outcome: producer
Producer exit: 7
Events: 6
Turns completed: 1/1

## Final message

Orbit Notes is a fictional practice project. README.md does not define a verification command.

## Diagnostics

- Producer exited 7.

A completed agent turn is not proof of factual correctness or accepted delivery.
```
