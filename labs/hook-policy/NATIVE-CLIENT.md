# Activate and observe a hook in a disposable project

Checked October 21, 2026 against the [Codex hooks reference](https://learn.chatgpt.com/docs/hooks). Hooks depend on the installed runtime, host shell, project trust, and hook-definition trust. The course author tested the handlers and generated configuration locally; the authenticated app/CLI activation below is a learner track, not an author-observed session.

## 1. Create the project

Run from the course root, or from the folder extracted from the lab ZIP (which retains `labs/hook-policy/`):

```powershell
$hookPracticeRoot = & {
  $ErrorActionPreference = 'Stop'
  $createdRoot = & node labs/hook-policy/create-workspace.cjs --with-stop --path-only
  if ($LASTEXITCODE -ne 0 -or @($createdRoot).Count -ne 1 -or [string]::IsNullOrWhiteSpace($createdRoot)) { throw 'Hook project creation failed; Git was not run.' }
  $resolvedRoot = (Resolve-Path -LiteralPath $createdRoot).Path
  $temporaryPrefix = [IO.Path]::GetTempPath().TrimEnd('\') + '\'
  if (-not $resolvedRoot.StartsWith($temporaryPrefix, [StringComparison]::OrdinalIgnoreCase) -or (Split-Path $resolvedRoot -Leaf) -notlike 'codex-howto-hooks-*' -or -not (Test-Path -LiteralPath (Join-Path $resolvedRoot '.codex/hooks.json') -PathType Leaf)) { throw 'Expected generated hook project is missing; Git was not run.' }
  & git -C $resolvedRoot init | Out-Host
  if ($LASTEXITCODE -ne 0) { throw 'Scratch Git initialization failed.' }
  $resolvedRoot
}
Write-Output $hookPracticeRoot
```

The generator creates a new directory under the operating system's temporary directory. It copies the handlers and writes `.codex/hooks.json` with the **actual Node executable and handler path**. It also creates `src/note.md`, `protected/note.md`, `candidate.md`, `review-evidence.json`, and `AGENTS.md`. Inspect these ordinary files before trusting this project. No personal configuration is edited. Without `--with-stop`, the project includes only the patch guard.

For Bash, check each prerequisite before Git runs:

```bash
if hookPracticeRoot=$(node labs/hook-policy/create-workspace.cjs --with-stop --path-only) \
  && [ -n "$hookPracticeRoot" ] \
  && [ -f "$hookPracticeRoot/.codex/hooks.json" ] \
  && hookPracticeRoot=$(cd -- "$hookPracticeRoot" && pwd -P); then
  case "$hookPracticeRoot" in
    */codex-howto-hooks-*) git -C "$hookPracticeRoot" init && printf '%s\n' "$hookPracticeRoot" ;;
    *) printf '%s\n' 'Unexpected generated path; Git was not run.' >&2 ;;
  esac
else
  printf '%s\n' 'Hook project creation failed; Git was not run.' >&2
fi
```

Use your host's Node/Git installations; a Windows Node path cannot run inside a Linux container. If any preparation step fails, stop and diagnose it instead of using an empty path or continuing from the current directory.

## 2. Open the native client and review trust

In the Codex desktop app, add/open the printed directory as a local project and start a new chat in it. In the CLI, launch `codex -C "$hookPracticeRoot"`, then enter `/hooks`. The CLI's `/hooks` view exposes loaded sources, event bindings, trust status, and enable/disable controls. Review both the project and the **current definition** before trusting it; editing a command invalidates its previous definition trust. If your app build lacks equivalent inspection controls, use the supported CLI view to inspect the configuration rather than assuming installation means execution. Start a fresh chat after configuration changes.

The IDE extension can use the shared runtime configuration when its version supports hooks, but this exercise's inspection instructions target the documented CLI `/hooks` view. Do not substitute a Claude `/hooks` command, a prompt reminder, or a made-up IDE setting.

## 3. Observe the tool boundary

Before the prompts, stage the two baseline files with `git -C $hookPracticeRoot add src/note.md protected/note.md`; this makes an unstaged diff useful without a commit or Git identity change. Use two separate prompts so the evidence is easy to compare:

```text
Use apply_patch to append "allowed exercise" to src/note.md.
Do not use a shell write or a different tool. Show the hook observation and diff.
```

```text
Use apply_patch to append "protected exercise" to protected/note.md.
If the hook denies the patch, stop and report that denial; do not bypass it.
```

Inspect the actual tool activity, then run `git -C $hookPracticeRoot diff -- src/note.md protected/note.md`. An allowed event produces `{}`; a protected patch produces a supported `PreToolUse` denial. Verify the protected file's content directly too. If you skipped staging the baseline, the generated files are untracked and a plain `git diff` alone cannot prove they are unchanged.

If the model chooses another tool, the guard has not been tested. This matcher covers canonical `apply_patch`, not shell writes, symlink resolution, or every editing capability. The operating system sandbox remains a separate boundary.

## 4. Observe a bounded Stop check

The optional Stop handler reads the actual `candidate.md`, verifies the Running and Verification headings, and checks a SHA-256-linked evidence record. The starting candidate lacks Verification. This is a deterministic classroom contract, not a general model quality judge.

```text
Inspect candidate.md and review-evidence.json. Complete this tiny guide with
Running and Verification sections. Record the exact candidate SHA-256 and
the two observed checks in review-evidence.json. Do not merely mark checks true.
Show the final files and any Stop-hook continuation that actually occurred.
```

A missing heading, stale hash, or missing evidence requests one focused continuation with `decision: "block"`. If `stop_hook_active` is already true, this teaching hook returns `{}` instead of repeating indefinitely. A valid event permits stopping. A `block` here requests another agent turn; it is not the `PreToolUse.permissionDecision` contract. Missing/invalid input is diagnosed separately and must not be described as a successful quality check.

Replay all four states without a model using `node labs/hook-policy/stop-demo.cjs`. This proves handler behavior, not native activation. Keep the real client's transcript/version separate.

## 5. Disable and clean up

Disable the non-managed hook in `/hooks` and repeat a fresh tiny allowed observation if you need to establish the disabled state. Alternatively rename **only this generated project's** `.codex/hooks.json` to `hooks.json.disabled`, then start a new chat and check `/hooks` again. Do not disable global hooks to finish this lab. The generated project may be retained for inspection; no recursive deletion is required.

## Troubleshooting

| Observation | Check next |
| --- | --- |
| No invocation | Correct project, supported runtime, event/matcher, source loaded, current definition trusted |
| Definition exists but is skipped | Review trust; project trust and hook trust are different decisions |
| JSON prints but file still changes | Was the event a covered `apply_patch` call? Was the inspected file the actual target? |
| Missing executable / timeout | Use the generated host path and stderr; a launch failure is not a policy denial |
| Repeated Stop continuation | Keep the `stop_hook_active` guard; inspect the candidate hash instead of blindly setting passed |

