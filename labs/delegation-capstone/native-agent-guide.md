# Run the capstone with actual Codex agents

Checked **21 October 2026** against [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) and [Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees). Current local Codex releases document subagent support in the app, CLI and IDE. Account, host and managed requirements can differ. None of the helper programs in this lab starts Codex or pretends to be a live worker.

## Establish a visible target

Work in an extracted disposable copy. From the lab folder:

```text
node run.cjs starter
node --test candidate.test.cjs
```

The starter must fail: `done=1`, `doneMinutes=80`; all four named candidate checks initially fail. Inspect `CONTRACT.md` and `work-packages.json` before looking at `solution/`. The target is `total=4`, `done=2`, `doneMinutes=55`, with all four candidate checks passing on independent records too.

## App: delegate, inspect and steer

Open this disposable lab as a project and start a local Codex chat. Send:

```text
Read CONTRACT.md and work-packages.json. Reproduce the starter result first.
Use two subagents: A owns starter/normalize.cjs only; B owns starter/report.cjs only.
Neither may change fixtures, tests, runner, baseline or solution.
A must trim/lowercase supported statuses and reject invalid input.
B receives normalized records and must validate them, count done records and sum only their minutes without mutation.
Let A and B work in parallel. Keep integration with the main agent.
Wait for both. Require each handoff to name its changed file, observed checks and remaining gaps.
Then inspect the combined diff, run node run.cjs starter and node --test candidate.test.cjs, and report the actual results.
```

Open each subagent thread from its activity in the main chat. Check its actual input/file ownership and result. To steer, ask the main chat “Tell A to cover null and unsupported status inputs without changing B's file.” To stop a wrong assignment, ask the main chat to stop that subagent and preserve the useful partial work. Do not infer a running state you did not observe.

**CLI:** start `codex` in this copy, send the same prompt, and use `/subagents` to inspect/switch active threads. Ask the main agent to steer or stop one. **IDE:** send the prompt in the open lab workspace; when the background-agent panel is available, expand it to inspect status or open a thread. Controls may differ from the app. Claude's `Ctrl+B`, team environment variable and teammate-pane flags are not Codex controls.

## Optional custom role, with the exact active location

`role-draft.toml` is inactive. To test it deliberately in this scratch project, place its full contents at `.codex/agents/practice_normalizer.toml`. In PowerShell, from the disposable lab folder:

```powershell
if (Test-Path -LiteralPath .codex/agents/practice_normalizer.toml) { throw 'Practice role already exists; review it before changing it.' }
New-Item -ItemType Directory -Force -Path .codex/agents | Out-Null
Copy-Item -LiteralPath role-draft.toml -Destination .codex/agents/practice_normalizer.toml -ErrorAction Stop
```

First confirm that destination does not already contain work; preserve/review it rather than overwriting a previous role. On a POSIX shell the corresponding new-package copy is `mkdir -p .codex/agents` followed by `cp -n role-draft.toml .codex/agents/practice_normalizer.toml`. Required fields are `name`, `description` and `developer_instructions`; no parent config entry is required for the current standalone file format. Start a fresh Codex chat/session if needed and request `practice_normalizer` explicitly for package A. Inspect the actual selected role and its changed file before calling loading successful.

The role inherits the parent's permissions, provider, model defaults and MCP servers. It cannot replace a sandbox/approval setting. Optional supported capability reductions, such as `[features] shell_tool = false`, belong only in a role that does not need command execution. A plain “do not edit” sentence does not create a read-only filesystem. A custom name matching `worker`, `default` or `explorer` shadows that built-in; keep this distinct practice name.

## Real Git isolation and destination checks

```text
node worktree-demo.cjs
node --test worktree.test.cjs
```

This program really creates a **new OS-temporary Git repository**, makes one baseline commit with a command-local fictional identity, adds a detached worktree, repairs the copied starter from reference files, runs its candidate grader, and applies the reviewed two-file patch back to its temporary parent. The original extracted lab, personal Git identity and actual Codex configuration are unchanged. The printed receipt includes actual paths and SHA. `actualAgentsSpawned:0` is intentional: the worktree and code execution are real, agent activity is not simulated as fact.

Observe the three useful states: A-only gives `done=2,doneMinutes=80`; both fixed in the worker give `2,55`; the parent still gives `1,80` until integration. A passing worker checkout cannot certify its destination. The separate final run must show `2,55` and all four candidate checks at the destination.

To perform an actual app worktree exercise, first use your own scratch **Git repository** with a baseline commit. In a new app chat choose **Worktree** beneath the composer, select the intended starting branch/state, then submit the task. Inspect the returned checkout path before editing. The app defaults to detached HEAD and provides Handoff/Create branch controls; follow the state you actually selected. A subagent by itself does not automatically create a worktree, and copying an uncommitted checkout is not the same as starting from HEAD.

## Accepted handoff

Return the actual input version/path, A's file/checks, B's file/checks, the combined result, destination candidate result and unverified stages. If only the offline/reference route ran, say so. The current documented Codex subagent workflow does not establish Claude's experimental shared task-list/mailbox/team-mode semantics; this two-owner contract reaches the practical coordination outcome without claiming those controls exist.
