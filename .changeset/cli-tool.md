---
"scope3": minor
---

Add dynamic CLI tool for Scope3 Agentic API with automatic command generation

The CLI now dynamically discovers available API operations from the MCP server, ensuring commands are always up-to-date with the latest API capabilities:

- **Zero maintenance**: Commands auto-generate from MCP server's tool list
- **Always in sync**: CLI automatically reflects API changes without code updates
- **80+ commands**: Covers all resources (agents, campaigns, creatives, tactics, media buys, etc.)
- **Smart caching**: 24-hour tool cache with fallback for offline use
- **Type-safe parameters**: Automatic validation and parsing from server schemas
- **Multiple output formats**: JSON and formatted table views
- **Persistent configuration**: Save API keys and base URLs locally

Usage:
```bash
# Configure once
scope3 config set apiKey YOUR_KEY

# Commands are dynamically discovered
scope3 list-tools  # See all available operations
scope3 brand-agent list
scope3 campaign create --prompt "..." --brandAgentId 123
scope3 media-buy execute --mediaBuyId "buy_123"
```

Benefits over static CLI:
- API adds new endpoint → CLI instantly supports it (after cache refresh)
- API changes parameter → CLI automatically updates validation
- No manual maintenance of command definitions required
