#!/usr/bin/env node
import { SimpleMediaAgentMCP } from './simple-media-agent-with-mcp.js';

const scope3ApiKey = process.env.SCOPE3_API_KEY;
const scope3BaseUrl = process.env.SCOPE3_BASE_URL;
const minDailyBudget = process.env.MIN_DAILY_BUDGET
  ? parseFloat(process.env.MIN_DAILY_BUDGET)
  : 100;
const overallocationPercent = process.env.OVERALLOCATION_PERCENT
  ? parseFloat(process.env.OVERALLOCATION_PERCENT)
  : 40;

if (!scope3ApiKey) {
  console.error('Error: SCOPE3_API_KEY environment variable is required');
  process.exit(1);
}

const agent = new SimpleMediaAgentMCP({
  scope3ApiKey,
  scope3BaseUrl,
  minDailyBudget,
  overallocationPercent,
  name: 'simple-media-agent',
  version: '1.0.0',
});

agent.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

console.error(`
Simple Media Agent MCP Server
- Scope3 Base URL: ${scope3BaseUrl || 'https://api.agentic.scope3.com'}
- Min Daily Budget: $${minDailyBudget}
- Overallocation: ${overallocationPercent}%
`);
