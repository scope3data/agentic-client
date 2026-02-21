---
name: scope3-agentic-partner
version: "2.0.0"
description: Scope3 Agentic Partner API - Publisher and seller integrations
api_base_url: https://api.agentic.scope3.com/api/v2/partner
auth:
  type: bearer
  header: Authorization
  format: "Bearer {token}"
  obtain_url: https://agentic.scope3.com/user-api-keys
---

# Scope3 Agentic Partner API

This API enables partners to manage their activation partnerships and register agents with the Scope3 Agentic platform. Partners manage agents of different types (SALES, SIGNAL, CREATIVE, OUTCOME), configure authentication including OAuth, and buyers connect to agents via the Buyer API.

**Important**: This is a REST API accessed via the `api_call` tool. After reading this documentation, use `api_call` to make HTTP requests to the endpoints below.

## ⚠️ CRITICAL: Always Ask for Account Policy

**NEVER default or auto-select `accountPolicy`.** When registering or updating an agent, you MUST ask the user which account policy they want. Do NOT assume, infer, or pick a default — always ask.

Explain the options to the user:
- **`"advertiser_account"`** — Each buyer must register their own credentials with the agent. The agent authenticates requests using per-buyer credentials. Choose this when the agent requires each buyer to have their own account (e.g., their own API key or OAuth token).
- **`"marketplace_account"`** — All buyers share the Scope3 marketplace credentials. The agent authenticates using a single shared credential configured at the agent level. Choose this when the agent doesn't need individual buyer accounts (e.g., a public inventory feed or a Scope3-managed integration).
- **Both `["advertiser_account", "marketplace_account"]`** — The agent supports either mode. Buyers who register their own account use their credentials; buyers without an account fall back to the shared marketplace credentials. Choose this for maximum flexibility.

## Quick Start

1. **Use `ask_about_capability` first**: Ask about the user's request to learn the correct workflow, endpoints, and field names
2. **Use `api_call` to execute**: All operations go through the generic `api_call` tool
3. **Base path**: All endpoints start with `/api/v2/partner/`
4. **Authentication**: All endpoints require authentication via the MCP session, except the platform OAuth callback (`GET /oauth/callback`) which is public to handle browser redirects.

---

## Account Management

Some account management tasks are handled in the web UI at [agentic.scope3.com](https://agentic.scope3.com). Direct users to these pages for:

| Task | URL | Capabilities |
|------|-----|--------------|
| **API Keys** | [agentic.scope3.com/user-api-keys](https://agentic.scope3.com/user-api-keys) | Create, view, edit, delete, and reveal API key secrets |
| **Team Members** | [agentic.scope3.com/user-management](https://agentic.scope3.com/user-management) | Invite members, manage roles, manage seat access |
| **Billing** | Available from user menu in the UI | Manage payment methods, view invoices (via Stripe portal) |
| **Profile** | [agentic.scope3.com/user-info](https://agentic.scope3.com/user-info) | View and update user profile |

**Note:** Billing and member management require admin permissions.

---

## Available Endpoints

### Partner Management

Partners represent activation partnerships. Each partner is an ACTIVATION-type seat in the platform.

#### List Partners

List all partners visible to the authenticated user. Supports filtering by status and name, with pagination.

```http
GET /api/v2/partner/partners
```

**Query Parameters (all optional):**
- `status` (string): Filter by status — `ACTIVE` (default) or `ARCHIVED`
- `name` (string): Filter by name (case-insensitive, partial match)
- `take` (number): Number of results to return (default: 50)
- `skip` (number): Number of results to skip (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "50",
      "name": "Acme Activation",
      "description": "Activation partner for Acme Corporation",
      "status": "ACTIVE",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "skip": 0,
      "take": 50,
      "total": 1,
      "hasMore": false
    }
  }
}
```

---

#### Create Partner

Create a new activation partner. This creates an ACTIVATION-type seat and adds the creator as admin.

```http
POST /api/v2/partner/partners
{
  "name": "Acme Activation",
  "description": "Activation partner for Acme Corporation"
}
```

**Required Fields:**
- `name` (string, 1-255 chars): Partner display name

**Optional Fields:**
- `description` (string, max 1000 chars): Partner description

**Response (201):**
```json
{
  "id": "50",
  "name": "Acme Activation",
  "description": "Activation partner for Acme Corporation",
  "status": "ACTIVE",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

---

#### Update Partner

Update a partner's name or description. Requires access to the partner seat.

```http
PUT /api/v2/partner/partners/{id}
{
  "name": "Updated Partner Name",
  "description": "Updated description"
}
```

**Path Parameters:**
- `id` (string): The partner ID

**Request Body (all fields optional):**
- `name` (string, 1-255 chars): Updated name
- `description` (string, max 1000 chars): Updated description

---

#### Archive Partner

Archive (soft-delete) a partner. Sets the partner to inactive.

```http
DELETE /api/v2/partner/partners/{id}
```

**Path Parameters:**
- `id` (string): The partner ID

**Response:** 204 No Content

---

### Agent Management

Agents represent different types of integrations:
- **SALES** — Sales/media agents (ad inventory, publisher connections)
- **SIGNAL** — Signal/data agents (audience segments, first-party data)
- **CREATIVE** — Creative agents (ad creative generation, management)
- **OUTCOME** — Outcome measurement agents (attribution, conversion tracking)

#### List Agents

List all agents visible to the authenticated user. Supports filtering by type, status, and relationship.

```http
GET /api/v2/partner/agents
```

**Query Parameters (all optional):**
- `type` (string): Filter by agent type — `SALES`, `SIGNAL`, `CREATIVE`, or `OUTCOME`
- `status` (string): Filter by status — `PENDING`, `ACTIVE`, or `DISABLED`
- `relationship` (string): Filter by relationship — `SELF` (owned by you), `MARKETPLACE` (all other marketplace agents)

**Response:**
```json
{
  "data": [
    {
      "agentId": "premiumvideo_a1b2c3d4",
      "type": "SALES",
      "name": "Premium Video Exchange",
      "description": "Premium CTV and video inventory provider",
      "endpointUrl": "https://api.premiumvideo.com/adcp",
      "protocol": "MCP",
      "authenticationType": "API_KEY",
      "accountPolicy": ["advertiser_account", "marketplace_account"],
      "status": "ACTIVE",
      "relationship": "MARKETPLACE",
      "customerAccounts": [
        {
          "accountIdentifier": "my-account-123",
          "status": "ACTIVE"
        }
      ],
      "requiresAccount": false,
      "authConfigured": true,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

**Notes:**
- All non-DISABLED agents are visible to everyone
- PENDING agents from other owners appear as `"status": "COMING_SOON"` with minimal info (name only)
- `customerAccounts` lists the caller's own accounts (excludes marketplace accounts)
- `requiresAccount` is true when the agent supports per-account registration (`advertiser_account` or `oauth_account` policy) and the caller has no accounts
- `accountPolicy` shows the agent's allowed account types
- `authConfigured` indicates whether the agent has authentication credentials configured. For OAUTH agents: `true` means the OAuth flow is complete, `false` means the user still needs to authorize. Use this field (NOT `status`) to determine if OAuth is complete.
- `oauth` is present ONLY for owner's PENDING OAUTH agents where `authConfigured` is `false` (OAuth flow not yet completed)

**Display Requirements — ALWAYS include when listing agents:**
- `accountPolicy`: Show what account types each agent supports (advertiser_account, marketplace_account)
- `customerAccounts`: Show the caller's registered accounts for each agent
- `requiresAccount`: Highlight agents that require account registration
- `authConfigured`: Show whether authentication is set up
- Group agents by status (ACTIVE first, then COMING_SOON)
- For each agent, clearly indicate: name, type, status, account policy, number of caller's accounts, and whether registration is needed

---

#### Register Agent

Register a new agent under a specific partner seat.

```http
POST /api/v2/partner/agents
{
  "partnerId": "50",
  "type": "SALES",
  "name": "Premium Video Exchange",
  "description": "Premium CTV and video inventory provider",
  "endpointUrl": "https://api.premiumvideo.com/adcp",
  "protocol": "MCP",
  "accountPolicy": ["advertiser_account"],
  "authenticationType": "API_KEY",
  "auth": {
    "type": "bearer",
    "token": "my-api-key-for-testing"
  }
}
```

**Required Fields:**
- `partnerId` (string): The partner seat ID (ACTIVATION seat) to register this agent under. Create a partner first via `POST /partners` if needed.
- `type` (string): Agent type — `"SALES"` (media/inventory), `"SIGNAL"` (data/segments), `"CREATIVE"` (creative generation), or `"OUTCOME"` (measurement/attribution). **This cannot be changed after registration.**
- `name` (string): Agent display name
- `endpointUrl` (string): URL of the agent's ADCP/MCP endpoint
- `protocol` (string): `"MCP"` or `"A2A"`
- `accountPolicy` (array of strings): **MUST ASK THE USER** — Only valid values are `"advertiser_account"` and `"marketplace_account"`. No other values exist. Do NOT default or auto-select. Always ask the user which account policy they want.
- `authenticationType` (string): Auth method required (`"API_KEY"`, `"NO_AUTH"`, `"JWT"`, `"OAUTH"`)
- `auth` (object): Initial credentials for testing and validation. Required for non-OAUTH agents.

**Note on OAUTH agents:** When `authenticationType` is `"OAUTH"`:
- No `redirectUri` needed — the platform automatically uses its own callback URL
- The registration automatically initiates the OAuth flow and returns an `authorizationUrl` in the response
- Just present the `authorizationUrl` link to the user — they authorize in their browser and the platform handles the rest
- `auth` is not required — the OAuth flow provides the agent's credentials
- The platform automatically discovers the agent's OAuth endpoints from its ADCP endpoint URL

**IMPORTANT: `accountPolicy` and `authenticationType` are independent.** Any combination is valid.

**Optional Fields:**
- `description` (string): Agent description
- `reportingType` (string): `"WEBHOOK"`, `"BUCKET"`, or `"POLLING"`
- `reportingPollingCadence` (string): `"DAILY"` or `"MONTHLY"` (when reportingType is POLLING)

**Response (non-OAUTH):**
```json
{
  "agentId": "premiumvideo_a1b2c3d4",
  "type": "SALES",
  "name": "Premium Video Exchange",
  "status": "PENDING",
  "endpointUrl": "https://api.premiumvideo.com/adcp",
  "protocol": "MCP",
  "accountPolicy": ["advertiser_account"],
  "authenticationType": "API_KEY",
  "description": "Premium CTV and video inventory provider"
}
```

**Response (OAUTH agent — returns authorization URL):**
```json
{
  "agentId": "oauthseller_x1y2z3",
  "type": "SALES",
  "name": "OAuth Seller",
  "status": "PENDING",
  "endpointUrl": "https://seller.example.com/adcp",
  "protocol": "MCP",
  "accountPolicy": ["advertiser_account"],
  "authenticationType": "OAUTH",
  "oauth": {
    "authorizationUrl": "https://seller.example.com/oauth/authorize?client_id=abc&...",
    "agentId": "oauthseller_x1y2z3",
    "agentName": "OAuth Seller"
  }
}
```

**Note:** All agents start as PENDING. The owner activates when ready using `PATCH /agents/{agentId}` with `{"status": "ACTIVE"}`. For OAUTH agents, complete the OAuth flow first, then activate.

---

#### Get Agent Details

Retrieve detailed information about a registered agent, including account data.

```http
GET /api/v2/partner/agents/{agentId}
```

**Path Parameters:**
- `agentId` (string): The agent ID returned from registration

**Response:**
```json
{
  "agentId": "premiumvideo_a1b2c3d4",
  "type": "SALES",
  "name": "Premium Video Exchange",
  "status": "ACTIVE",
  "endpointUrl": "https://api.premiumvideo.com/adcp",
  "protocol": "MCP",
  "accountPolicy": ["advertiser_account"],
  "authenticationType": "API_KEY",
  "description": "Premium CTV and video inventory provider",
  "customerId": 1,
  "relationship": "MARKETPLACE",
  "reportingType": "WEBHOOK",
  "reportingPollingCadence": null,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:05:00Z"
}
```

---

#### Update Agent

Update an agent's configuration. Only the owner can update an agent. **Note: The `type` field cannot be changed after registration.**

```http
PATCH /api/v2/partner/agents/{agentId}
{
  "name": "Updated Agent Name",
  "description": "New description",
  "accountPolicy": ["advertiser_account", "marketplace_account"],
  "reportingType": "POLLING",
  "reportingPollingCadence": "DAILY"
}
```

**Path Parameters:**
- `agentId` (string): The agent ID

**Request Body (all fields optional, at least one required):**
- `name` (string): Agent display name
- `description` (string): Agent description
- `endpointUrl` (string): Agent endpoint URL
- `protocol` (string): `"MCP"` or `"A2A"`
- `accountPolicy` (array of strings): **MUST ASK THE USER** — Only valid values are `"advertiser_account"` and `"marketplace_account"`. Do NOT default or auto-select. Always ask the user which account policy they want.
- `authenticationType` (string): Auth method
- `auth` (object): Authentication configuration
- `reportingType` (string): `"WEBHOOK"`, `"BUCKET"`, or `"POLLING"`
- `reportingPollingCadence` (string): `"DAILY"` or `"MONTHLY"`
- `status` (string): `"PENDING"`, `"ACTIVE"`, or `"DISABLED"` — see status transition rules below

**Status Transition Rules:**
- **→ ACTIVE**: Only allowed if the agent has authentication configured (agent-level credentials or at least one account with auth). Returns `VALIDATION_ERROR` otherwise.
- **→ DISABLED**: Always allowed, no prerequisites.
- **→ PENDING**: Always allowed.

**Response:**
```json
{
  "agentId": "premiumvideo_a1b2c3d4",
  "type": "SALES",
  "name": "Updated Agent Name",
  "status": "ACTIVE",
  "updatedFields": ["name", "description", "accountPolicy", "reportingType", "reportingPollingCadence", "status"]
}
```

---

### Account Registration (Buyer API)

**Account registration has moved to the Buyer API** (`/api/v2/buyer/sales-agents`). Buyers must specify which advertiser (BUYER seat) they are connecting for.

```http
POST /api/v2/buyer/sales-agents/{agentId}/accounts
{
  "advertiserId": "300",
  "accountIdentifier": "my-publisher-account",
  "auth": {
    "type": "bearer",
    "token": "my-api-key"
  }
}
```

**Required Fields:**
- `advertiserId` (string): The advertiser seat ID (BUYER seat) to connect this account for
- `accountIdentifier` (string): Unique account identifier

**Optional Fields:**
- `auth` (object): Authentication credentials. Required for API_KEY/JWT agents, not needed for OAUTH agents.

---

### OAuth Endpoints

#### Start Setup OAuth Flow

Initiate the OAuth flow for **agent-level setup**. Tokens are stored in the agent's configuration. The `redirectUri` is optional — if omitted, the platform-hosted callback URL is used automatically.

```http
POST /api/v2/partner/agents/{agentId}/oauth/authorize
{}
```

#### Start Account OAuth Flow

Initiate the OAuth flow for **per-account registration**. Tokens are stored per-account. The `redirectUri` is optional — if omitted, the platform-hosted callback URL is used automatically.

```http
POST /api/v2/partner/agents/{agentId}/accounts/oauth/authorize
{}
```

#### Platform OAuth Callback (Public - No Auth)

Platform-hosted callback that automatically completes the OAuth flow. AI agents should use this URL as their `redirectUri`.

```
GET /api/v2/partner/oauth/callback?code={code}&state={state}
```

- **Production:** `https://api.agentic.scope3.com/api/v2/partner/oauth/callback`
- **Staging:** `https://api.agentic.staging.scope3.com/api/v2/partner/oauth/callback`

#### Exchange OAuth Code

Exchange an OAuth authorization code for tokens manually. Only needed if you have your own callback server.

```http
POST /api/v2/partner/agents/{agentId}/oauth/callback
{
  "code": "authorization-code-from-redirect",
  "state": "state-parameter-from-redirect"
}
```

---

## Key Concepts

### Partners and Agents

- **Partners** are ACTIVATION-type seats that represent activation partnerships
- **Agents** are registered under a specific partner via `partnerId` and have a `type` (SALES, SIGNAL, CREATIVE, or OUTCOME)
- Create a partner first (`POST /partners`), then register agents under it (`POST /agents` with `partnerId` and `type`)
- Buyers connect to SALES agents via the Buyer API (`POST /api/v2/buyer/sales-agents/{agentId}/accounts`)
- The agent `type` cannot be changed after registration

### Account Policies

The `accountPolicy` field is an array specifying how buyers authenticate with the agent. **Always ask the user which policy they want — never default.**

| Value | What it means | Buyer experience | When to use |
|-------|---------------|------------------|-------------|
| `["advertiser_account"]` | Each buyer registers their own credentials with the agent | Buyers must set up an account before using the agent | Agent requires per-buyer API keys, OAuth tokens, or account IDs |
| `["marketplace_account"]` | All buyers share a single Scope3 marketplace credential configured at the agent level | No setup needed — buyers can use the agent immediately | Agent uses a shared feed, public API, or Scope3-managed integration |
| `["advertiser_account", "marketplace_account"]` | Both modes supported — buyers with their own account use it, others fall back to marketplace credentials | Optional account setup; works either way | Maximum flexibility — lets buyers choose their level of integration |

**How credential resolution works when both are set:** The platform checks for a buyer's own advertiser account first. If none exists, it falls back to the marketplace account. If no marketplace account exists, it falls back to the agent-level configuration.

### Authentication Types

| Type | Auth Object Format | Notes |
|------|-------------------|-------|
| `API_KEY` | `{ "type": "bearer", "token": "..." }` | Most common. Simple token-based auth. |
| `NO_AUTH` | `{}` | Agent endpoint is open. |
| `JWT` | `{ "type": "jwt", "privateKey": "...", ... }` | JSON Web Token with private key signing. |
| `OAUTH` | Managed by OAuth flow | Credentials obtained through OAuth redirect flow. |

### Agent Lifecycle

```
Registration (POST /agents with partnerId)
  --> PENDING (initial state, always)
      For OAUTH agents: complete the OAuth flow first
      Owner decides when to activate:
        --> PATCH /agents/{agentId} with status: "ACTIVE"
        --> ACTIVE (requires auth to be configured)

Any state --> DISABLED (via PATCH, always allowed)
DISABLED --> ACTIVE (via PATCH, requires auth configured)
```

**Key points:**
- All agents start as PENDING — registration never auto-activates
- The owner explicitly activates when ready via `PATCH /agents/{agentId}` with `{"status": "ACTIVE"}`
- Non-owners see PENDING agents as `COMING_SOON` in list responses

---

## Error Handling

All errors follow this format:
```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

| Code | HTTP Status | Resolution |
|------|-------------|------------|
| `VALIDATION_ERROR` | 400 | Check request body against schema |
| `UNAUTHORIZED` | 401 | Verify API key/auth |
| `ACCESS_DENIED` | 403 | Check permissions |
| `NOT_FOUND` | 404 | Verify agent/partner ID exists |
| `CONFLICT` | 409 | Agent already registered at endpoint URL or duplicate account |
| `RATE_LIMITED` | 429 | Wait and retry |

---

## Registering an OAuth Agent

**CRITICAL: NEVER ask the user for OAuth credentials.** No client_id, client_secret, authorization URL, token URL, or scopes. The platform discovers and handles ALL of this automatically.

**Steps:**
1. Ask the user for: `partnerId`, `name`, `endpointUrl`, `protocol`, and `accountPolicy`
2. Set `authenticationType` to `"OAUTH"` — do NOT include an `auth` field
3. Call `POST /api/v2/partner/agents` with those fields
4. The response includes an `oauth.authorizationUrl` — present this link to the user
5. The user clicks the link and authorizes in their browser
6. The platform handles the rest (token exchange, storage)

**Example request:**
```json
{
  "partnerId": "28",
  "type": "SALES",
  "name": "Snap Sales Agent",
  "endpointUrl": "https://snapadcp.scope3.com/mcp",
  "protocol": "MCP",
  "accountPolicy": ["advertiser_account"],
  "authenticationType": "OAUTH"
}
```

**What happens behind the scenes (you do NOT need to do any of this):**
- Platform discovers OAuth endpoints from the agent's `.well-known/oauth-authorization-server`
- Platform performs dynamic client registration (RFC 7591) if needed
- Platform generates PKCE challenge and stores pending flow
- After user authorizes, platform exchanges the code for tokens automatically

---

## Common Mistakes to Avoid

1. **Asking the user for OAuth credentials** - NEVER ask for client_id, client_secret, authorization URL, token URL, or scopes for OAUTH agents. The platform discovers everything automatically. Just set `authenticationType: "OAUTH"` with no `auth` field.
2. **Missing `partnerId` when registering an agent** - Every agent must be registered under a partner. Create a partner first via `POST /partners`.
3. **Auto-selecting `accountPolicy`** - `accountPolicy` is a required field that MUST be chosen by the user. Never default it or pick a value automatically. Always ask the user which account policy they want before registering an agent.
4. **Registering accounts on the Partner API** - Account registration is on the Buyer API (`POST /api/v2/buyer/sales-agents/{agentId}/accounts`), not the Partner API.
5. **Missing `advertiserId` when registering an account** - Buyers must specify which advertiser seat to connect for.
6. **Missing `auth` for non-OAUTH agents** - Initial credentials are required for testing and validation when `authenticationType` is NOT `OAUTH`
7. **No `redirectUri` needed for OAuth registration** - The platform automatically uses its own callback URL
8. **Using GET for OAuth authorize** - The OAuth authorize endpoints are POST, not GET
9. **Calling endpoints without auth** - All endpoints require authentication except `GET /oauth/callback`
10. **Wrong base path** - Partner API endpoints use `/api/v2/partner/` prefix
11. **Registering accounts on PENDING agents** - Agent must be ACTIVE before accounts can be registered
