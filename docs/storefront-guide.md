# Storefront Persona Guide

The storefront persona enables you to manage your storefront, inventory sources (agent registration), billing, readiness, and notifications on the Scope3 Agentic Platform.

## Setup

```typescript
import { Scope3Client } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'storefront',
});
```

## Storefront

Manage your storefront.

### Get Storefront

```typescript
const sf = await client.storefront.get();
```

### Create Storefront

```typescript
const sf = await client.storefront.create({
  name: 'My Storefront',
  description: 'Ad tech storefront',
});
```

### Update Storefront

```typescript
await client.storefront.update({
  name: 'Updated Name',
});
```

### Delete Storefront

```typescript
await client.storefront.delete();
```

## Inventory Sources

Register and manage inventory sources (agents).

### List Inventory Sources

```typescript
const sources = await client.inventorySources.list();
```

### Get an Inventory Source

```typescript
const source = await client.inventorySources.get('source-123');
```

### Create an Inventory Source

```typescript
const source = await client.inventorySources.create({
  sourceId: 'my-sales-agent',
  name: 'My Sales Agent',
  executionType: 'agent',
  type: 'SALES',
  endpointUrl: 'https://my-agent.example.com/mcp',
  protocol: 'MCP',
  authenticationType: 'API_KEY',
  auth: { type: 'bearer', token: 'my-api-key' },
});
```

### Update an Inventory Source

```typescript
await client.inventorySources.update('source-123', {
  name: 'Updated Source Name',
});
```

### Delete an Inventory Source

```typescript
await client.inventorySources.delete('source-123');
```

## Agents

List and manage agents (read-only discovery).

### List Agents

```typescript
const agents = await client.agents.list();
```

### Get an Agent

```typescript
const agent = await client.agents.get('agent-123');
```

## Readiness

Check your storefront's readiness status.

```typescript
const readiness = await client.readiness.check();
```

## Billing

Manage Stripe Connect billing integration.

### Get Billing Info

```typescript
const billing = await client.billing.get();
```

### Connect Stripe

```typescript
const connect = await client.billing.connect();
```

### Check Billing Status

```typescript
const status = await client.billing.status();
```

### Get Onboarding URL

```typescript
const url = await client.billing.onboardingUrl();
```

## Notifications

View and manage notifications.

### List Notifications

```typescript
const notifications = await client.notifications.list();
```

### Mark as Read

```typescript
await client.notifications.markAsRead('notification-123');
```

### Acknowledge

```typescript
await client.notifications.acknowledge('notification-123');
```

### Mark All as Read

```typescript
await client.notifications.markAllAsRead();
```
