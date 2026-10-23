# Release a plugin through the right channel

Checked October 21, 2026 against [packaging](https://developers.openai.com/plugins/build/plugins) and [submission](https://developers.openai.com/plugins/deploy/submission). This lab is an original fictional local package. It is not an approved public plugin and does not contain real publisher identity, support, or privacy URLs.

## 1. Ship a tested repo marketplace version

Finish the `missing-both` exercise in a generated workspace, or inspect the complete reference after your attempt. Run its baseline suite and the protocol-level extension grader. Verify package and server both report `0.3.0`. Review the changed files, license, support instructions, required Node version, tool inputs, and uninstall procedure. Include `.agents/plugins/marketplace.json` at the marketplace repository root and `plugins/workflow-review-practice/` at the exact path its catalog names.

The native lifecycle guide tests installation from a local marketplace using an isolated child-only profile. It has been run with Codex CLI `0.163.0-alpha.11` on Windows: starter `0.2.0` and reference `0.3.0` installed, listed as enabled, and removed successfully. This establishes native catalog/cache metadata behavior, not that an authenticated chat chose the skill or trusted the hooks.

To distribute through a Git repository you maintain, use your normal code review and repository release process. Commit the complete marketplace and tag the tested revision. The following is a **publisher recipe** with an intentionally illustrative repository name; replace it with your real repository, and publish only the reviewed files you intend to share:

```text
git status --short
git diff --check
git add .agents/plugins/marketplace.json plugins/workflow-review-practice
git commit -m "Release workflow review practice 0.3.0"
git tag v0.3.0
git push origin HEAD
git push origin v0.3.0
```

Git commits require your existing Git identity. The course does not configure it, push a repository, or create a tag in the owner's checkout. A local tag alone is not distribution. Verify the remote tag resolves to the tested commit before providing the consumer command:

```text
codex plugin marketplace add https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git --ref v0.3.0
codex plugin marketplace list --json
codex plugin list --marketplace howto-practice-local --available --json
codex plugin add workflow-review-practice@howto-practice-local --json
codex plugin list --marketplace howto-practice-local --json
```

The Git URL is a template, not a working course service. Inspect the actual marketplace name/root, package version, and returned installed path. Test the installed skill/tool in a new supported chat as described in NATIVE-CLIENT.md. CLI flag availability varies by version; inspect `codex plugin --help` before copying into an older installation. The IDE extension does not currently support plugins.

## 2. Update, rollback, and uninstall

For a tracked Git source, `codex plugin marketplace upgrade howto-practice-local` refreshes the source. A source pinned to a tag remains on that tag; do not promise that refresh silently follows a different release. To move to another ref, remove the practice installation/source and add the desired ref explicitly. A rollback uses the same sequence with a known-good old tag, then verifies the actual installed version and repeats the acceptance case.

```text
codex plugin remove workflow-review-practice@howto-practice-local --json
codex plugin marketplace remove howto-practice-local --json
```

Use the exact names you inspected. Do not remove a marketplace shared by other plugins without reviewing those dependencies. In the app, disabling a plugin stops its use while uninstalling removes the installation; the trusted project's `.codex/config.toml` can set `[plugins."workflow-review-practice@howto-practice-local"] enabled = false` to disable it for that project. Hook trust remains a separate reviewed definition, and changing a definition requires new trust. Keep a release note with actual install/smoke/removal results rather than an untested “ready” flag.

## 3. Workspace publishing is a different path

A workspace admin can open ChatGPT Plugins > Personal, open the local plugin's menu, select Publish, and choose workspace roles. This shares within that workspace; it is not a public-directory listing. Managed policy can disable workspace publishing. Inspect the resulting visibility from an eligible workspace member account before claiming distribution to that group. This step has not been run for the fictional lab.

## 4. Public directory submission

The public portal has separate eligibility and review. The current submission documentation rejects packages containing lifecycle hooks or app-reference files. This lab bundles hooks and local execution, so it cannot be uploaded unchanged. Removing a file without updating the manifest, setup instructions, behavior and tests does not produce an equivalent package. Consult the current desktop-only submission route for a local-MCP variant; remote MCP uses a stable public HTTPS endpoint and the portal's MCP setup.

For an eligible package: establish the publisher identity and required role, upload a complete ZIP in the Plugins dashboard, resolve metadata/MCP/skill findings, supply the required review evidence, submit for review, then choose **Publish plugin** on the approved version. Approval and publication are distinct states. Metadata/skills changes require a new package upload; hosted MCP changes have their own scan process. Use real privacy/support URLs and required assets; do not upload the fictional placeholders from a tutorial.

Success is visible installation and an evidence-backed workflow for the intended consumer, with a tested rollback/uninstall path. A JSON validator, local README checklist, ZIP file, or approval draft is not that result.
