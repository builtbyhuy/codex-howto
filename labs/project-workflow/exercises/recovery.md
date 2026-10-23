# Observe recovery instead of assuming a rewind

Create a fresh Git practice copy. This lab deliberately has an index tree and no HEAD commit. All changes below stay in that returned temporary folder.

1. Run `git status --short` and `git show :README.md`. Record the actual baseline.
2. Fix the unsupported check sentence in README.md and append `Useful review: preserve this paragraph.`
3. Change the heading to `# Rejected heading experiment`. Add a new `notes-draft.md` containing a fictional outline.
4. Use `git diff -- README.md` to inspect tracked content and `git status --short` to discover the untracked draft. Open that draft separately. Expected README status: AM, because it is added in the index and modified in the worktree; expected draft status: ??.
5. Correct only the rejected heading to `# Orbit Notes`. Verify that the corrected test command and useful paragraph remain. Opening another chat would not perform this edit.

A separate whole-file rejection is different: in another disposable copy, `git restore --worktree -- README.md` restores the index version and discards every unstaged README edit, including the useful paragraph. It leaves the untracked notes-draft.md alone. Do not use that whole-file command for step 5.

## Compare implementation alternatives

Copy candidate-a.cjs into notes.cjs in one fresh copy; copy candidate-b.cjs into another. Run `node --test checks.cjs` in each. A passes six. B passes five and fails original object identity, even though both return IDs n1/n3 for the padded uppercase query. The changed title text in B's output is another visible clue. Record the two directories; a chat fork alone does not provide two file workspaces.

## What a later real commit adds

An index tree identifies selected content for this disposable comparison, but the next git add changes that index. In a normal already-configured repository, an inspected commit records selected content and history independently of chat. Neither mechanism includes untracked drafts, ignored files or external services automatically. Review all staged paths before committing; this lab does not require identity setup, remotes or a push.

## A real commit demonstration without saving identity

Run `node verify-commit.cjs` from the lab folder when Git is already available. It creates a new owned repository, records the eight-file intentionally broken baseline, stages only the focused README/notes.cjs fix and records a second commit. It uses fictional identity only through `git -c user.name="Course Practice" -c user.email=practice@example.invalid -c commit.gpgSign=false commit ...`; it does not save these settings, inherit user Git configuration, add a remote or touch an existing repository.

Inspect the returned folder and two actual commit IDs. `git show HEAD:README.md` contains the corrected command; `git show <baseline-id>:README.md` still contains the planted npm test claim. Replace <baseline-id> with the recorded ID. `git diff <baseline-id> HEAD -- README.md notes.cjs` shows only the focused candidate. `git ls-tree --name-only HEAD` lists committed paths. The baseline is a recorded broken fixture, not a claim that those checks passed.

The verifier leaves an untracked notes-draft.md and a later unstaged README observation. `git status --short` shows both. HEAD does not include either later edit. The new repository remains available; no learner directory is cleaned up. A commit preserves the content selected when it was made, not every subsequent file state.
