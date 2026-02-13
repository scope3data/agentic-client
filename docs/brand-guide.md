# Brand Persona Guide

The brand persona is designed for brand identity management within the Scope3 SDK. It provides full CRUD operations for managing brand profiles, including support for brand manifests that define visual identity, tone, and other brand attributes.

## Setup

Configure the client with the `brand` persona:

```typescript
import { Scope3Client } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'brand',
});
```

## Brand Management

The brand persona supports the following operations:

- **list** - Retrieve all brands with pagination support
- **get** - Retrieve a specific brand by ID
- **create** - Create a new brand using a manifest URL or inline manifest JSON
- **update** - Update an existing brand
- **delete** - Remove a brand

## Manifest Formats

When creating or updating a brand, you can provide the brand manifest in one of two formats:

- **manifestUrl** - A URL pointing to a hosted JSON manifest file
- **manifestJson** - An inline JSON object containing the manifest data directly

### Brand Manifest Schema

The manifest supports the following fields:

| Field | Description |
|---|---|
| `name` | Brand name |
| `url` | Brand website URL |
| `logos` | Array of logo objects with `url` and `tags` |
| `colors` | Object with color definitions (e.g., `primary`, `secondary`) |
| `fonts` | Object with font definitions (e.g., `primary`, `secondary`) |
| `tone` | Description of the brand voice and tone |
| `tagline` | Brand tagline or slogan |
| `assets` | Additional brand assets |
| `product_catalog` | Product catalog information |
| `disclaimers` | Legal disclaimers and compliance text |
| `industry` | Industry vertical |
| `target_audience` | Description of the target audience |
| `contact` | Contact information |
| `metadata` | Arbitrary key-value metadata |

## Examples

### List Brands

```typescript
const brands = await client.brands.list();

for (const brand of brands.data) {
  console.log(`${brand.id}: ${brand.name}`);
}
```

### Create with Manifest URL

Use `manifestUrl` when your brand manifest is hosted externally:

```typescript
await client.brands.create({
  manifestUrl: 'https://example.com/brand-manifest.json',
});
```

### Create with Inline Manifest

Use `manifestJson` to provide the manifest data directly:

```typescript
await client.brands.create({
  manifestJson: {
    name: 'Acme Corp',
    url: 'https://acme.com',
    logos: [{ url: 'https://acme.com/logo.png', tags: ['primary'] }],
    colors: { primary: '#FF6600', secondary: '#333333' },
    fonts: { primary: 'Inter', secondary: 'Georgia' },
    tone: 'Professional and innovative',
    tagline: 'Building the future',
    industry: 'Technology',
    target_audience: 'Enterprise decision makers',
  },
});
```

### Get a Specific Brand

```typescript
const brand = await client.brands.get('brand-123');
console.log(brand.data.name);
```

### Update a Brand

```typescript
await client.brands.update('brand-123', {
  manifestJson: { name: 'Acme Corp Updated' },
});
```

### Delete a Brand

```typescript
await client.brands.delete('brand-123');
```

## Pagination

List operations support pagination using `take` and `skip` parameters:

```typescript
const firstPage = await client.brands.list({ take: 10, skip: 0 });

// Check if there are more pages
if (firstPage.pagination.hasMore) {
  const secondPage = await client.brands.list({ take: 10, skip: 10 });
}

console.log(`Showing ${firstPage.data.length} of ${firstPage.pagination.total}`);
```
