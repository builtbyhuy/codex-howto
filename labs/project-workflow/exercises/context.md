# A context ledger that survives a new chat

| Item | Home | How to verify |
| --- | --- | --- |
| Preserve WORK-NOTE.md and original note objects | AGENTS.md | Read the applicable instructions |
| Four current note records n1–n4 | notes.json | Inspect the actual array |
| Search should trim and ignore case | Current exercise brief/checks.cjs | Run the uppercase and padded-query checks |
| Baseline had 4 passes and 2 failures | Dated CONTEXT-CHECKPOINT.md | Rerun; an old result is historical |
| Deployment address | Not documented | Report unknown |
| “Only produce an outline this turn” | Current task | Supply it to the next task if still relevant |

## Stale-memory counterexample

Before the fix, copy solution/CONTEXT-CHECKPOINT.md into your practice project as CONTEXT-CHECKPOINT.md. Keep it unchanged for this deliberately stale-result experiment.

After fixing notes.cjs in the practice copy, preserve the old checkpoint text `Baseline: 4 pass, 2 fail`. Start another app chat with the checkpoint and current files. Ask it to distinguish the baseline from the current result. Run `node --test checks.cjs` again: the reference candidate passes six. A summary that repeats “two checks are still failing” without refreshing the check is wrong.

No memory feature needs to be enabled for this exercise. Generated recall may help locate this file; it does not update the file or make its old test status current. Keep canonical decisions in project files, not in a request to “remember everything”.
