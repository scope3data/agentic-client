import { MediaAgentMCP } from '../src/media-agent-mcp';

// Example: Running the media agent MCP server
// This shows how to programmatically create and run the MCP server

const server = new MediaAgentMCP({
  mediaAgentUrl: 'https://your-media-agent.example.com',
  apiKey: process.env.MEDIA_AGENT_API_KEY,
  name: 'example-media-agent',
  version: '1.0.0',
});

server.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
