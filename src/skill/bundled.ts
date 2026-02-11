/**
 * Bundled skill.md content for each persona
 * These are updated at build time by scripts/bundle-skill.ts
 * Used as fallback when fetching from API fails
 */

import type { Persona } from '../types';

export const bundledBuyerSkillMd = `---
name: scope3-agentic-buyer
version: "2.0.0"
description: Scope3 Agentic Buyer API - AI-powered programmatic advertising
api_base_url: https://api.agentic.scope3.com/api/v2/buyer
auth:
  type: bearer
  header: Authorization
  format: "Bearer {token}"
  obtain_url: https://app.agentic.scope3.com/settings/api-keys
---

# Scope3 Agentic Buyer API

This API enables AI-powered programmatic advertising with inventory discovery, campaign management, and creative orchestration.

**Important**: This is a REST API accessed via the \`api_call\` tool. After reading this documentation, use \`api_call\` to make HTTP requests to the endpoints below.

## ⚠️ CRITICAL: Exact Field Names Required

**DO NOT GUESS FIELD NAMES.** Use these exact camelCase names:

| Field | Type | Notes |
|-------|------|-------|
| \`advertiserId\` | string | NOT \`advertiser_id\` |
| \`flightDates\` | **object** | NOT \`startDate\`/\`endDate\` at root level |
| \`flightDates.startDate\` | string | ISO 8601: \`"2026-02-05T00:00:00Z"\` |
| \`flightDates.endDate\` | string | ISO 8601: \`"2026-02-10T23:59:59Z"\` |
| \`budget\` | **object** | NOT a number |
| \`budget.total\` | number | e.g., \`1000\` |
| \`budget.currency\` | string | \`"USD"\` (default) |
| \`constraints\` | object | Optional |
| \`constraints.channels\` | array | e.g., \`["display"]\`, \`["ctv"]\` |
| \`performanceConfig\` | object | Required for \`type: "performance"\` |

## Quick Start

1. **Use \`api_call\` tool**: All operations go through the generic \`api_call\` tool
2. **Base path**: All endpoints start with \`/api/v2/buyer/\`
3. **Authentication**: Handled automatically by the MCP session

### Quick Campaign Creation (Minimal Fields)

To create a discover campaign, these fields are **required**:

\`\`\`
Step 1: Get your advertiser ID
GET /api/v2/advertisers
→ Note the advertiser ID from the response

Step 2: Create the campaign
POST /api/v2/campaigns
{
  "advertiserId": "<advertiser_id_from_step_1>",
  "name": "My Campaign",
  "flightDates": {
    "startDate": "2026-02-05T00:00:00Z",
    "endDate": "2026-02-10T23:59:59Z"
  },
  "budget": {
    "total": 1000,
    "currency": "USD"
  },
  "constraints": {
    "channels": ["display"]
  }
}
\`\`\`

**CRITICAL - Use EXACT field names:**
- \`advertiserId\` (string) - NOT "advertiser_id"
- \`name\` (string)
- \`flightDates\` (object) - NOT "schedule", "dates", "startDate/endDate" at root
  - \`flightDates.startDate\` (ISO 8601 datetime)
  - \`flightDates.endDate\` (ISO 8601 datetime)
- \`budget\` (object) - NOT "totalBudget", "amount"
  - \`budget.total\` (number)
  - \`budget.currency\` (string, default "USD")
- \`constraints.channels\` (array) - e.g., \`["display"]\`, \`["ctv"]\`, \`["video"]\`

**Note:** The campaign type defaults to \`bundle\`. Products can be added later via \`POST /api/v2/campaigns/{id}/products\`.

**Important:** If the advertiser has a linked brand with a manifest URL, the system will automatically discover available products when the campaign is created.

---

## Browsing Products Without a Campaign

**When a user wants to browse products without mentioning a campaign:**

Users may want to explore available inventory before committing to a campaign. Use \`POST /bundles/discover-products\` which:
- Creates a bundle automatically if no bundleId is provided
- Discovers products based on the advertiser's context
- Returns both the bundleId and discovered products

**Interactive flow:**
1. **Browse products** - Call \`POST /bundles/discover-products\` with advertiser context
   - Returns bundleId (auto-created if needed) and product groups
   - Save the bundleId for later use
2. **Present products** - Show available inventory in a user-friendly way
3. **Add products to the bundle** - When the user likes products, add them via \`POST /bundles/{id}/products\`
4. **Create campaign later** - When ready, create a campaign with the bundleId via \`POST /campaigns/bundle\`

**Example request:**
\`\`\`http
POST /api/v2/buyer/bundles/discover-products
{
  "advertiserId": "12345",
  "channels": ["ctv", "display"],
  "countries": ["US"],
  "brief": "Looking for premium sports content",
  "publisherDomain": "espn"
}
\`\`\`

**Request Parameters (Filtering):**
- \`publisherDomain\` (optional): Filter products by publisher domain (exact domain component match). Example: "espn" matches "espn.com", "www.espn.com" but "esp" does not match

**Example response:**
\`\`\`json
{
  "bundleId": "abc123-def456",
  "productGroups": [...],
  "totalGroups": 25,
  "hasMoreGroups": true,
  "summary": { "totalProducts": 150, "publishersCount": 25 }
}
\`\`\`

**Key benefit:** Users can explore inventory without the overhead of creating bundles manually. The bundleId is returned so they can continue building their selection.

---

## CRITICAL: Entity Hierarchy & Prerequisites

Before creating campaigns, you MUST understand the entity hierarchy:

\`\`\`
Customer (your account)
  └── Advertiser (brand account - REQUIRED first)
        ├── Campaigns (advertising campaigns)
        ├── Creative Sets (ad creatives)
        ├── Conversion Events (for performance tracking)
        └── Test Cohorts (for A/B testing)
\`\`\`

### Setup Checklist

**Before you can run a campaign, you need:**

1. **Advertiser** (REQUIRED)
   - First, check if one exists: \`GET /api/v2/buyer/advertisers\`
   - If not, create one: \`POST /api/v2/buyer/advertisers\`
   - An advertiser represents a brand/company you're advertising for

2. **Conversion Events** (REQUIRED for performance campaigns)
   - Create tracking events: \`POST /api/v2/buyer/advertisers/{advertiserId}/conversion-events\`
   - Configure what actions to optimize for (purchases, signups, etc.)

3. **Creative Sets** (OPTIONAL)
   - Create creative container: \`POST /api/v2/buyer/advertisers/{advertiserId}/creative-sets\`
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
| **Media Buy** | Executed purchase record | Reporting |

## Creating Campaigns

There are **three campaign types**. When a user asks to create a campaign, present these options and let them choose:

| Type | Description | When to Use | Status |
|------|-------------|-------------|--------|
| **Bundle** | Select specific products/inventory from a curated bundle | User wants control over specific inventory selections (premium placements, specific publishers) | ✅ Available |
| **Performance** | System auto-optimizes inventory based on objective | User wants system to optimize for business outcomes (ROAS, conversions, leads, sales) | ✅ Available |
| **Audience** | Target specific audience signals | User wants to target specific audience segments | ❌ Not yet implemented |

**Recommended flow when user says "create a campaign":**
1. Ask: "What type of campaign would you like to create? You have three options:
   - **Bundle**: You choose the specific ad inventory/products
   - **Performance**: System automatically optimizes for your goal (ROAS, conversions, etc.)
   - **Audience**: Target specific audience signals (not yet available)"
2. Based on their choice, follow the appropriate workflow below

### Bundle Campaign Creation

**When to use:** User wants control over which specific inventory/products to include.

**Prerequisites:** Advertiser exists

**CRITICAL: Interactive Flow Required**

When a user asks to create a bundle campaign, follow this interactive flow:

1. **Create the bundle** - Call \`POST /bundles\` with the user's parameters
2. **STOP and guide the user** - Do NOT immediately create the campaign. Instead:
   - Explain that you've started building their campaign bundle
   - Offer to show them available inventory: "Would you like me to show you the available inventory?"
3. **Discover products together** - Call \`GET /bundles/{id}/discover-products\` and present results
   - Show product groups, publishers, channels, and price ranges in a user-friendly way
4. **Select products interactively** - Ask which products they want to add
   - Call \`POST /bundles/{id}/products\` with their selections
   - Show the updated bundle with selected products and budget allocation
5. **Confirm readiness** - "Your bundle has X products selected with $Y allocated. Ready to create the campaign?"
6. **Only then create the campaign** - Call \`POST /campaigns/bundle\` with the bundleId
7. **Launch** - Call \`POST /campaigns/{campaignId}/execute\`

**Why this matters:** Bundles give users control over their inventory selection. Skipping product discovery means they lose that control.

**IMPORTANT:** Do NOT expose API details to the user. Communicate conversationally about campaigns, inventory, products, and budgets—not about endpoints or HTTP methods.

See "Workflow 2: Bundle-First Campaign Creation" below for detailed request/response examples.

### Performance Campaign Creation

**When to use:** User wants system to optimize for business outcomes automatically.

**Prerequisites:** Advertiser exists + Conversion events configured

**Required field:** \`performanceConfig.objective\` (one of: ROAS, CONVERSIONS, LEADS, SALES)

**Steps:**
1. Verify advertiser: \`GET /advertisers\`
2. Check conversion events: \`GET /advertisers/{id}/conversion-events\`
3. Create campaign: \`POST /campaigns/performance\`
4. Launch: \`POST /campaigns/{campaignId}/execute\`

See "Workflow 3: Create a Performance Campaign" below for detailed request/response examples.

### Audience Campaign Creation

**Status:** ❌ Not yet implemented - returns 501 Not Implemented

---

## Complete Workflows

### Workflow 1: First-Time Setup

If you're starting fresh with a new advertiser, follow these steps.

\`\`\`
Step 1: Check if an advertiser already exists
GET /api/v2/buyer/advertisers
→ If advertisers exist, you can use one. If not, create one (see Create Advertiser below).

Step 2: Create conversion events (for performance campaigns)
POST /api/v2/buyer/advertisers/{advertiserId}/conversion-events
{
  "name": "Purchase",
  "type": "PURCHASE",
  "description": "Completed purchase event"
}

Step 3: Now you can discover products and create campaigns!
\`\`\`

---

### Workflow 2: Bundle-First Campaign Creation

This workflow allows you to create a product bundle before committing to a campaign. The bundle acts as a collection of selected products.

\`\`\`
Step 1: Create an empty bundle
POST /api/v2/buyer/bundles
{
  "advertiserId": "12345",
  "channels": ["ctv", "display"],
  "countries": ["US", "CA"],
  "brief": "Premium video inventory for tech enthusiasts",
  "budget": 50000,
  "flightDates": {
    "startDate": "2025-02-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z"
  }
}
→ Returns bundleId only
→ Save the bundleId for the next steps!

Step 2: Discover available products for the bundle
GET /api/v2/buyer/bundles/{bundleId}/discover-products
→ Returns productGroups
→ Review products and note which to add

Step 3: Add selected products to the bundle
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
→ Adds products to the bundle selection
→ Only selected products will be used when creating a campaign

Step 4: Create campaign with the bundle
POST /api/v2/buyer/campaigns/bundle
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
    "currency": "USD",
    "pacing": "EVEN"
  }
}
→ bundleId (required) attaches the bundle to the campaign
→ Campaign uses products that were selected in Step 3

Step 5: Launch the campaign
POST /api/v2/buyer/campaigns/{campaignId}/execute
→ Activates the campaign
\`\`\`

**Bundle Product Management:**
- \`GET /bundles/{id}/products\` - List selected products in the bundle
- \`POST /bundles/{id}/products\` - Add products to the bundle
- \`DELETE /bundles/{id}/products\` - Remove products from the bundle

**Key Points:**
- Create bundle → Discover products → Select products → Create campaign → Execute
- Products must be added to the bundle BEFORE creating the campaign
- Only products selected via \`POST /bundles/{id}/products\` are used
- The bundle stores the product selection until you create a campaign

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

### Workflow 3: Create a Performance Campaign

Performance campaigns optimize for specific business outcomes (ROAS, conversions, etc.). The system handles inventory selection automatically based on your objectives and constraints.

**Key Difference from Bundle Campaigns:** Performance campaigns do NOT require manual product or signal selection - you define the objective and the system optimizes automatically.

**Prerequisites:**
- Advertiser exists
- Conversion events configured (tells system what to optimize for)

\`\`\`
Step 1: Verify advertiser exists (filter by status and name)
GET /api/v2/buyer/advertisers?status=ACTIVE&name={advertiserName}

Step 2: Check/create conversion events
GET /api/v2/buyer/advertisers/{advertiserId}/conversion-events
# If empty, create one:
POST /api/v2/buyer/advertisers/{advertiserId}/conversion-events
{
  "name": "Purchase",
  "type": "PURCHASE"
}

Step 3: Create performance campaign with objective and constraints
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
→ performanceConfig.objective is required

Step 4: Launch
POST /api/v2/buyer/campaigns/{campaignId}/execute
\`\`\`

### Workflow 4: Create an Audience Campaign

**NOTE**: Audience campaigns are not yet implemented and will return 501 Not Implemented.

Audience campaigns will target specific audience signals once implemented.

\`\`\`
Step 1: Discover available signals
POST /api/v2/buyer/campaign/signals/discover
{
  "filters": {
    "catalogTypes": ["marketplace"]
  }
}
→ Returns signals available for targeting

Step 2: Create audience campaign with selected signals (NOT YET IMPLEMENTED)
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
→ Returns 501 Not Implemented

Step 3: Launch (once audience campaigns are implemented)
POST /api/v2/buyer/campaigns/{campaignId}/execute
\`\`\`

---

## API Endpoints Reference

### Advertisers

#### List Advertisers
\`\`\`http
GET /api/v2/buyer/advertisers?status=ACTIVE&name=Acme&take=50&skip=0
\`\`\`

**Query Parameters (Filters):**
- \`status\` (optional): Filter by status - \`ACTIVE\` or \`ARCHIVED\`
- \`name\` (optional): Filter by name (case-insensitive, partial match). Example: \`name=Acme\` matches "Acme Corp", "acme inc", etc.
- \`take\` (optional): Results per page (default: 50, max: 250)
- \`skip\` (optional): Pagination offset (default: 0)

#### Create Advertiser

**⚠️ IMPORTANT: Follow this interactive flow before calling this endpoint.**

When a user asks to create an advertiser, **DO NOT immediately call the API**:

1. **Ask for the name** - "What would you like to name your advertiser?"
2. **Check for existing brands** - Call \`GET /api/v2/buyer/brands\`
3. **Offer to link a brand** - If brands exist, ask: "Would you like to link one of these brands? Linking enables product discovery."
4. **Create the advertiser** with the user's chosen name
5. **Link the brand** if selected via \`PUT /api/v2/buyer/advertisers/{id}/brand\`

⚠️ Without a linked brand, the advertiser cannot discover products or create bundle campaigns.

\`\`\`http
POST /api/v2/buyer/advertisers
{
  "name": "Acme Corp",
  "description": "Global advertising account"
}
\`\`\`

#### Update Advertiser
\`\`\`http
PUT /api/v2/buyer/advertisers/{id}
{
  "name": "Acme Corporation",
  "description": "Updated description"
}
\`\`\`

---

### Brands

Brands exist at the customer level and can be linked to advertisers.

#### List Brands
\`\`\`http
GET /api/v2/buyer/brands?status=ACTIVE&name=Acme&take=50&skip=0
\`\`\`

**Query Parameters (Filters):**
- \`status\` (optional): Filter by status - \`ACTIVE\` or \`ARCHIVED\`
- \`name\` (optional): Filter by name (case-insensitive, partial match). Example: \`name=Acme\` matches "Acme Brand", "acme inc", etc.
- \`take\` (optional): Results per page (default: 50, max: 250)
- \`skip\` (optional): Pagination offset (default: 0)

#### Get Linked Brand
Get the brand linked to an advertiser.
\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/brand
\`\`\`

#### Link Brand to Advertiser
Link a brand to an advertiser. Brands must be created first via the Brand API.
\`\`\`http
PUT /api/v2/buyer/advertisers/{advertiserId}/brand
{
  "brandId": "brand_123"
}
\`\`\`

**Notes:**
- An advertiser can only have one linked brand at a time
- To change the brand, unlink the current one first

#### Unlink Brand from Advertiser
Remove the brand link from an advertiser.
\`\`\`http
DELETE /api/v2/buyer/advertisers/{advertiserId}/brand
\`\`\`

---

### Campaigns

The API supports three campaign types with **type-specific endpoints**:

| Type | Create Endpoint | Update Endpoint | Prerequisites |
|------|-----------------|-----------------|---------------|
| \`bundle\` | \`POST /campaigns/bundle\` | \`PUT /campaigns/bundle/{id}\` | Advertiser + **bundleId (required)** |
| \`performance\` | \`POST /campaigns/performance\` | \`PUT /campaigns/performance/{id}\` | Advertiser + performanceConfig.objective |
| \`audience\` | \`POST /campaigns/audience\` | \`PUT /campaigns/audience/{id}\` | **Not implemented (501)** |

**IMPORTANT**: Each campaign type has its own create and update endpoints. You cannot create a campaign at the generic \`/campaigns\` endpoint.

**IMPORTANT for Bundle campaigns**:
- **REQUIRED**: Call \`POST /bundles\` first to get a \`bundleId\`, then create campaign with that bundle
- You cannot create a bundle campaign without a bundleId

**Performance campaigns**: Require \`performanceConfig.objective\` (ROAS, CONVERSIONS, LEADS, or SALES).

**Audience campaigns**: Not yet implemented - will return 501 Not Implemented.

---

#### Create Bundle (Pre-Campaign)

Creates an empty bundle. Product discovery is done separately via GET /bundles/{id}/discover-products.

\`\`\`http
POST /api/v2/buyer/bundles
{
  "advertiserId": "12345",
  "channels": ["ctv", "display"],
  "countries": ["US", "CA"],
  "brief": "Premium video inventory for tech enthusiasts",
  "budget": 50000,
  "flightDates": {
    "startDate": "2025-02-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z"
  }
}
\`\`\`

**Request Parameters:**
- \`advertiserId\` (required): Advertiser ID to resolve brand manifest
- \`channels\` (optional): Channels to search (defaults to ["display", "olv", "ctv"])
- \`countries\` (optional): Target countries (defaults to brand agent countries)
- \`brief\` (optional): Natural language context for product search
- \`flightDates\` (optional): Flight dates for availability filtering
- \`budget\` (optional): Budget for budget context

**Response:**
\`\`\`json
{
  "bundleId": "abc123-def456-ghi789"
}
\`\`\`

**Important:** Save the \`bundleId\` to discover products and add them to the bundle.

---

#### Discover Products for Bundle

Discovers available products for an existing bundle.

\`\`\`http
GET /api/v2/buyer/bundles/{bundleId}/discover-products?groupLimit=10&groupOffset=0&productsPerGroup=5&publisherDomain=hulu
\`\`\`

**Path Parameters:**
- \`bundleId\` (required): Bundle ID from POST /bundles

**Query Parameters (Pagination):**
- \`groupLimit\` (optional): Maximum number of product groups to return (default: 10, max: 50)
- \`groupOffset\` (optional): Number of groups to skip for pagination (default: 0)
- \`productsPerGroup\` (optional): Maximum products to return per group (default: 5, max: 50). Increase this to see more products in each group when \`hasMoreProducts\` is true.

**Query Parameters (Filtering):**
- \`publisherDomain\` (optional): Filter products by publisher domain (exact domain component match). Example: "hulu" matches "hulu.com", "www.hulu.com", "hulu.tv" but "hul" does not match

**Response:**
\`\`\`json
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
      "productCount": 5
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
\`\`\`

**Pagination Notes:**
- \`totalGroups\`: Total number of product groups available
- \`hasMoreGroups\`: If true, use \`groupOffset\` to fetch more groups
- \`productCount\`: Number of products in each group (controlled by \`productsPerGroup\` parameter)

**Pagination Example:**

To paginate through all product groups:
\`\`\`
# Page 1 - First 10 groups
GET /api/v2/buyer/bundles/{bundleId}/discover-products?groupLimit=10&groupOffset=0

# Page 2 - Next 10 groups
GET /api/v2/buyer/bundles/{bundleId}/discover-products?groupLimit=10&groupOffset=10

# Continue until hasMoreGroups is false
\`\`\`

To see more products within a group, increase \`productsPerGroup\`:
\`\`\`
# Show up to 20 products per group
GET /api/v2/buyer/bundles/{bundleId}/discover-products?productsPerGroup=20
\`\`\`

---

#### Add Products to Bundle

Adds products to a bundle. Products must have been discovered via \`GET /bundles/{id}/discover-products\` first.

\`\`\`http
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
\`\`\`

**Path Parameters:**
- \`bundleId\` (required): Bundle ID

**Request Body:**
- \`products\` (required): Array of products to add
  - \`productId\` (required): Product ID from discover-products
  - \`salesAgentId\` (required): Sales agent ID from the product
  - \`groupId\` (required): Group ID where the product was discovered
  - \`groupName\` (required): Name of the group
  - \`cpm\` (optional): CPM for the product
  - \`budget\` (optional): Budget allocation for this product

**Response:**
\`\`\`json
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
\`\`\`

---

#### Get Bundle Products

Gets the list of products selected for a bundle.

\`\`\`http
GET /api/v2/buyer/bundles/{bundleId}/products
\`\`\`

**Path Parameters:**
- \`bundleId\` (required): Bundle ID

**Response:** Same format as Add Products response.

---

#### Remove Products from Bundle

Removes products from a bundle.

\`\`\`http
DELETE /api/v2/buyer/bundles/{bundleId}/products
{
  "productIds": ["product_123", "product_456"]
}
\`\`\`

**Path Parameters:**
- \`bundleId\` (required): Bundle ID

**Request Body:**
- \`productIds\` (required): Array of product IDs to remove

**Response:** Same format as Add Products response (with updated products list).

---

#### List Campaigns
\`\`\`http
GET /api/v2/buyer/campaigns?advertiserId=12345&type=bundle&status=ACTIVE
\`\`\`

**Query Parameters:**
- \`advertiserId\` (optional): Filter by advertiser
- \`type\` (optional): \`bundle\`, \`audience\`, or \`performance\`
- \`status\` (optional): \`DRAFT\`, \`ACTIVE\`, \`PAUSED\`, \`COMPLETED\`, \`ARCHIVED\`

#### Get Campaign
\`\`\`http
GET /api/v2/buyer/campaigns/{campaignId}
\`\`\`

#### Create Bundle Campaign
\`\`\`http
POST /api/v2/buyer/campaigns/bundle
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
  "brief": "Optional campaign brief"
}
\`\`\`

**Required fields:**
- \`advertiserId\`: Advertiser ID
- \`name\`: Campaign name (1-255 chars)
- \`bundleId\`: Bundle ID from \`POST /bundles\` **(required)**
- \`flightDates\`: Start and end dates
- \`budget\`: Total and currency

**Optional fields:**
- \`productIds\`: Product IDs to pre-select from the bundle
- \`constraints.channels\`: Target channels (ctv, display, olv, audio)
- \`constraints.countries\`: Target countries (ISO 3166-1 alpha-2 codes)
- \`brief\`: Campaign brief

#### Update Bundle Campaign
\`\`\`http
PUT /api/v2/buyer/campaigns/bundle/{campaignId}
{
  "name": "Updated Campaign Name",
  "budget": {
    "total": 75000
  },
  "productIds": ["prod_789"]
}
\`\`\`
All fields are optional. Campaign must be of type "bundle".

---

#### Create Performance Campaign
\`\`\`http
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
\`\`\`

**Required fields:**
- \`advertiserId\`: Advertiser ID
- \`name\`: Campaign name (1-255 chars)
- \`flightDates\`: Start and end dates
- \`budget\`: Total and currency
- \`performanceConfig.objective\`: One of \`ROAS\`, \`CONVERSIONS\`, \`LEADS\`, \`SALES\`

#### Update Performance Campaign
\`\`\`http
PUT /api/v2/buyer/campaigns/performance/{campaignId}
{
  "name": "Updated Campaign Name",
  "performanceConfig": {
    "goals": {
      "targetRoas": 5.0
    }
  }
}
\`\`\`
All fields are optional. Campaign must be of type "performance".

---

#### Create Audience Campaign (Not Implemented)
\`\`\`http
POST /api/v2/buyer/campaigns/audience
\`\`\`
**Returns 501 Not Implemented** - Audience campaigns are not yet available.

#### Update Audience Campaign (Not Implemented)
\`\`\`http
PUT /api/v2/buyer/campaigns/audience/{campaignId}
\`\`\`
**Returns 501 Not Implemented** - Audience campaigns are not yet available.

#### Execute Campaign (Launch)
\`\`\`http
POST /api/v2/buyer/campaigns/{campaignId}/execute
\`\`\`
Transitions campaign from DRAFT to ACTIVE.

#### Pause Campaign
\`\`\`http
POST /api/v2/buyer/campaigns/{campaignId}/pause
\`\`\`

---

### Conversion Events

Required for performance campaigns to track and optimize conversions.

#### List Conversion Events
\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/conversion-events
\`\`\`

#### Create Conversion Event
\`\`\`http
POST /api/v2/buyer/advertisers/{advertiserId}/conversion-events
{
  "name": "Purchase",
  "type": "PURCHASE",
  "description": "Completed purchase event",
  "value": 100,
  "currency": "USD"
}
\`\`\`

**Event Types:** \`PURCHASE\`, \`SIGNUP\`, \`LEAD\`, \`PAGE_VIEW\`, \`ADD_TO_CART\`, \`CUSTOM\`

#### Get Conversion Event
\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/conversion-events/{id}
\`\`\`

#### Update Conversion Event
\`\`\`http
PUT /api/v2/buyer/advertisers/{advertiserId}/conversion-events/{id}
{
  "name": "High-Value Purchase",
  "value": 200
}
\`\`\`

---

### Test Cohorts

For A/B testing campaign variations.

#### List Test Cohorts
\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/test-cohorts
\`\`\`

#### Create Test Cohort
\`\`\`http
POST /api/v2/buyer/advertisers/{advertiserId}/test-cohorts
{
  "name": "Q1 Creative Test",
  "description": "Testing new vs old creatives",
  "splitPercentage": 50
}
\`\`\`

---

### Creative Sets

#### List Creative Sets
\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/creative-sets
\`\`\`

#### Create Creative Set
\`\`\`http
POST /api/v2/buyer/advertisers/{advertiserId}/creative-sets
{
  "name": "Q1 Video Creatives",
  "type": "video"
}
\`\`\`

#### Add Asset to Creative Set
\`\`\`http
POST /api/v2/buyer/advertisers/{advertiserId}/creative-sets/{creativeSetId}/assets
{
  "assetUrl": "https://example.com/video.mp4",
  "name": "Hero Video 30s",
  "type": "video",
  "duration": 30
}
\`\`\`

#### Remove Asset
\`\`\`http
DELETE /api/v2/buyer/advertisers/{advertiserId}/creative-sets/{creativeSetId}/assets/{assetId}
\`\`\`

---

### Reporting

#### Get Reporting
\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/reporting?days=7
\`\`\`

**Query Parameters:**
- \`days\` (optional): Number of days to include (default: 7, max: 90)
- \`startDate\` (optional): Start date in ISO format (YYYY-MM-DD)
- \`endDate\` (optional): End date in ISO format (YYYY-MM-DD)
- \`campaignId\` (optional): Filter by campaign ID
- \`mediaBuyId\` (optional): Filter by media buy ID

**Response:** \`{ dailyMetrics: [{ date, impressions, clicks, spend }], totals: { impressions, clicks, spend }, periodStart, periodEnd }\`

---

### Media Buys

View executed purchases.

#### List Media Buys
\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/media-buys?campaignId=cmp_123
\`\`\`

#### Get Media Buy
\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/media-buys/{mediaBuyId}
\`\`\`

---

### Signals (for Audience Campaigns)

#### Discover Signals
\`\`\`http
POST /api/v2/buyer/campaign/signals/discover
\`\`\`

Discover available signals before creating a campaign. See "Discover Signals (Pre-Campaign)" above for details.

#### List Saved Signals
\`\`\`http
GET /api/v2/buyer/signals
\`\`\`

Returns signals that have been saved to your account.

---

## Error Handling

All errors follow this format:
\`\`\`json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
\`\`\`

| Code | HTTP Status | Resolution |
|------|-------------|------------|
| \`VALIDATION_ERROR\` | 400 | Check request body against schema |
| \`UNAUTHORIZED\` | 401 | Verify API key/auth |
| \`ACCESS_DENIED\` | 403 | Check permissions |
| \`NOT_FOUND\` | 404 | Verify resource ID exists |
| \`CONFLICT\` | 409 | Resource already exists (e.g., brand) |
| \`RATE_LIMITED\` | 429 | Wait and retry |

---

## Common Mistakes to Avoid

1. **Creating campaign without advertiser** - Always create/verify advertiser first
2. **Bundle campaign without bundleId** - You MUST call \`POST /bundles\` first and use the returned \`bundleId\` when creating the campaign
3. **Creating campaign without adding products** - You MUST add products to the bundle via \`POST /bundles/{id}/products\` BEFORE creating the campaign
4. **Expecting products from POST /bundles** - POST /bundles only returns bundleId; call \`GET /bundles/{id}/discover-products\` to get product suggestions
5. **Performance campaign without conversion events** - System needs events to optimize
6. **Adding products/signals to performance campaigns** - Performance campaigns don't need them; the system handles inventory selection automatically based on your objective
7. **Forgetting to execute** - Campaigns start in DRAFT status, must call \`/execute\`
8. **Wrong endpoint path** - Always use \`/api/v2/buyer/\` prefix
9. **Calling execute without products** - Must add products to the bundle before executing
`;

export const bundledBrandSkillMd = `---
name: scope3-agentic-brand
version: "2.0.0"
description: Scope3 Agentic Brand API - Brand identity and manifest management
api_base_url: https://api.agentic.scope3.com/api/v2/brand
auth:
  type: bearer
  header: Authorization
  format: "Bearer {token}"
  obtain_url: https://app.agentic.scope3.com/settings/api-keys
---

# Scope3 Agentic Brand API

This API enables management of brand identity and manifests for AI-powered programmatic advertising.

**Important**: This is a REST API accessed via the \`api_call\` tool. After reading this documentation, use \`api_call\` to make HTTP requests to the endpoints below.

## Quick Start

1. **Use \`api_call\` tool**: All operations go through the generic \`api_call\` tool
2. **Base path**: All endpoints start with \`/api/v2/brand/\`
3. **Authentication**: Handled automatically by the MCP session

---

## Core Concepts

### What is a Brand?

A **Brand** represents the identity of a company or product for advertising purposes. Brands exist at the **customer level** - they are NOT nested under advertisers.

### Brand Manifest

A brand manifest is a JSON document (conforming to ADCP v2) that describes everything about a brand's identity:
- **Name and URL** - Brand name and website
- **Logos** - Logo images with tags and dimensions
- **Colors** - Primary, secondary, accent, background, and text colors
- **Fonts** - Typography choices and font file URLs
- **Tone** - Voice and communication style
- **Tagline** - Brand slogan
- **Assets** - Images, videos, audio files
- **Product Catalog** - Product feed configuration
- **Disclaimers** - Legal text requirements
- **Contact** - Contact information

### Entity Hierarchy

\`\`\`
Customer (your account)
  ├── Brands (at customer level)
  │     └── Brand identity configuration (manifest)
  │
  └── Advertisers
        ├── Campaigns
        ├── Creative Sets
        └── Conversion Events
\`\`\`

---

## Endpoints Reference

### List Brands

List all brands for the current customer.

\`\`\`
GET /api/v2/brand/brands
\`\`\`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| \`take\` | number | Number of results to return (max 250, default 50) |
| \`skip\` | number | Number of results to skip for pagination |

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": "brand_123",
      "name": "Acme Corp",
      "manifestUrl": "https://storage.googleapis.com/...",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-20T14:45:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "take": 50,
    "skip": 0,
    "hasMore": false
  }
}
\`\`\`

---

### Get Brand

Retrieve a specific brand by ID.

\`\`\`
GET /api/v2/brand/brands/{brandId}
\`\`\`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| \`brandId\` | string | Brand ID (e.g., \`brand_123\`) |

**Response:**
\`\`\`json
{
  "data": {
    "id": "brand_123",
    "name": "Acme Corp",
    "manifestUrl": "https://storage.googleapis.com/...",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-20T14:45:00Z"
  }
}
\`\`\`

---

### Create Brand

Create a new brand with either a manifest URL or manifest JSON.

\`\`\`
POST /api/v2/brand/brands
\`\`\`

**Request Body (Option 1 - Manifest URL):**
\`\`\`json
{
  "manifestUrl": "https://example.com/brand-manifest.json"
}
\`\`\`

**Request Body (Option 2 - Manifest JSON):**
\`\`\`json
{
  "manifestJson": {
    "name": "Acme Corporation",
    "url": "https://www.acme.com",
    "logos": [
      {
        "url": "https://acme.com/logo.png",
        "tags": ["primary", "square"],
        "width": 512,
        "height": 512
      }
    ],
    "colors": {
      "primary": "#FF5733",
      "secondary": "#3366FF",
      "text": "#333333",
      "background": "#FFFFFF"
    },
    "fonts": {
      "primary": "Roboto",
      "secondary": "Open Sans"
    },
    "tone": "Professional, friendly, and innovative",
    "tagline": "Innovation for Everyone",
    "industry": "Technology",
    "target_audience": "Small business owners aged 25-45"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "data": {
    "id": "brand_123",
    "name": "Acme Corporation",
    "manifestUrl": "https://storage.googleapis.com/...",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
\`\`\`

---

### Update Brand

Update an existing brand's manifest.

\`\`\`
PUT /api/v2/brand/brands/{brandId}
\`\`\`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| \`brandId\` | string | Brand ID |

**Request Body:**
Same as Create Brand - provide either \`manifestUrl\` or \`manifestJson\`.

**Response:**
\`\`\`json
{
  "data": {
    "id": "brand_123",
    "name": "Acme Corporation",
    "manifestUrl": "https://storage.googleapis.com/...",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-20T14:45:00Z"
  }
}
\`\`\`

---

### Delete Brand

Delete a brand.

\`\`\`
DELETE /api/v2/brand/brands/{brandId}
\`\`\`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| \`brandId\` | string | Brand ID |

**Response:**
HTTP 204 No Content (success, no body)

---

## Complete Workflows

### Workflow 1: Create a New Brand

\`\`\`
Step 1: Create brand with manifest JSON
POST /api/v2/brand/brands
{
  "manifestJson": {
    "name": "My Brand",
    "url": "https://mybrand.com",
    "colors": {
      "primary": "#FF0000",
      "secondary": "#0000FF"
    },
    "tone": "Casual and fun",
    "tagline": "Making life easier"
  }
}
→ Save the brand ID from response
\`\`\`

### Workflow 2: Update Brand Identity

\`\`\`
Step 1: List brands to find the one to update
GET /api/v2/brand/brands

Step 2: Get current brand details
GET /api/v2/brand/brands/{brandId}
→ Review current manifest

Step 3: Update with new manifest
PUT /api/v2/brand/brands/{brandId}
{
  "manifestJson": {
    "name": "My Brand - Updated",
    "colors": {
      "primary": "#00FF00"
    },
    "tagline": "New and improved!"
  }
}
\`\`\`

---

## Brand Manifest Schema

The full brand manifest JSON schema includes:

| Field | Type | Description |
|-------|------|-------------|
| \`name\` | string | **Required.** Brand name |
| \`url\` | string | Brand website URL |
| \`logos\` | array | Array of logo objects with url, tags, width, height |
| \`colors\` | object | Color palette (primary, secondary, accent, background, text) |
| \`fonts\` | object | Typography (primary, secondary, font_urls) |
| \`tone\` | string | Brand voice and tone description |
| \`tagline\` | string | Brand slogan |
| \`assets\` | array | Brand assets (images, videos, audio) |
| \`product_catalog\` | object | Product feed configuration |
| \`disclaimers\` | array | Legal disclaimers |
| \`industry\` | string | Industry or sector |
| \`target_audience\` | string | Target audience description |
| \`contact\` | object | Contact information (email, phone, website) |
| \`metadata\` | object | Manifest metadata (version, dates) |

---

## Error Handling

All endpoints return standard error responses:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "field": "manifestUrl",
      "issue": "Invalid URL format"
    }
  }
}
\`\`\`

### Common Error Codes

| Code | Description |
|------|-------------|
| \`VALIDATION_ERROR\` | Invalid request parameters |
| \`UNAUTHORIZED\` | Authentication required |
| \`NOT_FOUND\` | Brand not found |
| \`INTERNAL_ERROR\` | Server error |

---

## Common Mistakes to Avoid

1. **Providing both manifestUrl and manifestJson** - Only provide one
2. **Missing required field** - Brand name is required in manifestJson
3. **Invalid color format** - Colors must be hex format (#RRGGBB)
4. **Invalid URL format** - URLs must be valid HTTP/HTTPS URLs
`;

export const bundledPartnerSkillMd = `---
name: scope3-agentic-partner
version: "2.0.0"
description: Scope3 Agentic Partner API - Publisher and seller integrations
api_base_url: https://api.agentic.scope3.com/api/v2/partner
auth:
  type: bearer
  header: Authorization
  format: "Bearer {token}"
  obtain_url: https://app.agentic.scope3.com/settings/api-keys
---

# Scope3 Agentic Partner API

This API enables publishers and sellers to integrate with the Scope3 Agentic platform.

**Important**: This is a REST API accessed via the \`api_call\` tool. After reading this documentation, use \`api_call\` to make HTTP requests to the endpoints below.

## Current Status

The Partner API v2 is currently in early development. Full partner endpoints (tactics, media buys, webhooks, segment management) will be added in future releases.

## Quick Start

1. **Use \`api_call\` tool**: All operations go through the generic \`api_call\` tool
2. **Base path**: All endpoints start with \`/api/v2/partner/\`
3. **Authentication**: Handled automatically by the MCP session

---

## Available Endpoints

### Health Check

Verify the API is running and responsive.

\`\`\`http
GET /api/v2/partner/health
\`\`\`

**Response:**
\`\`\`json
{
  "status": "healthy",
  "version": "2.0.0",
  "apiVersion": "v2-partner",
  "timestamp": "2025-01-20T14:45:00Z"
}
\`\`\`

---

## Coming Soon

The following features are planned for future releases:

### Tactic Management
- Create and manage advertising tactics
- Configure targeting parameters
- Set pricing and availability

### Media Buy Integration
- Receive media buy notifications
- Confirm or reject media buys
- Report delivery status

### Segment Management
- Create audience segments
- Attach data to segments
- Manage segment availability

### Webhooks
- Configure webhook endpoints
- Receive real-time notifications
- Track delivery events

### Reporting
- Access performance metrics
- Revenue reporting
- Fill rate analytics

---

## Error Handling

All errors follow this format:
\`\`\`json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
\`\`\`

| Code | HTTP Status | Resolution |
|------|-------------|------------|
| \`VALIDATION_ERROR\` | 400 | Check request body against schema |
| \`UNAUTHORIZED\` | 401 | Verify API key/auth |
| \`ACCESS_DENIED\` | 403 | Check permissions |
| \`NOT_FOUND\` | 404 | Verify resource ID exists |
| \`RATE_LIMITED\` | 429 | Wait and retry |

---

## Need Help?

For questions about the Partner API or to request early access to new features, contact your Scope3 account representative.
`;

export const bundledAt = '2026-02-10T00:00:00.000Z';

/**
 * Get bundled skill.md for a persona
 */
export function getBundledSkillMd(persona: Persona = 'buyer'): string {
  switch (persona) {
    case 'buyer':
      return bundledBuyerSkillMd;
    case 'brand':
      return bundledBrandSkillMd;
    case 'partner':
      return bundledPartnerSkillMd;
    default:
      return bundledBuyerSkillMd;
  }
}
