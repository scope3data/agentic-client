# Scope3 SDK

TypeScript client for the Scope3 Agentic Platform. Two entry points for two audiences:

- **REST consumers** (humans, CLI, programmatic) → `Scope3Client` with typed resource methods
- **MCP consumers** (AI agents) → `Scope3McpClient` — thin connection helper with direct `callTool`/`readResource`

## Installation

```bash
npm install scope3
```

## API Keys

Obtain your API key from the Scope3 dashboard:

- **Production:** [https://agentic.scope3.com](https://agentic.scope3.com) -> Manage API Keys
- **Staging:** [https://agentic.staging.scope3.com](https://agentic.staging.scope3.com) -> Manage API Keys

## Environment URLs

| Environment | URL |
|-------------|-----|
| Production  | `https://api.agentic.scope3.com` |
| Staging     | `https://api.agentic.staging.scope3.com` |

## Quick Start

### REST Client (Humans / CLI / Programmatic)

The `Scope3Client` provides typed resource methods and requires a `persona` parameter.

#### Buyer Persona

```typescript
import { Scope3Client } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'buyer',
});

// List advertisers
const advertisers = await client.advertisers.list();

// Create a bundle for inventory discovery
const bundle = await client.bundles.create({
  advertiserId: 'adv-123',
  channels: ['display', 'video'],
});

// Discover products in the bundle
const products = await client.bundles.discoverProducts(bundle.data.bundleId);

// Add products to the bundle
await client.bundles.products(bundle.data.bundleId).add({
  products: [{ productId: 'prod-1', salesAgentId: 'sa-1', groupId: 'g-1', groupName: 'Group 1' }],
});

// Create and execute a discovery campaign
const campaign = await client.campaigns.createDiscovery({
  advertiserId: 'adv-123',
  bundleId: bundle.data.bundleId,
  name: 'Q1 Campaign',
  flightDates: { startDate: '2025-01-15', endDate: '2025-03-31' },
  budget: { total: 50000, currency: 'USD' },
});
await client.campaigns.execute(campaign.data.id);
```

#### Storefront Persona

```typescript
const sfClient = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'storefront',
});

// Get your storefront
const sf = await sfClient.storefront.get();

// Create an inventory source (registers an agent)
const source = await sfClient.inventorySources.create({
  sourceId: 'my-sales-agent',
  name: 'My Sales Agent',
  executionType: 'agent',
  type: 'SALES',
  endpointUrl: 'https://my-agent.example.com/mcp',
  protocol: 'MCP',
  authenticationType: 'API_KEY',
  auth: { type: 'bearer', token: 'my-api-key' },
});

// Check readiness
const readiness = await sfClient.readiness.check();
```

### MCP Client (AI Agents)

The `Scope3McpClient` is a thin connection helper for AI agents. It wires up auth and the MCP URL, then exposes `callTool()`, `readResource()`, and `listTools()` as direct passthroughs. The MCP server handles routing and validation — no typed resource wrappers needed.

```typescript
import { Scope3McpClient } from 'scope3';

const mcp = new Scope3McpClient({
  apiKey: process.env.SCOPE3_API_KEY!,
});
await mcp.connect();

// Call tools directly — the v2 buyer surface exposes:
// api_call, ask_about_capability, help, health
const result = await mcp.callTool('api_call', {
  method: 'GET',
  path: '/api/v2/buyer/advertisers',
});

// Ask what the API can do
const capabilities = await mcp.callTool('ask_about_capability', {
  question: 'How do I create a campaign?',
});

// List available tools
const tools = await mcp.listTools();

await mcp.disconnect();
```

## Configuration

### Scope3Client (REST)

```typescript
const client = new Scope3Client({
  apiKey: 'your-api-key',       // Required: Bearer token
  persona: 'buyer',              // Required: 'buyer' | 'storefront'
  environment: 'production',     // Optional: 'production' (default) | 'staging'
  baseUrl: 'https://custom.com', // Optional: overrides environment
  timeout: 30000,                // Optional: request timeout in ms
  debug: false,                  // Optional: enable debug logging
});
```

### Scope3McpClient (MCP)

```typescript
const mcp = new Scope3McpClient({
  apiKey: 'your-api-key',       // Required: Bearer token
  environment: 'production',     // Optional: 'production' (default) | 'staging'
  baseUrl: 'https://custom.com', // Optional: overrides environment
  debug: false,                  // Optional: enable debug logging
});
```

## CLI

```bash
# Configure
scope3 config set apiKey your_api_key_here
scope3 config set environment staging

# Use
scope3 advertisers list
scope3 advertisers get adv-123
scope3 campaigns list --format json
scope3 bundles create --advertiser-id adv-123 --channels display,video

# Override persona per-command
scope3 --persona storefront storefront get

# See all commands
scope3 commands
```

## API Resources

### Buyer Resources

- `client.advertisers` -- CRUD and sub-resources (conversionEvents, creativeSets, testCohorts, eventSources, measurementData, catalogs, audiences, syndication, propertyLists)
- `client.campaigns` -- list, get, createDiscovery, updateDiscovery, createPerformance, updatePerformance, createAudience, execute, pause, creatives(campaignId)
- `client.bundles` -- create, discoverProducts, browseProducts, products(bundleId)
- `client.signals` -- Discover signals
- `client.reporting` -- Get reporting metrics
- `client.salesAgents` -- List sales agents, register accounts
- `client.tasks` -- Get task status
- `client.propertyListChecks` -- Run and retrieve property list check reports

### Storefront Resources

- `client.storefront` -- get, create, update, delete
- `client.inventorySources` -- list, get, create, update, delete
- `client.agents` -- list, get, update
- `client.readiness` -- check
- `client.billing` -- get, connect, status, transactions, payouts, onboardingUrl
- `client.notifications` -- list, markAsRead, acknowledge, markAllAsRead

## skill.md Support

```typescript
// Get parsed skill documentation
const skill = await client.getSkill();
console.log(skill.name, skill.version);
console.log(skill.commands); // Available API commands
```

## Webhook Server

A `WebhookServer` class is available for handling AdCP events. See [docs/getting-started.md](docs/getting-started.md) for usage details.

## Development

```bash
npm install
npm run type-check
npm run build
npm test
npm run lint
```

### Updating the SDK When the API Changes

The SDK is manually maintained. When the Agentic API changes, update these files:

| What changed | Files to update |
|---|---|
| Request/response shapes | `src/types/index.ts` |
| Endpoints added/removed | `src/resources/` (the relevant resource class) |
| CLI commands | `src/cli/commands/` (the relevant command file) |
| Bundled skill.md | `src/skill/bundled.ts` (copy from API response) |

**Steps:**

1. Check the latest skill.md for your persona:
   ```bash
   curl https://api.agentic.scope3.com/api/v2/buyer/skill.md
   curl https://api.agentic.scope3.com/api/v2/storefront/skill.md
   ```
2. Compare against `src/skill/bundled.ts` and update if needed
3. Update types in `src/types/index.ts` to match any schema changes
4. Update resource methods in `src/resources/` for endpoint changes
5. Update CLI commands in `src/cli/commands/` if applicable
6. Run `npm test` and `npm run build` to verify
7. Run manual workflow tests: `npm run test:buyer`, `npm run test:storefront`

### Integration Tests

```bash
export SCOPE3_API_KEY=your_key
npm run test:buyer     # Buyer workflow
npm run test:storefront   # Storefront workflow
npm run test:all       # All workflows
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [Buyer Guide](docs/buyer-guide.md)
- [Storefront Guide](docs/storefront-guide.md)
- [CLI Reference](docs/cli-reference.md)

## Contributing

This project uses [Changesets](https://github.com/changesets/changesets) for version management. When making changes that should be released, run `npm run changeset` and follow the prompts to describe your change. The changeset file is committed with your PR.

## License

MIT
