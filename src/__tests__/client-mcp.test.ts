/**
 * Tests for Scope3Client MCP protocol interactions
 *
 * Tests the actual MCP client behavior including:
 * - structuredContent handling
 * - Text content fallback
 * - JSON parsing from text
 * - Error scenarios
 * - Debug mode
 */

import { Scope3Client } from '../client';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// Mock the MCP SDK modules
jest.mock('@modelcontextprotocol/sdk/client/index.js');
jest.mock('@modelcontextprotocol/sdk/client/streamableHttp.js');

describe('Scope3Client MCP Protocol', () => {
  let client: Scope3Client;
  let mockMcpClient: jest.Mocked<Client>;
  let mockTransport: jest.Mocked<StreamableHTTPClientTransport>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Suppress logger output during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Setup mock MCP client
    mockMcpClient = {
      connect: jest.fn(),
      close: jest.fn(),
      callTool: jest.fn(),
    } as unknown as jest.Mocked<Client>;

    mockTransport = {
      close: jest.fn(),
    } as unknown as jest.Mocked<StreamableHTTPClientTransport>;

    // Mock constructor to return our mock client
    (Client as jest.MockedClass<typeof Client>).mockImplementation(() => mockMcpClient);
    (
      StreamableHTTPClientTransport as jest.MockedClass<typeof StreamableHTTPClientTransport>
    ).mockImplementation(() => mockTransport);

    client = new Scope3Client({
      apiKey: 'test-key',
      environment: 'production',
    });
  });

  afterEach(async () => {
    await client.disconnect();
    consoleErrorSpy.mockRestore();
  });

  describe('connection management', () => {
    it('should connect once on first callTool', async () => {
      mockMcpClient.callTool.mockResolvedValue({
        structuredContent: { result: 'success' },
        content: [],
      });

      await client['callTool']('test_tool', { arg: 'value' });

      expect(mockMcpClient.connect).toHaveBeenCalledTimes(1);
      expect(mockMcpClient.connect).toHaveBeenCalledWith(mockTransport);
    });

    it('should not reconnect on subsequent calls', async () => {
      mockMcpClient.callTool.mockResolvedValue({
        structuredContent: { result: 'success' },
        content: [],
      });

      await client['callTool']('test_tool_1', {});
      await client['callTool']('test_tool_2', {});

      expect(mockMcpClient.connect).toHaveBeenCalledTimes(1);
    });

    it('should disconnect cleanly', async () => {
      mockMcpClient.callTool.mockResolvedValue({
        structuredContent: { result: 'success' },
        content: [],
      });

      await client['callTool']('test_tool', {});
      await client.disconnect();

      expect(mockMcpClient.close).toHaveBeenCalledTimes(1);
      expect(mockTransport.close).toHaveBeenCalledTimes(1);
    });

    it('should not error when disconnecting without connecting', async () => {
      await expect(client.disconnect()).resolves.not.toThrow();
      expect(mockMcpClient.close).not.toHaveBeenCalled();
    });
  });

  describe('structuredContent handling (preferred path)', () => {
    it('should return structuredContent with message when text content present', async () => {
      const expectedData = { id: '123', name: 'Test Campaign', status: 'active' };
      const textMessage = 'Campaign retrieved successfully';
      mockMcpClient.callTool.mockResolvedValue({
        structuredContent: expectedData,
        content: [{ type: 'text', text: textMessage }],
      });

      const result = await client['callTool']<Record<string, unknown>, typeof expectedData>(
        'campaigns_get',
        { campaignId: '123' }
      );

      expect(result).toEqual({ _message: textMessage, ...expectedData });
    });

    it('should return structuredContent without message when no text content', async () => {
      const expectedData = { id: '123', name: 'Test Campaign', status: 'active' };
      mockMcpClient.callTool.mockResolvedValue({
        structuredContent: expectedData,
        content: [],
      });

      const result = await client['callTool']<Record<string, unknown>, typeof expectedData>(
        'campaigns_get',
        { campaignId: '123' }
      );

      expect(result).toEqual(expectedData);
    });

    it('should handle complex nested structuredContent', async () => {
      const complexData = {
        items: [
          { id: '1', nested: { deep: { value: 'test' } } },
          { id: '2', array: [1, 2, 3] },
        ],
        metadata: { total: 2, page: 1 },
      };

      mockMcpClient.callTool.mockResolvedValue({
        structuredContent: complexData,
        content: [],
      });

      const result = await client['callTool']('campaigns_list', {});

      expect(result).toEqual(complexData);
    });

    it('should handle empty structuredContent object', async () => {
      mockMcpClient.callTool.mockResolvedValue({
        structuredContent: {},
        content: [],
      });

      const result = await client['callTool']('test_tool', {});

      expect(result).toEqual({});
    });
  });

  describe('API specification violations', () => {
    it('should throw error when JSON is in text content instead of structuredContent', async () => {
      const data = { id: '456', status: 'completed' };
      mockMcpClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(data) }],
      });

      await expect(client['callTool']('test_tool', {})).rejects.toThrow(
        'API Error: Missing structured data'
      );
      await expect(client['callTool']('test_tool', {})).rejects.toThrow(
        'This is an API bug that needs to be fixed upstream'
      );
    });

    it('should throw error when array is in text content instead of structuredContent', async () => {
      const data = [{ id: '1' }, { id: '2' }];
      mockMcpClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(data) }],
      });

      await expect(client['callTool']('test_tool', {})).rejects.toThrow(
        'API Error: Missing structured data'
      );
    });

    it('should throw error when plain text is returned without structuredContent', async () => {
      const plainText = 'Operation completed successfully';
      mockMcpClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: plainText }],
      });

      await expect(client['callTool']('test_tool', {})).rejects.toThrow(
        'API Error: Missing structured data'
      );
    });

    it('should include debug info in error when structuredContent is missing', async () => {
      mockMcpClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: 'some data' }],
      });

      await expect(client['callTool']('test_tool', {})).rejects.toThrow('test_tool');
      await expect(client['callTool']('test_tool', {})).rejects.toThrow('API Error');
    });
  });

  describe('error handling', () => {
    it('should throw error when no content is returned', async () => {
      mockMcpClient.callTool.mockResolvedValue({
        content: [],
      });

      await expect(client['callTool']('test_tool', {})).rejects.toThrow(
        'API Error: Missing structured data'
      );
    });

    it('should throw error when content type is not text', async () => {
      mockMcpClient.callTool.mockResolvedValue({
        content: [{ type: 'image', data: 'base64data' }],
      });

      await expect(client['callTool']('test_tool', {})).rejects.toThrow(
        'API Error: Missing structured data'
      );
    });

    it('should propagate MCP client errors', async () => {
      const mcpError = new Error('MCP transport failure');
      mockMcpClient.callTool.mockRejectedValue(mcpError);

      await expect(client['callTool']('test_tool', {})).rejects.toThrow('MCP transport failure');
    });

    it('should handle connection errors', async () => {
      const connectionError = new Error('Connection refused');
      mockMcpClient.connect.mockRejectedValue(connectionError);

      await expect(client['callTool']('test_tool', {})).rejects.toThrow('Connection refused');
    });
  });

  describe('debug mode', () => {
    beforeEach(() => {
      // Create client with debug enabled
      client = new Scope3Client({
        apiKey: 'test-key',
        debug: true,
      });

      // Re-mock after new client creation
      (Client as jest.MockedClass<typeof Client>).mockImplementation(() => mockMcpClient);
      (
        StreamableHTTPClientTransport as jest.MockedClass<typeof StreamableHTTPClientTransport>
      ).mockImplementation(() => mockTransport);
    });

    it('should store debug info when debug mode is enabled', async () => {
      const request = { campaignId: '123' };
      const response = { id: '123', name: 'Test' };

      mockMcpClient.callTool.mockResolvedValue({
        structuredContent: response,
        content: [],
      });

      await client['callTool']('campaigns_get', request);

      expect(client.lastDebugInfo).toBeDefined();
      expect(client.lastDebugInfo?.toolName).toBe('campaigns_get');
      expect(client.lastDebugInfo?.request).toEqual(request);
      expect(client.lastDebugInfo?.response).toEqual(response);
      expect(client.lastDebugInfo?.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should not store debug info when API violates spec (no structuredContent)', async () => {
      const data = { id: '456' };
      const rawText = JSON.stringify(data);

      mockMcpClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: rawText }],
      });

      // Should throw before storing debug info
      await expect(client['callTool']('test_tool', {})).rejects.toThrow(
        'API Error: Missing structured data'
      );
    });

    it('should not store debug info when debug mode is disabled', async () => {
      const regularClient = new Scope3Client({
        apiKey: 'test-key',
        debug: false,
      });

      (Client as jest.MockedClass<typeof Client>).mockImplementation(() => mockMcpClient);
      (
        StreamableHTTPClientTransport as jest.MockedClass<typeof StreamableHTTPClientTransport>
      ).mockImplementation(() => mockTransport);

      mockMcpClient.callTool.mockResolvedValue({
        structuredContent: { result: 'success' },
        content: [],
      });

      await regularClient['callTool']('test_tool', {});

      expect(regularClient.lastDebugInfo).toBeUndefined();
    });
  });

  describe('environment and URL configuration', () => {
    it('should use production URL by default', () => {
      const prodClient = new Scope3Client({
        apiKey: 'test-key',
      });

      expect(prodClient.getBaseUrl()).toBe('https://api.agentic.scope3.com');
    });

    it('should use staging URL when environment is staging', () => {
      const stagingClient = new Scope3Client({
        apiKey: 'test-key',
        environment: 'staging',
      });

      expect(stagingClient.getBaseUrl()).toBe('https://api.agentic.staging.scope3.com');
    });

    it('should use custom baseUrl when provided (overrides environment)', () => {
      const customClient = new Scope3Client({
        apiKey: 'test-key',
        environment: 'staging',
        baseUrl: 'https://custom.api.com',
      });

      expect(customClient.getBaseUrl()).toBe('https://custom.api.com');
    });
  });

  describe('request argument handling', () => {
    it('should pass arguments as Record<string, unknown>', async () => {
      const args = {
        stringArg: 'test',
        numberArg: 123,
        boolArg: true,
        objectArg: { nested: 'value' },
        arrayArg: [1, 2, 3],
      };

      mockMcpClient.callTool.mockResolvedValue({
        structuredContent: { success: true },
        content: [],
      });

      await client['callTool']('test_tool', args);

      expect(mockMcpClient.callTool).toHaveBeenCalledWith({
        name: 'test_tool',
        arguments: args,
      });
    });

    it('should handle empty arguments object', async () => {
      mockMcpClient.callTool.mockResolvedValue({
        structuredContent: { success: true },
        content: [],
      });

      await client['callTool']('test_tool', {});

      expect(mockMcpClient.callTool).toHaveBeenCalledWith({
        name: 'test_tool',
        arguments: {},
      });
    });
  });
});
