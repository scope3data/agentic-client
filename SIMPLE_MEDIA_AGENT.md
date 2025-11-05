# Simple Media Agent

A basic reference implementation of a media agent using MCP (Model Context Protocol).

## Overview

This media agent exposes MCP tools that Scope3 platform calls to manage media buying:

- **get_proposed_tactics**: Fetches products from registered agents and proposes budget allocation based on floor prices
- **manage_tactic**: When assigned, creates media buys by allocating budget to the N cheapest products with overallocation

**Protocol**: MCP (stdio) - All communication via MCP, no HTTP server needed!

## Algorithm

### Budget Allocation
- Fetches all products from registered agents
- Sorts products by floor price (cheapest first)
- **Applies overallocation** (default 40%) to ensure delivery targets are met
- Calculates N = number of products where daily budget ≥ min daily budget (default $100)
- Selects N cheapest products
- Divides overallocated budget equally among N products

**Example**: For a $10,000 campaign with 40% overallocation, the agent allocates $14,000 across media buys. This ensures you hit your $10,000 spend target even with underdelivery.

## Installation

```bash
npm install @scope3/agentic-client
```

## Usage

### As MCP Server (Standalone)

```bash
export SCOPE3_API_KEY=your_api_key
export MIN_DAILY_BUDGET=100
export OVERALLOCATION_PERCENT=40
npx simple-media-agent
```

The agent runs as an MCP server on stdio. Scope3 platform calls it via MCP protocol.

### Programmatically

```typescript
import { SimpleMediaAgent } from '@scope3/agentic-client';

const agent = new SimpleMediaAgent({
  scope3ApiKey: process.env.SCOPE3_API_KEY,
  scope3BaseUrl: 'https://api.agentic.scope3.com',
  minDailyBudget: 100,
  overallocationPercent: 40,
  name: 'my-media-agent',
  version: '1.0.0',
});

await agent.start();
```

## Configuration

### Environment Variables

- `SCOPE3_API_KEY` (required): Your Scope3 API key
- `SCOPE3_BASE_URL` (optional): Scope3 API base URL (default: https://api.agentic.scope3.com)
- `MIN_DAILY_BUDGET` (optional): Minimum daily budget per product in USD (default: 100)
- `OVERALLOCATION_PERCENT` (optional): Overallocation percentage to ensure delivery (default: 40)

## MCP Tools

The agent exposes two MCP tools:

### `get_proposed_tactics`

Get tactic proposals based on available products and floor prices.

**Parameters:**
- `campaignId` (required): Campaign ID
- `seatId` (required): Seat/account ID
- `budgetRange` (optional): Budget range with min/max/currency
- `channels` (optional): Array of media channels
- `countries` (optional): Array of ISO country codes

**Returns:**
```json
{
  "proposedTactics": [
    {
      "tacticId": "simple-passthrough-campaign-123",
      "execution": "Passthrough strategy with 40% overallocation...",
      "budgetCapacity": 50000,
      "pricing": {
        "method": "passthrough",
        "estimatedCpm": 2.50,
        "currency": "USD"
      },
      "metadata": {
        "productCount": 25,
        "avgFloorPrice": 2.50,
        "overallocationPercent": 40
      }
    }
  ]
}
```

### `manage_tactic`

Accept tactic assignment and create media buys.

**Parameters:**
- `tacticId` (required): Tactic ID from proposal
- `tacticContext` (required): Tactic details including budget
- `brandAgentId` (required): Brand agent ID
- `seatId` (required): Seat/account ID

**Returns:**
```json
{
  "acknowledged": true,
  "mediaBuysCreated": 5,
  "allocations": [
    {
      "productId": "prod-123",
      "budget": 2800,
      "cpm": 2.10
    }
  ]
}
```

## Architecture

```
Scope3 Platform → MCP (stdio) → Simple Media Agent → Scope3 API
                                        ↓
                                  Create Media Buys
```

The agent:
1. Receives MCP tool calls from Scope3 platform
2. Fetches products from registered agents via Scope3 API
3. Calculates budget allocation with overallocation
4. Creates media buys via Scope3 API
5. Returns results via MCP response

## Extending the Agent

This is a reference implementation. To build your own:

### Custom Product Selection
```typescript
// Filter products by viewability
const highViewabilityProducts = allProducts.filter(p =>
  p.metadata?.viewability >= 0.85
);
```

### Custom Budget Allocation
```typescript
// Weight by performance, not just equal division
const budgetPerProduct = allocatedBudget * product.performanceScore / totalScore;
```

### Add More Tools
```typescript
this.server.addTool({
  name: 'reallocate_budget',
  description: 'Reallocate budget based on performance',
  parameters: z.object({
    tacticId: z.string(),
    performanceData: z.object({}).passthrough(),
  }),
  execute: async (args) => {
    // Custom reallocation logic
  },
});
```

## Example: Claude Desktop Configuration

Add to your Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "simple-media-agent": {
      "command": "npx",
      "args": ["simple-media-agent"],
      "env": {
        "SCOPE3_API_KEY": "your_key",
        "OVERALLOCATION_PERCENT": "40"
      }
    }
  }
}
```

Then in Claude: "Use get_proposed_tactics to propose tactics for campaign XYZ with $50,000 budget"
