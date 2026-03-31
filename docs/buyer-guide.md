# Buyer Persona Guide

## Overview

The buyer persona enables AI-powered programmatic advertising with:

- Advertiser management with rich sub-resources (conversion events, creative sets, test cohorts, event sources, measurement data, catalogs, audiences, syndication, property lists)
- Bundle-based inventory discovery
- 3 campaign types (discovery, performance, audience) with creative management
- Reporting and analytics
- Sales agents
- Async task tracking
- Property list checks

## Setup

```typescript
import { Scope3Client } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'buyer',
});
```

## Full Buyer Workflow

### Step 1: Create an Advertiser

```typescript
const advertiser = await client.advertisers.create({
  name: 'Acme Corp',
  description: 'Leading widget manufacturer',
  brandDomain: 'acme.com',
});
const advId = advertiser.data.id;
```

### Step 2: Create a Bundle for Inventory Discovery

```typescript
const bundle = await client.bundles.create({
  advertiserId: advId,
  channels: ['display', 'video'],
  countries: ['US', 'UK'],
  budget: 50000,
});
const bundleId = bundle.data.bundleId;
```

### Step 3: Discover Products

```typescript
const discovery = await client.bundles.discoverProducts(bundleId, {
  groupLimit: 10,
  productsPerGroup: 5,
});

// Browse the product groups
for (const group of discovery.data.productGroups) {
  console.log(`${group.groupName}: ${group.productCount} products`);
  for (const product of group.products) {
    console.log(`  - ${product.name} (${product.publisher}) $${product.cpm} CPM`);
  }
}
```

### Step 4: Add Products to Bundle

```typescript
const selectedProducts = discovery.data.productGroups[0].products.map(p => ({
  productId: p.productId,
  salesAgentId: p.salesAgentId,
  groupId: discovery.data.productGroups[0].groupId,
  groupName: discovery.data.productGroups[0].groupName,
}));

await client.bundles.products(bundleId).add({ products: selectedProducts });
```

### Step 5: Create a Discovery Campaign

```typescript
const campaign = await client.campaigns.createDiscovery({
  advertiserId: advId,
  bundleId: bundleId,
  name: 'Q1 Display Campaign',
  flightDates: { startDate: '2025-01-15', endDate: '2025-03-31' },
  budget: { total: 50000, currency: 'USD' },
});
```

### Step 6: Execute the Campaign

```typescript
await client.campaigns.execute(campaign.data.id);
```

## Campaign Types

### Discovery Campaigns

Standard campaigns with pre-selected inventory bundles.

```typescript
await client.campaigns.createDiscovery({ ... });
await client.campaigns.updateDiscovery(id, { ... });
```

### Performance Campaigns

Goal-oriented campaigns with performance optimization.

```typescript
await client.campaigns.createPerformance({
  advertiserId: advId,
  name: 'ROAS Campaign',
  flightDates: { startDate: '2025-01-15', endDate: '2025-03-31' },
  budget: { total: 100000, currency: 'USD' },
  performanceConfig: {
    objective: 'ROAS',
    goals: { targetRoas: 3.5 },
  },
});
```

### Audience Campaigns

Signal-based audience targeting (coming soon).

```typescript
await client.campaigns.createAudience({ ... });
```

## Campaign Sub-Resources

### Creatives

```typescript
const creatives = client.campaigns.creatives(campaignId);
await creatives.list();
await creatives.list({ quality: 'high', take: 5 });
await creatives.get('creative-123');
await creatives.update('creative-123', { /* updates */ });
await creatives.delete('creative-123');
```

## Advertiser Sub-Resources

Access sub-resources scoped to an advertiser.

### Conversion Events

```typescript
const events = client.advertisers.conversionEvents(advId);
await events.list();
await events.create({ name: 'Purchase', type: 'PURCHASE', value: 50 });
```

### Creative Sets

```typescript
const sets = client.advertisers.creativeSets(advId);
await sets.list();
await sets.create({ name: 'Holiday Creatives', type: 'display' });
```

### Test Cohorts

```typescript
const cohorts = client.advertisers.testCohorts(advId);
await cohorts.list();
await cohorts.create({ name: 'A/B Test', splitPercentage: 50 });
```

### Event Sources

```typescript
const eventSources = client.advertisers.eventSources(advId);
await eventSources.sync({ /* event source config */ });
await eventSources.list();
await eventSources.create({ /* event source data */ });
await eventSources.get('es-123');
await eventSources.update('es-123', { /* updates */ });
await eventSources.delete('es-123');
```

### Measurement Data

```typescript
const measurementData = client.advertisers.measurementData(advId);
await measurementData.sync({ /* measurement data config */ });
```

### Catalogs

```typescript
const catalogs = client.advertisers.catalogs(advId);
await catalogs.sync({ /* catalog data */ });
await catalogs.list();
await catalogs.list({ type: 'product', take: 10 });
```

### Audiences

```typescript
const audiences = client.advertisers.audiences(advId);
await audiences.sync({ /* audience data */ });
await audiences.list();
```

### Syndication

```typescript
const syndication = client.advertisers.syndication(advId);
await syndication.syndicate({ /* syndication config */ });
await syndication.status();
await syndication.status({ resourceType: 'campaign' });
```

### Property Lists

```typescript
const propertyLists = client.advertisers.propertyLists(advId);
await propertyLists.create({ /* property list data */ });
await propertyLists.list();
await propertyLists.list({ purpose: 'inclusion' });
await propertyLists.get('pl-123');
await propertyLists.update('pl-123', { /* updates */ });
await propertyLists.delete('pl-123');

// Top-level property list checks (not advertiser-scoped)
await client.propertyListChecks.check({ domains: ['example.com'] });
await client.propertyListChecks.getReport('report-123');
```

## Signals

```typescript
const signals = await client.signals.discover();
```

## Reporting

```typescript
const report = await client.reporting.get({ days: 30, view: 'summary' });

// With filters
const filtered = await client.reporting.get({
  advertiserId: advId,
  view: 'timeseries',
  days: 7,
});
```

## Sales Agents

```typescript
const agents = await client.salesAgents.list();

// Register an account for an agent
await client.salesAgents.registerAccount('agent-123', {
  name: 'My Account',
});
```

## Tasks

Check the status of async tasks.

```typescript
const task = await client.tasks.get('task-123');
```

## Pagination

All list methods support pagination:

```typescript
const page1 = await client.advertisers.list({ take: 10, skip: 0 });
const page2 = await client.advertisers.list({ take: 10, skip: 10 });

// Check pagination info
console.log(`Total: ${page1.pagination.total}, Has more: ${page1.pagination.hasMore}`);
```

## API Response Format

All responses use a standard envelope:

```typescript
// Single item
interface ApiResponse<T> {
  data: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
}

// Paginated list
interface PaginatedApiResponse<T> {
  data: T[];
  pagination: { total: number; take: number; skip: number; hasMore: boolean };
  error?: { code: string; message: string; details?: Record<string, unknown> };
}
```
