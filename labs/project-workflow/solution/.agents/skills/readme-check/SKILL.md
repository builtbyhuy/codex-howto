---
name: readme-check
description: Review a practice README against source files for missing or unsupported setup and verification claims. Do not use for code changes or visual design.
---

Read the named README and relevant project files.
Return a table with Claim, Evidence, Finding, and Suggested correction.
Distinguish an absent instruction from a present but untested command.
Do not edit files, install dependencies or contact services.
For the Orbit Notes starter, inspect whether package.json exists before accepting npm test.
