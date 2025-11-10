#!/usr/bin/env node
import { OutcomeAgent } from './outcome-agent.js';

const scope3ApiKey = process.env.SCOPE3_API_KEY;
const scope3BaseUrl = process.env.SCOPE3_BASE_URL;

if (!scope3ApiKey) {
  console.error('Error: SCOPE3_API_KEY environment variable is required');
  process.exit(1);
}

const agent = new OutcomeAgent({
  scope3ApiKey,
  scope3BaseUrl,
  name: 'outcome-agent',
  version: '1.0.0',
});

agent.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

console.error(`
Outcome Agent
- Scope3 Base URL: ${scope3BaseUrl || 'https://api.agentic.scope3.com'}
- Protocol: MCP (stdio)
- Tools: get_proposals, accept_proposal
`);
