/**
 * Tests for MCP adapter
 */

import { McpAdapter } from '../../adapters/mcp';
import { Scope3ApiError } from '../../adapters/base';

// Mock @modelcontextprotocol/sdk
const mockConnect = jest.fn();
const mockClose = jest.fn();
const mockCallTool = jest.fn();

jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    connect: mockConnect,
    close: mockClose,
    callTool: mockCallTool,
  })),
}));

jest.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
  })),
}));

describe('McpAdapter', () => {
  beforeEach(() => {
    mockConnect.mockReset();
    mockClose.mockReset();
    mockCallTool.mockReset();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const adapter = new McpAdapter({ apiKey: 'test-key', persona: 'buyer' });
      expect(adapter.baseUrl).toBe('https://api.agentic.scope3.com');
      expect(adapter.version).toBe('v2');
      expect(adapter.persona).toBe('buyer');
      expect(adapter.debug).toBe(false);
    });

    it('should use staging URL', () => {
      const adapter = new McpAdapter({
        apiKey: 'test-key',
        persona: 'buyer',
        environment: 'staging',
      });
      expect(adapter.baseUrl).toBe('https://api.agentic.staging.scope3.com');
    });

    it('should use custom base URL', () => {
      const adapter = new McpAdapter({
        apiKey: 'test-key',
        persona: 'buyer',
        baseUrl: 'https://custom.com',
      });
      expect(adapter.baseUrl).toBe('https://custom.com');
    });

    it('should enable debug mode', () => {
      const adapter = new McpAdapter({ apiKey: 'test-key', persona: 'buyer', debug: true });
      expect(adapter.debug).toBe(true);
    });
  });

  describe('connect', () => {
    it('should connect to MCP server', async () => {
      const adapter = new McpAdapter({ apiKey: 'test-key', persona: 'buyer' });
      await adapter.connect();
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should not reconnect if already connected', async () => {
      const adapter = new McpAdapter({ apiKey: 'test-key', persona: 'buyer' });
      await adapter.connect();
      await adapter.connect();
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should throw Scope3ApiError on connection failure', async () => {
      mockConnect.mockRejectedValue(new Error('Connection refused'));
      const adapter = new McpAdapter({ apiKey: 'test-key', persona: 'buyer' });
      await expect(adapter.connect()).rejects.toThrow(Scope3ApiError);
      await expect(adapter.connect()).rejects.toMatchObject({
        status: 0,
      });
    });
  });

  describe('disconnect', () => {
    it('should disconnect from MCP server', async () => {
      const adapter = new McpAdapter({ apiKey: 'test-key', persona: 'buyer' });
      await adapter.connect();
      await adapter.disconnect();
      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('should be no-op if not connected', async () => {
      const adapter = new McpAdapter({ apiKey: 'test-key', persona: 'buyer' });
      await adapter.disconnect();
      expect(mockClose).not.toHaveBeenCalled();
    });
  });

  describe('request - api_call tool', () => {
    let adapter: McpAdapter;

    beforeEach(async () => {
      adapter = new McpAdapter({ apiKey: 'test-key', persona: 'buyer' });
      mockCallTool.mockResolvedValue({
        structuredContent: { id: '123' },
      });
    });

    it('should call api_call tool for GET /advertisers', async () => {
      await adapter.request('GET', '/advertisers');
      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'api_call',
        arguments: {
          method: 'GET',
          path: '/api/v2/buyer/advertisers',
        },
      });
    });

    it('should call api_call tool for POST /advertisers with body', async () => {
      await adapter.request('POST', '/advertisers', { name: 'Test' });
      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'api_call',
        arguments: {
          method: 'POST',
          path: '/api/v2/buyer/advertisers',
          body: { name: 'Test' },
        },
      });
    });

    it('should call api_call tool for GET /advertisers/123', async () => {
      await adapter.request('GET', '/advertisers/123');
      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'api_call',
        arguments: {
          method: 'GET',
          path: '/api/v2/buyer/advertisers/123',
        },
      });
    });

    it('should append query params to path', async () => {
      await adapter.request('GET', '/campaigns', undefined, {
        params: { take: 10, status: 'ACTIVE' },
      });
      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'api_call',
        arguments: {
          method: 'GET',
          path: expect.stringContaining('/api/v2/buyer/campaigns?'),
        },
      });
      const callArgs = mockCallTool.mock.calls[0][0];
      expect(callArgs.arguments.path).toContain('take=10');
      expect(callArgs.arguments.path).toContain('status=ACTIVE');
    });

    it('should skip undefined query params', async () => {
      await adapter.request('GET', '/campaigns', undefined, {
        params: { take: 10, status: undefined },
      });
      const callArgs = mockCallTool.mock.calls[0][0];
      expect(callArgs.arguments.path).toContain('take=10');
      expect(callArgs.arguments.path).not.toContain('status');
    });

    it('should not include body for GET requests', async () => {
      await adapter.request('GET', '/advertisers');
      const callArgs = mockCallTool.mock.calls[0][0];
      expect(callArgs.arguments.body).toBeUndefined();
    });

    it('should include body for PUT requests', async () => {
      await adapter.request('PUT', '/advertisers/123', { name: 'Updated' });
      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'api_call',
        arguments: {
          method: 'PUT',
          path: '/api/v2/buyer/advertisers/123',
          body: { name: 'Updated' },
        },
      });
    });

    it('should include body for DELETE requests', async () => {
      await adapter.request('DELETE', '/bundles/123/products', { productIds: ['p1'] });
      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'api_call',
        arguments: {
          method: 'DELETE',
          path: '/api/v2/buyer/bundles/123/products',
          body: { productIds: ['p1'] },
        },
      });
    });

    it('should use brand persona in path', async () => {
      const brandAdapter = new McpAdapter({ apiKey: 'test-key', persona: 'brand' });
      mockCallTool.mockResolvedValue({ structuredContent: {} });
      await brandAdapter.request('GET', '/brands');
      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'api_call',
        arguments: {
          method: 'GET',
          path: '/api/v2/brand/brands',
        },
      });
    });

    it('should map latest version to v2 in path', async () => {
      const latestAdapter = new McpAdapter({
        apiKey: 'test-key',
        persona: 'buyer',
        version: 'latest',
      });
      mockCallTool.mockResolvedValue({ structuredContent: {} });
      await latestAdapter.request('GET', '/advertisers');
      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'api_call',
        arguments: {
          method: 'GET',
          path: '/api/v2/buyer/advertisers',
        },
      });
    });
  });

  describe('request - response handling', () => {
    let adapter: McpAdapter;

    beforeEach(() => {
      adapter = new McpAdapter({ apiKey: 'test-key', persona: 'buyer' });
    });

    it('should return structuredContent when available', async () => {
      mockCallTool.mockResolvedValue({
        structuredContent: { id: '123', name: 'Test' },
      });

      const result = await adapter.request('GET', '/advertisers/123');
      expect(result).toEqual({ id: '123', name: 'Test' });
    });

    it('should parse text content as JSON', async () => {
      mockCallTool.mockResolvedValue({
        content: [{ type: 'text', text: '{"id":"123"}' }],
      });

      const result = await adapter.request('GET', '/advertisers/123');
      expect(result).toEqual({ id: '123' });
    });

    it('should return text content as message when not JSON', async () => {
      mockCallTool.mockResolvedValue({
        content: [{ type: 'text', text: 'Campaign executed successfully' }],
      });

      const result = await adapter.request<{ message: string }>('POST', '/campaigns/123/execute');
      expect(result).toEqual({ message: 'Campaign executed successfully' });
    });

    it('should throw when no content returned', async () => {
      mockCallTool.mockResolvedValue({});

      await expect(adapter.request('GET', '/advertisers/123')).rejects.toThrow(Scope3ApiError);
      await expect(adapter.request('GET', '/advertisers/123')).rejects.toMatchObject({
        status: 500,
        message: 'MCP returned no content',
      });
    });

    it('should wrap non-Scope3ApiError errors', async () => {
      mockCallTool.mockRejectedValue(new Error('MCP timeout'));

      await expect(adapter.request('GET', '/advertisers')).rejects.toThrow(Scope3ApiError);
      await expect(adapter.request('GET', '/advertisers')).rejects.toMatchObject({
        status: 500,
        message: expect.stringContaining('MCP timeout'),
      });
    });

    it('should re-throw Scope3ApiError as-is', async () => {
      mockCallTool.mockRejectedValue(new Scope3ApiError(404, 'Not found'));

      await expect(adapter.request('GET', '/advertisers/999')).rejects.toMatchObject({
        status: 404,
        message: 'Not found',
      });
    });
  });

  describe('request - auto connect', () => {
    it('should auto-connect on first request', async () => {
      const adapter = new McpAdapter({ apiKey: 'test-key', persona: 'buyer' });
      mockCallTool.mockResolvedValue({
        structuredContent: { items: [] },
      });

      await adapter.request('GET', '/advertisers');
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });
});
