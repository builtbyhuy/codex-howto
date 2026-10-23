# A tool request with a checkable fallback

Use `ticket.json` as explicitly fictional local data. It is not an MCP server response.

## App-first exercise

Ask Codex: “Read exercises/ticket.json in this lab. Report ID, title, status and source. Label it a local fictional record. Do not present a live lookup as completed.” Expected: DEMO-123 / Normalize note search / Open / local fictional fixture. No live URL exists.

Then ask for DEMO-999. Expected: the supplied fixture does not contain that record. Returning DEMO-123 under the requested ID is a failure.

## Optional already-connected path

Inspect available app tools/plugins, or use `/mcp` inside CLI. If an already authorized read connection can retrieve the requested harmless record, report the returned identifier, title, status, source link and check time. If it cannot, report the unavailable capability and offer the separately labelled local exercise. Do not install a server, authenticate a new account or send a ticket to a service for this lesson.

A failure answer is useful: “No authorized ticket-read connection is available; I did not retrieve DEMO-123. The local fixture says Open, but that is fictional and does not establish a live ticket status.”

Claude's `/mcp__server__prompt` examples are a product-specific dispatch convention. In Codex, discover the tool actually available; a guessed slash name, a connected server and a successfully retrieved record are three different claims.
