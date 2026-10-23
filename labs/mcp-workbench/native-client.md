# Connect this exact lab in a chosen scratch Codex environment

Checked **21 October 2026** against [MCP configuration](https://learn.chatgpt.com/docs/extend/mcp) and [OpenAI Docs MCP](https://developers.openai.com/learn/docs-mcp). The local app, CLI and IDE share MCP configuration for the same Codex host. Cloud Work and a different remote host are separate environments; a local process path does not move to them.

## Prove the local process first

From this lab folder:

```text
node demo.cjs --transcript
node diagnose-launch.cjs missing-executable
node diagnose-launch.cjs missing-script
node diagnose-launch.cjs bad-handshake
node prepare-connection.cjs
```

The first command exchanges real MCP messages. The next three distinguish failure to spawn an executable, a Node process exiting because its script is absent, and protocol error `-32002` before initialization. The last command prints **inactive TOML with the real absolute executable/script paths** on your host. It does not register a server or write a configuration file.

## Codex app track

1. In a practice project, inspect **Settings → MCP servers** for an existing `practice_tasks` entry. Do not create a duplicate.
2. Choose **Add server**, name it `practice_tasks`, and select **STDIO**.
3. Use the `command` value printed by the preparer for the executable and the single `args` value as its script argument. Keep the server script at that extracted path.
4. Save, then select **Restart**. In the composer, `/mcp` shows connected servers in current documented desktop releases.
5. Ask: “Use practice_tasks to look up T-102. Return its exact title, status and minutes from the tool result.” Compare with `data/tasks.json`, then request T-999 and require an explicit missing-record error. Inspect actual tool activity before marking the native stage tested.

The preparer's raw TOML can instead be reviewed and added manually to the scratch project's `.codex/config.toml` **after checking that file's existing contents**. Project settings require a trusted project. Never replace an existing config wholesale with the printed fragment. This server needs no token or network connection.

## CLI and IDE differences

**CLI:** `codex mcp --help` describes the installed version. The documented stdio registration shape is `codex mcp add practice_tasks -- <absolute-node> <absolute-server.cjs>`. Substitute the two resolved paths printed above, quoting paths with spaces in your own shell. This is an actual registration command, so run it only in the environment you intend to configure. Use `codex mcp list`, then `/mcp` in an interactive Codex session and perform the same T-102/T-999 task.

**IDE:** open the Codex gear menu → **MCP servers** → **Add server**, supply the same STDIO details, save and choose **Restart extension**. Confirm the tool call on the same project. A connection visible in one host is not proof that another computer can launch those paths.

## Public HTTP comparison

Print an inactive public-docs fragment with `node prepare-connection.cjs --docs`. For an intentional CLI setup the official command is:

```text
codex mcp add openaiDeveloperDocs --url https://developers.openai.com/mcp
codex mcp list
```

In the app use **Streamable HTTP** and the same URL. The public Docs server is documentation-only; it does not call the OpenAI API for you. A private HTTP connector can require OAuth: use the app's **Authenticate** or the documented `codex mcp login SERVER_NAME` for that configured server. A token-based connector can refer to an environment-variable name with `bearer_token_env_var`; no token value belongs in this lab or a shared project file.

## Configuration versus actual access

The generated allow list presents three tool names. To test host filtering deliberately, add `disabled_tools = ["get_task"]` to that scratch server table, restart, and inspect the resulting tool list. The deny list applies after the allow list. The read-only local harness still advertises all three because it does not interpret Codex configuration. A hidden tool is also not record-level security: `read_task_snapshot` still returns every fixture record.

If launch fails, resolve executable/script paths on the host. If initialization fails, inspect the transcript. For HTTP 401/403, inspect authentication/authorization; for a wrong endpoint, check its URL. A successful lookup with no matches is not the same as `isError:true`. Our local fixture tests exercise launch and MCP boundaries; they do not fabricate an OAuth result, native tool selection, or a hosted connection.

## What was checked natively by the author

On **21 October 2026**, installed `codex-cli 0.163.0-alpha.11` was launched with a **new temporary CODEX_HOME** containing only this lab's reviewed stdio configuration. Through its documented app-server protocol, `initialize`, `initialized`, then `mcpServerStatus/list` with `{serverName:"practice_tasks",detail:"full"}` returned the actual server information, `get_task`, `list_tasks`, `read_task_snapshot` and `practice://taskboard/tasks`, with `toolsError:null`. The server's `authStatus:"unsupported"` means this local server offers no authentication capability; it is not a failed login result.

That check establishes native process startup, MCP handshake and capability discovery for the installed version. It sent no `thread/start` or `turn/start`, used no model call, supplied no account credentials and changed no owner configuration. The app UI flow, model-selected T-102/T-999 reads, filtering UI, OAuth and other hosts remain learner checks. Machine/install metadata from unsolicited native notifications is excluded from the public evidence.
