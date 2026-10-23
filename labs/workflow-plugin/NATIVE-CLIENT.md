# Install, inspect and remove a real local plugin

This is a native Codex CLI lifecycle exercise, not an MCP-protocol simulation. The local metadata/install path was exercised with `codex-cli 0.163.0-alpha.11` on Windows on 21 October 2026. Current official CLI documentation also describes these commands. Check `codex --version` and `codex plugin --help` in your own installation; availability can differ.

The helper gives **each child CLI process** a newly generated `CODEX_HOME`. It never changes your shell environment, copies credentials, signs in, sends a model prompt, registers an owner MCP server or edits your usual Codex configuration. Its commands only add/list/install/remove the packaged local practice plugin. They do create state and a cache inside the printed temporary practice directory. Review `native-client.cjs` first.

## 1. Create the complete practice layout

From the extraction root, using your existing Node.js and Codex CLI:

```powershell
$pluginPracticeRoot = & {
  $ErrorActionPreference = 'Stop'
  $createdRoot = & node labs/workflow-plugin/create-workspace.cjs --path-only
  if ($LASTEXITCODE -ne 0 -or @($createdRoot).Count -ne 1 -or [string]::IsNullOrWhiteSpace($createdRoot)) { throw 'Plugin workspace creation failed; no native action was run.' }
  $resolvedRoot = (Resolve-Path -LiteralPath $createdRoot).Path
  if ((Split-Path $resolvedRoot -Leaf) -notlike 'codex-howto-workflow-*' -or -not (Test-Path -LiteralPath (Join-Path $resolvedRoot 'PRACTICE-WORKSPACE.json') -PathType Leaf)) { throw 'Expected generated workspace is missing.' }
  $resolvedRoot
}
node labs/workflow-plugin/native-client.cjs version $pluginPracticeRoot
if ($LASTEXITCODE -ne 0) { throw 'Native version check failed; stop here.' }
```

On macOS/Linux, the equivalent first line is:

```bash
if plugin_practice_root=$(node labs/workflow-plugin/create-workspace.cjs --path-only) \
  && [ -n "$plugin_practice_root" ] \
  && [ -f "$plugin_practice_root/PRACTICE-WORKSPACE.json" ]; then
  node labs/workflow-plugin/native-client.cjs version "$plugin_practice_root"
else
  printf '%s\n' 'Workspace creation failed; no native action was run.' >&2
fi
```

Use `$pluginPracticeRoot` in the PowerShell commands below, or `"$plugin_practice_root"` in your shell. If `codex` is not on PATH, append `--codex` followed by the full path to an installed Codex executable. The helper runs that executable directly; it does not interpret a shell command string.

The generated tree contains:

```text
codex-howto-workflow-<unique>/
├── PRACTICE-WORKSPACE.json
├── codex-home/
│   └── config.toml       # file credential store; no copied sign-in
└── marketplace/
    ├── .agents/plugins/marketplace.json
    └── plugins/workflow-review-practice/
        ├── plugin.json
        ├── mcp.json
        ├── skills/fixture-review/SKILL.md
        ├── hooks/
        └── server.cjs
```

The catalog's `source.path` is `./plugins/workflow-review-practice`, resolved from `marketplace/`, not from `.agents/plugins/`. Inspect it and the copied package before installing.

## 2. Observe discoverable versus installed

```powershell
node labs/workflow-plugin/native-client.cjs add-marketplace $pluginPracticeRoot
node labs/workflow-plugin/native-client.cjs available $pluginPracticeRoot
node labs/workflow-plugin/native-client.cjs install $pluginPracticeRoot
node labs/workflow-plugin/native-client.cjs installed $pluginPracticeRoot
```

The helper prints the exact native argument array and stdout/stderr/exit status, and appends observations to `native-observations.jsonl` in the generated root. The underlying commands are:

```text
codex plugin marketplace add <generated-marketplace-root> --json
codex plugin list --marketplace howto-practice-local --available --json
codex plugin add workflow-review-practice@howto-practice-local --json
codex plugin list --marketplace howto-practice-local --json
```

Before installation expect `installed: false` in `available`; afterward expect the entry in `installed`, with `installed: true` and `enabled: true`. Inspect the returned `installedPath`; the helper checks that it is inside this temporary `codex-home`. Do not hardcode a cache version or expect every client to use the same cache layout.

Installing a package proves neither that its MCP server started in a conversation nor that its hooks were trusted. Those are separate observations below. On the tested Windows CLI, a temporary home prints a warning that helper PATH aliases are not created there. With an exit-zero lifecycle command and a correct receipt, that warning is not an installation failure. Do not weaken the temporary-directory protection to hide it.

## 3. App-first runtime track

For a real conversation, use a disposable Git project that you intentionally open in the ChatGPT desktop app. The IDE extension does not support plugins. The CLI lifecycle helper above does not install into the running desktop app's usual profile.

1. Inspect `marketplace/` in the generated root. If you elect the app track, initialize **that directory only** as a scratch Git repository, then open it as a project in the app.
2. The repo catalog is already at `.agents/plugins/marketplace.json`. Its name is `howto-practice-local`, and its one package is `workflow-review-practice`.
3. Following the current desktop guide, restart/refresh the app when required, open the Plugins Directory, choose this local source, inspect the package and explicitly install it. This is a learner-selected app installation; do not confuse it with the isolated helper cache.
4. Start a **new chat**. Select the packaged `fixture-review` skill from the available skill picker. Ask it to list the bundled fixtures and review `missing-checks`.
5. Inspect actual tool activity. Expected tool names are `list_fixture_readmes` and `review_fixture_readme`; expected result is one missing-verification finding with evidence. The package has no arbitrary file-path argument and needs no third-party account.
6. Hook review is separate. Inspect the exact SessionStart/PostToolUse definitions and trust them only if you choose to. Installation alone does not trust executable hooks. Observe the actual informational context; no supplied hook claims to block edits.
7. Record the client, version, host, installed package/version, tool discovery/call/result and hook-review state. Mark a stage **not run** if you did not observe it. A CLI metadata receipt cannot fill these rows.
8. In the app, remove only this practice installation through its plugin controls when finished. Do not remove another plugin or marketplace sharing the same real workspace.

An optional repo enable setting, after reviewing a trusted scratch project, is:

```toml
[plugins."workflow-review-practice@howto-practice-local"]
enabled = true
```

Place it only in that scratch project's `.codex/config.toml` if you choose that route. It selects project enablement; it is not proof of discovery, installation, authentication or hook trust. Managed policy can still constrain it. This course has not performed an authenticated app/CLI model session or a live hook-trust action.

## 4. Cleanup the isolated CLI state

```powershell
node labs/workflow-plugin/native-client.cjs remove $pluginPracticeRoot
node labs/workflow-plugin/native-client.cjs available $pluginPracticeRoot
node labs/workflow-plugin/native-client.cjs remove-marketplace $pluginPracticeRoot
node labs/workflow-plugin/native-client.cjs marketplaces $pluginPracticeRoot
```

Expected: the first removal makes the package available but uninstalled; after marketplace removal the generated source is absent. These are real native removals inside the isolated home. The practice files and observation log remain for inspection. No recursive deletion is required. If you installed separately in the app, clean that separate installation through its own controls as described above.

## Troubleshooting

- **CLI cannot launch:** check the existing executable with `--version`; pass its full path using `--codex`. Do not install a runtime merely to silence a command-not-found error.
- **CLI has no plugin subcommand:** your version differs. Use its current official documentation or the supported app track; the offline MCP tests remain useful but are not native activation.
- **Available is empty:** inspect `marketplaces` and the generated catalog's name/path. Do not substitute a global marketplace or private folder.
- **Installed but missing in the app:** the helper's profile is isolated. Follow the explicitly chosen app track rather than copying an owner authentication file into it.
- **The app shows old behavior:** review the source copy, package version and current installed copy. Refresh/reinstall only the scratch plugin and start a new chat as the current guide requires. A source edit does not prove the cache changed.

Sources checked 21 October 2026: [package and local marketplaces](https://developers.openai.com/plugins/build/plugins), [CLI commands](https://learn.chatgpt.com/docs/cli/reference), [plugins and supported surfaces](https://learn.chatgpt.com/docs/plugins), [Codex state locations](https://learn.chatgpt.com/docs/config-file/config-advanced), [hook trust](https://learn.chatgpt.com/docs/hooks).
