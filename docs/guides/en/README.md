# Start using Codex: a practical guide

**Language scope:** this getting-started guide is available in five languages. The 60 detailed lessons, executable practice files, source previews and knowledge checks remain in English. Choosing a guide language does not translate the entire course.

Guide updated **22 October 2026**. Product documentation checked **21 October 2026**; availability may depend on client version, operating system, account and organization policy.

[English](../en/README.md) · [Tiếng Việt](../vi/README.md) · [中文](../zh/README.md) · [日本語](../ja/README.md) · [Українська](../uk/README.md)

## 1. Start with a project you can inspect

Codex is a coding agent: it can read project files, propose edits and use available tools. Start in the desktop app, where projects, chats and previews share a workspace. Follow the [official app instructions](https://learn.chatgpt.com/docs/app) for installation and sign-in; if it is already installed, inspect the existing installation first. Select Codex and open a harmless practice folder. Successful sign-in does not prove that the right folder is open.

Open [lesson 1](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s01-01) and download [Orbit Notes](https://codex-howto.hokhachuy1234.chatgpt.site/labs/project-workflow.zip). Extract the ZIP. It preserves `labs/project-workflow/` beneath the extraction root. In that lab folder, run:

```text
node create-workspace.cjs
```

This requires an existing Node.js 20+ runtime and returns a fresh temporary folder. Open that exact folder in Codex. If Node is unavailable, copy `starter/` with your file browser and record that code checks have not run. Keep personal documents outside the exercise.

## 2. Ask for evidence before edits

Send this first message after opening the returned folder:

```text
Read only: confirm the actual working directory. Read README.md, AGENTS.md and notes.json. Report the project purpose, the four note IDs and whether a deployment URL is documented. Inspect whether package.json exists before accepting the README test instruction. Do not edit or install anything.
```

Compare the answer with the files yourself. The fictional note IDs are `n1`, `n2`, `n3` and `n4`. No deployment URL is documented. The starter README suggests `npm test`, but there is no `package.json`; this is a planted unsupported instruction. A grounded answer identifies the mismatch instead of inventing a website address or installing dependencies to disguise it. `AGENTS.md` is a file of project instructions; it is not a guarantee that every client discovered or followed it.

## 3. Repair one bug and check the result

In your disposable copy, record the baseline:

```text
node --test checks.cjs
node cli.cjs REVIEW
```

Expect **4 checks passing and 2 failing**. Search should match substrings regardless of case or surrounding query spaces. Ask Codex to fix `notes.cjs`, preserve the original note objects and their order, and correct README.md to use the actual test command. Preserve `notes.json`, `checks.cjs` and `WORK-NOTE.md`. Then rerun:

```text
node --test checks.cjs
node cli.cjs "  REVIEW  "
```

The target is **6 passing checks**, with `n1: Review launch checklist` and `n3: Review documentation`. Open the changed files yourself. A confident final message is not a test result. If tests fail, give Codex the exact output and ask for the smallest relevant correction. Do not delete failing checks or replace the whole project with the reference solution. The lab includes a complete solution and rubric to consult after your attempt.

Next, retain a useful README paragraph while undoing only a rejected heading change. This teaches narrow recovery. Starting another chat does not restore files. If Git is installed, the lab's optional Git exercise shows an index baseline and an inspectable diff; its separate commit demonstration explains durable history. An index snapshot and a commit are different checkpoints.

## 4. Follow the ten-module path

The course contains **60 lessons**, grouped in this order. A skill is a reusable instruction package; MCP is a protocol for connecting tools and data; a subagent handles a delegated task; a hook reacts to a supported event; a plugin distributes related capabilities together. Later lessons explain their separate setup and availability.

| Stage | Modules and lesson counts |
| --- | --- |
| Beginner | [Commands and first session](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s01-01) — 6; [Project guidance and memory](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s02-01) — 5; [Recovery and Git](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s08-01) — 5; [CLI](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s10-01) — 5 |
| Intermediate | [Skills](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s03-01) — 6; [Hooks](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s06-01) — 7; [MCP](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s05-01) — 6; [Subagents](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s04-01) — 7 |
| Advanced | [Advanced features](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s09-01) — 7; [Plugins](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s07-01) — 6 |

Each lesson has a goal, explanation, example, exercise, expected evidence, reference answer and knowledge check. Attempt the exercise before opening its answer. Any displayed learning time is an estimate, not a promise of mastery.

## 5. Understand what the seven labs prove

[Practice labs](https://codex-howto.hokhachuy1234.chatgpt.site/#labs) offer seven separate downloads. `project-workflow` covers the first project and recovery; `cli-pipeline` validates subprocess events and extracted reports; `skill-workflow` provides a reusable review skill and deterministic helper; `mcp-workbench` exchanges real local JSON-RPC messages; `delegation-capstone` integrates two work packages; `hook-policy` replays guarded events and checks artifact evidence; `workflow-plugin` combines a skill, tools and connection artifacts.

Local programs really execute, but fictional data, synthetic events and simulated delegation are labeled. A helper passing its tests does not prove Codex invoked a skill, chose an MCP tool, spawned agents or activated a hook. Optional native tracks explain these separate observations. Read each package README, use fresh copies, and distinguish expected red learner starters from passing reference checks.

## 6. Use the correct client instructions

The **app** uses projects, chats and review panels. The **CLI** is a separate terminal client: its current directory and command flags matter. The **IDE extension** works inside an editor workspace: confirm the workspace root and follow its controls. Do not paste a CLI command into app chat and assume it operates the app. Inspect the installed client's actual menus and supported features, and use the lesson's client-specific instructions. Never paste API keys or confidential material into practice prompts. See [CLI documentation](https://learn.chatgpt.com/docs/codex/cli), [authentication](https://learn.chatgpt.com/docs/auth) and [execution permissions](https://learn.chatgpt.com/docs/agent-approvals-security).

## 7. Save progress or run the website locally

The website needs no learner account. Opening a lesson records progress; mark it complete after checking the work. Progress and quiz choices stay in that browser and origin, so a local preview and the public website have separate records. Export a progress backup from Source library before switching devices or clearing browser data; import it on the destination. Private browsing or blocked storage may prevent persistence. The website never executes your terminal examples.

With Git and Node.js 20+ already installed:

```text
git clone https://github.com/builtbyhuy/codex-howto.git
cd codex-howto
node scripts/server.cjs
```

Open `http://127.0.0.1:4173/`, keep the terminal running, and stop it with Ctrl+C. No package installation or framework build is needed. Use the server rather than double-clicking index.html. JavaScript is required for the interactive reader.

## Sources, feedback and reuse

This independent community guide is not affiliated with OpenAI, Anthropic or the original reference author. It offers no certification. The curriculum adapts the learning organization of [Claude How-To](https://luongnv.com/claude-howto/), while Codex instructions are rewritten from verified capabilities. The [source repository](https://github.com/builtbyhuy/codex-howto) contains provenance and [third-party notices](https://github.com/builtbyhuy/codex-howto/blob/main/THIRD-PARTY-NOTICES.md). The original [MIT notice](https://github.com/builtbyhuy/codex-howto/blob/main/assets/licenses/claude-howto-MIT.txt) and the separate font, icon, Mermaid and schema licenses are retained. Public access does not grant a new blanket license over original course content.

For a problem, report the lesson ID, client/version and a sanitized symptom through [GitHub Issues](https://github.com/builtbyhuy/codex-howto/issues/new). Remove secrets and personal paths. Check the linked official documentation when your installed product differs; the course's verification date describes its evidence, not a guarantee about future releases.
