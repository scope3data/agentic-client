/**
 * Bundled skill.md content for each persona
 * These are updated at build time by scripts/bundle-skill.ts
 * Used as fallback when fetching from API fails
 */

import type { Persona } from '../types';

export const bundledBuyerSkillMd = `
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

**Important**: This is a REST API accessed via the \`api_call\` tool. After reading this documentation, use \`api_call\` to make HTTP requests to the endpoints below.

## ⚠️ CRITICAL: Presentation Rules

**Tool responses return JSON data.** For most endpoints (advertisers, sales agents, campaigns, etc.), YOU are responsible for presenting the data clearly in your message. Follow the Display Requirements for each endpoint — they tell you exactly what fields to show and how to structure the output. Never summarize into vague prose — always show the specific data points listed in the display requirements for each item.

**Exception: Product discovery and reporting endpoints render interactive UI components.** When those tools return a UI, display it as-is — do not generate your own competing visualization.

## ⚠️ CRITICAL: Always Use ask_about_capability Before api_call

**Before making ANY \`api_call\`, you MUST first call \`ask_about_capability\`** to learn the correct endpoint, field names, query parameters, and **display requirements**. Do NOT guess or assume any API details — always verify first.

**Required workflow for every API operation:**
1. Call \`ask_about_capability\` with a question about what you want to do (e.g., "How do I list sales agents and what should I show?", "How do I list advertisers?", "How do I create a campaign?")
2. Read the response to learn the exact endpoints, parameters, field names, **and what information you must present to the user**
3. Only then call \`api_call\` with the verified information

**Never skip this step.** Even for simple GET requests like listing sales agents or advertisers, always check \`ask_about_capability\` first. Responses contain critical fields (account status, credential requirements, linked accounts) that you MUST present to the user — not just names.

**Common mistake:** Listing sales agents or advertisers and only showing names. This is WRONG. You must show account status, credential requirements, linked accounts, and other operational details for each item.

## ⚠️ CRITICAL: Exact Field Names Required

**DO NOT GUESS FIELD NAMES.** Use these exact camelCase names:

| Field | Type | Notes |
|-------|------|-------|
| \`advertiserId\` | string | NOT \`advertiser_id\` |
| \`brand\` | string | Required on advertiser create (e.g., \`"nike.com"\`) |
| \`saveBrand\` | boolean | Optional on advertiser create. Set \`true\` to save an enriched brand to the registry |
| \`sandbox\` | boolean | Optional on advertiser create. When \`true\`, all ADCP operations use sandbox accounts (no real spend). Immutable after creation |
| \`optimizationApplyMode\` | string | \`"AUTO"\` or \`"MANUAL"\` (default \`"MANUAL"\`). Controls whether Scope3 AI model optimizations to media buys are applied automatically or require manual approval. Set on advertiser (default for all campaigns) or override per campaign. |
| \`flightDates\` | **object** | NOT \`startDate\`/\`endDate\` at root level |
| \`flightDates.startDate\` | string | ISO 8601: \`"2026-02-05T00:00:00Z"\` |
| \`flightDates.endDate\` | string | ISO 8601: \`"2026-02-10T23:59:59Z"\` |
| \`budget\` | **object** | NOT a number |
| \`budget.total\` | number | e.g., \`1000\` |
| \`budget.currency\` | string | \`"USD"\` (default) |
| \`constraints\` | object | Optional |
| \`constraints.channels\` | array | e.g., \`["display"]\`, \`["ctv"]\` |
| \`performanceConfig\` | object | Optional. Contains \`optimizationGoals\` array. Each goal has \`kind\` (\`"event"\` or \`"metric"\`). Event goals have \`eventSources\` array + optional \`target\`. Metric goals have \`metric\` + optional \`target\`. |

## ⚠️ CRITICAL: Always Send the ENTIRE Client Brief

**When sending a \`brief\` field to ANY endpoint, you MUST include the COMPLETE brief text the client provided — word for word, in full.** Do NOT summarize, truncate, paraphrase, or shorten the brief under any circumstances.

The brief is used by sales agents and the discovery system to match relevant inventory. Sending a partial or summarized brief degrades match quality and loses important context. Even if the brief is long, always pass it through in its entirety.

**Rules:**
- **Always include the brief** — if the client provided a brief, you MUST send it in every API call that accepts a \`brief\` field. Never omit it or leave it out.
- **Copy the full brief verbatim** — include every detail the client provided
- **Never summarize** — "Premium CTV for tech enthusiasts" is NOT an acceptable substitute for a multi-paragraph brief
- **Never truncate** — if the client gave you 500 words, send all 500 words
- **Applies everywhere \`brief\` is used** — product discovery, campaign creation, and any other endpoint that accepts a brief

## ⚠️ CRITICAL: Never Fabricate User Data

**Before making any API call that creates or modifies a resource, you MUST have explicit user input for all required fields.** Do NOT invent, guess, or auto-fill values the user hasn't provided.

**Rules:**
- **NEVER fabricate values** for required fields. If the user hasn't provided a value, ask for it.
- **Read-only calls are fine** — you can freely call GET endpoints to fetch data and present it to the user.
- **Confirm before mutating** — Before any POST, PUT, or DELETE call, verify you have user-provided (or user-confirmed) values for all required fields.
- **Inferring is OK when obvious** — If the user says "optimize for purchases with a 4x ROAS target", you can infer an event goal with \`eventType: "purchase"\` and \`target: { kind: "per_ad_spend", value: 4.0 }\`. But if intent is ambiguous, ask.
- **Never make up IDs** — IDs (advertiserId, discoveryId, campaignId, etc.) must come from previous API responses or the user. Never generate them.
- **Account IDs for linking MUST come from discovery** — When linking an agent account to an advertiser, the \`accountId\` MUST come from the \`GET /advertisers/{id}/accounts/available?partnerId={agentId}\` response. Even if the user tells you an account ID or name (e.g., "the account is named XYZ" or "the ID is 06cd7033..."), you MUST still call the discovery endpoint and use the \`accountId\` from the API response. If the account doesn't appear in the discovery results, it cannot be linked — tell the user it was not found. NEVER pretend to successfully link an account that was not returned by the discovery endpoint.
- **Only use what's documented** — Do NOT invent endpoints, fields, query parameters, or enum values that are not explicitly listed in this skill document. If you're unsure whether something exists, check this document first. If it's not here, don't use it.

---

## Notifications

The \`help\` and \`ask_about_capability\` tools include unread notifications in their responses. When a response contains a "Unread Notifications" section, summarize those notifications for the user before answering their question.

Notifications can be listed, marked as read, or acknowledged via the \`/api/v2/buyer/notifications\` endpoints — see the Notifications section below for details.

**Setup:** To receive notifications proactively at the start of every session, add this to your Claude Desktop Project instructions, CLAUDE.md, or system prompt: \`When using Scope3 tools, always start by calling the help tool. The response includes unread notifications — summarize those for the user before answering their question.\`

## Quick Start

1. **Use \`ask_about_capability\` first**: Ask about the user's request to learn the correct workflow, endpoints, and field names
2. **Use \`api_call\` to execute**: All operations go through the generic \`api_call\` tool
3. **Base path**: All endpoints start with \`/api/v2/buyer/\`
4. **Authentication**: Handled automatically by the MCP session

---

## Campaigns

Create an ad campaign via \`POST /campaigns\`. Campaigns are configured at creation or update time with:
- **Products**: Select products via the discovery endpoints (\`POST /discovery/discover-products\`, \`POST /discovery/{id}/products\`), then attach it via \`discoveryId\` at campaign creation or update.
- **Performance optimization**: Set via the \`performanceConfig\` field at campaign creation (\`POST /campaigns\`) or update (\`PUT /campaigns/{id}\`).
- **Audience targeting**: Target or suppress audiences via the \`audienceConfig\` field at campaign creation or update. Audiences are synced to the advertiser first via \`POST /audiences/sync\`.
- **Auto-select products (pick for me)**: Use \`POST /campaigns/{campaignId}/auto-select-products\` to let the system automatically choose products and allocate budget using AI. Requires a performance campaign with discovered products.

**⚠️ HARD RULE: One API Call Per Turn**

Only make ONE mutating or discovery API call per turn. After that call, present the results and END YOUR TURN. Do not paginate, re-discover, or chain additional calls — wait for the user to tell you what to do next.

**Required flow when user says "create a campaign":**
1. Collect campaign details: name, advertiser, budget, flight dates, brief, and any targeting constraints
2. Ask whether they want to target or suppress any audiences. If yes, list the advertiser's audiences (\`GET /advertisers/{accountId}/audiences\`) and let them choose. If the advertiser has no audiences, let the user know and offer: "You don't have any audiences synced yet. I can help you sync audiences to Scope3 — just ask me how to get started."
3. Ask if they want to attach a catalog — if yes, list their catalogs via \`GET /advertisers/{advertiserId}/catalogs\` and let them pick one
4. Ask how they'd like to configure: browse products (discovery) or set performance metrics
5. Based on their choice:
   - **Products**: Run discovery ONCE, present results, END YOUR TURN. The user drives what happens next.
   - **Performance**: Create the campaign with \`performanceConfig\`
6. Include \`audienceConfig\` if the user selected audiences in step 2
7. When ready, launch: \`POST /campaigns/{id}/execute\`

**Required fields for campaign creation:**
- \`advertiserId\` (number) — NOT \`advertiser_id\`
- \`name\` (string)
- \`flightDates\` (object) — NOT \`startDate\`/\`endDate\` at root level
  - \`flightDates.startDate\` (ISO 8601 datetime)
  - \`flightDates.endDate\` (ISO 8601 datetime)
- \`budget\` (object) — NOT a number
  - \`budget.total\` (number)
  - \`budget.currency\` (string, default \`"USD"\`)

**Optional fields at creation:**
- \`discoveryId\`: Attach an existing discovery session
- \`productIds\`: Product IDs to pre-select (requires discoveryId)
- \`performanceConfig\`: For performance optimization. Contains \`optimizationGoals\` array. Each goal has \`kind\` (\`"event"\` or \`"metric"\`). Event goals have \`eventSources\` array (each with \`eventSourceId\`, \`eventType\`, optional \`valueField\`) + optional \`target\` object (\`kind: "per_ad_spend"\` or \`kind: "cost_per"\` with \`value\`). Metric goals have \`metric\` string + optional \`target\`. Goals can include \`attributionWindow\` and \`priority\`.
- \`optimizationApplyMode\`: \`"AUTO"\` or \`"MANUAL"\` (default). Controls whether Scope3 AI model optimizations to media buys are applied automatically or require manual approval. Overrides the advertiser-level default.
- \`catalogId\` (number, optional): Attach a single catalog to the campaign. Only **one** catalog per campaign. The catalog must belong to the same advertiser. Get available catalogs via \`GET /advertisers/{advertiserId}/catalogs\`. When attached, the catalog is automatically included in product discovery requests — referenced by ID for agents that have the catalog syndicated, or sent inline (feed URL or items) otherwise.
- \`constraints.channels\`: Target channels (display, olv, ctv, social)
- \`constraints.countries\`: Target countries (ISO 3166-1 alpha-2 codes)
- \`brief\`: Campaign brief. **MUST be the ENTIRE brief from the client — never summarize or truncate.**
- \`audienceConfig\`: Audience targeting and suppression. Contains \`targetAudienceIds\` (audiences to **include**) and \`suppressAudienceIds\` (audiences to **exclude**). Audience IDs come from \`GET /advertisers/{accountId}/audiences\`.

---

## Browsing Products Before Creating a Campaign

**When a user wants to browse products but hasn't created a campaign yet:**

Users may want to explore available inventory before committing to a campaign. Use \`POST /discovery/discover-products\` which discovers products based on the advertiser's context and returns a \`discoveryId\` along with the discovered products.

**Interactive flow:**
1. **Discover products** — Call \`POST /discovery/discover-products\` with advertiser context
   - Returns \`discoveryId\` and product groups — save the \`discoveryId\` for later use
2. **Present products** — Show available inventory in a user-friendly way
3. **Select products** — When the user likes products, add them via \`POST /discovery/{id}/products\`
4. **Attach to a campaign** — Create a campaign with the \`discoveryId\` via \`POST /campaigns\`, or attach it to an existing campaign via \`PUT /campaigns/{id}\` with \`discoveryId\`

**Request Parameters (Filtering):**
- \`publisherDomain\` (optional): Filter products by publisher domain (exact domain component match). Example: "example" matches "example.com", "www.example.com" but "exampl" does not match
- \`salesAgentIds\` (optional, array): Filter products by exact sales agent ID(s). Use when you have agent IDs from a previous response.
- \`salesAgentNames\` (optional, array): Filter products by sales agent name(s) (case-insensitive match). Use when a user mentions specific sellers, partners, or exchanges by name.
- \`pricingModel\` (optional): Filter by pricing model (\`cpm\`, \`vcpm\`, \`cpc\`, \`cpcv\`, \`cpv\`, \`cpp\`, \`flat_rate\`). Use when a user wants inventory with a specific pricing type.

See the Campaign Workflow below for the full step-by-step with HTTP examples.

---

## Adding Products to a Campaign

**When the user wants to choose specific inventory:**

Product discovery and selection is done via the discovery endpoints. Discover products, select the ones you want, then attach them to the campaign.

1. **Discover products** — Use \`POST /discovery/discover-products\`
   - Show product groups, publishers, channels, and price ranges in a user-friendly way
2. **Present results and let the user choose** — Show the discovered products and ask which ones they want to add. Do NOT auto-select products for the user.
3. **Add their selections** — Call \`POST /discovery/{id}/products\` with the products the user chose
   - Show the updated product list and budget allocation
4. **Attach to campaign** — Create the campaign with \`discoveryId\` via \`POST /campaigns\`, or update an existing campaign via \`PUT /campaigns/{id}\` with \`discoveryId\`
5. **Confirm readiness** — "Your campaign has X products selected with $Y allocated. Ready to launch?"
6. **Launch** — Call \`POST /campaigns/{id}/execute\`

See the Discovery Workflow (Pre-Campaign Product Discovery) section below for the full step-by-step with HTTP examples.

### Setting Performance Optimization

**When the user wants the system to optimize for business outcomes:**

1. **Check conversion events** — Call \`GET /advertisers/{advertiserId}/events/summary\` with \`eventType: "conversion"\` to see what events are available for optimization
   - If none exist, help the user configure event sources first
   - **Note:** Event data is aggregated hourly. Newly reported events may take up to 1 hour to appear in the summary.
2. **Set performance config** — Include \`performanceConfig\` at campaign creation (\`POST /campaigns\`) or update (\`PUT /campaigns/{id}\`)
   - Required: \`optimizationGoals\` array with at least one goal object
   - Each goal has \`kind\` (\`"event"\` or \`"metric"\`)
   - Event goals: \`eventSources\` array (each with \`eventSourceId\`, \`eventType\`, optional \`valueField\`), optional \`target\` (\`kind: "per_ad_spend"\` or \`kind: "cost_per"\` with \`value\`), optional \`attributionWindow\`, optional \`priority\`
   - Metric goals: \`metric\` string, optional \`target\`, optional \`priority\`
3. **Launch** — Call \`POST /campaigns/{id}/execute\`

### Auto-Selecting Products (Pick For Me)

**When the user wants the system to choose products automatically:**

Instead of manually browsing and selecting products, performance campaigns can use auto-selection:

1. **Ensure products are discovered** — The campaign must have discovered products (via \`POST /discovery/discover-products\` or auto-discovery at campaign creation with \`performanceConfig\` + \`constraints.channels\`)
2. **Auto-select** — Call \`POST /campaigns/{campaignId}/auto-select-products\` (no request body needed)
   - The system uses AI to select the best products based on the campaign brief, budget, constraints, and optimization goals
   - Budget is allocated across selected products based on strategic fit
   - Any previous product selections in the discovery session are replaced
3. **Review selections** — Present the selected products, budget allocations, and rationale to the user
4. **Refine (optional)** — The user can adjust selections using existing discovery endpoints:
   - \`POST /discovery/{discoveryId}/products\` — Add products
   - \`DELETE /discovery/{discoveryId}/products\` — Remove products
   - Or call \`POST /campaigns/{campaignId}/auto-select-products\` again to re-select
5. **Launch** — When the user confirms, call \`POST /campaigns/{campaignId}/execute\`

**Response includes:**
- \`selectedProducts\`: Array of products with budget allocations
- \`budgetContext\`: Campaign budget vs allocated amount
- \`selectionRationale\`: AI-generated explanation of the selection strategy
- \`selectionMethod\`: \`"scoring"\`, \`"measurability"\`, or \`"cpm_heuristic"\`
- \`testBudgetPerProduct\`: Test budget allocated per product (when using measurability or scoring strategy)
- \`productCount\`: Number of products selected

---

## Discovery Workflow (Pre-Campaign Product Discovery)

**When to use:** User wants to browse, select, or control which specific inventory/products to include before or independently of campaign creation.

**Prerequisites:** Advertiser exists with a linked brand (set during advertiser creation via \`brand\`).

### Interactive Flow

Follow these steps in order. **Do NOT skip product discovery.**

**Step 1: Discover products**

\`\`\`http
POST /api/v2/buyer/discovery/discover-products
{
  "advertiserId": "12345",
  "channels": ["ctv", "display"],
  "countries": ["US"],
  "brief": "<<< ALWAYS include the ENTIRE brief from the client here — never summarize >>>",
  "salesAgentNames": ["Acme Ad Exchange"]
}
\`\`\`
→ Returns \`{ "discoveryId": "...", "productGroups": [...], "totalGroups": 25, "hasMoreGroups": true, "summary": { ... } }\`

Save the \`discoveryId\` for all subsequent steps.

**Step 2: Present results and END YOUR TURN**

Present the discovered products and END YOUR TURN. If \`hasMoreGroups: true\`, tell the user more are available.

To browse more products or apply filters, use:
\`\`\`http
GET /api/v2/buyer/discovery/{discoveryId}/discover-products?groupLimit=10&groupOffset=0&productsPerGroup=15
\`\`\`

**When discovery returns no products:**

A discovery response with 0 products is **not an error** — it means no products matched. Do NOT say "discovery failed." Do NOT speculate about why (e.g. "likely because X wasn't set up correctly" — you have no idea why, and guessing will be wrong and confusing). Just state the fact and offer these specific next steps:

1. **Add specificity** — Include budget, flight dates, specific channels (e.g. CTV, display), or audience targeting. Richer briefs give agents more to match against.
2. **Try different channels or geos** — The available inventory may not cover the requested combination.
3. **Reduce the ask** — If the brief is very narrow (e.g. a niche audience + specific publisher + tight budget), broadening one or more constraints often unlocks results.
4. **Try specific filters** — Filter by \`salesAgentNames\` or \`publisherDomain\` to target sellers known to have relevant inventory.

Example response when no products are returned:
> No products were returned for this brief. A few things that might help: adding a budget or flight dates, specifying channels (CTV, display, etc.), broadening the audience, or filtering by a specific seller. Want to try refining the brief?

**Explaining product relevance (IMPORTANT):**

Each product includes a \`briefRelevance\` field that explains WHY the product is a strategic fit for the campaign. When presenting products, you MUST:

1. **Lead with the "why"** — Don't just list product names and CPMs. For each product or product group, explain why it matters for THIS specific campaign. Use the \`briefRelevance\` text as your starting point but make it conversational.
2. **Connect products to the brief** — Reference the user's campaign goals, target audience, or brand context. Example: "These products from Magnite target family audiences with parenting and food-related segments — a direct match for your Fanta Meals campaign aimed at families."
3. **Highlight strategic differentiators** — Call out what makes a product stand out: guaranteed delivery, best-value CPM, audience segment alignment, or estimated reach. Don't bury these in a list.
4. **Group-level insight** — When presenting a sales agent's products, summarize what that agent brings to the table for this campaign. Don't just say "Products from Magnite Sales (5 products)" — say WHY Magnite Sales matters here.
5. **Skip empty relevance** — If a product has no \`briefRelevance\`, present it normally with its attributes. Don't fabricate relevance that doesn't exist.

**Bad example** (too basic):
> Magnite Sales has 5 products available: Americas Test Kitchen ($12 CPM, CTV), Rakuten TV ($8.50 CPM, CTV)...

**Good example** (explains why):
> Magnite Sales is a strong fit here — they offer family-targeting segments like "Parenting Babies and Toddlers" and "With Children" that align directly with your Fanta Meals audience. Their Americas Test Kitchen inventory puts your ads in a food/cooking context, and at $8.50–$12.00 CPM you're getting competitive rates with guaranteed delivery on several products.

### Filtering Product Discovery Results

When discovering products, these filters narrow results before grouping and pagination:

- \`publisherDomain\`: Filter by publisher website. Use when a user mentions a specific publisher or website.
  - Example: "hulu" matches "hulu.com", "www.hulu.com" but "hul" does not
- \`salesAgentIds\`: Filter by exact sales agent ID(s). Use when you have agent IDs from a previous response. Accepts multiple values.
- \`salesAgentNames\`: Filter by sales agent name(s) (case-insensitive substring match). Use when a user mentions specific sellers, partners, or exchanges by name. Accepts multiple values.
- \`pricingModel\`: Filter by pricing model. Use when a user asks about specific pricing types.
  - Valid values: \`cpm\`, \`vcpm\`, \`cpc\`, \`cpcv\`, \`cpv\`, \`cpp\`, \`flat_rate\`

Filters can be combined. Multiple values within a filter use OR logic (match any); different filters use AND logic.

**How to communicate filtering to users:**

Do NOT mention filter parameter names. Respond naturally:
- User: "What do you have from [agent name]?" → filter by salesAgentNames
- User: "Show me [publisher] inventory" → filter by publisherDomain
- User: "What does [agent name] have on [publisher]?" → filter by both salesAgentNames and publisherDomain
- User: "Show me inventory from [agent 1] and [agent 2]" → filter by salesAgentNames with both values
- User: "Show me CPM inventory" → filter by pricingModel=cpm
- User: "What flat rate options are there?" → filter by pricingModel=flat_rate
- User: "Who sells CTV inventory?" → show unfiltered results, then offer to narrow by seller

Each product group represents a sales agent. To focus on a specific agent's inventory, use the sales agent filter on subsequent requests.

**Step 3: Select products interactively**

Users can select products in two ways:
1. **Via the interactive card UI** — Users select product cards and click "Select". When this happens, you'll receive a message containing the discoveryId, productIds, and the exact \`POST /discovery/{id}/products\` API call to execute. The message will also ask you to prompt the user about per-product budgets. **Ask the user if they'd like to set individual budgets before executing the API call.** If they provide budgets, add a \`budget\` field to each product in the request body. If they decline, execute the call as-is without budgets. Do not re-discover products or look up IDs.
2. **Via conversation** — Users describe which products they want in natural language. The productId, salesAgentId, groupId, and groupName are included in the product listing from the discovery response — extract them from there to build the API call. Do not re-discover products to obtain IDs.

**Per-product budget:** Each product supports an optional \`budget\` field (number, in dollars). Ask about budgets before adding products — don't assume a budget if the user hasn't specified one.

**Bid price (REQUIRED for non-fixed pricing):** When a product's selected pricing option has \`isFixed: false\`, you MUST include \`bidPrice\` in the request body. Use the \`rate\` or \`floorPrice\` from the product's \`pricingOptions\` (from the discovery response) as the \`bidPrice\` value — do NOT ask the user for this. If \`isFixed: true\`, omit \`bidPrice\`.

\`\`\`http
POST /api/v2/buyer/discovery/{discoveryId}/products
{
  "products": [
    {
      "productId": "product_123",
      "salesAgentId": "agent_456",
      "groupId": "ctx_123-group-0",
      "groupName": "Publisher Name",
      "bidPrice": 12.50,
      "budget": 5000
    }
  ]
}
\`\`\`

Show the updated selection with selected products and budget allocation.

**Step 4: Confirm readiness**

"You have selected X products with $Y allocated. Ready to create the campaign?"

**Step 5: Create the campaign**

\`\`\`http
POST /api/v2/buyer/campaigns
{
  "advertiserId": "12345",
  "name": "Q1 2025 CTV Campaign",
  "discoveryId": "abc123-def456-ghi789",
  "flightDates": {
    "startDate": "2025-02-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z"
  },
  "budget": {
    "total": 50000,
    "currency": "USD"
  }
}
\`\`\`

**Step 6: Launch**

\`\`\`http
POST /api/v2/buyer/campaigns/{campaignId}/execute
\`\`\`

### Discovery Management

- \`GET /discovery/{id}/products\` — List selected products
- \`POST /discovery/{id}/products\` — Add products
- \`DELETE /discovery/{id}/products\` — Remove products (body: \`{ "productIds": ["..."] }\`)

**Summary:** Discover products → Select products → Create campaign → Execute

**IMPORTANT:** Do NOT expose API details to the user. Communicate conversationally about campaigns, inventory, products, and budgets — not about endpoints or HTTP methods.

---

## Performance Optimization Workflow

**When to use:** User wants the system to optimize for business outcomes automatically.

**Prerequisites:** Advertiser exists (with brand set during creation) + Event source configured.

**Step 1: Verify advertiser**
\`\`\`http
GET /api/v2/buyer/advertisers?status=ACTIVE&name={advertiserName}
\`\`\`

**Step 2: Check/create event source**

\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/event-sources
\`\`\`

If empty, create one:
\`\`\`http
POST /api/v2/buyer/advertisers/{advertiserId}/event-sources
{
  "eventSourceId": "website_pixel",
  "name": "Website Pixel",
  "eventTypes": ["purchase", "add_to_cart"]
}
\`\`\`

Save the \`eventSourceId\` — it's required for optimization goals.

**Step 3: Gather required fields from the user**

Before calling the create endpoint, confirm you have:
- Campaign name (ask the user or confirm a suggested name)
- Flight dates (start and end — ask the user)
- Budget total and currency (ask the user)
- Optimization goals: at least one goal with \`kind\` ("event" or "metric"). For event goals: event source ID (from Step 2), event type (e.g. \`purchase\`, \`lead\`), and optionally a \`target\` (e.g. \`kind: "per_ad_spend"\` for ROAS or \`kind: "cost_per"\` for CPA). For metric goals: \`metric\` string and optional \`target\`.
- Optional: constraints, attribution window, priority

**Step 4: Create the campaign with performanceConfig**
\`\`\`http
POST /api/v2/buyer/campaigns
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
    "optimizationGoals": [{
      "kind": "event",
      "eventSources": [
        { "eventSourceId": "es_abc123", "eventType": "purchase", "valueField": "value" }
      ],
      "target": { "kind": "per_ad_spend", "value": 4.0 },
      "attributionWindow": { "clickThrough": "7d" },
      "priority": 1
    }]
  },
  "constraints": {
    "channels": ["ctv", "display"],
    "countries": ["US"]
  }
}
\`\`\`

\`performanceConfig\` must include \`optimizationGoals\` array with at least one goal. Each goal has a \`kind\` discriminator: \`"event"\` goals require \`eventSources\` array (each with \`eventSourceId\` and \`eventType\`); \`"metric"\` goals require \`metric\` string. Both kinds support an optional \`target\` object (\`kind: "per_ad_spend"\` for ROAS targets, \`kind: "cost_per"\` for CPA targets, each with a \`value\`), \`attributionWindow\`, and \`priority\`.

**Step 5: Auto-select products (optional)**

If the campaign has discovered products (from auto-discovery at creation), let the system pick the best ones:
\`\`\`http
POST /api/v2/buyer/campaigns/{campaignId}/auto-select-products
\`\`\`
Returns selected products with budget allocations and AI-generated rationale. Present results and let the user review before launching.

**Step 6: Launch**
\`\`\`http
POST /api/v2/buyer/campaigns/{campaignId}/execute
\`\`\`

---

## Account Management

Some account management tasks are handled in the web UI at [agentic.scope3.com](https://agentic.scope3.com). Direct users to these pages for:

| Task | URL | Capabilities |
|------|-----|--------------|
| **API Keys** | [agentic.scope3.com/user-api-keys](https://agentic.scope3.com/user-api-keys) | Create, view, edit, delete, and reveal API key secrets |
| **Team Members** | [agentic.scope3.com/admin](https://agentic.scope3.com/admin) | Invite members, manage roles, manage advertiser access |
| **Billing** | Available from user menu in the UI | Manage payment methods, view invoices (via Stripe portal) |
| **Profile** | [agentic.scope3.com/user-info](https://agentic.scope3.com/user-info) | View and update user profile |

**Note:** Billing and member management require admin permissions.

### Current Account

Get the customer the authenticated user is currently operating in:

\`\`\`http
GET /api/v2/buyer/accounts/current
\`\`\`

Returns \`{ "id", "company", "name", "role" }\` where \`role\` is the user's normalized role (\`ADMIN\`, \`MEMBER\`, or \`SUPER_ADMIN\`).

### List Accounts

List all customers the authenticated user has active membership on:

\`\`\`http
GET /api/v2/buyer/accounts
\`\`\`

Returns \`{ "accounts": [{ "id", "company", "name", "role" }] }\` where \`role\` is the user's normalized role (\`ADMIN\`, \`MEMBER\`, or \`SUPER_ADMIN\`).

### Switch Account

Users with memberships on multiple customers can switch their active customer context:

\`\`\`http
POST /api/v2/buyer/accounts/switch
{
  "customerId": 123
}
\`\`\`

Returns the full user response scoped to the target customer (same shape as \`user_get_current\`), including \`user\`, \`customer\`, \`customers\`, \`organization\`, \`showPsaBox\`, and \`latestPsaVersion\`. Returns 403 if the user does not have an active membership on the target customer.

---

## Entity Hierarchy & Prerequisites

Before creating campaigns, you MUST understand the entity hierarchy:

\`\`\`
Customer (your account)
  └── Advertiser (brand account - REQUIRED first)
        ├── Catalogs (sync product/offering data to partners)
        ├── Campaigns (advertising campaigns)
        │     └── Creatives
        ├── Event Sources (conversion data pipelines for optimization)
        └── Test Cohorts (for A/B testing)
\`\`\`

### ⚠️ CRITICAL: Brand Domain Required for All Advertiser Actions

**Before performing ANY action on an advertiser** (creating campaigns, managing accounts, syncing catalogs, etc.), check that the advertiser has a brand domain configured (the \`brand\` field is not null/missing in the advertiser response).

If the advertiser does NOT have a brand domain:
1. **Do not proceed** with the requested action.
2. Inform the user: "This advertiser does not have a brand domain configured, which is required. Please provide a brand domain (e.g., \`nike.com\`) so I can update the advertiser."
3. Once the user provides one, update the advertiser: \`PUT /api/v2/buyer/advertisers/{id}\` with \`{ "brand": "nike.com" }\`.
4. Only then continue with the original request.

### Setup Checklist

**Before you can run a campaign, you need:**

1. **Advertiser with brand domain** (REQUIRED)
   - First, check if one exists: \`GET /api/v2/buyer/advertisers\`
   - If not, create one: \`POST /api/v2/buyer/advertisers\` (requires \`brand\`)
   - An advertiser represents a brand/company you're advertising for
   - The brand is resolved automatically from the domain during creation
   - If the brand is not yet registered, the API returns an enriched preview — show it to the user, then retry with \`saveBrand: true\` to register the brand and create the advertiser
   - Set \`sandbox: true\` to create a sandbox advertiser — all ADCP operations will use sandbox-flagged accounts with no real spend. See **Sandbox Mode** below. Sandbox mode cannot be changed after creation.

   **Sandbox Mode**

   Sandbox mode lets you test the full media buying lifecycle — discovery, campaign creation, creatives, and delivery — without real platform calls or spending real money.

   - Sandbox is **account-level, not per-request**. The seller provisions a dedicated sandbox account, and every request using that \`account_id\` is automatically treated as sandbox. This eliminates the risk of accidentally mixing real and test traffic in a multi-step flow.
   - All discovered accounts for a sandbox advertiser are sandbox accounts — \`list_accounts\` is called with \`sandbox: true\`.
   - The correct sandbox \`account_id\` is automatically injected into \`create_media_buy\`, \`get_media_buy_delivery\`, and \`get_products\` — delivery and reporting data are fully scoped to the sandbox environment.
   - Responses contain simulated but realistic data.
   - Reference: https://docs.adcontextprotocol.org/docs/media-buy/advanced-topics/sandbox#sandbox-mode

2. **Event Sources** (REQUIRED for performance optimization)
   - Register conversion data pipelines: \`POST /api/v2/buyer/advertisers/{advertiserId}/event-sources\`
   - Referenced by \`eventSourceId\` in optimization goals

3. **Creative Manifests** (REQUIRED)
   - Every campaign needs creative assets
   - **Asset creation and upload is UI-only** — look up the dashboard URL via \`GET /api/v2/buyer/dashboard-url\`, resolve the advertiser + campaign IDs, then direct the buyer to: \`{dashboard_url}/campaign-creative-assets/{advertiserId}/{campaignId}\`
   - Via MCP you can only **list**, **get**, **update metadata**, and **delete** existing manifests — see the **Creative Manifests** section below

---

## Core Concepts

| Concept | Description | Required For |
|---------|-------------|--------------|
| **Advertiser** | Top-level account representing a brand/company | Everything |
| **Catalog** | Product/offering data synced to partner platforms via ADCP | Catalog sync |
| **Campaign** | Advertising campaign with budget, dates, targeting | Running ads |
| **Creative Manifest** | Campaign-scoped container for creative assets (images, videos, URLs). Created/uploaded via UI only; list/get/update/delete via MCP | Ad delivery |
| **Event Source** | Conversion data pipeline (pixel, SDK, etc.) | Performance optimization |
| **Syndication** | Push audiences/events/catalogs to ADCP agents | Audience distribution |
| **Test Cohort** | A/B test configuration | Experimentation |
| **Media Buy** | Executed purchase record — managed via campaign endpoints (\`PUT /campaigns/{id}\`), no standalone endpoints | Campaigns, Reporting |

---

## First-Time Setup

If you're starting fresh with a new advertiser, follow these steps.

\`\`\`
Step 1: Check if an advertiser already exists
GET /api/v2/buyer/advertisers
→ If advertisers exist, you can use one. If not, create one (see Step 1b).

Step 1b: Create an advertiser (if needed)
POST /api/v2/buyer/advertisers
{ "name": "Acme Corp", "brand": "acme.com" }
→ If brand is registered: advertiser is created with linked brand.
→ If brand is not registered: returns enriched brand preview. Show it to the user,
  then retry with saveBrand: true to register the brand and create the advertiser:
  POST /api/v2/buyer/advertisers
  { "name": "Acme Corp", "brand": "acme.com", "saveBrand": true }

Step 2: Create an event source (for performance optimization)
POST /api/v2/buyer/advertisers/{advertiserId}/event-sources
{
  "eventSourceId": "website_pixel",
  "name": "Website Pixel"
}

Step 3: Now you can discover products and create campaigns!
\`\`\`

---

## API Endpoints Reference

### Advertisers

#### List Advertisers
\`\`\`http
GET /api/v2/buyer/advertisers?status=ACTIVE&name=Acme&includeBrand=true&includeAccounts=true&limit=10&offset=0
\`\`\`

**Query Parameters (Filters):**
- \`status\` (optional): Filter by status - \`ACTIVE\` or \`ARCHIVED\`
- \`name\` (optional): Filter by name (case-insensitive, partial match). Example: \`name=Acme\` matches "Acme Corp", "acme inc", etc.
- \`includeBrand\` (optional, boolean): Include resolved brand information (full ADCP manifest, logos, colors, industry, tagline, tone) for each advertiser. Default: \`false\`. Pass \`true\` or \`1\` to include.
- \`includeAccounts\` (optional, boolean): Embed linked partner accounts for each advertiser in the response. Default: \`true\`. **Use this instead of calling \`GET /advertisers/{id}/accounts\` per advertiser — avoids N+1 calls.** Each advertiser will have a \`linkedAccounts\` array containing \`{ partnerId, accountId, billingType }\` entries.
- \`limit\` (optional): Maximum number of advertisers per page (default: 10, max: 10)
- \`offset\` (optional): Pagination offset (default: 0)

**Response format:**
\`\`\`json
{
  "items": [ ... ],
  "total": 42,
  "hasMore": true,
  "nextOffset": 10
}
\`\`\`
Use \`nextOffset\` as the \`offset\` parameter for the next page. When \`hasMore\` is \`false\`, \`nextOffset\` is \`null\`.

**Display Requirements — ALWAYS include when listing advertisers:**

Present each advertiser as a structured entry (not prose). For every advertiser, show:
- **Name** and **ID**
- **Status** (ACTIVE, ARCHIVED)
- **Brand** — linked brand name or domain (show "No brand" if missing)
- **Sandbox** — Yes/No
- **Linked Accounts** — list each by partner name, account ID, and status. If none, say "No linked accounts" and offer to discover/link. For sandbox advertisers, do not mention linking accounts — sandbox accounts are provisioned automatically when the user has credentials for a sales agent.

Never summarize into a sentence like "You have 13 advertisers." Always show the per-item details above for every advertiser in the response.

**Note:** \`GET /api/v2/buyer/advertisers/{id}\` (single advertiser) always returns full brand details — no need for \`includeBrand\`.

#### Get Advertiser
\`\`\`http
GET /api/v2/buyer/advertisers/{id}
\`\`\`

Returns the advertiser with full brand details (equivalent to \`includeBrand=true\` on the list endpoint).

**Response:**
\`\`\`json
{
  "id": "34",
  "name": "Acme Corp",
  "description": null,
  "status": "ACTIVE",
  "createdAt": "2026-02-15T10:00:00Z",
  "updatedAt": "2026-02-15T10:00:00Z",
  "brand": "acme.com",
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
\`\`\`

**linkedBrand fields:**
- \`id\`: Brand agent ID (prefixed with \`brand_\`)
- \`name\`: Resolved brand name
- \`domain\`: Brand domain
- \`manifest\`: Full ADCP v2 brand manifest — includes logos, colors, fonts, tone, tagline, assets, product catalog, disclaimers, and more. This is the complete brand identity data.
- \`logoUrl\`: Primary logo URL (convenience field extracted from manifest)
- \`industry\`: Brand industry (convenience field)
- \`colors\`: Brand colors (convenience field)
- \`tagline\`: Brand tagline (convenience field)
- \`tone\`: Brand tone (convenience field)

#### Create Advertiser

**⚠️ IMPORTANT: \`brand\` is required when creating an advertiser.**

When a user asks to create an advertiser:

1. **Ask for the name** - "What would you like to name your advertiser?"
2. **Ask for the brand** - "What is the brand's website domain? (e.g., nike.com)"
3. **Create the advertiser** with name and brand

The system resolves the brand via Addie (AdCP registry + Brandfetch enrichment). There are three possible outcomes:

**Outcome 1: Brand exists in the registry** — Advertiser is created successfully with the linked brand.

**Outcome 2: Brand found via enrichment only (not yet registered)** — The create **fails** with a \`VALIDATION_ERROR\`. The error response includes \`error.details.enrichedBrand\` containing the brand data that was found (name, domain, manifest with logos, colors, industry, tagline, tone, etc.).

**When this error occurs, you MUST do BOTH of the following:**

1. **ALWAYS show the enriched brand preview first.** Present \`error.details.enrichedBrand\` to the user — show the brand name, domain, industry, colors, logo URL, tagline, tone, and any other fields present. This lets the user review and confirm the right brand was found.
2. **Then offer to save and create.** Tell the user they can save this brand to the AdCP registry and create the advertiser in one step by retrying the same request with \`saveBrand: true\`. The user may also choose to manually adjust the brand data before saving.

**Retry with \`saveBrand: true\`:**
\`\`\`http
POST /api/v2/buyer/advertisers
{
  "name": "Acme Corp",
  "brand": "acme.com",
  "description": "Global advertising account",
  "saveBrand": true
}
\`\`\`
This saves the enriched brand to the AdCP registry and creates the advertiser with the linked brand in one call.

**Outcome 3: No brand data found at all** — The create fails. Tell the user to register their brand at https://adcontextprotocol.org/chat.html or https://agenticadvertising.org/brand, then retry.

**Initial request (without \`saveBrand\`):**
\`\`\`http
POST /api/v2/buyer/advertisers
{
  "name": "Acme Corp",
  "brand": "acme.com",
  "description": "Global advertising account"
}
\`\`\`

**Request fields:**
- \`name\` (required): Advertiser name
- \`brand\` (required): Brand domain (e.g., \`"nike.com"\`)
- \`description\` (optional): Description
- \`saveBrand\` (optional, boolean, default \`false\`): When \`true\`, saves an enriched brand to the AdCP registry if the brand is not yet registered. Set this after reviewing the enriched brand preview returned from a previous attempt.
- \`linkedAccounts\` (optional, array): Accounts to link at creation time. Each item: \`{ partnerId, accountId, billingType? }\`. Use \`GET /advertisers/{advertiserId}/accounts/available?partnerId={agentId}\` to discover valid accountIds — never ask the user to provide one manually.
- \`optimizationApplyMode\` (optional, string): \`"AUTO"\` or \`"MANUAL"\` (default \`"MANUAL"\`). Controls whether Scope3 AI model optimizations to media buys are applied automatically or require manual approval for campaigns under this advertiser.
- \`utmConfig\` (optional, array, max 20): Default UTM parameters for this advertiser. These are appended to landing page URLs during clickthrough redirection. Each item: \`{ paramKey, paramValue }\`. \`paramKey\` is the query parameter name (e.g. \`"utm_source"\`, \`"bg_campaign"\`). \`paramValue\` is a macro (e.g. \`"{CAMPAIGN_ID}"\`) resolved dynamically at click time, or a static string (e.g. \`"scope3"\`). Available macros follow the ADCP universal macros spec: https://docs.adcontextprotocol.org/docs/creative/universal-macros#universal-macros. If omitted, defaults are applied: \`utm_source=scope3\`, \`utm_medium=agentic\`, \`utm_campaign={CAMPAIGN_ID}\`, \`utm_content={CREATIVE_ID}\`, \`utm_media_buy={MEDIA_BUY_ID}\`, \`utm_package={PACKAGE_ID}\`. Campaign-level UTM config can override these per param key.

**Response** includes \`brand\`, \`linkedBrand\`, \`optimizationApplyMode\`, optional \`utmConfig\` (seat-level UTM params, only present when configured), and optional \`brandWarning\` (e.g., if data came from Brandfetch enrichment rather than a well-known manifest).

#### Update Advertiser
\`\`\`http
PUT /api/v2/buyer/advertisers/{id}
{
  "name": "Acme Corporation",
  "description": "Updated description",
  "brand": "newbrand.com"
}
\`\`\`

**Optional fields:** \`name\`, \`description\`, \`brand\`, \`linkedAccounts\` (array of \`{ partnerId, accountId, billingType? }\` to add — does not remove existing links), \`optimizationApplyMode\` (\`"AUTO"\` or \`"MANUAL"\` — controls whether Scope3 AI model optimizations to media buys are applied automatically or require manual approval for campaigns under this advertiser), \`utmConfig\` (array of \`{ paramKey, paramValue }\`, max 20 — replaces all existing seat-level UTM params; pass \`[]\` to clear). Discover valid accountIds via \`GET /advertisers/{advertiserId}/accounts/available?partnerId={agentId}\` — never ask the user to provide an account ID.

If \`brand\` is provided, the system resolves the new brand and updates the linked brand agent.

#### Link Agent Account to Advertiser

Use this 3-step workflow to discover and link an agent's account to a specific advertiser.

**Two-step process overview:**
1. **Register agent credentials** (customer-level) — done once per agent via \`POST /sales-agents/{agentId}/accountCredentials\`
2. **Link account to advertiser** (advertiser-level) — discover available accounts for a specific agent and link one to an advertiser

**Prerequisites:** Agent credentials must already be registered for the relevant agent via \`POST /sales-agents/{agentId}/accountCredentials\` (see Register Agent Credentials in the Sales Agents section). **Only agents with \`requiresOperatorAuth: true\` support account linking.** To find eligible agents, use \`GET /api/v2/buyer/sales-agents?supportsRegistration=true\`.

**⚠️ CRITICAL: Multiple Credentials for the Same Agent**

A customer may register **multiple sets of credentials** for the same sales agent (e.g., two different Snap ad accounts with different API keys). This is fully supported. When this happens:
- Each set of credentials discovers its own set of ad accounts via \`list_accounts\`
- The discovery endpoint (\`accounts/available\`) **requires a \`credentialId\` parameter** so the system knows which credential to use for discovery
- If the customer has multiple credentials and \`credentialId\` is omitted, the API returns a **validation error listing the available credential IDs** — present these to the user and ask them to pick
- Once the user picks a credential, re-call the discovery endpoint with \`credentialId\` to get that credential's accounts
- When the user links an account, all future operations for that advertiser+agent pair automatically use the credential associated with that account

**Workflow when multiple credentials exist:**
1. Call \`GET /sales-agents/accountCredentials\` to list the customer's registered credentials
2. Present the credentials to the user (show \`id\` and \`accountIdentifier\` for each)
3. Ask the user which credential to use
4. Pass the chosen \`credentialId\` to the discovery endpoint

**Step 1 — Create advertiser with brand**
\`\`\`http
POST /api/v2/buyer/advertisers
{ "name": "Acme Corp", "brand": "acme.com" }
\`\`\`

**Step 2 — Discover available accounts for the agent**

**⚠️ CRITICAL: Account IDs MUST come from the discovery endpoint — NEVER from user input.**
- You MUST call the discovery endpoint below and use ONLY the \`accountId\` values returned in the response.
- If the user provides an account ID or account name verbally (e.g., "the account ID is 06cd7033..."), do NOT use that value. Instead, call the discovery endpoint and match against the returned results.
- If no accounts are returned from discovery, tell the user no matching accounts were found. Do NOT pretend to link an account that was not returned by the API.
- **NEVER fabricate, guess, or use a user-provided account ID directly.** The only valid account IDs are those returned by this endpoint.

\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/accounts/available?partnerId={agentId}
GET /api/v2/buyer/advertisers/{advertiserId}/accounts/available?partnerId={agentId}&credentialId={credentialId}
\`\`\`
- \`credentialId\` is **required when the customer has multiple credentials** registered for this agent. If omitted with multiple credentials, the API returns a validation error listing available credential IDs — present them to the user and ask which to use, then retry with \`credentialId\`.
- \`credentialId\` is optional when the customer has only one credential for the agent.
- Returns accounts filtered by the advertiser's brand domain for the specified agent and credential.
- Response includes \`accounts\` array with \`accountId\`, \`name\`, \`house\`, \`advertiser\`, \`partnerId\`, and \`billingOptions.supported\`.
- **Show ALL discovered accounts to the user and let them pick.** Present each account's \`name\` (and \`advertiser\` if different from the brand).
- If \`accounts\` is empty, tell the user no matching accounts were found for that agent. Do NOT proceed with linking.
- **Do NOT ask about billing type.** Use \`billingOptions.default\` from the response if available. Only include \`billingType\` in the link request if the response shows multiple \`billingOptions.supported\` values AND no default — in that case, present the options and ask the user to choose.

**Step 3 — Link the selected account to the advertiser**
\`\`\`http
PUT /api/v2/buyer/advertisers/{advertiserId}
{
  "linkedAccounts": [
    { "partnerId": "snap_6e2d13705a26", "accountId": "acc_123" }
  ]
}
\`\`\`
- The \`accountId\` here MUST be one returned from Step 2. Never use a value from any other source.
- \`linkedAccounts\` adds accounts — it does not remove existing links. Include \`billingType\` if the agent requires a specific billing arrangement.

---

### Campaigns

Campaigns use a single endpoint for creation and update. Configuration is done through action endpoints.

#### List Campaigns
\`\`\`http
GET /api/v2/buyer/campaigns?advertiserId=12345&status=ACTIVE
\`\`\`

**Query Parameters:**
- \`advertiserId\` (optional): Filter by advertiser
- \`status\` (optional): \`DRAFT\`, \`ACTIVE\`, \`PAUSED\`, \`COMPLETED\`, \`ARCHIVED\`

#### Get Campaign
\`\`\`http
GET /api/v2/buyer/campaigns/{campaignId}
\`\`\`

Campaign responses include an \`audiences\` array of currently active audiences with: \`audienceId\`, \`name\`, \`status\`, \`type\` (\`"TARGET"\` or \`"SUPPRESS"\`), \`enabledAt\`.

**DRAFT campaigns only:** The response includes \`discoveryId\`, \`products\`, and \`productCount\` fields representing the product selection from the discovery workflow. These fields are **only present while the campaign is in DRAFT status**. After execution, product data is represented through \`mediaBuys\` — do not look for \`discoveryId\` or \`products\` on executed campaigns.

**Understanding duplicate media buys in the response:** The \`mediaBuys\` array may contain **two entries with the same media buy ID but different statuses** — e.g., one \`ACTIVE\` and one \`PENDING_APPROVAL\`. This is **normal and expected**. The \`PENDING_APPROVAL\` entry is a pending version of the media buy that has been submitted to the sales agent/publisher for approval. The original \`ACTIVE\` version remains unchanged until the publisher approves the update — once approved, the pending version becomes ACTIVE and replaces the old one. Do NOT flag this as unusual or ask the user about it — simply explain that the update is pending publisher approval.

#### Create Campaign

**⚠️ BEFORE creating a campaign: verify the advertiser has a brand domain.**
Call \`GET /api/v2/buyer/advertisers/{advertiserId}\` and check the \`brand\` field is not null/missing.
If it is missing, do NOT proceed — tell the user: "This advertiser doesn't have a brand domain configured. Please provide one (e.g. \`nike.com\`) so I can update it first." Then \`PUT /api/v2/buyer/advertisers/{id}\` with \`{ "brand": "..." }\` before continuing.

\`\`\`http
POST /api/v2/buyer/campaigns
{
  "advertiserId": "12345",
  "name": "Q1 Campaign",
  "flightDates": {
    "startDate": "2025-02-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z"
  },
  "budget": {
    "total": 50000,
    "currency": "USD"
  },
  "brief": "<<< ALWAYS include the ENTIRE brief from the client — never summarize or truncate >>>",
  "constraints": {
    "channels": ["ctv", "display"],
    "countries": ["US"]
  },
  "discoveryId": "optional-existing-discovery-id",
  "productIds": ["prod_123", "prod_456"],
  "audienceConfig": {
    "targetAudienceIds": ["aud_001", "aud_002"],
    "suppressAudienceIds": ["aud_003"]
  },
  "performanceConfig": {
    "optimizationGoals": [{
      "kind": "event",
      "eventSources": [
        { "eventSourceId": "es_abc123", "eventType": "purchase", "valueField": "value" }
      ],
      "target": { "kind": "per_ad_spend", "value": 4.0 },
      "priority": 1
    }]
  }
}
\`\`\`

**Required fields:**
- \`advertiserId\`: Advertiser ID
- \`name\`: Campaign name (1-255 chars)
- \`flightDates\`: Start and end dates
- \`budget\`: Total and currency

**Optional fields:**
- \`brief\`: Campaign brief. **MUST be the ENTIRE brief from the client — never summarize or truncate.**
- \`constraints.channels\`: Target channels (display, olv, ctv, social)
- \`constraints.countries\`: Target countries (ISO 3166-1 alpha-2 codes)
- \`discoveryId\`: Attach an existing discovery session
- \`productIds\`: Product IDs to pre-select from the discovery session (requires discoveryId)
- \`audienceConfig\`: Audience targeting and suppression. \`targetAudienceIds\` (string array) — audiences to include. \`suppressAudienceIds\` (string array) — audiences to exclude. Audience IDs come from \`GET /advertisers/{accountId}/audiences\`.
- \`performanceConfig\`: Contains \`optimizationGoals\` array. Each goal has \`kind\` (\`"event"\` or \`"metric"\`). Event goals have \`eventSources\` array (each with \`eventSourceId\`, \`eventType\`, optional \`valueField\`), optional \`target\` (\`kind: "per_ad_spend"\` or \`kind: "cost_per"\` with \`value\`), optional \`attributionWindow\`, optional \`priority\`. Metric goals have \`metric\` string, optional \`target\`, optional \`priority\`.
- \`optimizationApplyMode\`: \`"AUTO"\` or \`"MANUAL"\` (default). Controls whether Scope3 AI model optimizations to media buys are applied automatically or require manual approval. Overrides the advertiser-level default.
- \`utmConfig\`: Campaign-level UTM parameter overrides. Object with \`params\` (array of \`{ paramKey, paramValue }\`, max 20) and optional \`deleteMissing\` (boolean — if \`true\`, removes campaign-level UTM params not in this request; if \`false\`/omitted, additive mode). Campaign UTM params override seat-level defaults per matching \`paramKey\`.

**After creating a campaign, suggest ONLY these next steps (never mention strategies, tactics, or media plans):**
1. **Discover products** — find and attach inventory via \`POST /discovery/discover-products\`
2. **Attach audiences** — link synced audiences for targeting/suppression via \`PUT /campaigns/{id}\` with \`audienceConfig\`
3. **Set performance configuration** — configure optimization goals via \`PUT /campaigns/{id}\` with \`performanceConfig\`

#### Update Campaign
\`\`\`http
PUT /api/v2/buyer/campaigns/{campaignId}
{
  "name": "Updated Campaign Name",
  "budget": { "total": 75000 },
  "audienceConfig": {
    "targetAudienceIds": ["aud_004"],
    "suppressAudienceIds": ["aud_005"]
  },
  "performanceConfig": {
    "optimizationGoals": [{
      "kind": "event",
      "eventSources": [
        { "eventSourceId": "es_abc123", "eventType": "purchase", "valueField": "value" }
      ],
      "target": { "kind": "per_ad_spend", "value": 5.0 },
      "priority": 1
    }]
  }
}
\`\`\`
All fields are optional. \`audienceConfig\` is **additive** by default — it adds audiences without removing existing ones. Set \`deleteMissing: true\` inside \`audienceConfig\` to replace the full audience set (audiences not in the list are soft-disabled). To remove all audiences, send \`{ "audienceConfig": { "deleteMissing": true } }\`.

##### Updating Media Buys via Campaign Update

**There are no standalone media buy endpoints.** To update media buys (budget, pacing, creatives, etc.), include the \`mediaBuys\` array in the campaign update body. Each entry targets a specific media buy by ID.

**IMPORTANT: ACTIVE media buys use \`packages\`, DRAFT media buys use \`products\`.**
- When a media buy is **ACTIVE** (already executed/deployed), update its **\`packages\`** — these are the deployed line items on the publisher side.
- When a media buy is **DRAFT** (not yet executed), update its **\`products\`** — these are the pre-execution product selections.

**Example — Update budget and pacing for an ACTIVE media buy's package:**
\`\`\`http
PUT /api/v2/buyer/campaigns/{campaignId}
{
  "mediaBuys": [
    {
      "mediaBuyId": "mb_abc123",
      "packages": [
        {
          "packageId": "pkg_xyz",
          "budget": 5000,
          "pacing": "even"
        }
      ],
      "updated_reason": "Increase budget for Q2 push"
    }
  ]
}
\`\`\`

**Example — Update a DRAFT media buy's products:**
\`\`\`http
PUT /api/v2/buyer/campaigns/{campaignId}
{
  "mediaBuys": [
    {
      "mediaBuyId": "mb_draft456",
      "products": [
        {
          "product_id": "prod_001",
          "budget": 3000,
          "pacing": "even"
        }
      ]
    }
  ]
}
\`\`\`

**Media buy update fields:**
- \`mediaBuyId\` (required): ID of the media buy to update (from campaign GET response \`mediaBuys\` array)
- \`name\` (optional): Updated media buy name
- \`packages\` (optional, for **ACTIVE** media buys): Array of package updates. Each: \`packageId\` (required), \`budget\`, \`pacing\` (\`"even"\` or \`"asap"\`), \`bidPrice\`, \`creative_ids\`
- \`products\` (optional, for **DRAFT** media buys): Array of product updates. Each: \`product_id\` (required), \`pricingOptionId\`, \`budget\`, \`pacing\` (\`"asap"\`, \`"even"\`, \`"front_loaded"\`), \`bidPrice\`
- \`start_time\` (optional): \`"asap"\` or ISO 8601 date-time
- \`end_time\` (optional): ISO 8601 date-time
- \`creative_ids\` (optional): Updated creative assignments
- \`updated_reason\` (optional): Reason for update (stored with version history)

**Media buy update versioning:** When you update an ACTIVE media buy, the system creates a **new pending version** with status \`PENDING_APPROVAL\`. This is expected:
- The original ACTIVE version remains unchanged until the sales agent (publisher) approves the update.
- The campaign GET response will temporarily show **two entries** for the same media buy: the original ACTIVE version and the new PENDING_APPROVAL version.
- The pending version's \`packages\`/\`products\` may not immediately reflect the requested changes — the updated values are submitted to the sales agent for approval.
- Once the sales agent approves, the pending version becomes ACTIVE and replaces the old one.
- **Do NOT treat this as an error or try alternative approaches.** Simply inform the user that the update has been submitted and is pending approval from the sales agent/publisher.

#### Delete Campaign
\`\`\`http
DELETE /api/v2/buyer/campaigns/{campaignId}
\`\`\`

---

#### Campaign Action Endpoints

#### Execute Campaign (Launch)
\`\`\`http
POST /api/v2/buyer/campaigns/{campaignId}/execute
\`\`\`

**Optional request body:**
\`\`\`json
{
  "debug": true
}
\`\`\`

**Response:**
\`\`\`json
{
  "campaignId": "campaign_abc123",
  "previousStatus": "DRAFT",
  "newStatus": "ACTIVE",
  "success": true
}
\`\`\`

**On partial failure** (some media buys failed to execute):
\`\`\`json
{
  "campaignId": "campaign_abc123",
  "previousStatus": "DRAFT",
  "newStatus": "ACTIVE",
  "success": false,
  "errors": [
    {
      "mediaBuyId": "mb_xyz",
      "salesAgentId": "snap_abc",
      "message": "Failed to submit media buy to publisher: ...",
      "debug": {
        "request": { "...full ADCP create_media_buy request..." },
        "response": { "...full ADCP response from sales agent..." },
        "debugLogs": [ { "...A2A request/response logs..." } ],
        "error": "error message"
      }
    }
  ]
}
\`\`\`

- \`success\` is \`false\` when any media buy execution failed
- \`errors\` array contains structured error objects per failed media buy
- \`debug\` field contains the same debug info as v1 \`execute_media_buy\` (full ADCP request, response, and A2A debug logs) — only present when \`debug: true\` was sent in the request body
- Campaign is still set to ACTIVE even with partial failures — re-execute to retry failed media buys

**Note on Media Buys:** Media buys are child resources of campaigns — there are **no standalone media buy endpoints**. Media buys are auto-created when a campaign is executed (\`POST /campaigns/{id}/execute\`), included in campaign GET responses (\`mediaBuys\` array), and modified through campaign updates (\`PUT /campaigns/{id}\` with \`mediaBuys\` array). For ACTIVE media buys, update \`packages\` (deployed line items); for DRAFT media buys, update \`products\`. See "Updating Media Buys via Campaign Update" above for full schema and examples.

#### Pause Campaign
\`\`\`http
POST /api/v2/buyer/campaigns/{campaignId}/pause
\`\`\`

#### Auto-Select Products
\`\`\`http
POST /api/v2/buyer/campaigns/{campaignId}/auto-select-products
\`\`\`
No request body. Automatically selects products from the campaign's discovery session and allocates budget based on measurability. Replaces any previous selections. Requires a performance campaign (\`performanceConfig\` set) with discovered products.

**Response:**
- \`selectedProducts\` (array): Products with budget allocations (\`productId\`, \`salesAgentId\`, \`budget\`, \`cpm\`, \`pricingOptionId\`)
- \`budgetContext\` (object): \`campaignBudget\`, \`totalAllocated\`, \`remainingBudget\`, \`currency\`
- \`selectionRationale\` (string): Explanation of the selection strategy
- \`selectionMethod\` (string): \`"scoring"\`, \`"measurability"\`, or \`"cpm_heuristic"\`
- \`testBudgetPerProduct\` (number, optional): Test budget allocated per product
- \`productCount\` (number): Total products selected

---

### Discovery

#### Discover Products

Discovers products based on advertiser context and returns a discoveryId for managing selections.

\`\`\`http
POST /api/v2/buyer/discovery/discover-products
{
  "advertiserId": "12345",
  "channels": ["ctv", "display"],
  "countries": ["US"],
  "brief": "<<< ALWAYS include the ENTIRE brief from the client here — never summarize >>>",
  "publisherDomain": "example",
  "salesAgentNames": ["Acme Ad Exchange"],
  "debug": true
}
\`\`\`

**Filtering Parameters:**
- \`publisherDomain\` (optional): Filter by publisher domain (exact domain component match)
- \`pricingModel\` (optional): Filter by pricing model (\`cpm\`, \`vcpm\`, \`cpc\`, \`cpcv\`, \`cpv\`, \`cpp\`, \`flat_rate\`)
- \`salesAgentIds\` (optional, array): Filter by exact sales agent ID(s)
- \`salesAgentNames\` (optional, array): Filter by sales agent name(s) (case-insensitive substring match)

**Debug Parameter:**
- \`debug\` (optional, boolean): When \`true\`, includes detailed ADCP agent request/response debug logs in the response. Returns an \`agentResults\` array with per-agent success/failure status, raw response data, and full HTTP request/response logs (authorization headers redacted). Same structure as v1 \`media_product_discover\` debug output.

#### Discover Products for Existing Session
\`\`\`http
GET /api/v2/buyer/discovery/{discoveryId}/discover-products?groupLimit=10&groupOffset=0&productsPerGroup=15
\`\`\`

**Query Parameters (Pagination):**
- \`groupLimit\` (optional): Max product groups (default: 10, max: 10)
- \`groupOffset\` (optional): Groups to skip (default: 0)
- \`productsPerGroup\` (optional): Max products per group (default: 10, max: 15)
- \`productOffset\` (optional): Products to skip within each group (default: 0)

**Query Parameters (Filtering):**
- \`publisherDomain\` (optional): Filter by publisher domain (exact component match). "hulu" matches "hulu.com" but "hul" does not
- \`pricingModel\` (optional): Filter by pricing model (\`cpm\`, \`vcpm\`, \`cpc\`, \`cpcv\`, \`cpv\`, \`cpp\`, \`flat_rate\`)
- \`salesAgentIds\` (optional, comma-separated): Filter by sales agent ID(s)
- \`salesAgentNames\` (optional, comma-separated): Filter by sales agent name(s) (case-insensitive substring match)
- \`debug\` (optional): When \`true\`, includes ADCP agent request/response debug logs in the response (see debug section below)

Filters can be combined. Example: \`?publisherDomain=example&pricingModel=cpm&salesAgentNames=Acme Ad Exchange\`

**Response:**
\`\`\`json
{
  "discoveryId": "abc123-def456-ghi789",
  "productGroups": [
    {
      "groupId": "group-0",
      "groupName": "Publisher Name",
      "products": [
        {
          "productId": "product_123",
          "name": "Premium CTV Inventory",
          "channel": "ctv",
          "bidPrice": 12.50,
          "salesAgentId": "agent_456",
          "publisherProperties": [
            { "publisherDomain": "hulu.com", "selectionType": "all" },
            { "publisherDomain": "espn.com", "selectionType": "by_id" }
          ]
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
\`\`\`

**Product fields:**
- \`publisherProperties\` (array, optional): Publisher domains and targeting details for this product. Each product can have multiple publishers. Each entry contains \`publisherDomain\` (string) and \`selectionType\` (\`"all"\` or \`"by_id"\`). Use this to understand which publishers a product targets.

**Debug response** (when \`debug: true\`):

The response includes an \`agentResults\` array containing only failed agents with full ADCP request/response logs for troubleshooting:
\`\`\`json
{
  "agentResults": [
    {
      "agentId": "agent_789",
      "agentName": "Failed Agent",
      "success": false,
      "productCount": 0,
      "error": "Connection timeout",
      "rawResponseData": { "..." },
      "debugLogs": [
        {
          "timestamp": "2026-03-18T10:00:00Z",
          "type": "request",
          "request": { "method": "POST", "url": "...", "headers": { "authorization": "[REDACTED]" }, "body": { "..." } },
          "response": { "status": 500, "body": { "..." } }
        }
      ]
    }
  ]
}
\`\`\`

**Pagination:**
- \`hasMoreGroups\`: Use \`groupOffset\` to fetch more groups
- \`hasMoreProducts\`: Use \`productOffset\` to fetch more products within a group
- To paginate products for a single group, combine \`productOffset\` with a filter (\`salesAgentIds\` or \`salesAgentNames\`) to isolate that group

#### Add Products to Selection
\`\`\`http
POST /api/v2/buyer/discovery/{discoveryId}/products
{
  "products": [
    {
      "productId": "product_123",
      "salesAgentId": "agent_456",
      "groupId": "ctx_123-group-0",
      "groupName": "Publisher Name",
      "bidPrice": 12.50,
      "budget": 5000
    }
  ]
}
\`\`\`

**Required per product:** \`productId\`, \`salesAgentId\`, \`groupId\`, \`groupName\`
**Optional per product:** \`bidPrice\` (required when \`isFixed: false\`), \`budget\`

**Response:**
\`\`\`json
{
  "discoveryId": "abc123-def456-ghi789",
  "products": [
    {
      "productId": "product_123",
      "salesAgentId": "agent_456",
      "bidPrice": 12.50,
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

#### Get Selected Products
\`\`\`http
GET /api/v2/buyer/discovery/{discoveryId}/products
\`\`\`

Response format same as Add Products.

#### Remove Products from Selection
\`\`\`http
DELETE /api/v2/buyer/discovery/{discoveryId}/products
{
  "productIds": ["product_123", "product_456"]
}
\`\`\`

Response format same as Add Products (with updated list).

---

### Event Sources

Conversion data pipelines (website pixels, mobile SDKs, etc.) registered at the advertiser level. Referenced by \`eventSourceId\` in campaign optimization goals.

Event sources can be managed through sync (bulk upsert following the ADCP spec) or through individual CRUD operations.

#### Sync Event Sources

Sync is the preferred way to manage event sources — it uses upsert semantics (creates or updates as needed).

\`\`\`http
POST /api/v2/buyer/advertisers/26/event-sources/sync
{
  "account": { "account_id": "26" },
  "event_sources": [
    {
      "event_source_id": "website_pixel",
      "name": "Website Pixel",
      "event_types": ["purchase", "add_to_cart"],
      "allowed_domains": ["shop.example.com"]
    },
    {
      "event_source_id": "mobile_sdk",
      "name": "Mobile App SDK",
      "event_types": ["app_install", "purchase"]
    }
  ],
  "delete_missing": false
}
\`\`\`

**URL path:** \`/advertisers/{advertiserId}/event-sources/sync\` — the \`{advertiserId}\` is the numeric advertiser ID (e.g. \`26\`). Also include it in the request body as \`account.account_id\`.

**\`account\` (required in body):**
- \`account_id\` (string): The advertiser ID — same value as the path \`{advertiserId}\` (e.g. \`"26"\`).

**\`event_sources\` array (required, 1–50 items). Each object:**
- \`event_source_id\` (string, required): Buyer-assigned identifier, referenced by optimization goals
- \`name\` (string, optional): Human-readable label
- \`event_types\` (array, optional): IAB ECAPI event types this source handles. When omitted, accepts all types. Values: \`purchase\`, \`lead\`, \`add_to_cart\`, \`complete_registration\`, \`subscribe\`, \`app_install\`, \`start_trial\`, \`search\`, \`add_to_wishlist\`, \`view_content\`, \`initiate_checkout\`, \`add_payment_info\`, \`share\`, \`donate\`, \`find_location\`, \`schedule\`, \`contact\`, \`customize_product\`, \`submit_application\`, \`login\`, \`page_view\`, \`complete_tutorial\`, \`achieve_level\`, \`unlock_achievement\`, \`spend_credits\`, \`rate\`, \`download\`, \`custom\`
- \`allowed_domains\` (array, optional): Domains authorized to send events

**Other optional fields:**
- \`delete_missing\` (boolean): Archive event sources not included in this request (default: false)

**Response (200):**
\`\`\`json
{
  "data": {
    "event_sources": [
      { "event_source_id": "website_pixel", "action": "created" },
      { "event_source_id": "mobile_sdk", "action": "updated" }
    ]
  }
}
\`\`\`

Actions: \`created\`, \`updated\`, \`unchanged\`, \`failed\`, \`deleted\`

#### List Event Sources

\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/event-sources
\`\`\`

**Query Parameters:**
- \`take\` / \`skip\` (optional): Pagination

#### Create Event Source
\`\`\`http
POST /api/v2/buyer/advertisers/{advertiserId}/event-sources
{
  "eventSourceId": "website_pixel",
  "name": "Website Pixel",
  "eventTypes": ["purchase", "add_to_cart"],
  "allowedDomains": ["shop.example.com"]
}
\`\`\`

**Required fields:**
- \`eventSourceId\` (string): Identifier referenced by optimization goals (e.g., \`"retailer_sales"\`, \`"website_pixel"\`)
- \`name\` (string): Human-readable name

**Optional fields:**
- \`eventTypes\` (array): IAB ECAPI event types this source handles. When omitted, accepts all types. Values: \`purchase\`, \`lead\`, \`add_to_cart\`, \`complete_registration\`, \`subscribe\`, \`app_install\`, \`start_trial\`, \`search\`, \`add_to_wishlist\`, \`view_content\`, \`initiate_checkout\`, \`add_payment_info\`, \`share\`, \`donate\`, \`find_location\`, \`schedule\`, \`contact\`, \`customize_product\`, \`submit_application\`, \`login\`, \`page_view\`, \`complete_tutorial\`, \`achieve_level\`, \`unlock_achievement\`, \`spend_credits\`, \`rate\`, \`download\`, \`custom\`
- \`allowedDomains\` (array): Domains authorized to send events for this source

#### Get Event Source
\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/event-sources/{eventSourceId}
\`\`\`

#### Update Event Source
\`\`\`http
PUT /api/v2/buyer/advertisers/{advertiserId}/event-sources/{eventSourceId}
{
  "name": "Updated Pixel Name",
  "eventTypes": ["purchase"]
}
\`\`\`

All fields are optional.

#### Delete Event Source
\`\`\`http
DELETE /api/v2/buyer/advertisers/{advertiserId}/event-sources/{eventSourceId}
\`\`\`

---

### Event Summary

Get hourly-aggregated event counts for an advertiser. Use this to verify that events (impressions, clicks, conversions, etc.) are being ingested before setting up optimization goals.

**Important:** Event data is aggregated hourly. Newly reported events may take up to 1 hour to appear in this summary. If the user has just started reporting events, let them know to wait before checking.

#### Get Event Summary
\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/events/summary
\`\`\`

**Query Parameters:**
- \`eventType\` (string, optional): Filter by event type — one of \`impression\`, \`click\`, \`conversion\`, \`measurement\`, \`mmp\`. When omitted, returns all types.
- \`startHour\` (string, optional): Start of query range (inclusive), hour-aligned ISO 8601 (e.g. \`2026-03-27T14:00:00Z\`). Defaults to start of last completed UTC hour.
- \`endHour\` (string, optional): End of query range (exclusive), hour-aligned ISO 8601. Defaults to end of last completed UTC hour.

**Response (200):**
\`\`\`json
{
  "data": {
    "periodStart": "2026-03-27T14:00:00.000Z",
    "periodEnd": "2026-03-27T15:00:00.000Z",
    "entries": [
      {
        "eventHour": "2026-03-27T14:00:00.000Z",
        "eventType": "impression",
        "eventCount": 1500
      },
      {
        "eventHour": "2026-03-27T14:00:00.000Z",
        "eventType": "conversion",
        "eventCount": 25
      }
    ],
    "totalEventCount": 1525
  }
}
\`\`\`

The response includes both advertiser-specific events and customer-level shared events (events not tied to a specific advertiser but shared across all advertisers under the same customer).

---

### Log Event

Log conversion and marketing events for attribution. Events are forwarded to the tracking endpoint (CAPI). Requires an event source registered via sync_event_sources.

#### Log Events
\`\`\`http
POST /api/v2/buyer/advertisers/{advertiserId}/log-event
{
  "event_source_id": "website_pixel",
  "events": [
    {
      "event_id": "txn_abc123",
      "event_type": "purchase",
      "event_time": "2026-03-15T14:30:00-05:00",
      "action_source": "website",
      "event_source_url": "https://example.com/checkout",
      "user_match": {
        "hashed_email": "a1b2c3d4e5f6...",
        "click_id": "abc123",
        "click_id_type": "gclid"
      },
      "custom_data": {
        "value": 99.99,
        "currency": "USD",
        "order_id": "order_456",
        "content_ids": ["prod_789"],
        "num_items": 2
      }
    }
  ],
  "test_event_code": "TEST123"
}
\`\`\`

**Request body:**
- \`event_source_id\` (string, required): Event source registered via sync_event_sources
- \`events\` (array, required, 1–10,000 items): Events to log
- \`test_event_code\` (string, optional): Test code for validation without affecting production data

**Each event object:**
- \`event_id\` (string, required): Unique identifier for deduplication
- \`event_type\` (enum, required): \`purchase\`, \`lead\`, \`add_to_cart\`, \`initiate_checkout\`, \`view_content\`, \`complete_registration\`, \`page_view\`, \`app_install\`, \`deposit\`, \`subscription\`, \`custom\`
- \`event_time\` (string, required): When the event occurred (ISO 8601 with timezone)
- \`action_source\` (enum, optional): \`website\`, \`app\`, \`in_store\`, \`phone_call\`, \`system_generated\`, \`other\`
- \`event_source_url\` (string, optional): URL where the event occurred
- \`custom_event_name\` (string, optional): Name for custom events (when event_type is \`custom\`)
- \`user_match\` (object, optional): User identity for attribution matching
  - \`uids\` (array): Universal ID values (\`{type, value}\` — rampid, id5, uid2, euid, pairid, maid)
  - \`hashed_email\`: SHA-256 of lowercase trimmed email
  - \`hashed_phone\`: SHA-256 of E.164 phone number
  - \`click_id\` / \`click_id_type\`: Platform click identifier
  - \`client_ip\` / \`client_user_agent\`: For probabilistic matching
- \`custom_data\` (object, optional): Event-specific data
  - \`value\`: Monetary value
  - \`currency\`: ISO 4217 code (e.g. \`USD\`)
  - \`order_id\`: Transaction identifier
  - \`content_ids\`: Product identifiers
  - \`content_type\`: Category (product, service, etc.)
  - \`num_items\`: Item count
  - \`contents\`: Array of \`{id, quantity, price, brand}\`

**Response (200):**
\`\`\`json
{
  "data": {
    "events_received": 1,
    "events_processed": 1,
    "partial_failures": [],
    "warnings": [],
    "match_quality": 0.85
  }
}
\`\`\`

---

### Measurement Data

Sync advertiser performance measurement data as an alternative to CAPI. Accepts time-series metric data over date ranges keyed by campaign, media buy, package, and/or creative. Uses upsert semantics — re-submitting the same data is safe and idempotent.

#### Sync Measurement Data

\`\`\`http
POST /api/v2/buyer/advertisers/26/measurement-data/sync
{
  "measurements": [
    {
      "start_time": "2026-03-01T00:00:00-05:00",
      "end_time": "2026-03-07T23:59:59-05:00",
      "metric_id": "incremental_revenue",
      "metric_value": 8450.75,
      "unit": "currency",
      "currency": "USD",
      "campaign_id": "camp_456"
    }
  ]
}
\`\`\`

**URL path:** \`/advertisers/{advertiserId}/measurement-data/sync\` — the \`{advertiserId}\` is the numeric advertiser ID (e.g. \`26\`).

**\`measurements\` array (required, 1–1000 items). Each object:**
- \`start_time\` (string, required): Start of the measurement period (ISO 8601 with timezone)
- \`end_time\` (string, required): End of the measurement period (ISO 8601 with timezone, must be after start_time)
- \`metric_id\` (enum, required): \`revenue\`, \`incremental_revenue\`, \`conversions\`, \`incremental_conversions\`, \`page_view_count\`, \`add_to_cart_count\`, \`purchase_count\`, \`ltv_1d\`, \`ltv_7d\`, \`ltv_30d\`
- \`metric_value\` (number, required): Measured value for this metric
- \`unit\` (enum, required): \`currency\`, \`count\`, \`ratio\`, \`percentage\`
- \`currency\` (string, conditional): 3-letter uppercase ISO 4217 code (e.g. \`"USD"\`) — required when \`unit\` is \`"currency"\`
- \`advertiser_id\` (string, optional): Advertiser identifier
- \`campaign_id\` (string, optional): Campaign identifier
- \`media_buy_id\` (string, optional): Media buy identifier
- \`package_id\` (string, optional): Package identifier
- \`creative_id\` (string, optional): Creative identifier
- \`source\` (string, optional): Source of the measurement data
- \`source_platform\` (string, optional): Platform the data originates from
- \`external_row_id\` (string, optional): External row identifier for idempotency

**Constraint:** At least one of \`advertiser_id\`, \`campaign_id\`, \`media_buy_id\`, \`package_id\`, or \`creative_id\` must be provided.

**Response (200):**
\`\`\`json
{
  "data": {
    "measurements": [
      { "index": 0, "action": "created" }
    ]
  }
}
\`\`\`

Actions: \`created\`, \`updated\`, \`unchanged\`, \`failed\`

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

### Creative Manifests (Campaign-Scoped)

Creative manifests live under campaigns — they are always scoped to a specific campaign.

**Dashboard URL**: \`{dashboard_url}\` is the base URL returned by \`GET /api/v2/buyer/dashboard-url\`. You MUST call this endpoint and use the returned value — never hardcode or guess the URL. It varies by environment (e.g. \`http://localhost:5173\` in local dev, \`https://agentic.scope3.com\` in production).

---

#### ⚠️⚠️⚠️ ABSOLUTE RULE: Creative Asset Creation & Upload = UI ONLY ⚠️⚠️⚠️

**There is NO MCP tool or API call for creating manifests or uploading assets. These operations DO NOT EXIST in the MCP interface.**

When a buyer asks to **add**, **upload**, **create**, or **manage** creative assets, follow these steps **exactly**:

**Step 1:** Get the dashboard URL:
\`\`\`
GET /api/v2/buyer/dashboard-url
\`\`\`
Returns: \`{ "dashboard_url": "<the actual base URL>" }\`

**Step 2:** Look up the advertiser ID and campaign ID using the **existing** list endpoints:
- \`GET /api/v2/buyer/advertisers\` — find the advertiser by name
- \`GET /api/v2/buyer/campaigns?advertiserId={advertiserId}\` — find the campaign by name

**Step 3:** Return the fully-qualified link:
\`\`\`
{dashboard_url}/campaign-creative-assets/{advertiserId}/{campaignId}
\`\`\`

**That is your ENTIRE response. Nothing else.**

**Examples:**

Buyer: "I want to add some creative assets for my Q2 campaign"
→ Call \`GET /api/v2/buyer/dashboard-url\` → get the \`dashboard_url\` value from the response
→ Call \`GET /api/v2/buyer/advertisers\` → find advertiser ID
→ Call \`GET /api/v2/buyer/campaigns?advertiserId=24\` → find "Q2" campaign ID
→ Reply: "You can manage your creative assets here: {dashboard_url}/campaign-creative-assets/24/campaign_abc123"

Buyer: "For Ematini | Q2 Sales Boost I want to add some creative assets"
→ Call \`GET /api/v2/buyer/dashboard-url\` → get the \`dashboard_url\` value from the response
→ Call \`GET /api/v2/buyer/advertisers\` → find Ematini (ID 24)
→ Call \`GET /api/v2/buyer/campaigns?advertiserId=24\` → find Q2 Sales Boost campaign
→ Reply: "You can manage your creative assets here: {dashboard_url}/campaign-creative-assets/24/campaign_1770084484376_r7pspq"

**DO NOT:**
- Ask what files they have
- Ask about briefs, URLs, or tracking pixels
- Mention any API endpoint to the buyer
- Explain what asset types are supported
- Offer to create a manifest via API (this is impossible via MCP)
- Mention \`POST .../creatives/create\` (that is a REST-only endpoint used by the UI, not available via MCP)
- Use \`ask_about_capability\` — just call the endpoints above directly

---

#### What IS Available via MCP (READ-ONLY + metadata updates on EXISTING manifests)

**REMINDER: You CANNOT create new manifests via MCP. If the buyer asks to "add", "create", or "upload" creatives, you MUST direct them to the UI link (see above). The operations below ONLY work on manifests that already exist.**

The MCP interface exposes these operations for creative manifests that were **already created in the UI**:

**Note:** Template detection and format matching happen automatically when assets are uploaded via the UI. The response includes \`auto_detected_template\` with the detected \`template_id\` and detection \`method\`. There is no need to call a separate templates endpoint.

##### 1. List Creative Manifests
\`\`\`
GET /api/v2/buyer/campaigns/{campaignId}/creatives
\`\`\`
**Query parameters:**
- \`quality\` (optional): Filter by quality level
- \`search\` (optional): Case-insensitive name search
- \`take\` (optional): Page size, default 50
- \`skip\` (optional): Pagination offset

**Response:** Array of manifests, each with \`creative_id\`, \`name\`, \`message\` (brief), \`template_id\`, \`format_id\`, \`preview_url\`, \`format_previews[]\` (concrete format sizes), \`auto_detected_template\`, \`assets[]\` (each with \`asset_source\`: \`CREATIVE_SOURCE\`, \`USER_UPLOADED\`, or \`SYSTEM_PROCESSED\`), \`campaign_id\`, \`created_at\`, \`updated_at\`.

##### 2. Get Creative Manifest
\`\`\`
GET /api/v2/buyer/campaigns/{campaignId}/creatives/{creativeId}
\`\`\`
Optional query: \`?preview=true\`

**Response:** Single manifest with all fields including \`preview_url\`, \`format_previews[]\`, \`auto_detected_template\`, \`html_processing\` (macros injected, unresolved refs), and assets array.

##### 3. Update Creative Manifest (metadata only — NO file uploads)
\`\`\`
PUT /api/v2/buyer/campaigns/{campaignId}/creatives/{creativeId}
\`\`\`
**Body (all fields optional):**
- \`name\` (string): Manifest name
- \`message\` (string): Creative brief
- \`tag\` (string): Tag
- \`quality\` (string): Quality level
- \`format_id\` (object): \`{ agent_url: string, id: string }\` — ADCP format ID
- \`template_id\` (string): ADCP format template ID (e.g. \`"display_300x250_html"\`, \`"video_standard"\`, \`"vendor_dcm_tag"\`)
- \`url_asset\` (object): \`{ url: string, url_type: string }\` — add a URL-based asset
- \`delete_asset_ids\` (string[]): Asset IDs to soft-delete
- \`reclassify_assets\` (array): \`[{ asset_id: string, asset_type: string }]\` — change asset type

**Note:** File uploads are NOT possible via MCP. The MCP update only handles metadata changes, URL assets, and asset deletion/reclassification. For file uploads, direct the buyer to the UI.

##### 4. Delete Creative Manifest
\`\`\`
DELETE /api/v2/buyer/campaigns/{campaignId}/creatives/{creativeId}
\`\`\`
Soft-deletes the manifest and all its assets (sets \`archived_at\`).

**Response:** \`204 No Content\`

**⚠️ FINAL REMINDER: None of the above operations CREATE a manifest. If the buyer wants to ADD or CREATE creatives, your ONLY response is the UI link: \`{dashboard_url}/campaign-creative-assets/{advertiserId}/{campaignId}\`. Do NOT ask follow-up questions about file types, URLs, briefs, or tags.**

---

#### Display Requirements — When listing/showing manifests:
- **Name** and **Creative ID**
- **Template** and **Format ID** (if set) — these are ADCP format IDs (e.g. \`display_300x250_html\`, \`video_standard\`)
- **Auto-detected template** (if present) — show \`template_id\` and detection \`method\`
- **Brief/message** (if present)
- **Format previews count** (if present) — e.g. "4 format sizes available"
- **Asset count** and asset details (filename, type, \`asset_source\`, URL)
- **Created/Updated timestamps**

---

### Reporting

#### Get Reporting Metrics
\`\`\`http
GET /api/v2/buyer/reporting/metrics?view=summary&days=7&advertiserId=12345&campaignId=campaign_abc
\`\`\`

Returns reporting data in one of two views: **summary** (hierarchical breakdown) or **timeseries** (daily aggregation).

**Query Parameters:**
- \`view\` (optional): Response format — \`summary\` (default) or \`timeseries\`
  - \`summary\`: Hierarchical breakdown by advertiser → campaign → media buy → package
  - \`timeseries\`: Daily date-level metric aggregation
- \`days\` (optional): Number of days to include (default: 7, max: 90). Ignored if both startDate and endDate are provided
- \`startDate\` (optional): Start date in ISO format (YYYY-MM-DD)
- \`endDate\` (optional): End date in ISO format (YYYY-MM-DD)
- \`advertiserId\` (optional): Filter by advertiser ID
- \`campaignId\` (optional): Filter by campaign ID
- \`demo\` (optional, boolean): When \`true\`, returns auto-generated demo data instead of querying real data sources. Default: \`false\`. Useful for testing and previewing the reporting UI without live campaign data.

**⚠️ CRITICAL: Disambiguating "demo" in user requests**

The word "demo" can mean two different things in reporting requests. You MUST distinguish between them:

| User intent | Example phrases | Action |
|-------------|----------------|--------|
| **Demo flag** (synthetic demo data) | "show reporting (demo)", "demo show reporting", "show reporting with demo flag", "show reporting demo mode" | Set \`demo=true\` query parameter |
| **Name filter** (advertiser/campaign containing "demo") | "show reporting for demo advertiser", "show reporting for % demo %", "show campaigns named demo", "reporting for 'demo brand'" | Use \`advertiserId\` or \`campaignId\` filters to match entities whose names contain "demo" — do NOT set \`demo=true\` |

**How to tell the difference:**
- If "demo" appears as a **modifier or flag on the reporting request itself** (in parentheses, as "demo mode", "demo flag", or as a standalone qualifier adjacent to "reporting"), the user wants \`demo=true\`.
- If "demo" appears as a **value describing an advertiser, campaign, or entity name** (preceded by "for", "named", "called", or wrapped in quotes/wildcards), the user is filtering by name — do NOT set \`demo=true\`.

**Summary Response** (\`view=summary\`, default):
\`\`\`json
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
\`\`\`

**Timeseries Response** (\`view=timeseries\`):
\`\`\`json
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
\`\`\`

**Metrics included:** impressions, spend, clicks, views, completedViews, conversions, leads, videoCompletions, ecpm, cpc, ctr, completionRate

#### Export / Download Reporting Metrics as CSV

To export or download reporting data as a CSV file, use the same reporting metrics endpoint with \`?download=true\`. This generates a CSV and returns a signed download URL (valid 7 days) instead of JSON data.

**IMPORTANT:** When a user asks to "export", "download", "save as CSV", or "get a spreadsheet" of their reporting data, use this endpoint with \`download=true\`.

\`\`\`http
GET /api/v2/buyer/reporting/metrics?days=30&download=true
\`\`\`

All the same query parameters apply (\`days\`, \`startDate\`, \`endDate\`, \`advertiserId\`, \`campaignId\`). The only addition is \`download=true\`.

**Response when \`download=true\`:**
\`\`\`json
{
  "downloadUrl": "https://storage.googleapis.com/...",
  "expiresAt": "2025-02-20T12:00:00.000Z",
  "fileName": "reporting-metrics-2025-02-06-to-2025-02-13.csv",
  "rowCount": 42
}
\`\`\`

**CSV columns (20):** Advertiser ID, Advertiser Name, Campaign ID, Campaign Name, Media Buy ID, Media Buy Name, Media Buy Status, Package ID, Impressions, Spend, Clicks, Views, Completed Views, Conversions, Leads, Video Completions, eCPM, CPC, CTR, Completion Rate. One row per package (media buys with no packages get one row with empty Package ID).

**CRITICAL: NEVER generate your own CSV, Excel, or spreadsheet files.** Always use this \`?download=true\` endpoint to produce reporting exports. The endpoint handles proper formatting, escaping, and data integrity. Do not use artifacts, code execution, or any other mechanism to create files — use the API.

When the download response is received, present the \`downloadUrl\` to the user as a clickable download link. Include the \`fileName\` and note that the link expires after 7 days (\`expiresAt\`).

---

### Catalogs

Catalogs are managed entirely through sync — there is no separate create/update/delete.

**Before calling sync, you MUST collect from the user:**
1. Which advertiser — the advertiser ID goes in the URL path AND in \`account.account_id\` in the request body
2. The catalog(s) to sync — each needs a \`catalog_id\`, \`type\`, and either a feed \`url\` or inline \`items\`

#### Sync Catalogs

**Option A — Remote feed URL (multiple catalogs in one call):**
\`\`\`http
POST /api/v2/buyer/advertisers/26/catalogs/sync
{
  "account": { "account_id": "26" },
  "catalogs": [
    {
      "catalog_id": "products-2026",
      "type": "product",
      "name": "2026 Product Catalog",
      "url": "https://example.com/products.xml",
      "feed_format": "google_merchant_center",
      "update_frequency": "daily"
    },
    {
      "catalog_id": "promotions-q1",
      "type": "promotion",
      "name": "Q1 Promotions",
      "url": "https://example.com/promotions.xml",
      "feed_format": "custom",
      "update_frequency": "hourly"
    }
  ]
}
\`\`\`

**Option B — Inline items:**
\`\`\`http
POST /api/v2/buyer/advertisers/26/catalogs/sync
{
  "account": { "account_id": "26" },
  "catalogs": [
    {
      "catalog_id": "my-catalog-1",
      "type": "product",
      "name": "Q1 Products",
      "items": [
        {
          "item_id": "sku-001",
          "title": "Blue Widget",
          "description": "A sturdy blue widget for everyday use",
          "price": "19.99 USD",
          "link": "https://example.com/products/blue-widget",
          "image_link": "https://example.com/images/blue-widget.jpg",
          "availability": "in stock",
          "brand": "Acme",
          "google_product_category": "Hardware > Tools"
        },
        {
          "item_id": "sku-002",
          "title": "Red Widget",
          "description": "A sturdy red widget for everyday use",
          "price": "24.99 USD",
          "link": "https://example.com/products/red-widget",
          "image_link": "https://example.com/images/red-widget.jpg",
          "availability": "in stock",
          "brand": "Acme",
          "google_product_category": "Hardware > Tools"
        }
      ]
    }
  ]
}
\`\`\`

> Items are free-form key/value objects — the fields depend on the catalog \`type\`. The examples above use common product fields. For \`job\` catalogs use fields like \`job_id\`, \`title\`, \`company\`, \`location\`; for \`hotel\` use \`hotel_id\`, \`name\`, \`address\`, \`star_rating\`; etc.

**URL path:** \`/advertisers/{advertiserId}/catalogs/sync\` — the \`{advertiserId}\` is the numeric advertiser ID (e.g. \`26\`). Also include it in the request body as \`account.account_id\`.

**\`account\` (required in body):**
- \`account_id\` (string): The advertiser ID — same value as the path \`{advertiserId}\` (e.g. \`"26"\`).

**\`catalogs\` array (required, 1–50 items). Each object:**
- \`catalog_id\` (string, required): Buyer-assigned identifier
- \`type\` (string, required): \`offering\`, \`product\`, \`inventory\`, \`store\`, \`promotion\`, \`hotel\`, \`flight\`, \`job\`, \`vehicle\`, \`real_estate\`, \`education\`, \`destination\`
- \`name\` (string, optional): Display name
- \`url\` (string): Remote feed URL — provide this OR \`items\`, not both
- \`items\` (array): Inline catalog items — provide this OR \`url\`, not both
- \`feed_format\` (string, optional): \`google_merchant_center\`, \`facebook_catalog\`, \`shopify\`, \`linkedin_jobs\`, \`custom\`
- \`update_frequency\` (string, optional): \`realtime\`, \`hourly\`, \`daily\`, \`weekly\`
- \`conversion_events\` (array, optional): Conversion event IDs

**Other optional fields:**
- \`catalog_ids\` (array): Filter which catalog_ids from the \`catalogs\` array to process
- \`delete_missing\` (boolean): Archive catalogs not included in this request (default: false)
- \`dry_run\` (boolean): Preview changes without persisting (default: false)
- \`validation_mode\` (string): \`strict\` (default) or \`lenient\`

**Response:**
\`\`\`json
{
  "data": {
    "results": [
      {
        "catalog_id": "my-catalog-1",
        "action": "created",
        "name": "Q1 Products",
        "type": "offering"
      }
    ]
  }
}
\`\`\`

Actions: \`created\`, \`updated\`, \`unchanged\`, \`failed\`, \`deleted\`

#### List Catalogs

\`\`\`http
GET /api/v2/buyer/advertisers/26/catalogs
\`\`\`

**URL path:** \`/advertisers/{advertiserId}/catalogs\` — the \`{advertiserId}\` is the numeric advertiser ID.

**Query Parameters:**
- \`type\` (optional): Filter by catalog type (\`offering\`, etc.)
- \`take\` / \`skip\` (optional): Pagination

**Response (200):**
\`\`\`json
{
  "data": {
    "account": { "account_id": "26" },
    "catalogs": [
      {
        "catalogId": "my-catalog-1",
        "type": "offering",
        "name": "Q1 Products",
        "url": "https://example.com/feed.xml"
      }
    ]
  }
}
\`\`\`

---

### Sales Agents

Browse available sales agents, register agent credentials, and link accounts to advertisers.

**CRITICAL — Account Status Awareness:**
When listing sales agents, you MUST tell the user about the credential/account registration status for EACH agent. Specifically:
- If \`requiresAccount\` is \`true\`: Tell the user they need to register credentials for this agent before they can use it.
- If \`customerAccounts\` is empty and \`requiresOperatorAuth\` is \`true\`: The customer has NOT set up credentials yet — flag this.
- If \`customerAccounts\` has entries: Show the user their registered account identifiers and statuses.
- If \`requiresOperatorAuth\` is \`false\`: The platform handles credentials — no action needed from the user.

Never silently omit this information. The user needs to know which agents are ready to use and which require setup.

**CRITICAL — Proactive Registration Prompt for \`requiresAccount: true\` Agents:**
When ANY agent in the response has \`requiresAccount: true\`, you MUST:
1. **Explicitly call it out in a separate section** — Do NOT bury it in the main list. After showing the full agent list, add a clear callout like: "The following agents require you to register credentials before you can use them: [agent names]. Would you like to register credentials for any of them?"
2. **Offer to start the registration flow** — Ask the user if they want to register credentials now. If yes:
   a. For **OAUTH agents** (\`authenticationType: "OAUTH"\`): Call \`POST /api/v2/buyer/sales-agents/{agentId}/accountCredentials\` with just \`accountIdentifier\` (no \`auth\` field). Present the returned \`oauth.authorizationUrl\` for the user to complete authorization.
   b. For **API_KEY/JWT agents**: Ask the user for their credentials, then call \`POST /api/v2/buyer/sales-agents/{agentId}/accountCredentials\`.
3. **After registering credentials, offer to link an account to an advertiser** — Once agent credentials are registered, ask: "Now that credentials are set up for [agent name], would you like to discover and link an account to a specific advertiser?" If yes, follow the Link Agent Account to Advertiser workflow (see Advertisers section):
   a. List the customer's advertisers via \`GET /api/v2/buyer/advertisers\`
   b. For the chosen advertiser, discover available accounts for the agent: \`GET /api/v2/buyer/advertisers/{advertiserId}/accounts/available?partnerId={agentId}\`
   c. Present discovered accounts and let the user pick
   d. Link via \`PUT /api/v2/buyer/advertisers/{advertiserId}\` with \`linkedAccounts\`

This end-to-end flow (list agents → register agent credentials → link account to advertiser) should feel seamless. Do NOT make the user figure out the next step — always offer it.

#### List Sales Agents

List all sales agents visible to the buyer. Shows all non-DISABLED agents. Results are paginated.

\`\`\`http
GET /api/v2/buyer/sales-agents?status=ACTIVE&relationship=MARKETPLACE&limit=10&offset=0
\`\`\`

**Query Parameters (all optional):**
- \`status\` (string): Filter by status — \`PENDING\`, \`ACTIVE\`
- \`relationship\` (string): Filter by relationship — \`SELF\` (owned by you), \`MARKETPLACE\` (all other marketplace agents)
- \`name\` (string): Filter by agent name (partial match, case-insensitive)
- \`supportsRegistration\` (boolean string \`"true"\`/\`"false"\`): When \`true\`, return only agents with \`requiresOperatorAuth: true\` (i.e. agents the buyer must register their own credentials for)
- \`limit\` (number): Maximum number of agents to return per page (default: 10, max: 10)
- \`offset\` (number): Number of agents to skip for pagination (default: 0)

**Response:**
\`\`\`json
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
        "requiresOperatorAuth": true,
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
    "hasMore": true,
    "nextOffset": 10
  }
}
\`\`\`

**Pagination:** Results are paginated with a maximum of 10 items per page. When \`hasMore\` is true, use the \`nextOffset\` value as the \`offset\` parameter in your next request to fetch the next page. Continue until \`hasMore\` is false or \`nextOffset\` is null.

**Notes:**
- All non-DISABLED agents are visible to everyone
- PENDING agents from other owners appear as \`"status": "COMING_SOON"\` with minimal info
- \`customerAccounts\` lists the caller's own accounts (excludes marketplace accounts)
- \`requiresAccount\` is true when the agent requires operator auth and the caller has no credentials registered
- \`requiresOperatorAuth\` indicates whether the buyer must provide their own credentials
- \`oauth\` field is present for owner's PENDING OAUTH agents that haven't completed the OAuth flow

**Credential rules — CRITICAL:**
- \`requiresOperatorAuth: true\` → the buyer MUST provide their own credentials. Use \`GET /api/v2/buyer/sales-agents?supportsRegistration=true\` to list these. Registration is done via \`POST /api/v2/buyer/sales-agents/{agentId}/accountCredentials\`.
- \`requiresOperatorAuth: false\` → the platform (Scope3) uses its own credentials. **Individual credential registration is NOT applicable.** Do NOT present these agents when the user asks which agents they can register credentials for or which agents they can link to advertisers.
- These states are mutually exclusive — an agent is in one state or the other, never both.
- **Account linking requires \`requiresOperatorAuth: true\`.** Only agents where the buyer registers their own credentials can have accounts discovered and linked to advertisers. When users ask about linking agents to advertisers, ALWAYS filter with \`supportsRegistration=true\`.

**Display Requirements — ALWAYS include when listing sales agents:**

Present each agent as a structured entry (not prose). Group agents into these sub-categories:

1. **Active & Ready to Use** — ACTIVE agents where \`requiresAccount\` is false
2. **Active but Requires Your Credentials** — ACTIVE agents where \`requiresAccount\` is true
3. **Coming Soon** — agents with status \`COMING_SOON\`

For every agent, show:
- **Name** (append "[Your Agent]" if \`relationship: "SELF"\`)
- **ID** (\`agentId\`)
- **Protocol** (MCP, A2A, etc.)
- **Status** (ACTIVE, COMING_SOON, etc.)
- **Credential status** — one of: "Platform-managed" (if \`requiresOperatorAuth: false\`), "Registered" (if \`requiresOperatorAuth: true\` and \`customerAccounts\` has entries), or "Needs your credentials" (if \`requiresOperatorAuth: true\` and no \`customerAccounts\`)
- **Registered accounts** — list each \`customerAccounts\` entry by \`accountIdentifier\` and \`status\`, or "None" if empty

Key rules:
- \`status\` and \`requiresAccount\` are separate concepts. \`status\` = whether the agent is live. \`requiresAccount\` = whether this buyer has registered credentials.
- Never summarize into a sentence like "You have 5 sales agents." Always show the per-item details above for every agent.
- **After listing, ALWAYS ask about registration** if any agents have \`requiresAccount: true\`. Do NOT just list them and move on.
- When answering "which agents can I register credentials for" or "which agents can I link to advertisers" (or any variation about linking, connecting, or registering with agents) — call \`GET /api/v2/buyer/sales-agents?supportsRegistration=true\` to get only agents that support account registration and linking. Only agents with \`requiresOperatorAuth: true\` can have accounts linked to advertisers — agents with \`requiresOperatorAuth: false\` use platform-managed credentials and do NOT support per-advertiser account linking. Do NOT call without this parameter and filter client-side.

#### List Registered Agent Credentials

List all agent credentials registered by this customer across all agents.

\`\`\`http
GET /api/v2/buyer/sales-agents/accountCredentials
\`\`\`

**Response (200):**
\`\`\`json
{
  "data": [
    {
      "id": "722",
      "agentId": "snap_6e2d13705a26",
      "agentName": "Snap",
      "accountIdentifier": "Scope3 Snap Creds",
      "accountType": "CLIENT",
      "status": "ACTIVE",
      "registeredBy": "user@example.com",
      "createdAt": "2026-02-23T19:55:11.602Z",
      "updatedAt": "2026-02-23T19:56:56.272Z"
    }
  ]
}
\`\`\`

**Notes:**
- Returns all agent credentials belonging to the authenticated customer, across all agents
- \`auth_configuration\` is never returned (sensitive)
- Use this to check what agent credentials have been registered before linking accounts to advertisers

#### Register Agent Credentials

Register credentials for a specific agent at the **customer level**. This is the first step in connecting to an agent — credentials belong to the whole customer, not a specific advertiser. Once credentials are registered, accounts can be discovered and linked to individual advertisers (see Link Agent Account to Advertiser in the Advertisers section).

**Multiple credentials per agent:** A customer CAN register multiple sets of credentials for the same agent (e.g., two different Snap ad accounts with different API keys). Each set uses a different \`accountIdentifier\`. Each credential discovers its own set of ad accounts. When discovering accounts for linking, the \`credentialId\` parameter is required so the system knows which credential to query — see "Link Agent Account to Advertiser" in the Advertisers section for the full workflow.

\`\`\`http
POST /api/v2/buyer/sales-agents/{agentId}/accountCredentials
{
  "accountIdentifier": "my-publisher-account",
  "auth": {
    "type": "bearer",
    "token": "my-api-key"
  }
}
\`\`\`

**Path Parameters:**
- \`agentId\` (string): The agent ID

**Required Fields:**
- \`accountIdentifier\` (string): Unique account identifier for this agent

**Optional Fields:**
- \`auth\` (object): Authentication credentials. Required for API_KEY/JWT agents, not needed for OAUTH agents.
- \`marketplaceAccount\` (boolean): Admin-only flag for marketplace accounts

**OAUTH agents:** Do NOT ask the user for any OAuth credentials (client_id, client_secret, tokens, etc.). Just omit the \`auth\` field. The response will include an \`oauth.authorizationUrl\` — present this link to the user to complete authorization. The platform handles discovery, client registration, and token exchange automatically.

**Response (non-OAUTH, 201):**
\`\`\`json
{
  "id": "123",
  "accountIdentifier": "my-publisher-account",
  "status": "ACTIVE",
  "registeredBy": "user@example.com",
  "createdAt": "2026-01-15T10:00:00Z"
}
\`\`\`

**Response (OAUTH, 201):**
\`\`\`json
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
\`\`\`

**Notes:**
- Agent must be ACTIVE before accounts can be registered
- For OAUTH agents, the account is created with PENDING status and includes an \`authorizationUrl\` for the user to click
- After the user authorizes, the account status changes to ACTIVE automatically

### Audiences

Sync first-party CRM audiences into Scope3 for later syndication to sales agents. Audiences contain hashed customer identifiers used for targeting. Processing is **asynchronous** — sync returns immediately with an \`operationId\`, and processing completes in the background.

**Important:** All member identifiers must be pre-hashed before sending:
- **Email:** SHA-256 of lowercase, trimmed email (64-char hex string)
- **Phone:** SHA-256 of E.164-formatted phone number (64-char hex string)
- **Universal IDs:** RampID, UID2, MAID, etc. passed as-is

**Limits:** Maximum 100,000 total members per sync call. For larger lists, chunk into sequential requests.

#### Sync Audiences

Sync audience data for an advertiser. The \`accountId\` in the URL is the **advertiser ID** (numeric, e.g. \`25\`) — the same \`advertiserId\` used when creating campaigns. Returns **202 Accepted** with an operation ID for tracking. Each member requires an \`externalId\` plus at least one hashed identifier.

\`\`\`http
POST /api/v2/buyer/advertisers/{accountId}/audiences/sync
{
  "audiences": [
    {
      "audienceId": "crm-high-value",
      "name": "High Value Customers",
      "add": [
        {
          "externalId": "user-001",
          "hashedEmail": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
        },
        {
          "externalId": "user-002",
          "uids": [{ "type": "uid2", "value": "uid2-token-value" }]
        }
      ],
      "consentBasis": "consent"
    }
  ],
  "deleteMissing": false
}
\`\`\`

**Path Parameters:**
- \`accountId\` (string, required): Advertiser ID (numeric, e.g. \`"25"\`)

**Required Fields:**
- \`audiences\` (array): Audiences to sync
  - \`audienceId\` (string, required): Buyer's identifier for this audience

**Optional Fields per Audience:**
- \`name\` (string): Human-readable name
- \`add\` (array, max 10,000): Members to add (each needs \`externalId\` + at least one identifier)
- \`remove\` (array, max 10,000): Members to remove by \`externalId\`
- \`delete\` (boolean): When true, delete this audience entirely
- \`consentBasis\` (string): GDPR lawful basis — \`consent\`, \`legitimate_interest\`, \`contract\`, \`legal_obligation\`
- \`deleteMissing\` (boolean): When true, audiences not in this request are marked as deleted

**Response (202 Accepted):**
\`\`\`json
{
  "success": true,
  "accountId": "25",
  "operationId": "550e8400-e29b-41d4-a716-446655440000",
  "taskId": "550e8400-e29b-41d4-a716-446655440000"
}
\`\`\`

**Notes:**
- Processing is asynchronous — poll \`GET /api/v2/buyer/tasks/{taskId}\` for progress (see [Tasks](#tasks))
- \`status\` values: \`PROCESSING\` (matching in progress), \`READY\` (available for targeting), \`ERROR\`, \`TOO_SMALL\` (below platform minimum)

#### List Audiences

List stored audiences for an account. Use this to check processing status after syncing.

\`\`\`http
GET /api/v2/buyer/advertisers/{accountId}/audiences?take=50&skip=0
\`\`\`

**Path Parameters:**
- \`accountId\` (string, required): Advertiser ID (numeric, e.g. \`"25"\`)

**Query Parameters (all optional):**
- \`take\` (number): Results per page (default: 50, max: 100)
- \`skip\` (number): Pagination offset (default: 0)

**Response:**
\`\`\`json
{
  "audiences": [
    {
      "audienceId": "crm-high-value",
      "name": "High Value Customers",
      "accountId": "25",
      "consentBasis": "consent",
      "status": "READY",
      "deleted": false,
      "uploadedCount": 1500,
      "matchedCount": 1200,
      "lastOperationStatus": "COMPLETED",
      "createdAt": "2026-02-24T10:00:00Z",
      "updatedAt": "2026-02-25T10:00:00Z"
    }
  ],
  "total": 1,
  "take": 50,
  "skip": 0
}
\`\`\`

---

### Syndication

Syndicate audiences, event sources, or catalogs to ADCP agents. Tracks status asynchronously via webhooks.

#### Syndicate Resource

\`\`\`http
POST /api/v2/buyer/advertisers/{advertiserId}/syndicate
{
  "resourceType": "AUDIENCE",
  "resourceId": "aud_12345",
  "adcpAgentIds": ["agent-abc-123", "agent-def-456"],
  "enabled": true
}
\`\`\`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`resourceType\` | string | Yes | \`AUDIENCE\`, \`EVENT_SOURCE\`, or \`CATALOG\` |
| \`resourceId\` | string | Yes | ID of the resource to syndicate |
| \`adcpAgentIds\` | string[] | Yes | Array of ADCP agent ID strings (min 1) |
| \`enabled\` | boolean | Yes | Whether to enable or disable syndication |

**Response (201):** Returns the syndication status records for each agent.

#### Query Syndication Status

\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/syndication-status?resourceType=AUDIENCE&status=SYNCING&limit=20&offset=0
\`\`\`

**Query Parameters (all optional):**
| Parameter | Type | Description |
|-----------|------|-------------|
| \`resourceType\` | string | Filter by \`AUDIENCE\`, \`EVENT_SOURCE\`, or \`CATALOG\` |
| \`resourceId\` | string | Filter by specific resource ID |
| \`adcpAgentId\` | string | Filter by ADCP agent ID |
| \`enabled\` | string | Filter by \`true\` or \`false\` |
| \`status\` | string | Filter by \`PENDING\`, \`SYNCING\`, \`COMPLETED\`, \`FAILED\`, or \`DISABLED\` |
| \`limit\` | number | Max results (1-100, default 50) |
| \`offset\` | number | Pagination offset (default 0) |

---

### Tasks

Async operations (audience sync, media buy creation, etc.) return a task ID that can be polled for status.

#### Get Task Status
\`\`\`http
GET /api/v2/buyer/tasks/{taskId}
\`\`\`

**Response:**
\`\`\`json
{
  "task": {
    "taskId": "550e8400-e29b-41d4-a716-446655440000",
    "taskType": "audience_sync",
    "status": "completed",
    "resourceType": "audience",
    "resourceId": "aud_12345",
    "error": null,
    "response": { "audience_id": "aud_12345", "member_count": 15000 },
    "metadata": {},
    "retryAfterSeconds": null,
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:35:00.000Z"
  }
}
\`\`\`

**Task types:** \`audience_sync\`, \`media_buy_create\`, \`creative_sync\`

**Status values:** \`submitted\`, \`working\`, \`completed\`, \`failed\`, \`input-required\`

**Error format** (AdCP-compatible, set when status is \`failed\`):
\`\`\`json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid budget value",
  "field": "packages[0].budget",
  "suggestion": "Budget must be positive",
  "recovery": "correctable"
}
\`\`\`

**Notes:**
- Task IDs are UUIDs returned in 202 responses from async operations
- Poll this endpoint when webhooks are unavailable — use \`retryAfterSeconds\` for polling interval guidance
- \`response\` contains the original downstream response payload (varies by task type)
- Tasks are scoped to the caller's customer — you cannot access another customer's tasks

---

### Property Lists

Property lists define which publisher domains an advertiser targets (include lists) or avoids (exclude lists). Lists are scoped to an advertiser and automatically apply to all campaigns under that brand's targeting profile.

#### Create Property List

Create a named include or exclude list of publisher domains. Domains are resolved to internal property records. Any domains that cannot be resolved are returned as \`unresolvedDomains\`.

\`\`\`http
POST /api/v2/buyer/advertisers/{advertiserId}/property-lists
\`\`\`

**Request body:**
\`\`\`json
{
  "name": "Q1 Campaign - Premium Publishers",
  "purpose": "include",
  "domains": ["nytimes.com", "cnn.com", "bbc.co.uk"]
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "listId": "42",
  "name": "Q1 Campaign - Premium Publishers",
  "purpose": "include",
  "domains": ["nytimes.com", "cnn.com"],
  "unresolvedDomains": ["bbc.co.uk"],
  "propertyCount": 2,
  "createdAt": "2026-03-16T10:00:00.000Z",
  "updatedAt": "2026-03-16T10:00:00.000Z"
}
\`\`\`

#### List Property Lists

\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/property-lists?purpose=include
\`\`\`

#### Get Property List

\`\`\`http
GET /api/v2/buyer/advertisers/{advertiserId}/property-lists/{listId}
\`\`\`

#### Update Property List

Update name and/or replace domains entirely.

\`\`\`http
PUT /api/v2/buyer/advertisers/{advertiserId}/property-lists/{listId}
\`\`\`

**Request body:**
\`\`\`json
{
  "name": "Updated List Name",
  "domains": ["nytimes.com", "washingtonpost.com"]
}
\`\`\`

#### Delete Property List

Archives the property list. The list remains associated with the advertiser but is no longer active.

\`\`\`http
DELETE /api/v2/buyer/advertisers/{advertiserId}/property-lists/{listId}
\`\`\`

**Recommended workflow:**
1. Create a property list with initial domains
2. Use the check endpoint (below) to validate domains against the AAO registry
3. Update the list based on check results (remove blocked domains, apply canonical corrections)
4. All campaigns under the advertiser automatically inherit the targeting
5. Property lists are automatically passed to sales agents during product discovery via ADCP \`property_list\` field

#### Resolve Property List (ADCP)

Returns a property list in ADCP \`GetPropertyListResponse\` format with domain identifiers. Used by sales agents to resolve a \`PropertyListReference\` received during product discovery. Authenticated via HMAC token (not platform auth).

\`\`\`http
GET /lists/{listId}
Authorization: Bearer {auth_token}
\`\`\`

**Response:**
\`\`\`json
{
  "list": {
    "list_id": "123",
    "name": "Premium publishers"
  },
  "identifiers": [
    { "type": "domain", "value": "nytimes.com" },
    { "type": "domain", "value": "cnn.com" }
  ],
  "resolved_at": "2026-03-17T12:00:00.000Z",
  "cache_valid_until": "2026-03-18T12:00:00.000Z"
}
\`\`\`

#### Check Property List

Validate a list of publisher domains against the AAO Community Registry. Identifies blocked domains (ad servers, CDNs, trackers), normalizes URLs (strips www/m prefixes), removes duplicates, and flags unknown domains.

\`\`\`http
POST /api/v2/buyer/property-lists/check
\`\`\`

**Request body:**
\`\`\`json
{
  "domains": ["nytimes.com", "www.cnn.com", "doubleclick.net", "unknown-site.xyz"]
}
\`\`\`

**Response:**
\`\`\`json
{
  "summary": { "total": 4, "remove": 1, "modify": 1, "assess": 1, "ok": 1 },
  "remove": [
    { "input": "doubleclick.net", "canonical": "doubleclick.net", "reason": "blocked", "domain_type": "ad_server" }
  ],
  "modify": [
    { "input": "www.cnn.com", "canonical": "cnn.com", "reason": "www prefix removed" }
  ],
  "assess": [
    { "domain": "unknown-site.xyz" }
  ],
  "ok": [
    { "domain": "nytimes.com", "source": "registry" }
  ],
  "reportId": "rpt_abc123"
}
\`\`\`

**Result buckets:**
- \`remove\`: Domains to remove — duplicates or blocked (ad servers, CDNs, trackers, intermediaries)
- \`modify\`: Domains that were normalized (e.g. \`www.example.com\` → \`example.com\`). Use the \`canonical\` value.
- \`assess\`: Unknown domains not in the registry and not blocked — may need manual review
- \`ok\`: Domains found in the registry with no issues

**Limits:** 1–1000 domains per request.

#### Get Property Check Report

Retrieve a stored property check report by ID. Reports expire after 7 days.

\`\`\`http
GET /api/v2/buyer/property-lists/reports/{reportId}
\`\`\`

**Response:**
\`\`\`json
{
  "summary": { "total": 4, "remove": 1, "modify": 1, "assess": 1, "ok": 1 }
}
\`\`\`

---

## Error Handling

### Hard Failures vs. No Products Found

These are two distinct outcomes — do NOT conflate them:

**Hard failures** — the agent returned an actual error response. Examples:
- Auth or tenant context errors
- Authentication required
- Data corruption errors
- MCP endpoint not responding

These surface as non-2xx HTTP responses or error payloads. Treat as errors that need investigation.

**Soft failures / no products** — the agent responded successfully (HTTP 200) but returned 0 products. This is **not an error**. It means the brief did not match available inventory. Do NOT tell the user the agent "failed." See "When discovery returns no products" above for how to handle this.

### API Error Format

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

## Notifications

Notifications are events about resources you manage — campaigns going unhealthy, creatives syncing, agents registering, etc. They follow a \`resource.action\` taxonomy (e.g., \`campaign.unhealthy\`, \`creative.sync_failed\`).

### List Notifications
\`\`\`http
GET /api/v2/buyer/notifications?unreadOnly=true&limit=20&offset=0
\`\`\`

**Query Parameters (all optional):**
- \`unreadOnly\` (\`true\`/\`false\`): Show only unread notifications
- \`brandAgentId\` (number): Filter by brand agent
- \`types\` (comma-separated): Filter by event types (e.g., \`campaign.unhealthy,creative.sync_failed\`)
- \`campaignId\` (string): Filter by campaign
- \`creativeId\` (string): Filter by creative
- \`limit\` (number): Results per page (default: 50, max: 100)
- \`offset\` (number): Pagination offset

**Response:**
\`\`\`json
{
  "notifications": [
    {
      "id": "notif_1709123456_abc123",
      "type": "campaign.unhealthy",
      "data": {
        "message": "Campaign \\"Q1 CTV\\" is unhealthy",
        "campaignId": "camp_123",
        "campaignName": "Q1 CTV"
      },
      "read": false,
      "acknowledged": false,
      "createdAt": "2026-03-01T12:00:00Z"
    }
  ],
  "totalCount": 15,
  "unreadCount": 3,
  "hasMore": false
}
\`\`\`

### Mark Notification as Read
\`\`\`http
POST /api/v2/buyer/notifications/{notificationId}/read
\`\`\`

Marks a single notification as seen. No request body required.

### Mark Notification as Acknowledged
\`\`\`http
POST /api/v2/buyer/notifications/{notificationId}/acknowledge
\`\`\`

Marks a notification as dealt with. Acknowledged notifications are automatically cleaned up after 90 days. No request body required.

### Mark All Notifications as Read
\`\`\`http
POST /api/v2/buyer/notifications/read-all
\`\`\`

**Optional body:**
\`\`\`json
{ "brandAgentId": 123 }
\`\`\`

If \`brandAgentId\` is provided, only marks notifications for that agent as read. Otherwise marks all unread notifications as read.

### Proactive Notification Setup

Unread notifications are automatically included in \`help\` and \`ask_about_capability\` tool responses. To ensure your AI agent surfaces them to users at the start of every session, add the following to your client configuration:

- **Claude Desktop**: Create a Project and add to the project instructions: \`When using Scope3 tools, always start by calling the help tool. The response includes unread notifications — summarize those for the user before answering their question.\`
- **Claude Code**: Add the same instruction to your \`CLAUDE.md\` or project instructions.
- **API / Custom Agent**: Add it to your system prompt.
- **ChatGPT Custom GPT**: Add it to your Custom GPT's instructions.

---

## Common Mistakes to Avoid

1. **Creating campaign without advertiser** — Always create/verify advertiser first
2. **Skipping product discovery** — Always use \`POST /discovery/discover-products\` to discover products; use \`GET /discovery/{id}/discover-products\` to browse more
3. **Optimization without event source** — You need an event source (\`eventSourceId\`) before creating a campaign with event-based optimization goals
4. **Optimization without conversion data** — System needs events logged via event sources to optimize for ROAS/conversions
5. **Forgetting to execute** — Campaigns start in DRAFT status; must call \`POST /campaigns/{id}/execute\`
6. **Wrong endpoint path** — Always use \`/api/v2/buyer/\` prefix
7. **Creating advertiser without brand** — \`brand\` is required. If brand resolution returns an enriched preview, show the preview and offer to retry with \`saveBrand: true\`. Only direct the user to external registration if no brand data is found at all
8. **Auto-selecting products for the user** — When the user wants to browse/select inventory, ALWAYS present discovery results and let them choose
9. **Defaulting to a configuration without asking** — When the user says "create a campaign" without specifying how to configure it, ask them to choose (product discovery or performance metrics)
10. **Fabricating field values** — NEVER guess or make up values for required fields. Always ask the user or use values from previous API responses
11. **Making multiple API calls in one turn** — ONE discovery/mutating call per turn. Present results, END YOUR TURN, wait for the user.
12. **Missing bid price for non-fixed pricing** — If a product's pricing option has \`isFixed: false\`, \`bidPrice\` is REQUIRED in the \`POST /discovery/{id}/products\` request. Read it from the product's \`pricingOptions\` (\`rate\` or \`floorPrice\`) in the discovery response. Do NOT ask the user — the value comes from the product data.
13. **Summarizing list responses as prose** — When listing advertisers, sales agents, or campaigns, NEVER reduce the response to a sentence like "You have 13 advertisers." Always show the structured per-item details specified in the Display Requirements for that endpoint. The user needs to see each item's operational details, not a count.
14. **Using user-provided account IDs for linking** — NEVER use an account ID or account name that the user provides verbally. Account IDs for linking MUST come from the \`GET /advertisers/{id}/accounts/available?partnerId={agentId}\` discovery endpoint. If the user says "link account 06cd7033..." or "the account is named XYZ", do NOT use that value directly — call the discovery endpoint first, find the matching account in the response, and use the \`accountId\` from the API response. If the account does not appear in the discovery results, tell the user it was not found — do NOT pretend to link it.
15. **Missing credentialId with multiple credentials** — When a customer has multiple credentials for the same agent, the \`accounts/available\` endpoint requires \`credentialId\`. If omitted, the API returns an error with available credential IDs. Present those to the user and ask which to use, then retry with the chosen \`credentialId\`.

`;

export const bundledStorefrontSkillMd = `
---
name: scope3-agentic-storefront
version: "2.0.0"
description: Scope3 Agentic Storefront API - Publisher and seller integrations
api_base_url: https://api.agentic.scope3.com/api/v2/storefront
auth:
  type: bearer
  header: Authorization
  format: "Bearer {token}"
  obtain_url: https://agentic.scope3.com/user-api-keys
---

# Scope3 Agentic Storefront API

This API enables partners to manage their activation partnerships, create storefronts, and register agents through the Scope3 Agentic platform. Storefronts are the single entry point for partner onboarding — agents are created as part of inventory source setup.

**Important**: This is a REST API accessed via the \`api_call\` tool. After reading this documentation, use \`api_call\` to make HTTP requests to the endpoints below.

## ⚠️ CRITICAL: Never Render Your Own UI When a Tool Is Already Returning One

**When a tool response already includes a UI component, display it as-is. Do NOT generate your own HTML artifacts, dashboards, charts, or visual components on top of it.** If the tool returns a UI, that is the UI — do not create a competing or duplicate visualization.

## Notifications

The \`help\` and \`ask_about_capability\` tools include unread notifications in their responses. When a response contains a "Unread Notifications" section, summarize those notifications for the user before answering their question.

## Getting Started

All operations go through the generic \`api_call\` tool. Base path: \`/api/v2/storefront/\`. All endpoints require authentication via the MCP session, except the platform OAuth callback (\`GET /oauth/callback\`) which is public.

### Onboarding Flow

\`\`\`
1. Create Storefront    → POST /storefront { platformId, name, publisherDomain }
2. Add Inventory Source  → POST /storefront/inventory-sources
3. Activate Source       → PUT /storefront/inventory-sources/{sourceId} { status: "active" }
4. Set Up Billing        → POST /storefront/billing/connect
5. Check Readiness       → GET /storefront/readiness
6. Enable Storefront     → PUT /storefront { enabled: true }
\`\`\`

---
## Account Management

Some account management tasks are handled in the web UI at [agentic.scope3.com](https://agentic.scope3.com). Direct users to these pages for:

| Task | URL | Capabilities |
|------|-----|--------------|
| **API Keys** | [agentic.scope3.com/user-api-keys](https://agentic.scope3.com/user-api-keys) | Create, view, edit, delete, and reveal API key secrets |
| **Team Members** | [agentic.scope3.com/user-management](https://agentic.scope3.com/user-management) | Invite members, manage roles, manage partner access |
| **Billing** | Available from user menu in the UI | Manage payment methods, view invoices (via Stripe portal) |
| **Profile** | [agentic.scope3.com/user-info](https://agentic.scope3.com/user-info) | View and update user profile |

**Note:** Billing and member management require admin permissions.

---

## Available Endpoints

### Storefront Management

Each customer can have at most one storefront, keyed by a platformId slug.

#### Create Storefront

\`\`\`http
POST /api/v2/storefront
{
  "platformId": "cvs-media",
  "name": "CVS Media",
  "publisherDomain": "cvs.com"
}
\`\`\`

**Required Fields:**
- \`platformId\` (string): Lowercase slug with hyphens
- \`name\` (string, 1-255 chars): Display name

**Optional Fields:**
- \`publisherDomain\` (string): Publisher's domain
- \`plan\` (string): Plan tier, currently only \`"basic"\` (default)

#### Get Customer Storefront
\`\`\`http
GET /api/v2/storefront
\`\`\`

#### Update Storefront
\`\`\`http
PUT /api/v2/storefront
{
  "name": "CVS Media Network",
  "enabled": true
}
\`\`\`

**Note:** Setting \`enabled: true\` requires all readiness checks to pass. Check readiness first with \`GET /storefront/readiness\`.

#### Delete Storefront
\`\`\`http
DELETE /api/v2/storefront
\`\`\`

---

### Inventory Sources (Agent Registration)

When \`executionType\` is \`"agent"\`, creating an inventory source also registers the agent.

#### Create Inventory Source

\`\`\`http
POST /api/v2/storefront/inventory-sources
{
  "sourceId": "snap-ads-agent",
  "name": "Snap Ads Agent",
  "executionType": "agent",
  "type": "SALES",
  "endpointUrl": "https://agent.example.com/adcp",
  "protocol": "MCP",
  "authenticationType": "API_KEY",
  "auth": { "type": "bearer", "token": "my-api-key" }
}
\`\`\`

**Required Fields:**
- \`sourceId\` (string): Unique ID within the storefront
- \`name\` (string, 1-255 chars): Display name

**Required when executionType is "agent":**
- \`type\`: \`"SALES"\`, \`"SIGNAL"\`, \`"CREATIVE"\`, or \`"OUTCOME"\`
- \`endpointUrl\`: Agent endpoint URL (public HTTPS)
- \`protocol\`: \`"MCP"\` or \`"A2A"\`
- \`authenticationType\`: \`"API_KEY"\`, \`"NO_AUTH"\`, \`"JWT"\`, or \`"OAUTH"\`
- \`auth\` (object): Initial credentials. Required for non-OAUTH agents.

#### List Inventory Sources
\`\`\`http
GET /api/v2/storefront/inventory-sources
\`\`\`

#### Get Inventory Source
\`\`\`http
GET /api/v2/storefront/inventory-sources/{sourceId}
\`\`\`

#### Update Inventory Source
\`\`\`http
PUT /api/v2/storefront/inventory-sources/{sourceId}
{ "status": "active" }
\`\`\`

**Status Transitions:**
- \`pending → active\`: Activates source and linked agent
- \`pending → disabled\`: Disables source and linked agent
- \`active → disabled\`: Disables source and linked agent

#### Delete Inventory Source
\`\`\`http
DELETE /api/v2/storefront/inventory-sources/{sourceId}
\`\`\`

---

### Storefront Readiness

\`\`\`http
GET /api/v2/storefront/readiness
\`\`\`

**Status values:** \`ready\` (all checks pass), \`blocked\` (blockers present)

**Checks:** \`inventory_sources\`, \`agent_status\`, \`agent_auth\`, \`billing_setup\`

---

### Storefront Billing (Stripe Connect)

#### Provision Stripe Connect Account
\`\`\`http
POST /api/v2/storefront/billing/connect
\`\`\`

#### Get Billing Config
\`\`\`http
GET /api/v2/storefront/billing
\`\`\`

#### Get Stripe Account Status
\`\`\`http
GET /api/v2/storefront/billing/status
\`\`\`

#### Get Balance Transactions
\`\`\`http
GET /api/v2/storefront/billing/transactions?limit=25&starting_after=txn_xxx
\`\`\`

#### Get Payouts
\`\`\`http
GET /api/v2/storefront/billing/payouts?limit=25&starting_after=po_xxx
\`\`\`

#### Get Onboarding URL
\`\`\`http
GET /api/v2/storefront/billing/onboard
\`\`\`

---

### Agent Discovery (Read-Only)

#### List Agents
\`\`\`http
GET /api/v2/storefront/agents
\`\`\`

**Query Parameters:** \`type\`, \`status\`, \`relationship\`

#### Get Agent Details
\`\`\`http
GET /api/v2/storefront/agents/{agentId}
\`\`\`

---

### OAuth Endpoints

#### Start Setup OAuth Flow
\`\`\`http
POST /api/v2/storefront/agents/{agentId}/oauth/authorize
{}
\`\`\`

#### Start Account OAuth Flow
\`\`\`http
POST /api/v2/storefront/agents/{agentId}/accounts/oauth/authorize
{}
\`\`\`

#### Platform OAuth Callback (Public - No Auth)
\`\`\`
GET /api/v2/storefront/oauth/callback?code={code}&state={state}
\`\`\`

#### Exchange OAuth Code
\`\`\`http
POST /api/v2/storefront/agents/{agentId}/oauth/callback
{
  "code": "authorization-code-from-redirect",
  "state": "state-parameter-from-redirect"
}
\`\`\`

---

### Notifications

#### List Notifications
\`\`\`http
GET /api/v2/storefront/notifications?unreadOnly=true&limit=20&offset=0
\`\`\`

#### Mark Notification as Read
\`\`\`http
POST /api/v2/storefront/notifications/{notificationId}/read
\`\`\`

#### Mark Notification as Acknowledged
\`\`\`http
POST /api/v2/storefront/notifications/{notificationId}/acknowledge
\`\`\`

#### Mark All Notifications as Read
\`\`\`http
POST /api/v2/storefront/notifications/read-all
\`\`\`

---

## Key Concepts

### Authentication Types

| Type | Auth Object Format | Notes |
|------|-------------------|-------|
| \`API_KEY\` | \`{ "type": "bearer", "token": "..." }\` | Most common |
| \`NO_AUTH\` | \`{}\` | Agent endpoint is open |
| \`JWT\` | \`{ "type": "jwt", "privateKey": "..." }\` | JSON Web Token |
| \`OAUTH\` | Managed by OAuth flow | Credentials obtained through OAuth redirect |

---

## Common Mistakes to Avoid

1. **Asking the user for OAuth credentials** - The platform discovers everything automatically
2. **Auto-selecting accountPolicy** - Always ask the user
3. **Registering credentials/accounts on the Storefront API** - Use the Buyer API
4. **Missing advertiserId when linking an account** - Buyers must specify which advertiser
5. **Missing auth for non-OAUTH agents** - Initial credentials required
6. **No redirectUri needed for OAuth** - Platform uses its own callback URL
7. **Using GET for OAuth authorize** - The endpoints are POST
8. **Calling endpoints without auth** - All require auth except OAuth callback
9. **Wrong base path** - Storefront API uses \`/api/v2/storefront/\` prefix
10. **Registering accounts on PENDING agents** - Agent must be ACTIVE first
11. **Enabling storefront without checking readiness** - Always check readiness first
`;

export const bundledAt = '2026-03-31T00:00:00.000Z';

/**
 * Get bundled skill.md for a persona
 */
export function getBundledSkillMd(persona: Persona = 'buyer'): string {
  switch (persona) {
    case 'buyer':
      return bundledBuyerSkillMd;
    case 'storefront':
      return bundledStorefrontSkillMd;
    default:
      return bundledBuyerSkillMd;
  }
}
