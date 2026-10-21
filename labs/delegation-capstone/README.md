# Delegation capstone: two workers, one verified result
Node.js 20+, no package installation/accounts/network. The optional real-worktree demo and its two tests also require an existing Git executable. Work in an extracted disposable copy. The code and integration checks are real; any simulated handoffs are explicitly deterministic.
## Run from this folder
```text
node run.cjs starter
node run.cjs solution
node --test capstone.test.cjs
node --test worktree.test.cjs
node --test candidate.test.cjs
node simulate.cjs
```
Starter intentionally exits 1: done=1 and doneMinutes=80. Solution exits 0: total=4, done=2, doneMinutes=55, five integrated checks pass. Seven contract/test checks pass because they verify both the frozen broken baseline and the reference solution. Four candidate checks intentionally fail before your changes; they must all pass after your fixes. simulate.cjs spawns zero agents; it prints the ownership/dependency model and runs the reference code.
## Implement before looking at the answer
Read CONTRACT.md and work-packages.json. A owns normalization; B owns aggregation. Implement both starter modules, then run node run.cjs starter. Read the solution only after comparing your output to the contract. The baseline/ folder preserves the original defects while starter/ is yours to edit. Run node --test candidate.test.cjs after editing: all four candidate checks must pass. Do not weaken the assertions to accept a broken implementation.
## Actual optional Codex delegation
Ask Codex in your disposable copy to delegate A and B with their exact owned files and frozen contract, retain integration for the main agent, and return both handoffs. Use the current client's subagent activity controls. Record actual worker messages and command results; do not label simulate.cjs output as agent work. Built-in roles are default, worker and explorer. role-draft.toml illustrates a custom role but is inactive.
Subagents inherit parent permissions; instructions naming files do not enforce an OS boundary. Shared-checkout ownership and Git worktree isolation are different designs. The ordinary runner/simulation creates neither settings nor worktrees. The separate real-worktree demonstration below creates only a new temporary Git repository and its checkout; no owner configuration is changed.

Read [native-agent-guide.md](native-agent-guide.md) for the complete app dispatch/inspect/steer/stop flow, CLI `/subagents`, conditional IDE panel, exact custom-role path and optional app Worktree flow. It includes the actual two-owner prompt, not merely a proposed role name. Native invocation and role loading remain deliberate learner observations.

## Real isolation and incomplete handoff

Run `node worktree-demo.cjs` to create a fresh OS-temporary repository with a command-local fictional commit identity, add a detached worktree, execute an A-only candidate, repair B, run the worker's actual candidate checks and integrate the reviewed two-file patch into its temporary parent. It prints actual paths/SHA and preserves the original lab. Parent output remains `1/80` while the fixed worker has `2/55`; destination checks pass only after integration. `actualAgentsSpawned:0` distinguishes this real Git/code exercise from actual Codex work.

`worktree.test.cjs` adds two checks for the real flow and isolation from ambient Git settings. With the seven reference checks that gives **nine**, separately from the four deliberately broken learner checks. The program uses existing Git and Node only; it changes neither global Git identity nor the owner's repository. Set `CODEX_LAB_TEMP` to an existing dedicated temporary parent if needed; the program creates a unique child there and retains it for inspection.
## Three experiments
1. Sequential: complete A then B and integrate. Note the actual elapsed time if useful; no claimed speedup is supplied.
2. Parallel work packages: A and B can proceed independently against the frozen interface. Integration waits for both.
3. Incomplete handoff: accept only A, leave B broken and run integration. It must fail. A convincing completion message cannot replace the combined check.
## Rubric
The candidate must satisfy both module contracts, preserve inputs, produce the exact fixture result, handle independent boundary cases and respect ownership. The final report must name actual checks and unverified client behavior. Reject a correct-looking total produced by hardcoding this fixture.

The four learner tests include invalid containers, non-string IDs, unknown/unnormalized status values, NaN/Infinity/negative/non-number effort and duplicate IDs. The seven-test reference suite includes an actual grader mutation check: removing ID-type, allowed-status or finite-effort validation from an otherwise correct report implementation must make the candidate grader fail. These extra assertions retain four named learner tests and seven named reference tests; they do not establish exhaustive coverage.
## Troubleshooting
Wrong completed count: inspect normalization before aggregation. Wrong minutes with correct count: inspect completed-only reduction. Two workers edit the same file: stop that overlap and assign one owner. A worker waits on another unnecessarily: confirm whether the interface contract already makes its input independent. A simulation says passed: inspect kind and actualAgentsSpawned before making an agent-performance claim.


