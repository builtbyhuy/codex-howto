# Source-grounded review answer key

This is a reference answer, not a captured Codex response.

| Claim | Evidence | Finding | Suggested correction |
| --- | --- | --- | --- |
| Orbit Notes is a fictional local notes project | starter/README.md and notes.json | Supported; four sample notes exist | Keep the factual description. |
| npm test verifies the project | No package.json exists; checks.cjs contains Node tests | Unsupported starter instruction | Use node --test checks.cjs. |
| Search ignores case and outer spaces | The brief says so, but notes.cjs compares raw strings | Required behavior is not implemented | Normalize the comparison; keep the supplied checks. |
| A deployment URL exists | No source defines one | Unknown | Do not invent a URL. |

Rubric: name the input, cite the mismatch, propose the smallest correction, distinguish required behavior from observed implementation, and leave unverified facts unknown.
