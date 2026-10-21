# Observe instruction discovery with a counterexample

Copy these files into a fresh `create-workspace.cjs --git` practice copy using your file browser or a scoped Codex request. Merge the root requirement with the existing AGENTS.md rather than replacing unrelated guidance. Copy docs/ and sibling/ beneath that root. The Git root is necessary to make the intended root-to-directory boundary explicit.

Open a fresh task at the practice root, then a separate fresh task whose actual working directory is docs/. Ask for the instruction source paths and applicable heading rule. Expected project chain in docs/: root AGENTS.md, then docs/AGENTS.override.md. docs/AGENTS.md is not also selected at that level; sibling/AGENTS.md is outside the path. Applicable global guidance may also exist; record it without modifying it.

Now move docs/AGENTS.override.md to a separate holding folder in this disposable copy and start another fresh docs task. Expected: docs/AGENTS.md supplies the heading convention instead. Restore the fixture file afterward if comparing further. A directory full of Markdown is not itself proof of which files the client loaded.

Optional CLI equivalent, after choosing the returned project path:

```text
codex --cd "<returned-practice-path>/docs" --sandbox read-only "List loaded instruction paths and the heading rule. Do not edit files."
```

`<returned-practice-path>` is a placeholder, not a literal directory. This fixture does not edit CODEX_HOME, global guidance, fallback filenames or the default byte limit.
