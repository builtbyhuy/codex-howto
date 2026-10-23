# Howto codex learning path

[Catalog](CATALOG.md) · [Website](https://builtbyhuy.github.io/codex-howto/)

## Choose by demonstrated skills

Beginner: start at 01 if you cannot yet verify a folder, source facts and unknowns. Intermediate: enter at 03 after demonstrating the 01, 02 and 08 exit checks; add 10 before MCP or hooks. Advanced: enter at 09 only with artifacts for its prerequisite milestones. Missing evidence means unassessed, not failed or mastered. You may read any lesson; these are practice dependencies.

## A bounded first session

Spend 15–25 minutes on s01-01: create an owned fictional Orbit Notes workspace following its lab README, ask the read-only request and compare source facts. A later 30–50 minute session covers scoped guidance and narrow recovery. Node.js 20+ is needed for offline labs; reading needs only a browser. Native Codex use is optional and needs your own supported client/access; do not purchase anything for the offline track.

## Milestones

Estimates cover the recommended lesson and focused practice, not every lesson or client installation. Pause at the upper bound, record the blocking observation and revisit that prerequisite next session. Revisit after a day with a different fictional input, before reopening the reference. Completion ticks and multiple-choice scores do not establish practical mastery.

### 01 — Commands and your first session

Prerequisites: none. Budget: 25–45 minutes.

Read [s01-01](docs/lessons/s01-01.md); practise with [the existing lab](labs/project-workflow/README.md).

Exit evidence: In a fresh Orbit Notes copy, report n1–n4, identify the unsupported npm test instruction and leave the deployment URL unknown.

Before references: How would you distinguish sign-in, folder access and a grounded answer?

Transfer case: A fictional Atlas Notes README claims a deployment exists, but provides no URL or package manifest. Draft a read-only request and explain which facts remain unknown.

Transfer rubric (compare after attempting):

- Name the actual workspace and files to inspect; do not infer access from sign-in.
- Treat the deployment claim as unsupported without a URL source.
- Inspect the manifest before accepting an npm instruction; do not install to justify a claim.

Compare your reasoning against the lesson's checks and solution. Record what you observed, what is uncertain and which missing prerequisite or failed check you will revisit. If every check is supported, try a changed input rather than claiming mastery.

### 02 — Project guidance and memory

Prerequisites: [Module 01](#01--commands-and-your-first-session). Budget: 30–50 minutes.

Read [s02-01](docs/lessons/s02-01.md); practise with [the existing lab](labs/project-workflow/README.md).

Exit evidence: Write scoped project guidance in a disposable copy, explain its scope, and compare observed behavior with the instruction; do not infer loading from file existence.

Before references: What evidence separates an instruction file existing from the client loading and following it?

Transfer case: A fictional monorepo has conflicting parent and child guidance. Describe the files and scope you would inspect before editing its child app.

Transfer rubric (compare after attempting):

- Inspect parent and child guidance within the actual workspace and explain their scopes.
- Identify the conflict before proposing a bounded child-app change.
- Separate files existing from observed client loading and compliance.

Compare your reasoning against the lesson's checks and solution. Record what you observed, what is uncertain and which missing prerequisite or failed check you will revisit. If every check is supported, try a changed input rather than claiming mastery.

### 08 — Checkpoints, recovery and Git

Prerequisites: [Module 01](#01--commands-and-your-first-session), [Module 02](#02--project-guidance-and-memory). Budget: 30–50 minutes.

Read [s08-01](docs/lessons/s08-01.md); practise with [the existing lab](labs/project-workflow/README.md).

Exit evidence: In an owned scratch copy, recover only the intended change and prove unrelated learner edits remain with a diff.

Before references: Why is a conversation checkpoint not a universal filesystem backup?

Transfer case: A fictional teammate has an unrelated unsaved change beside your failed experiment. Propose a narrow recovery and a preservation check.

Transfer rubric (compare after attempting):

- Identify the exact experiment changes using a diff before recovery.
- Preserve the unrelated teammate change; avoid broad reset or overwrite.
- Verify both intended recovery and preservation afterwards; a chat checkpoint is insufficient evidence.

Compare your reasoning against the lesson's checks and solution. Record what you observed, what is uncertain and which missing prerequisite or failed check you will revisit. If every check is supported, try a changed input rather than claiming mastery.

### 10 — Working from the command line

Prerequisites: [Module 01](#01--commands-and-your-first-session), [Module 08](#08--checkpoints-recovery-and-git). Budget: 30–60 minutes.

Read [s10-01](docs/lessons/s10-01.md); practise with [the existing lab](labs/cli-pipeline/README.md).

Exit evidence: Run the fictional local pipeline and separate events, final output and errors; label native Codex execution unrun unless actually observed.

Before references: How do you distinguish command exit status from a useful, valid final artifact?

Transfer case: A fictional CI task returns exit zero but its final JSON is missing a required field. Design separate process and artifact checks.

Transfer rubric (compare after attempting):

- Check process exit status and final artifact validity independently.
- Specify the missing required JSON field and reject the incomplete artifact even on exit zero.
- Keep events, final output and errors distinct; do not report fixture execution as live Codex behavior.

Compare your reasoning against the lesson's checks and solution. Record what you observed, what is uncertain and which missing prerequisite or failed check you will revisit. If every check is supported, try a changed input rather than claiming mastery.

### 03 — Skills

Prerequisites: [Module 01](#01--commands-and-your-first-session), [Module 02](#02--project-guidance-and-memory). Budget: 40–70 minutes.

Read [s03-02](docs/lessons/s03-02.md); practise with [the existing lab](labs/skill-workflow/README.md).

Exit evidence: Inspect a local skill and run its bounded fixture checks; record discovery, selection and execution as separate observations.

Before references: How would you diagnose a skill that is visible but fails during execution?

Transfer case: A fictional README audit skill is listed but its helper cannot read a fixture. Give a diagnosis sequence without reinstalling globally.

Transfer rubric (compare after attempting):

- Distinguish discovery and selection from helper execution failure.
- Check the referenced fixture path, helper input contract and access with evidence.
- Propose a narrow scratch repair; global reinstallation does not diagnose a local fixture error.

Compare your reasoning against the lesson's checks and solution. Record what you observed, what is uncertain and which missing prerequisite or failed check you will revisit. If every check is supported, try a changed input rather than claiming mastery.

### 05 — MCP

Prerequisites: [Module 02](#02--project-guidance-and-memory), [Module 10](#10--working-from-the-command-line). Budget: 40–70 minutes.

Read [s05-02](docs/lessons/s05-02.md); practise with [the existing lab](labs/mcp-workbench/README.md).

Exit evidence: Exchange actual local JSON-RPC messages and distinguish initialization, tool discovery, authorization and retrieval evidence.

Before references: Why does successful initialization not prove a requested record was retrieved?

Transfer case: A fictional connector lists a tool but cannot retrieve ticket AT-17. Separate transport, authorization and missing-data hypotheses.

Transfer rubric (compare after attempting):

- Separate successful initialization/tool listing from a successful record retrieval.
- Inspect transport error, authorization response and missing-record evidence as distinct hypotheses.
- Keep AT-17 unknown until a real tool response supports the claim.

Compare your reasoning against the lesson's checks and solution. Record what you observed, what is uncertain and which missing prerequisite or failed check you will revisit. If every check is supported, try a changed input rather than claiming mastery.

### 04 — Subagents

Prerequisites: [Module 02](#02--project-guidance-and-memory), [Module 03](#03--skills), [Module 08](#08--checkpoints-recovery-and-git). Budget: 45–75 minutes.

Read [s04-07](docs/lessons/s04-07.md); practise with [the existing lab](labs/delegation-capstone/README.md).

Exit evidence: Produce two bounded work briefs and integrate their artifacts using the capstone contract; distinguish fixture integration from live delegation.

Before references: Which ownership and output boundaries prevent two workers from overwriting each other?

Transfer case: A fictional review task needs both a schema check and prose review. Divide ownership and specify how you will resolve conflicting recommendations.

Transfer rubric (compare after attempting):

- Assign separate owned artifacts to schema and prose reviewers.
- Give each brief inputs, boundaries and an output contract.
- Define an integration check and a conflict-resolution decision with evidence rather than concurrent overwrites.

Compare your reasoning against the lesson's checks and solution. Record what you observed, what is uncertain and which missing prerequisite or failed check you will revisit. If every check is supported, try a changed input rather than claiming mastery.

### 06 — Hooks

Prerequisites: [Module 01](#01--commands-and-your-first-session), [Module 10](#10--working-from-the-command-line). Budget: 40–70 minutes.

Read [s06-01](docs/lessons/s06-01.md); practise with [the existing lab](labs/hook-policy/README.md).

Exit evidence: Replay bounded fictional events and inspect allowed, rejected and failure cases; label real hook registration/trust separately.

Before references: What can an offline event replay prove, and what requires client observation?

Transfer case: A fictional post-tool hook fails to write its report. Explain how to preserve the tool result while surfacing the hook failure without claiming enforcement.

Transfer rubric (compare after attempting):

- Preserve the tool result independently from the failed report write.
- Surface the hook failure and inspect its allowed path/error without claiming enforcement.
- Distinguish offline replay from actual client registration, trust and execution.

Compare your reasoning against the lesson's checks and solution. Record what you observed, what is uncertain and which missing prerequisite or failed check you will revisit. If every check is supported, try a changed input rather than claiming mastery.

### 09 — Advanced features

Prerequisites: [Module 04](#04--subagents), [Module 05](#05--mcp), [Module 06](#06--hooks), [Module 08](#08--checkpoints-recovery-and-git), [Module 10](#10--working-from-the-command-line). Budget: 50–90 minutes.

Read [s09-01](docs/lessons/s09-01.md); practise with [the existing lab](labs/workflow-plugin/README.md).

Exit evidence: Prepare a bounded plan, permission matrix and validated output artifact; keep scheduling, model comparison and live actions explicitly unrun.

Before references: How do a prepared plan, a validated fixture and an executed workflow differ?

Transfer case: A fictional team wants a scheduled weekly review. Draft the minimum safe plan, required approval boundary and output checks without scheduling anything.

Transfer rubric (compare after attempting):

- Bound the weekly-review inputs, owned outputs and acceptance checks.
- Identify permission required for scheduling or external actions and leave them unrun.
- Distinguish a prepared plan and validated fixture from an executed workflow.

Compare your reasoning against the lesson's checks and solution. Record what you observed, what is uncertain and which missing prerequisite or failed check you will revisit. If every check is supported, try a changed input rather than claiming mastery.

### 07 — Plugins

Prerequisites: [Module 03](#03--skills), [Module 05](#05--mcp), [Module 06](#06--hooks), [Module 09](#09--advanced-features). Budget: 50–90 minutes.

Read [s07-05](docs/lessons/s07-05.md); practise with [the existing lab](labs/workflow-plugin/README.md).

Exit evidence: Inspect the package, run its schema/protocol checks and explain distribution limits; fixture checks do not establish native activation.

Before references: Why does a valid package not prove that a client activated its skill, MCP tools and hooks?

Transfer case: A fictional team packages a review skill with a local server and lifecycle hook. Write a release checklist separating offline validation, scratch client checks and publication permission.

Transfer rubric (compare after attempting):

- Check the distributed skill, server, hook references and offline schema/protocol output.
- Require separate scratch-client observations for discovery, activation and actual retrieval/hook execution.
- Keep publication approval separate from package validity; do not call fixture success native activation.

Compare your reasoning against the lesson's checks and solution. Record what you observed, what is uncertain and which missing prerequisite or failed check you will revisit. If every check is supported, try a changed input rather than claiming mastery.

## Focused session without an AI assistant

Choose a module above and write your intent: before reading (diagnose), during reading (explain a confusion), or after reading (retrieve and transfer). First answer its recall question without references. Then attempt the transfer case. Open the linked lesson and compare against its checks, mistakes, solution and troubleshooting. Record correctness and reasoning separately, quote the evidence for each claim and choose one targeted next practice. Skip or uncertainty is useful evidence; do not invent a score for an unattempted item. Keep notes in your own disposable workspace; this Markdown workflow stores no progress.
