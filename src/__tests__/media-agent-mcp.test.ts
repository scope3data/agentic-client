import { MediaAgentMCP } from '../media-agent-mcp';

describe('MediaAgentMCP', () => {
  it('should create an instance with required config', () => {
    const mcp = new MediaAgentMCP({
      mediaAgentUrl: 'https://example.com',
    });

    expect(mcp).toBeInstanceOf(MediaAgentMCP);
  });

  it('should create an instance with full config', () => {
    const mcp = new MediaAgentMCP({
      mediaAgentUrl: 'https://example.com',
      apiKey: 'test-key',
      name: 'test-agent',
      version: '1.0.0',
    });

    expect(mcp).toBeInstanceOf(MediaAgentMCP);
  });
});
