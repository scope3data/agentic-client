---
name: scope3-agentic-buyer
version: "2.0.0"
description: Scope3 Agentic Buyer API - AI-powered programmatic advertising
api_base_url: https://api.agentic.scope3.com/api/v2/buyer
auth:
  type: bearer
  header: Authorization
  format: "Bearer {token}"
  obtain_url: https://agentic.scope3.com/user-api-keys
---

# Scope3 Agentic Buyer API

This API enables AI-powered programmatic advertising with inventory discovery, campaign management, and creative orchestration.

**Important**: This is a REST API accessed via the `api_call` tool. After reading this documentation, use `api_call` to make HTTP requests to the endpoints below.

## ⚠️ CRITICAL: Exact Field Names Required

**DO NOT GUESS FIELD NAMES.** Use these exact camelCase names:

| Field | Type | Notes |
|-------|------|-------|
| `advertiserId` | string | NOT `advertiser_id` |
| `brandDomain` | string | Required on advertiser create (e.g., `"nike.com"`) |
| `flightDates` | **object** | NOT `startDate`/`endDate` at root level |
| `flightDates.startDate` | string | ISO 8601: `"2026-02-05T00:00:00Z"` |
| `flightDates.endDate` | string | ISO 8601: `"2026-02-10T23:59:59Z"` |
| `budget` | **object** | NOT a number |
| `budget.total` | number | e.g., `1000` |
| `budget.currency` | string | `"USD"` (default) |
| `constraints` | object | Optional |
| `constraints.channels` | array | e.g., `["display"]`, `["ctv"]` |
| `performanceConfig` | object | Required for `type: "performance"` |

## ⚠️ CRITICAL: Always Send the ENTIRE Client Brief

**When sending a `brief` field to ANY endpoint, you MUST include the COMPLETE brief text the client provided — word for word, in full.** Do NOT summarize, truncate, paraphrase, or shorten the brief under any circumstances.

The brief is used by sales agents and the discovery system to match relevant inventory. Sending a partial or summarized brief degrades match quality and loses important context. Even if the brief is long, always pass it through in its entirety.

**Rules:**
- **Always include the brief** — if the client provided a brief, you MUST send it in every API call that accepts a `brief` field. Never omit it or leave it out.
- **Copy the full brief verbatim** — include every detail the client provided
- **Never summarize** — "Premium CTV for tech enthusiasts" is NOT an acceptable substitute for a multi-paragraph brief
- **Never truncate** — if the client gave you 500 words, send all 500 words
- **Applies everywhere `brief` is used** — bundle creation, product discovery, campaign creation, and any other endpoint that accepts a brief

## ⚠️ CRITICAL: Never Fabricate User Data

**Before making any API call that creates or modifies a resource, you MUST have explicit user input for all required fields.** Do NOT invent, guess, or auto-fill values the user hasn't provided.

**Rules:**
- **NEVER fabricate values** for required fields. If the user hasn't provided a value, ask for it.
- **Read-only calls are fine** — you can freely call GET endpoints to fetch data and present it to the user.
- **Confirm before mutating** — Before any POST, PUT, or DELETE call, verify you have user-provided (or user-confirmed) values for all required fields.
- **Inferring is OK when obvious** — If the user says "optimize for return on ad spend", you can infer `objective: "ROAS"`. But if intent is ambiguous, ask.
- **Never make up IDs** — IDs (advertiserId, bundleId, campaignId, etc.) must come from previous API responses or the user. Never generate them.
- **Only use what's documented** — Do NOT invent endpoints, fields, query parameters, or enum values that are not explicitly listed in this skill document. If you're unsure whether something exists, check this document first. If it's not here, don't use it.

---

## Quick Start

1. **Use `ask_about_capability` first**: Ask about the user's request to learn the correct workflow, endpoints, and field names
2. **Use `api_call` to execute**: All operations go through the generic `api_call` tool
3. **Base path**: All endpoints start with `/api/v2/buyer/`
4. **Authentication**: Handled automatically by the MCP session

---

## Campaign Workflow Decision Tree

**There is no generic campaign creation endpoint.** You must choose a campaign type first, then follow the type-specific workflow.

**CRITICAL: When a user says "create a campaign" without specifying a type, ALWAYS ask them to choose. Do NOT default to any type.**

Match the user's **intent** to the right type:

| User Intent | Campaign Type | Workflow |
|-------------|---------------|----------|
| "browse inventory", "show me what's available", "I want to pick publishers", "select products", "specific sites", "curated", "what inventory do you have" | **Discovery** ✅ | See Discovery Campaign Workflow below |
| "optimize for ROAS", "maximize conversions", "drive sales", "hit a CPA target", "performance goal", "optimize my spend" | **Performance** ✅ | See Performance Campaign Workflow below |
| "target tech enthusiasts", "reach parents aged 25-40", "audience segments", "demographic targeting" | **Audience** ❌ Coming soon | Returns 501 — suggest discovery or performance instead |

**Key distinction:** Does the user want to choose the inventory themselves (→ discovery) or let the system choose (→ performance)? If the user mentions wanting to see products or pick publishers, that's **discovery**, even if they also mention performance goals.

**When the user's intent is ambiguous**, ask:
> "What type of campaign would you like to create?
> - **Discovery**: You browse and select the specific ad inventory/products
> - **Performance**: The system automatically optimizes for your goal (ROAS, conversions, etc.)
> - **Audience**: Target specific audience segments (coming soon)"

**All campaign types share these required fields:**
- `advertiserId` (string) — NOT `advertiser_id`
- `name` (string)
- `flightDates` (object) — NOT `startDate`/`endDate` at root level
  - `flightDates.startDate` (ISO 8601 datetime)
  - `flightDates.endDate` (ISO 8601 datetime)
- `budget` (object) — NOT a number
  - `budget.total` (number)
  - `budget.currency` (string, default `"USD"`)

Each type then requires additional fields:
- **Discovery**: `bundleId` (from `POST /bundles`) → create via `POST /campaigns/discovery`
- **Performance**: `performanceConfig.objective` → create via `POST /campaigns/performance`
- **Audience**: `signals` → create via `POST /campaigns/audience` (coming soon)

---

## Browsing Products Without a Campaign

Browsing products is part of the **discovery** campaign workflow. If a user starts browsing inventory, they are implicitly heading toward a discovery campaign (where they select specific products). This is different from a performance campaign, where the system selects inventory automatically.

**When a user wants to browse products without mentioning a campaign:**

Users may want to explore available inventory before committing to a campaign. Use `POST /bundles/discover-products` which:
- Creates a bundle automatically if no bundleId is provided
- Discovers products based on the advertiser's context
- Returns both the bundleId and discovered products

**Interactive flow:**
1. **Browse products** — Call `POST /bundles/discover-products` with advertiser context
   - Returns bundleId (auto-created if needed) and product groups
   - Save the bundleId for later use
2. **Present products** — Show available inventory in a user-friendly way
3. **Add products to the bundle** — When the user likes products, add them via `POST /bundles/{id}/products`
4. **Create campaign later** — When ready, create a campaign with the bundleId via `POST /campaigns/discovery`

**Request Parameters (Filtering):**
- `publisherDomain` (optional): Filter products by publisher domain (exact domain component match). Example: "example" matches "example.com", "www.example.com" but "exampl" does not match
- `salesAgentIds` (optional, array): Filter products by exact sales agent ID(s). Use when you have agent IDs from a previous response.
- `salesAgentNames` (optional, array): Filter products by sales agent name(s) (case-insensitive match). Use when a user mentions specific sellers, partners, or exchanges by name.

**Key benefit:** Users can explore inventory without the overhead of creating bundles manually. The bundleId is returned so they can continue building their selection.

See the Discovery Campaign Workflow below for the full step-by-step with HTTP examples.

---

## Discovery Campaign Workflow

**When to use:** User wants to browse, select, or control which specific inventory/products to include.

**Prerequisites:** Advertiser exists with a linked brand (set during advertiser creation via `brandDomain`).

### Interactive Flow

Follow these steps in order. **Do NOT skip bundle creation or product discovery.**

**Step 1: Create the bundle**

```http
POST /api/v2/buyer/bundles
{
  "advertiserId": "12345",
  "channels": ["ctv", "display"],
  "countries": ["US", "CA"],
  "brief": "<<< ALWAYS include the ENTIRE brief from the client here — never summarize >>>",
  "budget": 50000,
  "flightDates": {
    "startDate": "2025-02-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z"
  }
}
```
→ Returns `{ "bundleId": "abc123-def456-ghi789" }` — save this for all subsequent steps.

Alternatively, use `POST /bundles/discover-products` which creates a bundle AND discovers products in one call (useful when a user just wants to browse without explicit bundle creation):
```http
POST /api/v2/buyer/bundles/discover-products
{
  "advertiserId": "12345",
  "channels": ["ctv", "display"],
  "countries": ["US"],
  "brief": "<<< ALWAYS include the ENTIRE brief from the client here — never summarize >>>",
  "salesAgentNames": ["Acme Ad Exchange"]
}
```
→ Returns `{ "bundleId": "...", "productGroups": [...], "totalGroups": 25, "hasMoreGroups": true, "summary": { ... } }`

**Step 2: STOP and guide the user**

Do NOT immediately create the campaign. Instead:
- Explain that you've started building their campaign bundle
- Offer to show them available inventory: "Would you like me to show you the available inventory?"

**Step 3: Discover products**

If you used `POST /bundles` in Step 1 (not `POST /bundles/discover-products`), discover products now:

```http
GET /api/v2/buyer/bundles/{bundleId}/discover-products?groupLimit=10&groupOffset=0&productsPerGroup=5
```

Present product groups, publishers, channels, and price ranges in a user-friendly way.

**Explaining product relevance (IMPORTANT):**

Each product includes a `briefRelevance` field that explains WHY the product is a strategic fit for the campaign. When presenting products, you MUST:

1. **Lead with the "why"** — Don't just list product names and CPMs. For each product or product group, explain why it matters for THIS specific campaign. Use the `briefRelevance` text as your starting point but make it conversational.
2. **Connect products to the brief** — Reference the user's campaign goals, target audience, or brand context. Example: "These products from Magnite target family audiences with parenting and food-related segments — a direct match for your Fanta Meals campaign aimed at families."
3. **Highlight strategic differentiators** — Call out what makes a product stand out: guaranteed delivery, best-value CPM, audience segment alignment, or estimated reach. Don't bury these in a list.
4. **Group-level insight** — When presenting a sales agent's products, summarize what that agent brings to the table for this campaign. Don't just say "Products from Magnite Sales (5 products)" — say WHY Magnite Sales matters here.
5. **Skip empty relevance** — If a product has no `briefRelevance`, present it normally with its attributes. Don't fabricate relevance that doesn't exist.

**Bad example** (too basic):
> Magnite Sales has 5 products available: Americas Test Kitchen ($12 CPM, CTV), Rakuten TV ($8.50 CPM, CTV)...

**Good example** (explains why):
> Magnite Sales is a strong fit here — they offer family-targeting segments like "Parenting Babies and Toddlers" and "With Children" that align directly with your Fanta Meals audience. Their Americas Test Kitchen inventory puts your ads in a food/cooking context, and at $8.50–$12.00 CPM you're getting competitive rates with guaranteed delivery on several products.

### Filtering Product Discovery Results

When discovering products, these filters narrow results before grouping and pagination:

- `publisherDomain`: Filter by publisher website. Use when a user mentions a specific publisher or website.
  - Example: "hulu" matches "hulu.com", "www.hulu.com" but "hul" does not
- `salesAgentIds`: Filter by exact sales agent ID(s). Use when you have agent IDs from a previous response. Accepts multiple values.
- `salesAgentNames`: Filter by sales agent name(s) (case-insensitive substring match). Use when a user mentions specific sellers, partners, or exchanges by name. Accepts multiple values.

Filters can be combined. Multiple values within a filter use OR logic (match any); different filters use AND logic.

**How to communicate filtering to users:**

Do NOT mention filter parameter names. Respond naturally:
- User: "What do you have from [agent name]?" → filter by salesAgentNames
- User: "Show me [publisher] inventory" → filter by publisherDomain
- User: "What does [agent name] have on [publisher]?" → filter by both salesAgentNames and publisherDomain
- User: "Show me inventory from [agent 1] and [agent 2]" → filter by salesAgentNames with both values
- User: "Who sells CTV inventory?" → show unfiltered results, then offer to narrow by seller

Each product group represents a sales agent. To focus on a specific agent's inventory, use the sales agent filter on subsequent requests.

**Step 4: Select products interactively**

Users can select products in two ways:
1. **Via the interactive card UI** — Users select product cards and click "Add to Bundle". When this happens, you'll receive a message containing the bundleId, productIds, and the exact `POST /bundles/{id}/products` API call to execute. The message will also ask you to prompt the user about per-product budgets. **Ask the user if they'd like to set individual budgets before executing the API call.** If they provide budgets, add a `budget` field to each product in the request body. If they decline, execute the call as-is without budgets. Do not re-discover products or look up IDs.
2. **Via conversation** — Users describe which products they want in natural language. The productId, salesAgentId, groupId, and groupName are included in the product listing from the discovery response — extract them from there to build the API call. Do not re-discover products to obtain IDs.

**Per-product budget:** Each product supports an optional `budget` field (number, in dollars). Ask about budgets before adding products — don't assume a budget if the user hasn't specified one.

```http
POST /api/v2/buyer/bundles/{bundleId}/products
{
  "products": [
    {
      "productId": "product_123",
      "salesAgentId": "agent_456",
      "groupId": "ctx_123-group-0",
      "groupName": "Publisher Name",
      "cpm": 12.50,
      "budget": 5000
    }
  ]
}
```

Show the updated bundle with selected products and budget allocation.

**Step 5: Confirm readiness**

"Your bundle has X products selected with $Y allocated. Ready to create the campaign?"

**Step 6: Create the campaign**

```http
POST /api/v2/buyer/campaigns/discovery
{
  "advertiserId": "12345",
  "name": "Q1 2025 CTV Campaign",
  "bundleId": "abc123-def456-ghi789",
  "flightDates": {
    "startDate": "2025-02-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z"
  },
  "budget": {
    "total": 50000,
    "currency": "USD"
  }
}
```

**Step 7: Launch**

```http
POST /api/v2/buyer/campaigns/{campaignId}/execute
```

### Bundle Management

- `GET /bundles/{id}/products` — List selected products
- `POST /bundles/{id}/products` — Add products
- `DELETE /bundles/{id}/products` — Remove products (body: `{ "productIds": ["..."] }`)

**Summary:** Create bundle → Discover products → Select products → Create campaign → Execute

### Bundle Lifecycle

**How long do bundles live?**
- Bundles persist indefinitely until explicitly completed
- There is no automatic expiration or TTL
- Bundles remain in "active" status until a campaign is executed

**Can bundles be reused?**
- Yes, the same bundleId can be attached to multiple campaigns
- Each campaign independently references the bundle's products
- Modifying the bundle affects all campaigns that reference it

**What happens after campaign creation?**
- The bundle remains active after campaign creation
- You can continue adding/removing products from the bundle
- The bundle is only "completed" when the campaign is executed
- Once completed, the bundle cannot be modified

**Best Practices:**
- Create one bundle per campaign workflow
- Complete product selection before creating the campaign
- Don't reuse bundles across unrelated campaigns

**IMPORTANT:** Do NOT expose API details to the user. Communicate conversationally about campaigns, inventory, products, and budgets — not about endpoints or HTTP methods.

---

## Performance Campaign Workflow

**When to use:** User wants the system to optimize for business outcomes automatically. The system handles inventory selection — no manual product or signal selection needed.

**Prerequisites:** Advertiser exists (with brand set during creation) + Conversion events configured.

### Steps

**Step 1: Verify advertiser**

```http
GET /api/v2/buyer/advertisers?status=ACTIVE&name={advertiserName}
```

**Step 2: Check/create conversion events**

```http
GET /api/v2/buyer/advertisers/{advertiserId}/conversion-events
```

If empty, create one:
```http
POST /api/v2/buyer/advertisers/{advertiserId}/conversion-events
{
  "name": "Purchase",
  "type": "PURCHASE"
}
```

**Step 3: Gather required fields from the user**

Before calling the create endpoint, confirm you have:
- Campaign name (ask the user or confirm a suggested name)
- Flight dates (start and end — ask the user)
- Budget total and currency (ask the user)
- Performance objective: `ROAS`, `CONVERSIONS`, `LEADS`, or `SALES` (ask the user if not clear from context)
- Optional: goals, bid strategy, constraints (offer these but don't require)

**Step 4: Create the campaign**

```http
POST /api/v2/buyer/campaigns/performance
{
  "advertiserId": "12345",
  "name": "Q1 ROAS Optimization",
  "flightDates": {
    "startDate": "2025-02-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z"
  },
  "budget": {
    "total": 100000,
    "currency": "USD"
  },
  "performanceConfig": {
    "objective": "ROAS",
    "goals": {
      "targetRoas": 4.0
    }
  },
  "constraints": {
    "channels": ["ctv", "display"],
    "countries": ["US"]
  }
}
```

`performanceConfig.objective` is required.

**Step 5: Launch**

```http
POST /api/v2/buyer/campaigns/{campaignId}/execute
```

---

## Audience Campaign Workflow

**Status:** ❌ Not yet implemented — returns 501 Not Implemented.

If a user wants audience targeting, explain this type is coming soon and suggest discovery or performance as alternatives.

**Future flow (once implemented):**

Step 1: Discover available signals
```http
POST /api/v2/buyer/campaign/signals/discover
{
  "filters": {
    "catalogTypes": ["marketplace"]
  }
}
```

Step 2: Create audience campaign with selected signals
```http
POST /api/v2/buyer/campaigns/audience
{
  "advertiserId": "12345",
  "name": "Tech Enthusiasts Campaign",
  "flightDates": {
    "startDate": "2025-02-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z"
  },
  "budget": {
    "total": 25000,
    "currency": "USD"
  },
  "signals": ["tech_enthusiasts_signal_id", "early_adopters_signal_id"]
}
```

Step 3: Launch — `POST /campaigns/{campaignId}/execute`

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

## Entity Hierarchy & Prerequisites

Before creating campaigns, you MUST understand the entity hierarchy:

```
Customer (your account)
  └── Advertiser (brand account - REQUIRED first)
        ├── Campaigns (advertising campaigns)
        ├── Creative Sets (ad creatives)
        ├── Conversion Events (for performance tracking)
        └── Test Cohorts (for A/B testing)
```

### Setup Checklist

**Before you can run a campaign, you need:**

1. **Advertiser** (REQUIRED)
   - First, check if one exists: `GET /api/v2/buyer/advertisers`
   - If not, create one: `POST /api/v2/buyer/advertisers` (requires `brandDomain`)
   - An advertiser represents a brand/company you're advertising for
   - The brand is resolved automatically from the domain during creation

2. **Conversion Events** (REQUIRED for performance campaigns)
   - Create tracking events: `POST /api/v2/buyer/advertisers/{advertiserId}/conversion-events`
   - Configure what actions to optimize for (purchases, signups, etc.)

3. **Creative Sets** (OPTIONAL)
   - Create creative container: `POST /api/v2/buyer/advertisers/{advertiserId}/creative-sets`
   - Add assets to it for ad delivery

---

## Core Concepts

| Concept | Description | Required For |
|---------|-------------|--------------|
| **Advertiser** | Top-level account representing a brand/company | Everything |
| **Campaign** | Advertising campaign with budget, dates, targeting | Running ads |
| **Creative Set** | Collection of creative assets | Ad delivery |
| **Conversion Event** | Trackable action (purchase, signup, etc.) | Performance campaigns |
| **Test Cohort** | A/B test configuration | Experimentation |
| **Media Buy** | Executed purchase record (within reporting hierarchy) | Reporting |

---

## First-Time Setup

If you're starting fresh with a new advertiser, follow these steps.

```
Step 1: Check if an advertiser already exists
GET /api/v2/buyer/advertisers
→ If advertisers exist, you can use one. If not, create one with a brandDomain (see Create Advertiser below).

Step 2: Create conversion events (for performance campaigns)
POST /api/v2/buyer/advertisers/{advertiserId}/conversion-events
{
  "name": "Purchase",
  "type": "PURCHASE",
  "description": "Completed purchase event"
}

Step 3: Now you can discover products and create campaigns!
```

---

## API Endpoints Reference

### Advertisers

#### List Advertisers
```http
GET /api/v2/buyer/advertisers?status=ACTIVE&name=Acme&includeBrand=true&take=50&skip=0
```

**Query Parameters (Filters):**
- `status` (optional): Filter by status - `ACTIVE` or `ARCHIVED`
- `name` (optional): Filter by name (case-insensitive, partial match). Example: `name=Acme` matches "Acme Corp", "acme inc", etc.
- `includeBrand` (optional, boolean): Include resolved brand information (full ADCP manifest, logos, colors, industry, tagline, tone) for each advertiser. Default: `false`. Pass `true` or `1` to include.
- `take` (optional): Results per page (default: 50, max: 250)
- `skip` (optional): Pagination offset (default: 0)

**Note:** `GET /api/v2/buyer/advertisers/{id}` (single advertiser) always returns full brand details — no need for `includeBrand`.

#### Get Advertiser
```http
GET /api/v2/buyer/advertisers/{id}
```

Returns the advertiser with full brand details (equivalent to `includeBrand=true` on the list endpoint).

**Response:**
```json
{
  "id": "34",
  "name": "Acme Corp",
  "description": null,
  "status": "ACTIVE",
  "createdAt": "2026-02-15T10:00:00Z",
  "updatedAt": "2026-02-15T10:00:00Z",
  "brandDomain": "acme.com",
  "brandWarning": null,
  "linkedBrand": {
    "id": "brand_123",
    "name": "Acme Corp",
    "domain": "acme.com",
    "manifest": {
      "name": "Acme Corp",
      "logos": [{ "url": "https://acme.com/logo.png", "tags": ["primary"] }],
      "colors": { "primary": "#FF5733" },
      "industry": "Technology",
      "tagline": "Innovation for Everyone",
      "tone": "professional"
    },
    "logoUrl": "https://acme.com/logo.png",
    "industry": "Technology",
    "colors": { "primary": "#FF5733" },
    "tagline": "Innovation for Everyone",
    "tone": "professional"
  }
}
```

**linkedBrand fields:**
- `id`: Brand agent ID (prefixed with `brand_`)
- `name`: Resolved brand name
- `domain`: Brand domain
- `manifest`: Full ADCP v2 brand manifest — includes logos, colors, fonts, tone, tagline, assets, product catalog, disclaimers, and more. This is the complete brand identity data.
- `logoUrl`: Primary logo URL (convenience field extracted from manifest)
- `industry`: Brand industry (convenience field)
- `colors`: Brand colors (convenience field)
- `tagline`: Brand tagline (convenience field)
- `tone`: Brand tone (convenience field)

#### Create Advertiser

**⚠️ IMPORTANT: `brandDomain` is required when creating an advertiser.**

When a user asks to create an advertiser:

1. **Ask for the name** - "What would you like to name your advertiser?"
2. **Ask for the brand domain** - "What is the brand's website domain? (e.g., nike.com)"
3. **Create the advertiser** with name and brandDomain

The system resolves the brand via Addie (AdCP registry + Brandfetch enrichment). If the brand is found only via enrichment (not yet registered), the create **fails** with a `VALIDATION_ERROR`. The error response includes `error.details.enrichedBrand` containing the brand data that was found (name, domain, manifest with logos, colors, industry, tagline, tone, etc.).

**When this error occurs, you MUST do BOTH of the following:**

1. **ALWAYS show the enriched brand data first.** Present `error.details.enrichedBrand` to the user — show the brand name, domain, industry, colors, logo URL, tagline, tone, and any other fields present. This lets the user confirm the right brand was found.
2. **Then explain next steps.** Tell them this brand needs to be registered before an advertiser can be created. Direct them to register at https://adcontextprotocol.org/chat.html or https://agenticadvertising.org/brand, then retry.

If no brand data is found at all (no enrichment results), the create also fails — tell the user to register their brand first.

```http
POST /api/v2/buyer/advertisers
{
  "name": "Acme Corp",
  "brandDomain": "acme.com",
  "description": "Global advertising account"
}
```

**Response** includes `brandDomain`, `linkedBrand`, and optional `brandWarning` (e.g., if data came from Brandfetch enrichment rather than a well-known manifest).

#### Update Advertiser
```http
PUT /api/v2/buyer/advertisers/{id}
{
  "name": "Acme Corporation",
  "description": "Updated description",
  "brandDomain": "newbrand.com"
}
```

**Optional fields:** `name`, `description`, `brandDomain`

If `brandDomain` is provided, the system resolves the new brand domain and updates the linked brand agent.

---

### Campaigns

The API supports three campaign types with **type-specific endpoints**:

| Type | Create Endpoint | Update Endpoint | Prerequisites |
|------|-----------------|-----------------|---------------|
| `discovery` | `POST /campaigns/discovery` | `PUT /campaigns/discovery/{id}` | Advertiser + **bundleId (required)** |
| `performance` | `POST /campaigns/performance` | `PUT /campaigns/performance/{id}` | Advertiser + performanceConfig.objective |
| `audience` | `POST /campaigns/audience` | `PUT /campaigns/audience/{id}` | **Not implemented (501)** |

**IMPORTANT**: Each campaign type has its own create and update endpoints. You cannot create a campaign at the generic `/campaigns` endpoint.

For full step-by-step workflows, see the Discovery Campaign Workflow and Performance Campaign Workflow sections above.

#### List Campaigns
```http
GET /api/v2/buyer/campaigns?advertiserId=12345&type=discovery&status=ACTIVE
```

**Query Parameters:**
- `advertiserId` (optional): Filter by advertiser
- `type` (optional): `discovery`, `audience`, or `performance`
- `status` (optional): `DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`, `ARCHIVED`

#### Get Campaign
```http
GET /api/v2/buyer/campaigns/{campaignId}
```

#### Create Discovery Campaign
```http
POST /api/v2/buyer/campaigns/discovery
{
  "advertiserId": "12345",
  "name": "Q1 CTV Bundle",
  "bundleId": "abc123-def456-ghi789",
  "productIds": ["prod_123", "prod_456"],
  "flightDates": {
    "startDate": "2025-02-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z"
  },
  "budget": {
    "total": 50000,
    "currency": "USD"
  },
  "brief": "<<< ALWAYS include the ENTIRE brief from the client — never summarize or truncate >>>"
}
```

**Required fields:**
- `advertiserId`: Advertiser ID
- `name`: Campaign name (1-255 chars)
- `bundleId`: Bundle ID from `POST /bundles` **(required)**
- `flightDates`: Start and end dates
- `budget`: Total and currency

**Optional fields:**
- `productIds`: Product IDs to pre-select from the bundle
- `constraints.channels`: Target channels (display, olv, ctv, social)
- `constraints.countries`: Target countries (ISO 3166-1 alpha-2 codes)
- `brief`: Campaign brief. **MUST be the ENTIRE brief from the client — never summarize or truncate.**

#### Update Discovery Campaign
```http
PUT /api/v2/buyer/campaigns/discovery/{campaignId}
{
  "name": "Updated Campaign Name",
  "budget": {
    "total": 75000
  },
  "productIds": ["prod_789"]
}
```
All fields are optional. Campaign must be of type "discovery".

---

#### Create Performance Campaign
```http
POST /api/v2/buyer/campaigns/performance
{
  "advertiserId": "12345",
  "name": "Q1 ROAS Campaign",
  "flightDates": {
    "startDate": "2025-02-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z"
  },
  "budget": {
    "total": 100000,
    "currency": "USD"
  },
  "performanceConfig": {
    "objective": "ROAS",
    "goals": {
      "targetRoas": 4.0
    }
  },
  "constraints": {
    "channels": ["ctv", "display"],
    "countries": ["US"]
  }
}
```

**Required fields:**
- `advertiserId`: Advertiser ID
- `name`: Campaign name (1-255 chars)
- `flightDates`: Start and end dates
- `budget`: Total and currency
- `performanceConfig.objective`: One of `ROAS`, `CONVERSIONS`, `LEADS`, `SALES`

#### Update Performance Campaign
```http
PUT /api/v2/buyer/campaigns/performance/{campaignId}
{
  "name": "Updated Campaign Name",
  "performanceConfig": {
    "goals": {
      "targetRoas": 5.0
    }
  }
}
```
All fields are optional. Campaign must be of type "performance".

---

#### Create Audience Campaign (Not Implemented)
```http
POST /api/v2/buyer/campaigns/audience
```
**Returns 501 Not Implemented** - Audience campaigns are not yet available.

#### Update Audience Campaign (Not Implemented)
```http
PUT /api/v2/buyer/campaigns/audience/{campaignId}
```
**Returns 501 Not Implemented** - Audience campaigns are not yet available.

#### Execute Campaign (Launch)
```http
POST /api/v2/buyer/campaigns/{campaignId}/execute
```
Transitions campaign from DRAFT to ACTIVE.

#### Pause Campaign
```http
POST /api/v2/buyer/campaigns/{campaignId}/pause
```

---

### Bundles

#### Create Bundle
```http
POST /api/v2/buyer/bundles
{
  "advertiserId": "12345",
  "channels": ["ctv", "display"],
  "countries": ["US", "CA"],
  "brief": "<<< ALWAYS include the ENTIRE brief from the client here — never summarize >>>",
  "budget": 50000,
  "flightDates": {
    "startDate": "2025-02-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z"
  }
}
```

**Request Parameters:**
- `advertiserId` (required): Advertiser ID to resolve brand manifest
- `channels` (optional): Channels to search (defaults to ["display", "olv", "ctv", "social"]). Accepted values: display, olv, ctv, social, video (alias for olv).
- `countries` (optional): Target countries (defaults to brand agent countries)
- `brief` (optional): Natural language context for product search. **MUST be the ENTIRE brief from the client — never summarize or truncate.**
- `flightDates` (optional): Flight dates for availability filtering
- `budget` (optional): Budget for budget context
- `salesAgentIds` (optional, array): Filter products by exact sales agent ID(s). These are stored and used as defaults when discovering products for this bundle.
- `salesAgentNames` (optional, array): Filter products by sales agent name(s) (case-insensitive substring match). These are stored and used as defaults when discovering products for this bundle.

**Response:** `{ "bundleId": "abc123-def456-ghi789" }`

#### Discover Products (Auto-Creates Bundle)

Creates a bundle and discovers products in one call.

```http
POST /api/v2/buyer/bundles/discover-products
{
  "advertiserId": "12345",
  "channels": ["ctv", "display"],
  "countries": ["US"],
  "brief": "<<< ALWAYS include the ENTIRE brief from the client here — never summarize >>>",
  "publisherDomain": "example",
  "salesAgentNames": ["Acme Ad Exchange"]
}
```

**Filtering Parameters:**
- `publisherDomain` (optional): Filter by publisher domain (exact domain component match)
- `salesAgentIds` (optional, array): Filter by exact sales agent ID(s)
- `salesAgentNames` (optional, array): Filter by sales agent name(s) (case-insensitive substring match)

#### Discover Products for Existing Bundle
```http
GET /api/v2/buyer/bundles/{bundleId}/discover-products?groupLimit=10&groupOffset=0&productsPerGroup=5
```

**Query Parameters (Pagination):**
- `groupLimit` (optional): Max product groups (default: 10, max: 50)
- `groupOffset` (optional): Groups to skip (default: 0)
- `productsPerGroup` (optional): Max products per group (default: 5, max: 50)
- `productOffset` (optional): Products to skip within each group (default: 0)

**Query Parameters (Filtering):**
- `publisherDomain` (optional): Filter by publisher domain (exact component match). "hulu" matches "hulu.com" but "hul" does not
- `salesAgentIds` (optional, comma-separated): Filter by sales agent ID(s)
- `salesAgentNames` (optional, comma-separated): Filter by sales agent name(s) (case-insensitive substring match)

Filters can be combined. Example: `?publisherDomain=example&salesAgentNames=Acme Ad Exchange`

**Response:**
```json
{
  "bundleId": "abc123-def456-ghi789",
  "productGroups": [
    {
      "groupId": "group-0",
      "groupName": "Publisher Name",
      "products": [
        {
          "productId": "product_123",
          "name": "Premium CTV Inventory",
          "publisher": "example.com",
          "channel": "ctv",
          "cpm": 12.50,
          "salesAgentId": "agent_456"
        }
      ],
      "productCount": 5,
      "totalProducts": 20,
      "hasMoreProducts": true
    }
  ],
  "totalGroups": 25,
  "hasMoreGroups": true,
  "summary": {
    "totalProducts": 150,
    "publishersCount": 25,
    "priceRange": { "min": 5.0, "max": 25.0, "avg": 12.5 }
  },
  "budgetContext": {
    "sessionBudget": 50000,
    "allocatedBudget": 0,
    "remainingBudget": 50000
  }
}
```

**Pagination:**
- `hasMoreGroups`: Use `groupOffset` to fetch more groups
- `hasMoreProducts`: Use `productOffset` to fetch more products within a group
- To paginate products for a single group, combine `productOffset` with a filter (`salesAgentIds` or `salesAgentNames`) to isolate that group

#### Add Products to Bundle
```http
POST /api/v2/buyer/bundles/{bundleId}/products
{
  "products": [
    {
      "productId": "product_123",
      "salesAgentId": "agent_456",
      "groupId": "ctx_123-group-0",
      "groupName": "Publisher Name",
      "cpm": 12.50,
      "budget": 5000
    }
  ]
}
```

**Required per product:** `productId`, `salesAgentId`, `groupId`, `groupName`
**Optional per product:** `cpm`, `budget`

**Response:**
```json
{
  "bundleId": "abc123-def456-ghi789",
  "products": [
    {
      "productId": "product_123",
      "salesAgentId": "agent_456",
      "cpm": 12.50,
      "budget": 5000,
      "selectedAt": "2025-02-01T10:00:00Z",
      "groupId": "ctx_123-group-0",
      "groupName": "Publisher Name"
    }
  ],
  "totalProducts": 1,
  "budgetContext": {
    "sessionBudget": 50000,
    "allocatedBudget": 5000,
    "remainingBudget": 45000
  }
}
```

#### Get Bundle Products
```http
GET /api/v2/buyer/bundles/{bundleId}/products
```

Response format same as Add Products.

#### Remove Products from Bundle
```http
DELETE /api/v2/buyer/bundles/{bundleId}/products
{
  "productIds": ["product_123", "product_456"]
}
```

Response format same as Add Products (with updated list).

---

### Conversion Events

Required for performance campaigns to track and optimize conversions.

#### List Conversion Events
```http
GET /api/v2/buyer/advertisers/{advertiserId}/conversion-events
```

#### Create Conversion Event
```http
POST /api/v2/buyer/advertisers/{advertiserId}/conversion-events
{
  "name": "Purchase",
  "type": "PURCHASE",
  "description": "Completed purchase event",
  "value": 100,
  "currency": "USD"
}
```

**Event Types:** `PURCHASE`, `SIGNUP`, `LEAD`, `PAGE_VIEW`, `ADD_TO_CART`, `CUSTOM`

#### Get Conversion Event
```http
GET /api/v2/buyer/advertisers/{advertiserId}/conversion-events/{id}
```

#### Update Conversion Event
```http
PUT /api/v2/buyer/advertisers/{advertiserId}/conversion-events/{id}
{
  "name": "High-Value Purchase",
  "value": 200
}
```

---

### Test Cohorts

For A/B testing campaign variations.

#### List Test Cohorts
```http
GET /api/v2/buyer/advertisers/{advertiserId}/test-cohorts
```

#### Create Test Cohort
```http
POST /api/v2/buyer/advertisers/{advertiserId}/test-cohorts
{
  "name": "Q1 Creative Test",
  "description": "Testing new vs old creatives",
  "splitPercentage": 50
}
```

---

### Creative Sets

#### List Creative Sets
```http
GET /api/v2/buyer/advertisers/{advertiserId}/creative-sets
```

#### Create Creative Set
```http
POST /api/v2/buyer/advertisers/{advertiserId}/creative-sets
{
  "name": "Q1 Video Creatives",
  "type": "video"
}
```

#### Add Asset to Creative Set
```http
POST /api/v2/buyer/advertisers/{advertiserId}/creative-sets/{creativeSetId}/assets
{
  "assetUrl": "https://example.com/video.mp4",
  "name": "Hero Video 30s",
  "type": "video",
  "duration": 30
}
```

#### Remove Asset
```http
DELETE /api/v2/buyer/advertisers/{advertiserId}/creative-sets/{creativeSetId}/assets/{assetId}
```

---

### Reporting

#### Get Reporting Metrics
```http
GET /api/v2/buyer/reporting/metrics?view=summary&days=7&advertiserId=12345&campaignId=campaign_abc
```

Returns reporting data in one of two views: **summary** (hierarchical breakdown) or **timeseries** (daily aggregation).

**Query Parameters:**
- `view` (optional): Response format — `summary` (default) or `timeseries`
  - `summary`: Hierarchical breakdown by advertiser → campaign → media buy → package
  - `timeseries`: Daily date-level metric aggregation
- `days` (optional): Number of days to include (default: 7, max: 90). Ignored if both startDate and endDate are provided
- `startDate` (optional): Start date in ISO format (YYYY-MM-DD)
- `endDate` (optional): End date in ISO format (YYYY-MM-DD)
- `advertiserId` (optional): Filter by advertiser ID
- `campaignId` (optional): Filter by campaign ID
- `demo` (optional, boolean): When `true`, returns auto-generated demo data instead of querying real data sources. Default: `false`. Useful for testing and previewing the reporting UI without live campaign data.

**Summary Response** (`view=summary`, default):
```json
{
  "advertisers": [
    {
      "advertiserId": "12345",
      "advertiserName": "Acme Corp",
      "metrics": { "impressions": 15000, "spend": 750, "clicks": 300, "views": 1500, "completedViews": 1200, "conversions": 75, "leads": 30, "videoCompletions": 1125, "ecpm": 50, "cpc": 2.5, "ctr": 0.02, "completionRate": 0.8 },
      "campaigns": [
        {
          "campaignId": "campaign_abc",
          "campaignName": "Summer Campaign",
          "metrics": { "..." : "..." },
          "mediaBuys": [
            {
              "mediaBuyId": "mb_1",
              "name": "Media Buy One",
              "status": "ACTIVE",
              "metrics": { "..." : "..." },
              "packages": [
                { "packageId": "pkg_1", "metrics": { "..." : "..." } }
              ]
            }
          ]
        }
      ]
    }
  ],
  "totals": { "impressions": 35000, "spend": 1750 },
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31"
}
```

**Timeseries Response** (`view=timeseries`):
```json
{
  "timeseries": [
    {
      "date": "2025-01-01",
      "metrics": { "impressions": 5000, "spend": 250, "clicks": 100, "views": 500, "completedViews": 400, "conversions": 25, "leads": 10, "videoCompletions": 375, "ecpm": 50, "cpc": 2.5, "ctr": 0.02, "completionRate": 0.8 }
    },
    {
      "date": "2025-01-02",
      "metrics": { "..." : "..." }
    }
  ],
  "totals": { "impressions": 35000, "spend": 1750 },
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-07"
}
```

**Metrics included:** impressions, spend, clicks, views, completedViews, conversions, leads, videoCompletions, ecpm, cpc, ctr, completionRate

---

### Sales Agents

Browse available sales agents and register accounts to connect with them.

#### List Sales Agents

List all sales agents visible to the buyer. Shows all non-DISABLED agents. Results are paginated.

```http
GET /api/v2/buyer/sales-agents?status=ACTIVE&relationship=MARKETPLACE&limit=20&offset=0
```

**Query Parameters (all optional):**
- `status` (string): Filter by status — `PENDING`, `ACTIVE`
- `relationship` (string): Filter by relationship — `SELF` (owned by you), `MARKETPLACE` (all other marketplace agents)
- `name` (string): Filter by agent name (partial match, case-insensitive)
- `limit` (number): Maximum number of agents to return per page (default: 20)
- `offset` (number): Number of agents to skip for pagination (default: 0)

**Response:**
```json
{
  "data": {
    "items": [
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
    ],
    "total": 25,
    "hasMore": true
  }
}
```

**Pagination:** Use `offset` + `limit` to page through results. When `hasMore` is true, fetch the next page with `offset` increased by `limit`.

**Notes:**
- All non-DISABLED agents are visible to everyone
- PENDING agents from other owners appear as `"status": "COMING_SOON"` with minimal info
- `customerAccounts` lists the caller's own accounts (excludes marketplace accounts)
- `requiresAccount` is true when the agent supports per-account registration and the caller has no accounts
- `accountPolicy` shows the agent's allowed account types
- `oauth` field is present for owner's PENDING OAUTH agents that haven't completed the OAuth flow

**Display Requirements — ALWAYS include when listing sales agents:**
- `accountPolicy`: Show what account types each agent supports (advertiser_account, marketplace_account)
- `customerAccounts`: Show the caller's registered accounts for each agent
- `requiresAccount`: Highlight agents that require account registration
- Group agents by status (ACTIVE first, then COMING_SOON)
- For each agent, clearly indicate: name, status, account policy, number of caller's accounts, and whether registration is needed

#### Register Sales Agent Account

Register an account for a sales agent under a specific advertiser. This connects the buyer's advertiser to the agent.

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

**Path Parameters:**
- `agentId` (string): The agent ID

**Required Fields:**
- `advertiserId` (string): The advertiser seat ID (BUYER seat) to connect this account for
- `accountIdentifier` (string): Unique account identifier for this agent

**Optional Fields:**
- `auth` (object): Authentication credentials. Required for API_KEY/JWT agents, not needed for OAUTH agents.
- `marketplaceAccount` (boolean): Admin-only flag for marketplace accounts

**OAUTH agents:** Do NOT ask the user for any OAuth credentials (client_id, client_secret, tokens, etc.). Just omit the `auth` field. The response will include an `oauth.authorizationUrl` — present this link to the user to complete authorization. The platform handles discovery, client registration, and token exchange automatically.

**Response (non-OAUTH, 201):**
```json
{
  "id": "123",
  "accountIdentifier": "my-publisher-account",
  "status": "ACTIVE",
  "registeredBy": "user@example.com",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

**Response (OAUTH, 201):**
```json
{
  "id": "123",
  "accountIdentifier": "my-publisher-account",
  "status": "PENDING",
  "registeredBy": "user@example.com",
  "createdAt": "2026-01-15T10:00:00Z",
  "oauth": {
    "authorizationUrl": "https://agent.example.com/authorize?client_id=abc&...",
    "agentId": "agent_abc123",
    "agentName": "Agent Name"
  }
}
```

**Notes:**
- Agent must be ACTIVE before accounts can be registered
- For OAUTH agents, the account is created with PENDING status and includes an `authorizationUrl` for the user to click
- After the user authorizes, the account status changes to ACTIVE automatically

---

### Signals (for Audience Campaigns)

#### Discover Signals
```http
POST /api/v2/buyer/campaign/signals/discover
```

Discover available signals for audience targeting. Audience campaigns are not yet implemented (returns 501), but you can browse available signals.

#### List Saved Signals
```http
GET /api/v2/buyer/signals
```

Returns signals that have been saved to your account.

---

## Error Handling

All errors follow this format:
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
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
| `NOT_FOUND` | 404 | Verify resource ID exists |
| `CONFLICT` | 409 | Resource already exists (e.g., brand) |
| `RATE_LIMITED` | 429 | Wait and retry |

---

## Common Mistakes to Avoid

1. **Creating campaign without advertiser** — Always create/verify advertiser first
2. **Discovery campaign without bundleId** — You MUST create a bundle first via `POST /bundles` or `POST /bundles/discover-products`
3. **Skipping product selection** — You MUST add products to the bundle via `POST /bundles/{id}/products` BEFORE creating a discovery campaign
4. **Expecting products from POST /bundles** — `POST /bundles` only returns bundleId; use `GET /bundles/{id}/discover-products` to get product suggestions
5. **Performance campaign without conversion events** — System needs events to optimize
6. **Adding products to performance campaigns** — Performance campaigns handle inventory selection automatically; don't pass product/signal selections
7. **Forgetting to execute** — Campaigns start in DRAFT status; must call `POST /campaigns/{id}/execute`
8. **Wrong endpoint path** — Always use `/api/v2/buyer/` prefix
9. **Creating advertiser without brandDomain** — `brandDomain` is required. If brand resolution fails, tell the user to register their brand at https://adcontextprotocol.org/chat.html or https://agenticadvertising.org/brand first
10. **Choosing performance when user wants to browse/select inventory** — If the user wants to see products or pick publishers, that's **discovery**, not performance
11. **Defaulting to a campaign type without asking** — When the user says "create a campaign" without specifying a type, ALWAYS ask them to choose
12. **Fabricating field values** — NEVER guess or make up values for required fields. Always ask the user or use values from previous API responses
