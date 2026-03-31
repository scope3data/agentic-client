/**
 * Tests for Scope3McpClient - thin MCP connection helper
 */

import { Scope3McpClient } from '../mcp-client';
import { Scope3ApiError } from '../adapters/base';

// Mock @modelcontextprotocol/sdk
const mockConnect = jest.fn();
const mockClose = jest.fn();
const mockCallTool = jest.fn();
const mockReadResource = jest.fn();
const mockListTools = jest.fn();

jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    connect: mockConnect,
    close: mockClose,
    callTool: mockCallTool,
    readResource: mockReadResource,
    listTools: mockListTools,
  })),
}));

jest.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
  })),
}));

describe('Scope3McpClient', () => {
  beforeEach(() => {
    mockConnect.mockReset();
    mockClose.mockReset();
    mockCallTool.mockReset();
    mockReadResource.mockReset();
    mockListTools.mockReset();
  });

  describe('initialization', () => {
    it('should require apiKey', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => new Scope3McpClient({ apiKey: '' } as any)).toThrow('apiKey is required');
    });

    it('should reject whitespace-only apiKey', () => {
      expect(() => new Scope3McpClient({ apiKey: '   ' })).toThrow('apiKey is required');
    });

    it('should default to production URL', () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      expect(client.baseUrl).toBe('https://api.agentic.scope3.com');
    });

    it('should use staging URL', () => {
      const client = new Scope3McpClient({ apiKey: 'test-key', environment: 'staging' });
      expect(client.baseUrl).toBe('https://api.agentic.staging.scope3.com');
    });

    it('should use custom base URL', () => {
      const client = new Scope3McpClient({ apiKey: 'test-key', baseUrl: 'https://custom.com' });
      expect(client.baseUrl).toBe('https://custom.com');
    });

    it('should strip trailing slash from base URL', () => {
      const client = new Scope3McpClient({ apiKey: 'test-key', baseUrl: 'https://custom.com/' });
      expect(client.baseUrl).toBe('https://custom.com');
    });

    it('should not be connected initially', () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      expect(client.isConnected).toBe(false);
    });
  });

  describe('connect', () => {
    it('should connect to MCP server', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      await client.connect();
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(client.isConnected).toBe(true);
    });

    it('should not reconnect if already connected', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      await client.connect();
      await client.connect();
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should throw Scope3ApiError on connection failure', async () => {
      mockConnect.mockRejectedValue(new Error('Connection refused'));
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      await expect(client.connect()).rejects.toThrow(Scope3ApiError);
    });

    it('should allow retry after connection failure', async () => {
      mockConnect.mockRejectedValueOnce(new Error('Connection refused'));
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      await expect(client.connect()).rejects.toThrow();

      mockConnect.mockResolvedValueOnce(undefined);
      await client.connect();
      expect(client.isConnected).toBe(true);
    });

    it('should deduplicate concurrent connect calls', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      await Promise.all([client.connect(), client.connect(), client.connect()]);
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from MCP server', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      await client.connect();
      await client.disconnect();
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(client.isConnected).toBe(false);
    });

    it('should be no-op if not connected', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      await client.disconnect();
      expect(mockClose).not.toHaveBeenCalled();
    });

    it('should handle disconnect errors gracefully', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      await client.connect();
      mockClose.mockRejectedValueOnce(new Error('close failed'));
      await client.disconnect();
      // Should still mark as disconnected even on error
      expect(client.isConnected).toBe(false);
    });
  });

  describe('reconnect lifecycle', () => {
    it('should reconnect after disconnect via callTool auto-connect', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockCallTool.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] });

      // Connect then disconnect
      await client.connect();
      expect(mockConnect).toHaveBeenCalledTimes(1);
      await client.disconnect();
      expect(client.isConnected).toBe(false);

      // callTool should auto-reconnect
      await client.callTool('health');
      expect(mockConnect).toHaveBeenCalledTimes(2);
      expect(client.isConnected).toBe(true);
    });

    it('should reconnect after disconnect via explicit connect', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });

      await client.connect();
      await client.disconnect();
      await client.connect();

      expect(mockConnect).toHaveBeenCalledTimes(2);
      expect(client.isConnected).toBe(true);
    });
  });

  describe('callTool', () => {
    it('should auto-connect on first call', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockCallTool.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] });

      await client.callTool('health');
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should pass tool name and arguments directly', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockCallTool.mockResolvedValue({ content: [] });

      await client.callTool('api_call', {
        method: 'GET',
        path: '/api/v2/buyer/advertisers',
      });

      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'api_call',
        arguments: {
          method: 'GET',
          path: '/api/v2/buyer/advertisers',
        },
      });
    });

    it('should call tools without arguments', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockCallTool.mockResolvedValue({ content: [{ type: 'text', text: 'healthy' }] });

      await client.callTool('health');

      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'health',
        arguments: undefined,
      });
    });

    it('should return raw CallToolResult', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      const expected = {
        content: [{ type: 'text', text: '{"id":"123"}' }],
        structuredContent: { id: '123' },
      };
      mockCallTool.mockResolvedValue(expected);

      const result = await client.callTool('api_call', {
        method: 'GET',
        path: '/api/v2/buyer/advertisers/123',
      });

      expect(result).toEqual(expected);
    });

    it('should propagate callTool errors', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockCallTool.mockRejectedValue(new Error('MCP tool error'));

      await expect(
        client.callTool('api_call', { method: 'GET', path: '/api/v2/buyer/advertisers' })
      ).rejects.toThrow('MCP tool error');
    });

    it('should deduplicate concurrent auto-connect from parallel callTool', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockCallTool.mockResolvedValue({ content: [] });

      await Promise.all([client.callTool('health'), client.callTool('health')]);

      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('readResource', () => {
    it('should auto-connect on first call', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockReadResource.mockResolvedValue({ contents: [] });

      await client.readResource('scope3://schema/advertiser');
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should pass URI directly', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockReadResource.mockResolvedValue({ contents: [] });

      await client.readResource('scope3://schema/advertiser');

      expect(mockReadResource).toHaveBeenCalledWith({
        uri: 'scope3://schema/advertiser',
      });
    });
  });

  describe('listTools', () => {
    it('should auto-connect on first call', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockListTools.mockResolvedValue({ tools: [] });

      await client.listTools();
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should return available tools', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      const expected = {
        tools: [
          { name: 'api_call', description: 'Make API calls' },
          { name: 'ask_about_capability', description: 'Ask about capabilities' },
          { name: 'help', description: 'Get help' },
          { name: 'health', description: 'Health check' },
        ],
      };
      mockListTools.mockResolvedValue(expected);

      const result = await client.listTools();
      expect(result.tools).toHaveLength(4);
      expect(result.tools[0].name).toBe('api_call');
    });
  });
});
