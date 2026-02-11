# Buyer Persona Guide

## Overview

The buyer persona enables AI-powered programmatic advertising with:

- Advertiser management
- Bundle-based inventory discovery
- 3 campaign types (bundle, performance, audience)
- Reporting and analytics

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
});
const advId = advertiser.data.id;
```

### Step 2: Link a Brand

```typescript
const brand = client.advertisers.brand(advId);
await brand.link({ brandId: 'brand-123' });
```

### Step 3: Create a Bundle for Inventory Discovery

```typescript
const bundle = await client.bundles.create({
  advertiserId: advId,
  channels: ['display', 'video'],
  countries: ['US', 'UK'],
  budget: 50000,
});
const bundleId = bundle.data.bundleId;
```

### Step 4: Discover Products

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

### Step 5: Add Products to Bundle

```typescript
const selectedProducts = discovery.data.productGroups[0].products.map(p => ({
  productId: p.productId,
  salesAgentId: p.salesAgentId,
  groupId: discovery.data.productGroups[0].groupId,
  groupName: discovery.data.productGroups[0].groupName,
}));

await client.bundles.products(bundleId).add({ products: selectedProducts });
```

### Step 6: Create a Bundle Campaign

```typescript
const campaign = await client.campaigns.createBundle({
  advertiserId: advId,
  bundleId: bundleId,
  name: 'Q1 Display Campaign',
  flightDates: { startDate: '2025-01-15', endDate: '2025-03-31' },
  budget: { total: 50000, currency: 'USD', pacing: 'EVEN' },
});
```

### Step 7: Execute the Campaign

```typescript
await client.campaigns.execute(campaign.data.id);
```

## Campaign Types

### Bundle Campaigns

Standard campaigns with pre-selected inventory bundles.

```typescript
await client.campaigns.createBundle({ ... });
await client.campaigns.updateBundle(id, { ... });
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

### Reporting

```typescript
const reporting = client.advertisers.reporting(advId);
const report = await reporting.get({ days: 30 });
console.log(`Total spend: $${report.data.totals.spend}`);
```

### Media Buys

```typescript
const buys = client.advertisers.mediaBuys(advId);
const mediaBuys = await buys.list();
```

## Signals

```typescript
const signals = await client.signals.discover();
```

## Buyer Brands

List all brands available:

```typescript
const brands = await client.buyerBrands.list();
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
