# Testing Simple Media Agent

## Prerequisites

You need:
- Scope3 API key
- Registered agents in your Scope3 account
- Products available from those agents

## Method 1: Direct Testing (Recommended First)

Test the tools directly without MCP to verify logic:

```bash
export SCOPE3_API_KEY=your_api_key
npx ts-node test-media-agent.ts
```

This will:
1. Call `get_proposed_tactics` with a test campaign
2. Call `manage_tactic` to create media buys
3. Show you the results and verify overallocation is working

## Method 2: Claude Desktop Integration

Add to your Claude Desktop MCP config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "simple-media-agent": {
      "command": "node",
      "args": [
        "/path/to/agentic-client/.conductor/zurich-v4/dist/simple-media-agent-server.js"
      ],
      "env": {
        "SCOPE3_API_KEY": "your_api_key_here",
        "MIN_DAILY_BUDGET": "100",
        "OVERALLOCATION_PERCENT": "40"
      }
    }
  }
}
```

Then in Claude Desktop:

```
Use get_proposed_tactics to propose tactics for campaign "test-123" with max budget 50000
```

Claude will call your MCP server and show the results!

## Method 3: MCP Inspector

Use the MCP Inspector tool to test your server:

```bash
export SCOPE3_API_KEY=your_key
npx @modelcontextprotocol/inspector node dist/simple-media-agent-server.js
```

This opens a web UI where you can:
- See all available tools
- Call tools with test parameters
- View responses in real-time

## What to Verify

### get_proposed_tactics
✅ Returns proposed tactics with:
- Correct tactic ID format
- Estimated CPM based on floor prices
- Budget capacity matches request
- No metadata field (spec compliance)

### manage_tactic
✅ Creates media buys with:
- Sum of all budgets = original budget * 1.4 (40% overallocation)
- Each media buy has correct product ID, agent ID, CPM
- Uses MediaBuyProduct structure from ADCP client
- N products where daily budget >= $100

## Example Output

```json
{
  "proposedTactics": [
    {
      "tacticId": "simple-passthrough-test-123",
      "execution": "Passthrough strategy: distribute budget across 25 products...",
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

## Debugging

If something fails:

1. **Check logs**: The server outputs to stderr
2. **Verify API key**: Make sure it's valid and has proper permissions
3. **Check agents**: Run `scope3.agents.list({ type: 'SALES' })` to verify you have agents registered
4. **Check products**: Run `scope3.products.discover()` to verify products are available

## Common Issues

**"No products found"**
- You need to register sales agents first
- Sales agents need to have products available

**"Budget calculation is wrong"**
- Check that overallocationPercent is set correctly
- Verify: sum of all media buy budgets = totalBudget * (1 + overallocationPercent/100)

**"Type errors"**
- Make sure you've run `npm run build` after making changes
