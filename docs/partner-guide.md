# Partner Persona Guide

The partner persona enables integration partners to manage their organization and register agents on the Scope3 Agentic Platform.

## Setup

```typescript
import { Scope3Client } from 'scope3';

const client = new Scope3Client({
  apiKey: process.env.SCOPE3_API_KEY!,
  persona: 'partner',
});
```

## Partners

Manage partner organizations.

### List Partners

```typescript
const partners = await client.partners.list();
```

### Create a Partner

```typescript
const partner = await client.partners.create({
  name: 'My Organization',
  description: 'Ad tech partner',
});
```

### Update a Partner

```typescript
await client.partners.update('partner-123', {
  name: 'Updated Name',
});
```

### Archive a Partner

```typescript
await client.partners.archive('partner-123');
```

## Agents

Register and manage agents that interact with the platform.

### List Agents

```typescript
const agents = await client.agents.list();
```

### Get an Agent

```typescript
const agent = await client.agents.get('agent-123');
```

### Register an Agent

```typescript
const agent = await client.agents.register({
  name: 'My Sales Agent',
  type: 'SALES',
  partnerId: 'partner-123',
});
```

### Update an Agent

```typescript
await client.agents.update('agent-123', {
  name: 'Updated Agent Name',
});
```

## OAuth Authorization

Agents can be authorized via OAuth flows.

### Authorize an Agent

```typescript
const auth = await client.agents.authorizeOAuth('agent-123', {
  redirectUri: 'https://myapp.com/callback',
  scopes: ['read', 'write'],
});
// Redirect user to auth.authorizationUrl
```

### Exchange Authorization Code

```typescript
const tokens = await client.agents.exchangeOAuthCode('agent-123', {
  code: 'auth-code-from-callback',
  redirectUri: 'https://myapp.com/callback',
});
```
