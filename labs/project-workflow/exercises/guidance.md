# Modular writing guidance and command policy are separate

Copy examples/writing-guidelines.md into docs/writing-guidelines.md in your practice copy. Add this narrowly scoped reading instruction to the existing project AGENTS.md:

```markdown
For README changes, read docs/writing-guidelines.md first.
Keep the actual verification command and label unrun checks.
```

Rewrite the misleading verification sentence in README.md, leaving the source code alone. Expected correction: npm test becomes node --test checks.cjs; the text does not claim that it passed until it actually ran. Compare against solution/README.md. An `@file` mention or a paths YAML block copied from Claude does not establish automatic Codex import semantics.

## Optional execution-policy inspection

`review.rules` is an experimental Codex rules-language example kept outside an active .codex/rules directory. Reading or checking it does not install a policy. With an existing CLI that supports this command, run from this lab:

```text
codex execpolicy check --rules ./exercises/review.rules -- node --test checks.cjs
codex execpolicy check --rules ./exercises/review.rules -- node --test private-checks.cjs
```

Expected explicit decision: prompt for checks.cjs, forbidden for private-checks.cjs. Both match the broad node --test prefix; the narrower forbidden rule wins for the second case. This evaluator does not execute either test command. A no-match result supplies no explicit authorization, and an allow decision would still not prove a command's output correct. Do not copy this file into active personal or project policy as part of the exercise.
