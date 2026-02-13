---
"scope3": major
---

SDK v2.0.0: Persona-based API architecture

Complete rebuild of the Scope3 SDK with persona-based design for the Agentic Platform v2 API.

**New Features:**
- Unified `Scope3Client` with `persona` parameter: `buyer`, `brand`, or `partner`
- Full CLI with `scope3` command for all API operations
- REST and MCP adapter support
- Chained resource access: `client.advertisers.brand(id).link()`

**CLI Highlights:**
- `scope3 config set apiKey <key>` - persistent configuration
- `scope3 commands` - list all available commands by persona
- Table, JSON, and YAML output formats
- Environment support: production and staging

**Breaking Changes:**
- Removed `Scope3AgenticClient` - use `Scope3Client` with `persona` parameter
- Removed auto-generated types from OpenAPI (now manually maintained)
- New API surface matches Agentic Platform v2

**Migration Guide:**

```typescript
// Before (v1):
import { Scope3AgenticClient } from 'scope3';
const client = new Scope3AgenticClient({ apiKey: '...' });

// After (v2):
import { Scope3Client } from 'scope3';

// For buyers (advertisers, campaigns, bundles):
const buyerClient = new Scope3Client({ apiKey: '...', persona: 'buyer' });

// For brand owners:
const brandClient = new Scope3Client({ apiKey: '...', persona: 'brand' });

// For partners (DSPs, publishers):
const partnerClient = new Scope3Client({ apiKey: '...', persona: 'partner' });
```

**Testing:**
- 225 tests passing
- Verified with real API calls to staging environment
- CLI tested for all major workflows
