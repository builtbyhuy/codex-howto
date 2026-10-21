# Replace an obsolete reverse-MCP integration with an actual protocol client

Checked **21 October 2026**: [MCP server removal](https://learn.chatgpt.com/docs/mcp-server) says `codex mcp-server` and `codex-mcp-server` were removed. [App-server](https://learn.chatgpt.com/docs/app-server) documents a different bidirectional JSON-RPC protocol and marks its command experimental, unsupported for production. This is an educational migration, not a production recommendation or proof of host compatibility.

## Choose the interface for the job

| Required outcome | Appropriate starting point |
| --- | --- |
| Codex reads another system's tools | External MCP connection, as in `server.cjs` and `native-client.md` |
| One bounded repository task | `codex exec` with checked output/process state; see the CLI pipeline lessons |
| A custom conversational client needs threads, turns, approvals and events | App-server protocol, after reviewing the installed version and experimental support |

The old `legacy-launch.json` has the third direction but only needs a README summary. `audit-integration.cjs` identifies the obsolete command; it does not implement a migration. `app-server-client.cjs` now provides a complete minimal client for the conversational path, while the bounded CLI route can be simpler.

## Run the complete client without running Codex

```text
node app-server-client.cjs --fixture complete
node app-server-client.cjs --fixture failed
node app-server-client.cjs --fixture approval
node app-server-client.cjs --fixture empty
node app-server-client.cjs --fixture wrong-turn
node app-server-client.cjs --fixture trailing-malformed
node app-server-client.cjs --fixture trailing-exit
node --test app-server.test.cjs
```

The client launches a real Node subprocess and exchanges JSONL messages with `app-server-fixture.cjs`. That process is explicitly **not Codex**. The complete case returns `kind: protocol-fixture`, `nativeCodexExecuted:false`, completed status and a fixture-labeled message. Failure, requested file approval and an empty completed turn exit unsuccessfully; passing status alone is insufficient. The fixture does not fabricate native execution, authorization or model output.

The core sequence is:

```json
{"id":1,"method":"initialize","params":{"clientInfo":{"name":"codex_howto_teaching_client","version":"1.0.0"}}}
{"method":"initialized","params":{}}
{"id":2,"method":"thread/start","params":{"cwd":"/your/reviewed/scratch-project","sandbox":"read-only","approvalPolicy":"never"}}
{"id":3,"method":"turn/start","params":{"threadId":"the-returned-thread-id","input":[{"type":"text","text":"Read README.md and summarize its purpose. Do not change files."}]}}
```

The literal sample paths/IDs explain the wire; the program uses its selected real directory and returned thread/turn IDs. App-server wire messages omit MCP's `jsonrpc` header. MCP's `notifications/initialized` is also different from app-server's `initialized`. Do not reuse the MCP workbench client unchanged.

### Native protocol check, without a model turn

On 21 October 2026 the author ran the installed **codex-cli 0.163.0-alpha.11** with a separate temporary configuration home, generated its JSON Schema successfully, and first completed `initialize` followed by `initialized`. No thread or turn was started, credentials were not supplied, and the owner's configuration was not used or changed. This checks native process/handshake behavior, not authenticated generation. The separate local MCP inventory check is described in native-client.md; it also starts no thread or turn.

The generated `ThreadStartParams` schema uses the **SandboxMode string `read-only`**. The returned **SandboxPolicy object** uses `{"type":"readOnly"}`. These are different shapes. The public guide's illustrative thread example uses another spelling; for this version the installed generated schema is authoritative, and this client was corrected to `read-only`. The fixture also carries required item timestamps/turn IDs and turn `items` arrays. Generate and review your installed schema before reusing the recipe on a different version; the account-backed turn remains an explicitly unrun stage.

The client waits for the returned turn's `turn/completed` event **and** completed agent-message text matching both the requested thread and returned `turnId`. An earlier turn's text cannot satisfy an empty current turn. Completion is only a candidate until stdout is drained and transport teardown is checked: malformed trailing data or a natural nonzero process exit invalidates success. The receipt's `process.terminatedByClient` distinguishes a persistent server deliberately terminated after the result from a natural process failure; `stdoutDrained` confirms closure was observed. Eight named tests include those failures, invalid JSON message structure, and intentional teardown. Independent counterexamples also reproduce the three former false-success cases and now reject them.

The client also rejects failed/interrupted status, missing IDs and timeout. It declines command/file-change approval requests. Unsupported server requests receive an explicit protocol error instead of an invented grant. This minimal client does not provide a general approval UI, authentication manager, every server-request type, reconnect/resume, or production fault tolerance.

## Optional actual-client stage

This stage starts the installed Codex process, can consume account usage, and can create native conversation history. It is not performed by the offline lab or author. Use only a deliberately chosen scratch repository and the account/environment where you intend to test.

1. Inspect the installed `codex app-server --help`. Generate its matching schema with `codex app-server generate-json-schema --out ./schemas` in the scratch project, then check the fields used by this client.
2. Confirm the actual Codex executable and scratch directory paths. On Windows, use the executable binary rather than assuming a shell's `.ps1`/`.cmd` launcher works with `spawn` and `shell:false`. Keep the ordinary login/setup procedure separate; this program does not create credentials.
3. Deliberately run `node app-server-client.cjs --native ABSOLUTE_CODEX_EXECUTABLE ABSOLUTE_SCRATCH_PROJECT`, substituting the reviewed paths. It requests a read-only thread and declines approval requests; your host's managed policy still applies.
4. Inspect the actual output, thread/turn result and scratch files. Native output is labeled `native-attempt`; only a completed checked conversation returns a receipt. If schema, account, launch or policy prevents the run, record that boundary rather than reporting fixture success as native compatibility.

For an outcome requiring MCP specifically, this app-server client is not an MCP adapter. It demonstrates a protocol migration whose suitability must be judged separately.
