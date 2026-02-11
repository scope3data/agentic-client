# Getting Started with the Scope3 SDK

The `scope3` npm package provides a TypeScript/JavaScript client for the Scope3 Agentic Platform. It supports REST and MCP (Model Context Protocol) adapters, and organizes functionality around three personas: buyer, brand, and partner.

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

The SDK requires a persona to determine which API surface is available. There are three personas:

| Persona    | Use Case                                                                                      |
|------------|-----------------------------------------------------------------------------------------------|
| `buyer`    | Programmatic advertising -- manage advertisers, campaigns, bundles, and inventory discovery.   |
| `brand`    | Brand identity management -- create and update brands with manifests.                         |
| `partner`  | Integration partners -- health checks and coming-soon features.                               |

Resources are scoped by persona. Attempting to access a resource outside of your chosen persona will throw an error at runtime.

## Initialize the Client

```typescript
import { Scope3Client } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'buyer', // or 'brand' or 'partner'
});
```

## Configuration Options

The full configuration interface:

```typescript
interface Scope3ClientConfig {
  /** API key (Bearer token) for authentication. Required. */
  apiKey: string;

  /** API persona -- buyer, brand, or partner. Required. */
  persona: 'buyer' | 'brand' | 'partner';

  /** API version to use. Default: 'v2'. */
  version?: 'v1' | 'v2' | 'latest';

  /** Environment. Default: 'production'. */
  environment?: 'production' | 'staging';

  /** Custom base URL. Overrides the environment setting. */
  baseUrl?: string;

  /** Adapter type: 'rest' for HTTP, 'mcp' for AI agents. Default: 'rest'. */
  adapter?: 'rest' | 'mcp';

  /** Request timeout in milliseconds. Default: 30000. */
  timeout?: number;

  /** Enable debug logging. Default: false. */
  debug?: boolean;
}
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

### Brand persona

```typescript
import { Scope3Client } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'brand',
});

// List brands
const brands = await client.brands.list();
console.log('Brands:', brands);
```

### Partner persona

```typescript
import { Scope3Client } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'partner',
});

// Run a health check
const health = await client.health.check();
console.log('Health:', health);
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
- [Brand Guide](./brand-guide.md) -- Brand identity management and manifests.
- [Partner Guide](./partner-guide.md) -- Partner integration and health checks.
- [CLI Reference](./cli-reference.md) -- Command-line interface usage.
