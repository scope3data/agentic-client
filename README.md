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

**Architecture:** This client uses the official `@modelcontextprotocol/sdk` to connect to the Scope3 MCP server at `https://api.agentic.scope3.com/mcp` via Streamable HTTP transport. This uses HTTP POST for sending messages and HTTP GET with Server-Sent Events for receiving messages, providing reliable bidirectional communication with automatic reconnection support.

## Installation

```bash
npm install @scope3/agentic-client
```

## Quick Start

```typescript
import { Scope3AgenticClient } from '@scope3/agentic-client';

const client = new Scope3AgenticClient({
  apiKey: process.env.SCOPE3_API_KEY,
});

// List brand agents
const brandAgents = await client.brandAgents.list();

// Create a campaign
const campaign = await client.campaigns.create({
  prompt: 'Create a video campaign targeting tech enthusiasts',
  budget: {
    amount: 5000000, // $50,000 in cents
    currency: 'USD',
    pacing: 'even',
  },
});
```

## Configuration

```typescript
const client = new Scope3AgenticClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.agentic.scope3.com', // optional, defaults to production
  timeout: 30000, // optional, request timeout in ms
});
```

## API Resources

The client provides access to all Scope3 API resources:

### Assets
```typescript
await client.assets.upload({ brandAgentId, assets: [...] });
await client.assets.list({ brandAgentId });
```

### Brand Agents
```typescript
await client.brandAgents.list();
await client.brandAgents.create({ name: 'My Brand' });
await client.brandAgents.get({ brandAgentId });
await client.brandAgents.update({ brandAgentId, name: 'Updated Name' });
await client.brandAgents.delete({ brandAgentId });
```

### Campaigns
```typescript
await client.campaigns.list({ status: 'ACTIVE' });
await client.campaigns.create({ prompt: '...', budget: {...} });
await client.campaigns.update({ campaignId, status: 'PAUSED' });
await client.campaigns.getSummary({ campaignId });
await client.campaigns.listTactics({ campaignId });
await client.campaigns.delete({ campaignId });
```

### Creatives
```typescript
await client.creatives.list({ brandAgentId });
await client.creatives.create({ brandAgentId, name: '...' });
await client.creatives.assign({ creativeId, campaignId });
```

### Tactics
```typescript
await client.tactics.list({ campaignId });
await client.tactics.create({ name: '...', campaignId });
await client.tactics.update({ tacticId, channelCodes: ['DIGITAL-AUDIO'] });
```

### Media Buys
```typescript
await client.mediaBuys.list({ tacticId });
await client.mediaBuys.create({
  tacticId,
  name: '...',
  products: [{ mediaProductId, salesAgentId }],
  budget: { amount: 1000000 },
});
await client.mediaBuys.execute({ mediaBuyId });
```

### Sales Agents
```typescript
await client.salesAgents.list();
await client.salesAgents.register({
  name: '...',
  endpointUrl: '...',
  protocol: 'A2A',
  authenticationType: 'API_KEY',
});
```

### Other Resources
- `client.brandStandards` - Brand safety standards
- `client.brandStories` - AI-powered audience definitions
- `client.channels` - Advertising channels
- `client.notifications` - System notifications
- `client.products` - Media product management

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

# Build the project
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Generate types from OpenAPI spec
npm run generate-types
```

## Examples

See the `examples/` directory for more usage examples:
- `basic-usage.ts` - Basic API usage
- `create-campaign.ts` - Campaign creation workflow
- `webhook-server.ts` - Webhook server setup

## License

MIT
