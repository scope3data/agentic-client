---
name: scope3-storefront
description: Create and manage advertising agents that process ad briefs via MCP and recommend products from your catalog. Use for agent CRUD, product uploads, evals, traces, policy, and HITL task management.
license: MIT
metadata:
  author: Scope3
  version: "2.0.0"
---

# Scope3 Publisher API

REST API for creating and managing advertising agents. Agents process ad briefs via MCP and recommend products from your catalog.

**Base URL:** `https://agents.scope3.com/api/v1`

## Authentication

This API uses OAuth 2.0 authorization code flow via WorkOS. A human must complete browser-based login to obtain a token — there is no machine-to-machine grant.

**For agents:** surface the authorization URL to the user and wait for the callback.

Discovery endpoints (no auth required):
- `GET https://agents.scope3.com/api/v1/.well-known/oauth-authorization-server` — returns `authorization_endpoint`, `token_endpoint`, `registration_endpoint`
- `GET https://agents.scope3.com/api/v1/.well-known/oauth-protected-resource` — returns `resource`, `authorization_servers`

Flow:
1. `POST /register` — register a client (returns `client_id`)
2. Redirect user to `authorization_endpoint` with `client_id`, `redirect_uri`, `code_challenge` (S256)
3. Exchange the authorization code at `token_endpoint` for an access token
4. Include the token in every request: `Authorization: Bearer <access_token>`

Scopes: `api:read`, `api:write`.

## Error Format

All errors return JSON with an `error` field:
```json
{ "error": "platformId must be 2-50 chars, lowercase alphanumeric with hyphens/underscores" }
```

Common status codes: `400` (validation), `401` (auth), `404` (not found or not owned), `409` (conflict), `500` (server error).

## Pagination

List endpoints accept a `limit` query parameter. There is no cursor or offset — results are returned newest-first up to the limit. If you receive `count` equal to `limit`, there may be more results.

## Endpoints

### Agents

`{id}` in all paths below refers to `platformId`.

**List agents** — `GET /agents`

Returns agents owned by the authenticated user.
```json
// Response 200
{
  "agents": [{
    "platformId": "my-podcast-network",
    "platformName": "My Podcast Network",
    "publisherDomain": "mypodcasts.com",
    "enabled": true,
    "templates": [{ "id": "t1", "name": "Sponsored Post", "pricingModel": "cpm" }],
    "counts": { "templates": 1, "formats": 0, "creativeFormats": 0, "targetingFields": 0, "accounts": 0 },
    "createdAt": "2025-01-15T00:00:00.000Z",
    "updatedAt": "2025-01-15T00:00:00.000Z"
  }]
}
```

**Get agent** — `GET /agents/{id}`

Returns the full agent object. LLM API keys are redacted to `***`.

**Create agent** — `POST /agents` (201)
```json
{
  "platformId": "my-podcast-network",
  "platformName": "My Podcast Network",
  "publisherDomain": "mypodcasts.com"
}
```
Required: `platformId`, `platformName`, `publisherDomain`. Optional: `templates`, `formats`, `targetingFields`, `accounts`, `creativeFormats` (arrays, default `[]`), `enabled` (boolean, default `true`).

`platformId` must be 2-50 chars matching `^[a-z][a-z0-9_-]{1,49}$`. Returns the created agent object.

**Update agent** — `PUT /agents/{id}`
```json
{
  "platformName": "Updated Name",
  "enabled": true
}
```
All fields optional: `platformName`, `publisherDomain`, `templates`, `formats`, `targetingFields`, `accounts`, `creativeFormats`, `enabled`. Returns the updated agent object. Use `POST /agents/{id}/upload` to manage templates via CSV/JSON.

**Delete agent** — `DELETE /agents/{id}` (204, no body)

### Product Templates

Upload a CSV or JSON file to populate product templates.

**Upload file** — `POST /agents/{id}/upload` (201)
```json
{
  "content": "name,description,pricingModel,floorPrice\nSponsored Post,Display ad,cpm,5",
  "file_type": "csv",
  "replace": true
}
```
Required: `content` (string, max 1MB), `file_type` (`"csv"` or `"json"`). Optional: `replace` (boolean, default `true` — set `false` to append).
```json
// Response
{
  "platformId": "my-podcast-network",
  "templatesAdded": 1,
  "templateIds": ["t1"],
  "replaced": true,
  "traceId": "uuid",
  "warnings": []
}
```

**List file uploads** — `GET /agents/{id}/file-uploads?limit=20`

Query: `limit` (default 20, max 100). Returns `{ agentId, uploads: [{ id, fileType, templateCount, traceId, createdAt, createdBy }] }`.

### Traces

Decision traces record how the agent makes recommendations.

**Query traces** — `GET /agents/{id}/traces`

Query: `capability`, `trace_type`, `min_confidence` (number 0-1), `limit` (default 20, max 100).
```json
// Response
{
  "agentId": "my-podcast-network",
  "count": 1,
  "traces": [{
    "id": "uuid",
    "traceType": "recommendation",
    "capability": "get_products",
    "decision": { },
    "reasoning": "...",
    "briefContext": { },
    "confidence": 0.85,
    "validFrom": "2025-01-15T00:00:00.000Z",
    "validUntil": null,
    "createdAt": "2025-01-15T00:00:00.000Z",
    "createdBy": "system"
  }]
}
```

**Add trace** — `POST /agents/{id}/traces` (201)
```json
{
  "trace_type": "policy",
  "capability": "get_products",
  "decision": { "rule": "Always recommend video for brand awareness briefs" },
  "reasoning": "Video formats drive higher brand recall",
  "valid_until": "2025-12-31T00:00:00.000Z",
  "brief_context": { "objective": "brand_awareness" }
}
```
Required: `trace_type`, `capability`, `decision` (object). Optional: `reasoning`, `valid_until` (ISO date), `brief_context` (object).

Valid trace types: `recommendation`, `correction`, `outcome`, `policy`, `exception`.

### Tasks

Human-in-the-loop tasks are created when an agent capability is set to `"human"` mode.

**List tasks** — `GET /agents/{id}/tasks`

Query: `status` (`pending`, `claimed`, `completed`), `capability`, `limit` (default 20, max 100).
```json
// Response
{
  "agentId": "my-podcast-network",
  "count": 1,
  "tasks": [{
    "id": "uuid",
    "capability": "create_media_buy",
    "status": "pending",
    "title": "Review media buy",
    "description": "...",
    "claimedBy": null,
    "claimedAt": null,
    "completedAt": null,
    "createdAt": "2025-01-15T00:00:00.000Z"
  }]
}
```

**Get task** — `GET /tasks/{id}`

Returns full task including `context`, `result`, `sessionId`, `expiresAt`, `updatedAt`.

**Claim task** — `POST /tasks/{id}/claim`

Optional body: `{ "claimed_by": "reviewer-name" }` (defaults to authenticated user).
```json
// Response
{ "id": "uuid", "status": "claimed", "claimedBy": "reviewer-name", "claimedAt": "..." }
```
Returns `409` if task is not in `pending` status.

**Complete task** — `POST /tasks/{id}/complete`
```json
{
  "result": { "approved": true },
  "correction": {
    "original": { "budget": 1000 },
    "corrected": { "budget": 500 },
    "reason": "Budget cap exceeded"
  }
}
```
Required: `result` (object). Optional: `correction` — if provided, a correction trace is automatically created.
```json
// Response
{ "id": "uuid", "status": "completed", "completedAt": "...", "correctionTraceCreated": true }
```
Returns `409` if task is not in `claimed` status.

### Configuration

**Capabilities** — `PUT /agents/{id}/capabilities`

Control which features run automatically vs. require human approval.
```json
{
  "capabilities": {
    "get_products": { "mode": "automated" },
    "create_media_buy": { "mode": "human" }
  }
}
```
Modes: `automated`, `human`, `disabled`. Capabilities are merged with existing settings.

Returns `{ "platformId": "...", "capabilities": { ... } }`.

**Notifications** — `PUT /agents/{id}/notifications`

Configure where HITL task alerts are sent.
```json
{
  "channels": [
    { "type": "webhook", "destination": "https://hooks.slack.com/..." },
    { "type": "slack", "destination": "https://hooks.slack.com/..." },
    { "type": "email", "destination": "ops@publisher.com" }
  ]
}
```
Channel types: `webhook`, `slack`, `email`. Webhook and slack destinations must be HTTPS URLs.

**LLM Provider** — `PUT /agents/{id}/llm-provider`

Bring your own LLM for product recommendations.
```json
{
  "provider": "openai",
  "model_id": "gpt-4o",
  "api_key": "sk-..."
}
```
Required: `provider` (`gemini`, `openai`, `anthropic`). Optional: `model_id`, `api_key`.

Returns `{ "platformId": "...", "llmConfig": { "provider": "openai", "modelId": "gpt-4o", "hasApiKey": true } }`.

**Inbound Filters** — `PUT /agents/{id}/inbound-filters`

Filter incoming briefs before processing.
```json
{
  "filters": [
    { "type": "category_block", "config": { "categories": ["gambling", "tobacco"] } }
  ]
}
```

### Storefront Sources

Configure where products, audiences, accounts, and pricing come from.

**Inventory Sources** — `GET /agents/{id}/inventory-sources` | `PUT /agents/{id}/inventory-sources`

Define where ad inventory comes from (e.g. GAM for display, a podcast agent for audio).
```json
{
  "inventorySources": [
    {
      "id": "gam-display",
      "name": "GAM Display Network",
      "channels": ["display", "video"],
      "execution": { "type": "agent", "agentUrl": "https://gam-agent.example.com" }
    },
    {
      "id": "podcast-static",
      "name": "Podcast Catalog",
      "channels": ["audio"],
      "execution": { "type": "manual" }
    }
  ]
}
```
Each source requires `id`, `name`, `channels[]`, and `execution.type` (`agent`, `queue`, or `manual`). Agent sources include an `agentUrl`.

**Audience Sources** — `GET /agents/{id}/audience-sources` | `PUT /agents/{id}/audience-sources`

Connect identity and targeting partners. Each audience source maps to inventory sources it can activate on.
```json
{
  "audienceSources": [
    {
      "id": "liveramp",
      "name": "LiveRamp Identity",
      "activatesOn": ["gam-display"],
      "execution": { "type": "agent", "agentUrl": "https://liveramp.example.com" }
    }
  ]
}
```
Each source requires `id`, `name`, `activatesOn[]` (inventory source IDs), and `execution.type` (`agent` or `static`).

**Account Sources** — `GET /agents/{id}/account-sources` | `PUT /agents/{id}/account-sources`

Connect CRM systems for advertiser account resolution.
```json
{
  "accountSources": [
    {
      "id": "salesforce",
      "name": "Salesforce CRM",
      "execution": { "type": "agent", "agentUrl": "https://sf-agent.example.com" }
    }
  ]
}
```
Each source requires `id`, `name`, and `execution.type` (`agent` or `static`).

**Rate Cards** — `GET /agents/{id}/rate-cards` | `PUT /agents/{id}/rate-cards`

Configure pricing rules layered on top of products.
```json
{
  "rateCards": [
    {
      "id": "standard-2026",
      "name": "2026 Standard Rates",
      "rules": [
        { "match": { "channel": "display" }, "pricing": { "type": "cpm", "amount": 12, "currency": "USD" } },
        { "match": { "channel": "video" }, "pricing": { "type": "cpm", "amount": 25, "currency": "USD" } }
      ]
    }
  ]
}
```
Each card requires `id`, `name`, and `rules[]`. Rules have a `match` (by `channel` and/or `productId`) and `pricing` (`cpm`, `flat`, or `custom`).

### Policy

Synthesize a decision policy from accumulated traces.

**Synthesize policy** — `POST /agents/{id}/synthesize-policy`
```json
{ "apply": true }
```
Optional: `apply` (default `true`). When `true`, the synthesized policy is saved to the agent.
```json
// Response
{
  "platformId": "my-podcast-network",
  "policy": "...",
  "summary": "Prioritize video for brand awareness, display for performance",
  "traceCount": 42,
  "applied": true
}
```
Returns `400` if no traces are available.

### Evals

Run evaluation briefs against the agent to test recommendations.

**Run eval** — `POST /agents/{id}/evals` (201)
```json
{
  "briefs": [
    { "brief": "Looking for podcast sponsorship for a health & wellness brand, $10k budget" },
    { "brief": "Need social media ads targeting Gen Z gamers" }
  ]
}
```
Required: `briefs` (array, 1-50 items). Each must have a non-empty `brief` string. Agent must have at least one product template.
```json
// Response
{
  "evalId": "uuid",
  "agentId": "my-podcast-network",
  "briefCount": 2,
  "aggregateScores": { },
  "results": [{ }]
}
```

**Get eval** — `GET /evals/{id}`

**Compare evals** — `POST /evals/compare`
```json
{ "eval_id_a": "uuid-1", "eval_id_b": "uuid-2" }
```
Returns `{ evalIdA, evalIdB, scoresA, scoresB, scoreDelta, briefComparisons }`.

### Audit

**Config change history** — `GET /agents/{id}/config-changes?limit=50`

Query: `limit` (default 50, max 200). Returns `{ agentId, count, changes: [{ id, operation, fieldChanges, changedBy, createdAt }] }`.

### Reference

**OpenAPI spec** (no auth) — `GET /openapi.json`

**This documentation** (no auth) — `GET /skill.md`

## MCP Endpoint

Once created and enabled, your agent is accessible as an MCP server at:

```
/{platformId}/mcp
```

MCP clients (ad buyers) connect here to browse products, get recommendations, and create media buys. The capabilities you configure via `PUT /agents/{id}/capabilities` determine which operations run automatically vs. require human approval via tasks.

## Common Workflows

### Quick Start

1. **Create agent** — `POST /agents` with `platformId`, `platformName`, `publisherDomain`
2. **Upload products** — `POST /agents/{id}/upload` with CSV/JSON product catalog
3. **Run eval** — `POST /agents/{id}/evals` to test recommendations
4. **Go live** — agent is available at `/{platformId}/mcp` for MCP clients

### Storefront Setup

Connect external sources to power multi-channel proposals:

1. **Define inventory sources** — `PUT /agents/{id}/inventory-sources` with your ad servers, podcast networks, or other supply sources (each with channels and execution type)
2. **Connect audience sources** — `PUT /agents/{id}/audience-sources` with identity partners and targeting data providers (map each to the inventory sources it activates on)
3. **Connect account source** — `PUT /agents/{id}/account-sources` with your CRM (Salesforce, HubSpot, etc.) for advertiser identity resolution
4. **Configure rate cards** — `PUT /agents/{id}/rate-cards` with pricing rules per channel or product

When a brief arrives, the storefront automatically resolves the buyer's account, detects whether this is a new opportunity or continuation of an existing one, then assembles products from configured inventory sources.

### Operations

1. **Review traces** — `GET /agents/{id}/traces` to see how decisions were made
2. **Add policy** — `POST /agents/{id}/traces` with `trace_type: "policy"` to guide behavior
3. **Set capabilities** — `PUT /agents/{id}/capabilities` to control automation level
4. **Configure notifications** — `PUT /agents/{id}/notifications` for HITL alerts
