#!/usr/bin/env node
import { MediaAgentMCP } from './media-agent-mcp.js';

const mediaAgentUrl = process.env.MEDIA_AGENT_URL;
const apiKey = process.env.MEDIA_AGENT_API_KEY;

if (!mediaAgentUrl) {
  console.error('Error: MEDIA_AGENT_URL environment variable is required');
  process.exit(1);
}

const server = new MediaAgentMCP({
  mediaAgentUrl,
  apiKey,
  name: 'scope3-media-agent',
  version: '1.0.0',
});

server.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
