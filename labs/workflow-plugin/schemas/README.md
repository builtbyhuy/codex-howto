# Schema snapshots

Retrieved October 21, 2026 from the canonical schema URLs linked by the current OpenAI plugin packaging guide:

- https://agent-plugins.org/schemas/1.0.0/plugin.schema.json
- https://agent-plugins.org/schemas/1.0.0/mcp.schema.json

The two JSON files are Apache-2.0-licensed software from Agent Plugins, pinned to upstream commit `ff8ab5e392cc87bd88d87c060815a87490e51003`. The complete license is included in [Apache-2.0.txt](Apache-2.0.txt), with exact source URLs, hashes and the correction history in [SOURCE-NOTICE.md](SOURCE-NOTICE.md). In the full website/source tree, additional copies are at `assets/licenses/agent-plugins-Apache-2.0.txt` and `THIRD-PARTY-NOTICES.md`; those website-level paths are not part of this standalone lab ZIP.

The earlier snapshots were JSON-equivalent but reformatted. On October 21, 2026 they were restored to the exact pinned upstream bytes, so the distributed JSONs now have no local modifications. The upstream repository has no NOTICE-named file at that commit; no per-file attribution header was removed.

The included dependency-free validator implements the keywords exercised by these two schemas and rejects unknown keywords rather than silently claiming full support. OpenAI-specific extension semantics and runtime path expansion need separate checks; the portable schema intentionally treats extension objects as client-specific. The legal/source restoration does not change those schema values or checks.

Source guide: https://developers.openai.com/plugins/build/plugins
Local stdio example: https://developers.openai.com/plugins/deploy/desktop-only

