# Scope3 Agentic Client

TypeScript client for the Scope3 Agentic API with AdCP webhook support.

## Features

- 🚀 Full TypeScript support with generated types from OpenAPI schema
- 📦 Complete API coverage for all Scope3 MCP tools
- 🔐 Bearer token authentication
- 🔌 Official MCP SDK (`@modelcontextprotocol/sdk`) with HTTP streaming transport
- 🪝 Optional webhook server for AdCP events
- ✨ Clean, intuitive API design
- 🧪 Comprehensive test coverage
- 💻 **CLI tool** for all API resources (80+ commands)

**Architecture:** This client uses the official `@modelcontextprotocol/sdk` to connect to the Scope3 MCP server at `https://api.agentic.scope3.com/mcp` via Streamable HTTP transport. This uses HTTP POST for sending messages and HTTP GET with Server-Sent Events for receiving messages, providing reliable bidirectional communication with automatic reconnection support.

## Installation

```bash
npm install scope3
```

## Quick Start

The SDK provides two separate clients for different use cases:

### PlatformClient (for Brand Advertisers/Buyers)

Use this client if you're a brand advertiser managing campaigns, creatives, and discovering media products.

```typescript
import { PlatformClient } from 'scope3';

const platform = new PlatformClient({
  apiKey: process.env.SCOPE3_API_KEY,
  environment: 'production', // or 'staging'
});

// List brand agents
const brandAgents = await platform.brandAgents.list();

// Create a campaign
const campaign = await platform.campaigns.create({
  prompt: 'Create a video campaign targeting tech enthusiasts',
  brandAgentId: '123',
});

// Discover media products
const products = await platform.mediaProducts.discover({
  channels: ['DIGITAL-DISPLAY'],
  budget: { min: 10000, max: 50000 },
});
```

### PartnerClient (for DSPs/Publishers/Sales Agents)

Use this client if you're a media partner managing tactics, media buys, and products.

```typescript
import { PartnerClient } from 'scope3';

const partner = new PartnerClient({
  apiKey: process.env.SCOPE3_API_KEY,
  environment: 'production', // or 'staging'
});

// Register a sales agent
const agent = await partner.agents.register({
  name: 'My DSP',
  type: 'SALES',
  endpointUrl: 'https://my-dsp.com/mcp',
});

// Create a media buy
const mediaBuy = await partner.mediaBuys.create({
  tacticId: 'tactic_123',
  name: 'Q1 Campaign Buy',
  budget: { amount: 100000, currency: 'USD' },
});

// Execute media buy
await partner.mediaBuys.execute({ mediaBuyId: mediaBuy.id });
```

## CLI Usage

The CLI dynamically discovers available commands from the API server, ensuring it's always up-to-date.

### Quick Start

```bash
# Use with npx (no install needed)
npx scope3 --help

# Or install globally
npm install -g scope3
scope3 --help

# Configure authentication
scope3 config set apiKey your_api_key_here

# Configure environment (optional - defaults to production)
scope3 config set environment staging

# Or use environment variables
export SCOPE3_API_KEY=your_api_key_here
export SCOPE3_ENVIRONMENT=staging  # or 'production'

# Or use command-line flags
scope3 --environment staging list-tools

# Discover available commands (80+ auto-generated)
scope3 list-tools

# Examples
scope3 brand-agent list
scope3 campaign create --prompt "Q1 2024 Spring Campaign" --brandAgentId 123
scope3 media-buy execute --mediaBuyId "buy_123"

# Switch environments on the fly
scope3 --environment production campaign list
scope3 --environment staging campaign list
```

**Dynamic Updates:** Commands automatically stay in sync with API changes. No manual updates needed!

## SDK Configuration

Both `PlatformClient` and `PartnerClient` accept the same configuration options:

```typescript
const client = new PlatformClient({
  apiKey: 'your-api-key',

  // Option 1: Use environment (recommended)
  environment: 'production', // 'production' or 'staging' (default: 'production')

  // Option 2: Use custom base URL (overrides environment)
  baseUrl: 'https://custom-api.example.com',

  // Optional settings
  timeout: 30000, // request timeout in ms
  debug: false, // enable debug logging
});
```

### Environment URLs

- **Production**: `https://api.agentic.scope3.com`
- **Staging**: `https://api.agentic.staging.scope3.com`

## API Resources

### PlatformClient Resources

```typescript
// Assets
await platform.assets.upload({ brandAgentId, assets: [...] });
await platform.assets.list({ brandAgentId });

// Brand Agents
await platform.brandAgents.list();
await platform.brandAgents.create({ name: 'My Brand' });
await platform.brandAgents.get({ brandAgentId });
await platform.brandAgents.update({ brandAgentId, name: 'Updated Name' });
await platform.brandAgents.delete({ brandAgentId });

// Campaigns
await platform.campaigns.list({ status: 'ACTIVE' });
await platform.campaigns.create({ prompt: '...', budget: {...} });
await platform.campaigns.update({ campaignId, status: 'PAUSED' });
await platform.campaigns.getSummary({ campaignId });
await platform.campaigns.listTactics({ campaignId });
await platform.campaigns.delete({ campaignId });

// Creatives
await platform.creatives.list({ brandAgentId });
await platform.creatives.create({ brandAgentId, name: '...' });
await platform.creatives.assign({ creativeId, campaignId });

// Tactics
await platform.tactics.list({ campaignId });
await platform.tactics.create({ name: '...', campaignId });
await platform.tactics.update({ tacticId, channelCodes: ['DIGITAL-AUDIO'] });

// Other Resources
// - platform.brandStandards - Brand safety standards
// - platform.brandStories - AI-powered audience definitions
// - platform.channels - Advertising channels
// - platform.mediaProducts - Media product discovery
// - platform.targeting - Geographic and demographic targeting
```

### PartnerClient Resources

```typescript
// Media Buys
await partner.mediaBuys.list({ tacticId });
await partner.mediaBuys.create({
  tacticId,
  name: '...',
  products: [{ mediaProductId, salesAgentId }],
  budget: { amount: 1000000 },
});
await partner.mediaBuys.execute({ mediaBuyId });

// Agents (Sales & Outcome)
await partner.agents.list();
await partner.agents.list({ type: 'SALES' });
await partner.agents.register({
  type: 'SALES',
  name: '...',
  endpointUrl: '...',
  protocol: 'MCP',
  authenticationType: 'API_KEY',
});
await partner.agents.get({ agentId: '...' });
await partner.agents.update({ agentId: '...', name: 'Updated Name' });
await partner.agents.unregister({ agentId: '...' });

// Other Resources
// - partner.products - Media product management
// - partner.webhooks - Webhook configuration
```

## Webhook Server

The client includes an optional webhook server for handling AdCP events:

```typescript
import { WebhookServer } from '@scope3/agentic-client';

const webhookServer = new WebhookServer({
  port: 3000,
  path: '/webhooks',
  secret: process.env.WEBHOOK_SECRET, // optional
});

// Register event handlers
webhookServer.on('campaign.created', async (event) => {
  console.log('Campaign created:', event.data);
});

webhookServer.on('media_buy.executed', async (event) => {
  console.log('Media buy executed:', event.data);
});

// Catch all events
webhookServer.on('*', async (event) => {
  console.log('Event received:', event.type);
});

// Start the server
await webhookServer.start();
console.log(`Webhook server running at ${webhookServer.getUrl()}`);

// Stop the server
await webhookServer.stop();
```

## Development

```bash
# Install dependencies
npm install

# Update schemas from upstream (downloads latest OpenAPI spec)
npm run update-schemas

# Type check without building
npm run type-check

# Build the project (includes type checking)
npm run build

# Run tests (includes pre-test type checking)
npm test

# Run linter
npm run lint

# Format code
npm run format

# Generate types from local OpenAPI spec
npm run generate-types
```

### Type Safety

This client is **fully typed** with no `any` types:

- **Generated types** from OpenAPI spec using `openapi-typescript`
- **Strict TypeScript** configuration enabled
- **Pre-commit hooks** via Husky that run:
  - Type checking (`tsc --noEmit`)
  - Linting with auto-fix
  - Code formatting
- **CI validation** on every PR:
  - Type checking
  - Linting
  - Format checking
  - Test execution
  - Build verification

To update types when the upstream API changes:
```bash
npm run update-schemas
```

This downloads the latest OpenAPI spec and regenerates TypeScript types.

## Contributing

### Versioning and Releases

This project uses [Changesets](https://github.com/changesets/changesets) for version management and automated NPM publishing.

#### Creating a Changeset

When making changes that should be released, add a changeset:

```bash
npm run changeset
```

Follow the prompts to:
1. Select the type of change (major, minor, patch)
2. Describe the changes for the changelog

The changeset file will be committed with your PR.

#### Release Process

When a PR with changesets is merged to `main`:
1. The Release workflow creates a "Version Packages" PR
2. This PR updates package versions and generates changelogs
3. When the Version PR is merged, packages are automatically published to NPM

**NPM Publishing:** Packages are published as `@scope3/agentic-client` with public access.

#### CI Requirements

Every PR to `main` must include a changeset. The CI will fail if no changeset is detected.

To bypass this check (for docs/config changes), create an empty changeset:
```bash
npm run changeset
# Select "patch" and leave the description empty
```

## Examples

See the `examples/` directory for more usage examples:
- `basic-usage.ts` - Basic API usage
- `create-campaign.ts` - Campaign creation workflow
- `webhook-server.ts` - Webhook server setup

## License

MIT
