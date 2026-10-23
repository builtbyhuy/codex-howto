# MCP workbench: a real local stdio conversation
Node.js 20+, standard library only. Fictional records are stored in data/tasks.json and really read on each call. The offline exercises create no network socket, external data, authentication, registry, Codex registration, or write tool. A separate isolated native discovery check is documented below.
## Run from this folder
```text
node --test workbench.test.cjs
node --test native-setup.test.cjs app-server.test.cjs
node demo.cjs
node demo.cjs --transcript
```
From the course repository, prefix script paths with labs/mcp-workbench/.
Expected: eight tests pass. The demo discovers list_tasks, get_task, read_task_snapshot; searching " README " returns T-101; T-999 returns isError true; the resource contains three records; an unknown method returns -32601; malformed JSON returns -32700. The final ping test proves recovery after errors.

The twelve additional checks exercise concrete host-path generation, process-launch versus initialization errors, resource freshness, and the separate app-server client lifecycle/failures. All three test files give **20** checks. No test launches authenticated Codex, applies host configuration or performs a network request.
## Inspect the wire
demo.cjs launches server.cjs as a real subprocess and exchanges newline-delimited JSON-RPC over stdin/stdout. --transcript prints both directions, including initialize, notifications/initialized, discovery, calls and errors. It does not emulate Codex or ask a model to choose tools.
The server negotiates the listed protocol versions from 2024-11-05 through 2025-11-25. It advertises only tools and resources. No prompts, subscriptions, HTTP transport, pagination, sampling, elicitation, or general protocol certification are claimed. Text tool results maximize compatibility; no structured-output schema is advertised.
## Exercises and worked solution
1. Predict results for README, unknown title, T-102 and T-999. Run the demo and compare actual fixture values.
2. Compare resources/read with read_task_snapshot: both supply the same records through different protocol capabilities. A host determines how resources appear; this is not an @resource shortcut test.
3. In a disposable copy, add a fourth task and rerun a call. Update an intentional row-count expectation if the dataset changes; never hide that change by weakening every assertion.
4. Break only the command path in connection-draft.toml on paper. Diagnose launch versus protocol versus data errors without registering anything.
5. Implement a new read-only status filter only after defining its input schema, success result and invalid-value behavior. Add tests before replacing the reference implementation.
The checked-in server is the worked solution. Read its tools/call branch: invalid IDs produce tool errors, unknown tool names produce protocol errors, and an empty successful search is distinct from both.
## Optional client handoff
connection-draft.toml shows a current Codex stdio shape with placeholders; it is inactive. For a deliberate client exercise, verify the installed Node path, script path, host, effective tool list and real invocation separately. The author verified native launch/handshake/discovery using installed codex-cli 0.163.0-alpha.11 and a new temporary CODEX_HOME only: documented `mcpServerStatus/list` returned this server's three tools and task resource, with `toolsError:null`. No owner configuration changed and no thread, turn or model-selected tool call was started. This is narrower than an app UI or account-backed integration test.
Codex's CLI /mcp inventories configured tools. Protocol resources are not evidence that a particular Codex @mention syntax exists. Do not use codex mcp-server as a reverse bridge: that command was removed.

For a complete setup rather than placeholder paths, run `node prepare-connection.cjs`; it prints inactive TOML using this actual Node executable and server path. [native-client.md](native-client.md) gives app **Settings → MCP servers**, restart, CLI/IDE differences, trusted project configuration, real tool invocation and known-tool filtering checks. `diagnose-launch.cjs` executes distinct missing-executable, missing-script and bad-handshake cases without registering anything.

## A working replacement-protocol example

[app-server-migration.md](app-server-migration.md) and `app-server-client.cjs` supply the different thread/turn/event protocol instead of only identifying an obsolete command. Run `node app-server-client.cjs --fixture complete`, then the `failed`, `approval`, `empty`, `wrong-turn`, `trailing-malformed` and `trailing-exit` cases. The transport is a real subprocess exchange; its endpoint is explicitly a protocol fixture, not Codex. The client checks terminal status plus completed message text from the requested turn, drains stdout and checks natural termination before returning success. It reports deliberate post-result termination separately and declines approval requests. An explicit optional native path is documented with installed-schema/account/support boundaries. It is not an MCP adapter or production integration.
## Troubleshooting
- Server appears silent when launched directly: it is waiting for one JSON request per line; run demo.cjs.
- Unexpected stdout text: remove logging from stdout, use stderr, then repeat transcript checks.
- isError:true: inspect the tool's input and data; it is not an empty result.
- -32602 unknown tool: use tools/list rather than guessing names.
- Timeout: distinguish process launch/path failure from handshake failure; no retry loop fixes a nonexistent executable.
## References and limits
- https://learn.chatgpt.com/docs/extend/mcp
- https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle
- https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
- https://modelcontextprotocol.io/specification/2025-11-25/server/tools
- https://modelcontextprotocol.io/specification/2025-11-25/server/resources
The implementation is original teaching code, with no third-party runtime dependencies. Local harness checks establish the stated subset's observed behavior, not compatibility with every host or a completed Codex integration.


