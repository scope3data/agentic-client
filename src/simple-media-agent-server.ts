#!/usr/bin/env node
import { SimpleMediaAgent } from './simple-media-agent.js';

const scope3ApiKey = process.env.SCOPE3_API_KEY;
const scope3BaseUrl = process.env.SCOPE3_BASE_URL;
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const minDailyBudget = process.env.MIN_DAILY_BUDGET
  ? parseFloat(process.env.MIN_DAILY_BUDGET)
  : 100;

if (!scope3ApiKey) {
  console.error('Error: SCOPE3_API_KEY environment variable is required');
  process.exit(1);
}

const agent = new SimpleMediaAgent({
  scope3ApiKey,
  scope3BaseUrl,
  port,
  minDailyBudget,
});

agent.start();

console.log(`
Simple Media Agent Configuration:
- Port: ${port}
- Scope3 Base URL: ${scope3BaseUrl || 'https://api.agentic.scope3.com'}
- Min Daily Budget: $${minDailyBudget}
`);
