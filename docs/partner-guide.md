# Partner Persona Guide

The partner persona is designed for integration partners working with the Scope3 SDK. This persona is currently in early development, with additional capabilities planned for future releases.

## Setup

Configure the client with the `partner` persona:

```typescript
import { Scope3Client } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'partner',
});
```

## Currently Available

### Health Check

The health check endpoint allows partners to verify API connectivity and retrieve version information.

```typescript
const health = await client.health.check();
console.log(`Status: ${health.data.status}`);
console.log(`Version: ${health.data.version}`);
console.log(`API Version: ${health.data.apiVersion}`);
```

## Coming Soon

The following features are planned for the partner persona and are not yet available:

- **Agent Registration** - Register and manage AI agents that interact with the platform
- **Media Products** - Access and manage media product inventory
- **Webhooks** - Subscribe to real-time event notifications
- **Notifications** - Receive and manage platform notifications

This guide will be updated as new partner capabilities are released.
