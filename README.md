# Scope3 SDK

TypeScript client for the Scope3 Agentic Platform. Supports three personas (buyer, brand, partner) with REST and MCP adapters.

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

The SDK uses a unified `Scope3Client` with a `persona` parameter to determine available resources.

### Buyer Persona

For programmatic advertising -- manage advertisers, bundles, campaigns, and signals.

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

// Create and execute a bundle campaign
const campaign = await client.campaigns.createBundle({
  advertiserId: 'adv-123',
  bundleId: bundle.data.bundleId,
  name: 'Q1 Campaign',
  flightDates: { startDate: '2025-01-15', endDate: '2025-03-31' },
  budget: { total: 50000, currency: 'USD' },
});
await client.campaigns.execute(campaign.data.id);
```

### Brand Persona

For brand identity management -- manage brand manifests and metadata.

```typescript
const brandClient = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'brand',
});

const brands = await brandClient.brands.list();
await brandClient.brands.create({
  manifestUrl: 'https://example.com/brand-manifest.json',
});
```

### Partner Persona

For integration health monitoring.

```typescript
const partnerClient = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'partner',
});

const health = await partnerClient.health.check();
```

## Configuration

```typescript
const client = new Scope3Client({
  apiKey: 'your-api-key',       // Required: Bearer token
  persona: 'buyer',              // Required: 'buyer' | 'brand' | 'partner'
  environment: 'production',     // Optional: 'production' (default) | 'staging'
  baseUrl: 'https://custom.com', // Optional: overrides environment
  adapter: 'rest',               // Optional: 'rest' (default) | 'mcp'
  timeout: 30000,                // Optional: request timeout in ms
  debug: false,                  // Optional: enable debug logging
});
```

## CLI

```bash
# Configure
scope3 config set apiKey your_api_key_here
scope3 config set persona buyer

# Use
scope3 advertisers list
scope3 advertisers get --id adv-123
scope3 campaigns list --format json
scope3 bundles create --advertiserId adv-123 --channels display,video

# Override persona per-command
scope3 --persona brand brands list
scope3 --persona partner health
```

## API Resources

### Buyer Resources

- `client.advertisers` -- CRUD and sub-resources (brand, conversionEvents, creativeSets, testCohorts, reporting, mediaBuys)
- `client.buyerBrands` -- List brands available to the buyer
- `client.campaigns` -- list, get, createBundle, updateBundle, createPerformance, updatePerformance, createAudience, execute, pause
- `client.bundles` -- create, discoverProducts, browseProducts, products(bundleId)
- `client.signals` -- Discover signals

### Brand Resources

- `client.brands` -- list, get, create, update, delete

### Partner Resources

- `client.health` -- Health check

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

## Documentation

- [Getting Started](docs/getting-started.md)
- [Buyer Guide](docs/buyer-guide.md)
- [Brand Guide](docs/brand-guide.md)
- [Partner Guide](docs/partner-guide.md)
- [CLI Reference](docs/cli-reference.md)

## Contributing

This project uses [Changesets](https://github.com/changesets/changesets) for version management. When making changes that should be released, run `npm run changeset` and follow the prompts to describe your change. The changeset file is committed with your PR.

## License

MIT
