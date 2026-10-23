# From your first project to a reviewed Git diff

Orbit Notes is a fictional, dependency-free capstone. Start with the **Codex desktop app**; the optional Git and terminal exercises do not require the Codex CLI. Use an existing Node.js 20+ runtime for checks. Nothing installs software, signs in, contacts a service or modifies a user repository.

## Make your own disposable copy

From this lab folder:

```text
node create-workspace.cjs
```

The command returns a fresh temporary folder path. Open that exact folder in the Codex app. It copies the starter, leaving the shipped lab and other work untouched. You may also copy `starter/` using your file browser if Node is unavailable; record that you have not yet run the code checks.

## The brief

Orbit Notes contains four fictional notes. Search must match substrings regardless of case or surrounding spaces. It must preserve the input note objects and their order. Fix only `notes.cjs` for code behavior, correct the unsupported README verification instruction, and preserve `notes.json`, `checks.cjs` and `WORK-NOTE.md`.

### 1. Establish context

Ask Codex to read the README and AGENTS.md, name the working directory and report which facts are documented. The project purpose and four-note data are known. No deployment URL or customer claim exists. The starter intentionally tells you to run `npm test`, but has no package.json. Do not install packages to make that planted instruction seem correct.

### 2. Record the baseline

In the disposable copy:

```text
node --test checks.cjs
node cli.cjs REVIEW
```

Expected baseline: **4 checks pass, 2 fail**. The uppercase query prints no notes, which contradicts the brief. The failures are the case and surrounding-whitespace checks. Keep the failing checks; they define the intended contract.

### 3. Make and inspect one focused change

Have Codex normalize the query and comparison text without cloning or sorting notes. Correct README.md to document `node --test checks.cjs`. Inspect both actual files and rerun:

```text
node --test checks.cjs
node cli.cjs "  REVIEW  "
```

Expected reference: **6 checks pass** and:

```text
n1: Review launch checklist
n3: Review documentation
```

### 4. Recover narrowly

Add a useful review paragraph to README.md. Separately replace its heading with a deliberately rejected experiment. Recover only the heading while retaining the useful paragraph. Explain why a whole-file restore would discard too much and why starting another chat would not restore either file.

### 5. Optional Git evidence, without identity changes

If Git is already available, create another disposable copy with a private Git index baseline:

```text
node create-workspace.cjs --git
```

The setup initializes only its fresh temporary directory, stages the named starter files and records a tree identifier. Its subprocesses discard inherited Git repository/index/config variables. It does **not** create a commit, configure a name/email or read/write your global Git configuration. The staged index is the baseline for this exercise; it is not a durable commit history. A later real project can use reviewed commits through its normal Git workflow.

After making the fix in that copy, inspect:

```text
git status --short
git diff -- README.md notes.cjs
git show :README.md
```

An `AM` status is expected for a baseline-added file with later working edits because the lab deliberately has no initial commit. Compare working files with the index. An untracked output is not part of an ordinary diff; inspect it separately.

## Complete solution and automated demonstration

`solution/notes.cjs`, `solution/README.md` and `solution/HANDOFF.md` contain a complete reference. Use them after attempting the task. [EXPECTED.md](solution/EXPECTED.md) records the offline demonstration; [reference.diff](solution/reference.diff) contains an actual generated Git diff. To verify the reference in another fresh temporary directory:

```text
node verify-reference.cjs
node verify-reference.cjs --git
node --test workflow.test.cjs
```

The first command checks baseline failure, reference success and narrow recovery. The Git option also produces an actual `evidence.diff` inside its returned temporary directory. Expected test summary: **4 integration tests pass** when Git is available; the Git-specific test is honestly skipped if it is absent. No user Git identity or existing repository is changed. The generated directory remains available for inspection.

## Answer rubric

Pass when the source-grounded context is correct, both planted behavior failures are fixed, all six checks pass, protected files are unchanged, the README gives the real command, and the useful paragraph survives recovery. A completed Codex message or a single passing test is insufficient. Write a handoff identifying changed files, actual check results and limits; compare it with the reference handoff.

The supplied automated reference proves the local fixture behavior. It does not prove that a learner used Codex successfully or that a real product was accepted. Optional controls and memory settings must be inspected in the actual installed client; this lab does not alter them.

## Lesson-specific practice and depth checks

[Command observation](exercises/control-notebook.md), [prompt-to-skill migration](exercises/migration.md), [fictional tool fallback](exercises/connection-request.md), [context ledger](exercises/context.md), [instruction initialization](exercises/initialization.md), [hierarchy fixture](exercises/hierarchy/README.md), [modular guidance and isolated rule checks](exercises/guidance.md), and [recovery/alternative experiments](exercises/recovery.md) have distinct outcomes. Compare the [complete answer key](solution/DEPTH-ANSWERS.md) after attempting them.

Run `node verify-depth.cjs` for actual candidate A/B behavior, narrow versus whole-file restoration, index/untracked coverage and stale-checkpoint counterexamples in fresh owned copies. It checks fixture structure, not live Codex skill activation, memory generation or instruction discovery.

For the separate durable-history lesson, `node verify-commit.cjs` creates a new owned repository and two actual practice commits with invocation-only fictional identity. It verifies HEAD coverage, an excluded untracked draft and a later unstaged edit. Default --git setup remains index-only. See the [full recovery guide](exercises/recovery.md).
