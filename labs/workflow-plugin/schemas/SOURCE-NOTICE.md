# Agent Plugins schema source and license notice

This notice applies only to the adjacent `plugin.schema.json` and `mcp.schema.json` files. They are software schemas from the [Agent Plugins specification repository](https://github.com/agentplugins/agent-plugins-spec), pinned to commit `ff8ab5e392cc87bd88d87c060815a87490e51003`:

- [Upstream plugin.schema.json](https://github.com/agentplugins/agent-plugins-spec/blob/ff8ab5e392cc87bd88d87c060815a87490e51003/schemas/1.0.0/plugin.schema.json)
- [Upstream mcp.schema.json](https://github.com/agentplugins/agent-plugins-spec/blob/ff8ab5e392cc87bd88d87c060815a87490e51003/schemas/1.0.0/mcp.schema.json)

The pinned repository's [licensing declaration](https://github.com/agentplugins/agent-plugins-spec/blob/ff8ab5e392cc87bd88d87c060815a87490e51003/LICENSE.md) assigns schemas and other software material to **Apache License 2.0**, while assigning different terms to documentation. The complete, unchanged Apache license is included here as [Apache-2.0.txt](Apache-2.0.txt). This scoped notice does not relicense the schemas under the original Claude source's MIT license or extend their software license to upstream documentation.

## Source restoration on October 21, 2026

The course's earlier snapshots had formatting-only serialization differences from the pinned source. Their parsed JSON values were equal, but calling them byte-unmodified was inaccurate. During the license correction, both files were restored verbatim to the pinned upstream bytes. The distributed schema files now have **no local modifications**, and retain all upstream content:

| File | SHA-256 of exact upstream and local bytes |
| --- | --- |
| `plugin.schema.json` | `0a4aad95ce337878ad38802ebf0daa3fde76abe3f65400c86bcbb1ec0b3ab883` |
| `mcp.schema.json` | `6539175bfcdf43085855183e86da40ea94b166547a72b47ae9a0a390516d3acb` |

The pinned repository's complete, non-truncated Git tree was inspected on October 21, 2026. It contains no `NOTICE`-named file. The two schema sources contain no separate per-file copyright or attribution header to remove or replace. No upstream attribution was deleted; the complete license and project/source identification are retained here.

This source restoration and the added legal notices do not change schema values, validator behavior, lesson content, model settings or account state. The original course code and fictional fixtures remain separately identified in the lab README.
