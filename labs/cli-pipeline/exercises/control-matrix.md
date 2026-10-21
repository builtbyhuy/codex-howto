# Command families: location, state and evidence

These exact spellings are from the official command reference checked 21 October 2026. Inspect your installed `--help`; availability can differ.

| Where | Example | Effect | Evidence / limitation |
| --- | --- | --- | --- |
| Shell | `codex --version` | Prints local executable version | Does not prove authentication or the model used |
| Shell | `codex login status` | Inspects credential status | Does not prove access to every model or tool; don't share auth files |
| Shell | `codex --cd "./practice" --sandbox read-only` | Starts an interactive client at a chosen directory | Inspect actual directory and available permissions |
| Shell | `codex resume` | Opens saved-session selection | Confirm session and directory; it does not restore files |
| Shell | `codex fork` | Selects a chat to fork | A new transcript is not automatically a separate filesystem |
| Shell | `codex exec resume --last "Check the current README again; do not edit files."` | Continues an exec task from the current directory | --last may select unintended history if run from the wrong directory |
| Shell | `codex review --uncommitted` | Reviews a working diff | Inspect target; findings do not apply fixes or run acceptance checks |
| Composer | `/status` | Shows current session controls/context | Not a terminal executable |
| Composer | `/diff` | Shows current working changes | Not a test runner |
| Composer | `/new` | Starts a fresh chat | Not a Git restore |

## A small real-client comparison

If an existing CLI is available, run `codex resume --help`, `codex fork --help` and `codex review --help` without starting a task. Record the installed version. In a harmless existing practice session, observe its actual directory before choosing resume. Do not use an owner task just to populate this exercise.

In the desktop app use the corresponding saved-chat/project and review controls actually available. The IDE extension keeps work beside the editor. Neither surface requires you to type shell-only codex subcommands into its composer. Keep a screenshot or note of actual observation; this answer key is not that observation.
