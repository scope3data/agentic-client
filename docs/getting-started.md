# Getting Started with the Scope3 SDK

The `scope3` npm package provides a TypeScript/JavaScript client for the Scope3 Agentic Platform. It provides two clients -- `Scope3Client` for REST consumers and `Scope3McpClient` for AI agents using MCP -- and organizes functionality around two personas: buyer and storefront.

## Installation

```bash
npm install scope3
```

## Getting Your API Key

You need an API key to authenticate with the Scope3 platform.

- **Production**: Go to [https://agentic.scope3.com](https://agentic.scope3.com), click **Manage API Keys**, and create a new key.
- **Staging**: Go to [https://agentic.staging.scope3.com](https://agentic.staging.scope3.com), click **Manage API Keys**, and create a new key.

Store your API key securely. You will pass it to the client at initialization.

## Choose Your Persona

The SDK requires a persona to determine which API surface is available. There are two personas:

| Persona    | Use Case                                                                                      |
|------------|-----------------------------------------------------------------------------------------------|
| `buyer`       | Programmatic advertising -- manage advertisers, campaigns, bundles, and inventory discovery.   |
| `storefront`  | Storefronts -- manage your storefront, inventory sources, agents, billing, and readiness.      |

Resources are scoped by persona. Attempting to access a resource outside of your chosen persona will throw an error at runtime.

## Initialize the Client

```typescript
import { Scope3Client } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'buyer', // or 'storefront'
});
```

## Configuration Options

### Scope3Client (REST)

```typescript
interface Scope3ClientConfig {
  /** API key (Bearer token) for authentication. Required. */
  apiKey: string;

  /** API persona -- buyer or storefront. Required. */
  persona: 'buyer' | 'storefront';

  /** API version to use. Default: 'v2'. */
  version?: 'v1' | 'v2' | 'latest';

  /** Environment. Default: 'production'. */
  environment?: 'production' | 'staging';

  /** Custom base URL. Overrides the environment setting. */
  baseUrl?: string;

  /** Request timeout in milliseconds. Default: 30000. */
  timeout?: number;

  /** Enable debug logging. Default: false. */
  debug?: boolean;
}
```

### Scope3McpClient (AI Agents)

For AI agents using MCP, use `Scope3McpClient` instead. It connects to the MCP server and gives you direct access to `callTool()`, `readResource()`, and `listTools()`.

```typescript
import { Scope3McpClient } from 'scope3';

const mcp = new Scope3McpClient({
  apiKey: process.env.SCOPE3_API_KEY!,
  // environment?: 'production' | 'staging'
  // baseUrl?: string
  // debug?: boolean
});
await mcp.connect();

const result = await mcp.callTool('api_call', {
  method: 'GET',
  path: '/api/v2/buyer/advertisers',
});
```

## Environment Setup

The SDK targets two environments:

| Environment   | Base URL                                    |
|---------------|---------------------------------------------|
| `production`  | `https://api.agentic.scope3.com`            |
| `staging`     | `https://api.agentic.staging.scope3.com`    |

Production is the default. To use staging, either pass `environment: 'staging'` in the config or set environment variables:

```bash
export SCOPE3_API_KEY=your_api_key_here
export SCOPE3_ENVIRONMENT=staging
```

Then in your code:

```typescript
const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'buyer',
  environment: (process.env.SCOPE3_ENVIRONMENT as 'production' | 'staging') ?? 'production',
});
```

## Your First Request

### Buyer persona

```typescript
import { Scope3Client } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'buyer',
});

// List advertisers
const advertisers = await client.advertisers.list();
console.log('Advertisers:', advertisers);

// Create a bundle for inventory discovery
const bundle = await client.bundles.create({
  advertiserId: 'adv_123',
  channels: ['display'],
});
console.log('Bundle:', bundle);
```

### Storefront persona

```typescript
import { Scope3Client } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'storefront',
});

// Get your storefront
const sf = await client.storefront.get();
console.log('Storefront:', sf);

// List inventory sources
const sources = await client.inventorySources.list();
console.log('Sources:', sources);
```

## Error Handling

The SDK exports a `Scope3ApiError` class for structured error handling. It includes the HTTP status code, a message, and optional details.

```typescript
import { Scope3Client, Scope3ApiError } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'buyer',
});

try {
  const result = await client.advertisers.get('invalid-id');
} catch (error) {
  if (error instanceof Scope3ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`);
    if (error.details) {
      console.error('Details:', error.details);
    }
  } else {
    throw error;
  }
}
```

## Next Steps

- [Buyer Guide](./buyer-guide.md) -- Full buyer workflow: advertisers, campaigns, bundles, and inventory discovery.
- [Storefront Guide](./storefront-guide.md) -- Storefront management, inventory sources, billing, and readiness.
- [CLI Reference](./cli-reference.md) -- Command-line interface usage.
