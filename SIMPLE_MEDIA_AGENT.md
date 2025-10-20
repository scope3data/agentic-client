# Simple Media Agent

A basic reference implementation of a media agent that implements the Media Agent Protocol.

## Overview

This simple media agent demonstrates a passthrough strategy:
1. **Get Proposed Tactics**: Fetches products from all registered sales agents and proposes budget allocation based on floor prices
2. **Manage Tactic**: When assigned, creates media buys by allocating budget to the N cheapest products
3. **Reallocation**: Responds to daily reporting signals to reallocate budget based on performance

## Algorithm

### Budget Allocation
- Fetches all products from registered sales agents
- Sorts products by floor price (cheapest first)
- Calculates N = number of products where daily budget ≥ min daily budget (default $100)
- Selects N cheapest products
- Divides total budget equally among N products

### Reallocation
- Listens for daily `reporting-complete` webhook
- Analyzes performance data from all media buys
- Reallocates budget based on performance (TODO: implement reallocation logic)

## Installation

```bash
npm install @scope3/agentic-client
```

## Usage

### As a Standalone Server

```bash
export SCOPE3_API_KEY=your_api_key
export PORT=8080
export MIN_DAILY_BUDGET=100
npx simple-media-agent
```

### Programmatically

```typescript
import { SimpleMediaAgent } from '@scope3/agentic-client';

const agent = new SimpleMediaAgent({
  scope3ApiKey: process.env.SCOPE3_API_KEY,
  scope3BaseUrl: 'https://api.agentic.scope3.com',
  port: 8080,
  minDailyBudget: 100,
});

agent.start();
```

## Configuration

### Environment Variables

- `SCOPE3_API_KEY` (required): Your Scope3 API key
- `SCOPE3_BASE_URL` (optional): Scope3 API base URL (default: https://api.agentic.scope3.com)
- `PORT` (optional): Port to listen on (default: 8080)
- `MIN_DAILY_BUDGET` (optional): Minimum daily budget per product in USD (default: 100)

## Endpoints

The agent implements all required Media Agent Protocol endpoints:

### POST /get-proposed-tactics
Returns tactic proposals based on available products and floor prices.

**Request:**
```json
{
  "campaignId": "campaign-123",
  "budgetRange": { "min": 10000, "max": 50000, "currency": "USD" },
  "channels": ["display", "video"],
  "countries": ["US", "CA"],
  "brief": "Campaign brief text",
  "seatId": "seat-123"
}
```

**Response:**
```json
{
  "proposedTactics": [
    {
      "tacticId": "simple-passthrough-campaign-123",
      "execution": "Passthrough strategy: distribute budget across N products",
      "budgetCapacity": 50000,
      "pricing": {
        "method": "passthrough",
        "estimatedCpm": 2.50,
        "currency": "USD"
      },
      "sku": "simple-passthrough"
    }
  ]
}
```

### POST /manage-tactic
Accepts tactic assignment and creates media buys.

### POST /tactic-context-updated
Handles tactic context changes (budget, schedule, etc.).

### POST /tactic-creatives-updated
Handles creative updates.

### POST /tactic-feedback
Receives performance feedback from orchestrator.

### POST /webhook/reporting-complete
Handles daily reporting complete signal and triggers reallocation.

**Request:**
```json
{
  "tacticId": "tactic-123",
  "reportingData": {
    "date": "2025-10-20",
    "impressions": 100000,
    "spend": 250.00
  }
}
```

## Connecting to the MCP Server

To use this agent with the MCP server:

1. Start the simple media agent:
   ```bash
   export SCOPE3_API_KEY=your_api_key
   npx simple-media-agent
   ```

2. Start the MCP server pointing to the media agent:
   ```bash
   export MEDIA_AGENT_URL=http://localhost:8080
   npx scope3-media-agent
   ```

3. The MCP server will now proxy calls to your simple media agent

## Extending the Agent

This is a reference implementation. To build your own media agent:

1. **Custom Product Selection**: Modify `handleGetProposedTactics` to filter/rank products differently
2. **Budget Allocation**: Update `calculateBudgetAllocation` with your own algorithm
3. **Reallocation Logic**: Implement performance-based reallocation in `handleReportingComplete`
4. **Optimization**: Add ML models, historical data analysis, or custom signals

## Example Custom Extensions

### Use Brand Story for Targeting
```typescript
const productsResponse = await this.scope3.products.discover({
  salesAgentId: agent.id,
  brandStoryId: tacticContext.brandStoryId,
});
```

### Optimize for vCPM
```typescript
// Filter products by viewability
const highViewabilityProducts = allProducts.filter(p =>
  p.viewability >= 0.85
);
```

### Performance-Based Reallocation
```typescript
// In handleReportingComplete
const sortedByPerformance = mediaBuys.sort((a, b) =>
  b.performanceIndex - a.performanceIndex
);

// Increase budget for top performers
for (const mediaBuy of sortedByPerformance.slice(0, 3)) {
  await this.scope3.mediaBuys.update({
    mediaBuyId: mediaBuy.id,
    budget: { amount: mediaBuy.budget * 1.2 },
  });
}
```
