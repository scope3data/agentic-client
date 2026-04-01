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

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { Client: MockClient } = require('@modelcontextprotocol/sdk/client/index.js');

jest.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
  })),
}));

describe('Scope3McpClient', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockConnect.mockReset();
    mockClose.mockReset();
    mockCallTool.mockReset();
    mockReadResource.mockReset();
    mockListTools.mockReset();
    MockClient.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
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

  describe('MCP Apps capability', () => {
    it('should declare apps in experimental capabilities', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      await client.connect();

      expect(MockClient).toHaveBeenCalledWith(
        { name: 'scope3-sdk', version: expect.any(String) },
        { capabilities: { tools: {}, experimental: { apps: {} } } }
      );
    });
  });

  describe('idle timeout', () => {
    it('should set a timer after callTool with default timeout', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockCallTool.mockResolvedValue({ content: [] });

      await client.callTool('health');

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 300_000);
      setTimeoutSpy.mockRestore();
    });

    it('should set a timer with custom timeout', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      const client = new Scope3McpClient({ apiKey: 'test-key', idleTimeoutMs: 60_000 });
      mockCallTool.mockResolvedValue({ content: [] });

      await client.callTool('health');

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 60_000);
      setTimeoutSpy.mockRestore();
    });

    it('should clear the timer on disconnect', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockCallTool.mockResolvedValue({ content: [] });

      await client.callTool('health');
      await client.disconnect();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('should not set a timer when idleTimeoutMs is 0', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      const client = new Scope3McpClient({ apiKey: 'test-key', idleTimeoutMs: 0 });
      mockCallTool.mockResolvedValue({ content: [] });

      const callsBefore = setTimeoutSpy.mock.calls.length;
      await client.callTool('health');

      // No new setTimeout calls should have been made for idle timeout
      const newCalls = setTimeoutSpy.mock.calls.slice(callsBefore);
      const hasIdleTimeout = newCalls.some(([, ms]) => typeof ms === 'number' && ms > 0);
      expect(hasIdleTimeout).toBe(false);
      setTimeoutSpy.mockRestore();
    });
  });

  describe('token expiry', () => {
    it('should throw when token is expired on callTool', async () => {
      const client = new Scope3McpClient({
        apiKey: 'test-key',
        tokenExpiresAt: Date.now() - 1000, // already expired
      });
      mockCallTool.mockResolvedValue({ content: [] });

      await client.connect();

      await expect(client.callTool('health')).rejects.toThrow(
        'API token has expired. Please provide a fresh token.'
      );
    });

    it('should throw a Scope3ApiError when token is expired', async () => {
      const client = new Scope3McpClient({
        apiKey: 'test-key',
        tokenExpiresAt: Date.now() - 1000,
      });
      mockCallTool.mockResolvedValue({ content: [] });

      await client.connect();

      await expect(client.callTool('health')).rejects.toThrow(Scope3ApiError);
    });

    it('should disconnect when token expires', async () => {
      const client = new Scope3McpClient({
        apiKey: 'test-key',
        tokenExpiresAt: Date.now() - 1000,
      });
      mockCallTool.mockResolvedValue({ content: [] });

      await client.connect();
      expect(client.isConnected).toBe(true);

      await expect(client.callTool('health')).rejects.toThrow();
      expect(client.isConnected).toBe(false);
    });

    it('should work fine when tokenExpiresAt is not set', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockCallTool.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] });

      await client.callTool('health');

      expect(mockCallTool).toHaveBeenCalledTimes(1);
    });

    it('should work fine when token is not yet expired', async () => {
      const client = new Scope3McpClient({
        apiKey: 'test-key',
        tokenExpiresAt: Date.now() + 60_000, // expires in 1 min
      });
      mockCallTool.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] });

      await client.callTool('health');

      expect(mockCallTool).toHaveBeenCalledTimes(1);
    });

    it('should throw when tokenExpiresAt is a Date object in the past', async () => {
      const pastDate = new Date(Date.now() - 5000);
      const client = new Scope3McpClient({
        apiKey: 'test-key',
        tokenExpiresAt: pastDate,
      });
      mockCallTool.mockResolvedValue({ content: [] });

      await client.connect();

      await expect(client.callTool('health')).rejects.toThrow(
        'API token has expired. Please provide a fresh token.'
      );
    });
  });

  describe('idle timer fires and disconnects', () => {
    it('should invoke disconnect when idle timeout elapses after callTool', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key', idleTimeoutMs: 10_000 });
      mockCallTool.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] });
      const disconnectSpy = jest.spyOn(client, 'disconnect');

      await client.callTool('health');
      expect(disconnectSpy).not.toHaveBeenCalled();

      jest.advanceTimersByTime(10_000);

      expect(disconnectSpy).toHaveBeenCalledTimes(1);
      disconnectSpy.mockRestore();
    });
  });

  describe('readResource and listTools reset idle timer', () => {
    it('should reset idle timer after readResource', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockReadResource.mockResolvedValue({ contents: [] });

      await client.readResource('scope3://schema/advertiser');

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 300_000);
      setTimeoutSpy.mockRestore();
    });

    it('should reset idle timer after listTools', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      const client = new Scope3McpClient({ apiKey: 'test-key' });
      mockListTools.mockResolvedValue({ tools: [] });

      await client.listTools();

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 300_000);
      setTimeoutSpy.mockRestore();
    });
  });

  describe('debug logging', () => {
    it('should not throw when debug mode is enabled during connect and callTool', async () => {
      const client = new Scope3McpClient({ apiKey: 'test-key', debug: true });
      mockCallTool.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] });

      await client.connect();
      const result = await client.callTool('health');

      expect(client.isConnected).toBe(true);
      expect(result).toEqual({ content: [{ type: 'text', text: 'ok' }] });
    });
  });
});
