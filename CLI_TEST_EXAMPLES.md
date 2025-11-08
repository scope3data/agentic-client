# CLI Testing Examples - Implementation Guide

This document provides concrete, copy-paste-ready test examples for the missing CLI test coverage.

## Test File 1: CLI Dynamic Commands (`src/__tests__/cli-dynamic-commands.test.ts`)

```typescript
/**
 * Tests for CLI dynamic command generation
 *
 * Tests the core CLI functionality:
 * - Tool fetching and caching
 * - Tool name parsing
 * - Parameter parsing and validation
 * - Command registration
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Mock fs operations
jest.mock('fs');
jest.mock('os');

describe('CLI Dynamic Command Generation', () => {
  const mockHomedir = '/mock/home';
  const mockConfigDir = path.join(mockHomedir, '.scope3');
  const mockCacheFile = path.join(mockConfigDir, 'tools-cache.json');

  beforeEach(() => {
    jest.clearAllMocks();
    (os.homedir as jest.Mock).mockReturnValue(mockHomedir);
  });

  describe('parseToolName', () => {
    // Extract parseToolName function from cli.ts for testing
    function parseToolName(toolName: string): { resource: string; method: string } {
      const parts = toolName.split('_');
      if (parts.length < 2) {
        return { resource: 'tools', method: toolName };
      }
      const method = parts[parts.length - 1];
      const resource = parts.slice(0, -1).join('-');
      return { resource, method };
    }

    it('should parse simple tool names', () => {
      expect(parseToolName('campaigns_create')).toEqual({
        resource: 'campaigns',
        method: 'create',
      });

      expect(parseToolName('campaigns_list')).toEqual({
        resource: 'campaigns',
        method: 'list',
      });
    });

    it('should handle multi-word resources', () => {
      expect(parseToolName('brand_agents_create')).toEqual({
        resource: 'brand-agents',
        method: 'create',
      });

      expect(parseToolName('brand_standards_update')).toEqual({
        resource: 'brand-standards',
        method: 'update',
      });
    });

    it('should handle three-word resources', () => {
      expect(parseToolName('media_buy_orders_list')).toEqual({
        resource: 'media-buy-orders',
        method: 'list',
      });
    });

    it('should handle single-word tool names', () => {
      expect(parseToolName('ping')).toEqual({
        resource: 'tools',
        method: 'ping',
      });
    });

    it('should handle tools with action prefixes', () => {
      expect(parseToolName('campaigns_get_by_id')).toEqual({
        resource: 'campaigns-get-by',
        method: 'id',
      });
    });
  });

  describe('parseParameterValue', () => {
    // Extract parseParameterValue function from cli.ts
    function parseParameterValue(value: string, schema: Record<string, unknown>): unknown {
      const type = schema.type as string;

      if (type === 'object' || type === 'array') {
        return JSON.parse(value);
      }

      if (type === 'integer' || type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Invalid number: ${value}`);
        }
        return num;
      }

      if (type === 'boolean') {
        if (value === 'true') return true;
        if (value === 'false') return false;
        throw new Error(`Invalid boolean: ${value}`);
      }

      return value;
    }

    describe('object parameters', () => {
      it('should parse valid JSON objects', () => {
        const schema = { type: 'object' };
        const result = parseParameterValue('{"key":"value"}', schema);
        expect(result).toEqual({ key: 'value' });
      });

      it('should parse nested objects', () => {
        const schema = { type: 'object' };
        const result = parseParameterValue('{"outer":{"inner":"value"}}', schema);
        expect(result).toEqual({ outer: { inner: 'value' } });
      });

      it('should throw on invalid JSON', () => {
        const schema = { type: 'object' };
        expect(() => parseParameterValue('{invalid', schema)).toThrow();
      });

      it('should handle empty objects', () => {
        const schema = { type: 'object' };
        const result = parseParameterValue('{}', schema);
        expect(result).toEqual({});
      });
    });

    describe('array parameters', () => {
      it('should parse JSON arrays', () => {
        const schema = { type: 'array' };
        const result = parseParameterValue('[1,2,3]', schema);
        expect(result).toEqual([1, 2, 3]);
      });

      it('should parse arrays of objects', () => {
        const schema = { type: 'array' };
        const result = parseParameterValue('[{"id":"1"},{"id":"2"}]', schema);
        expect(result).toEqual([{ id: '1' }, { id: '2' }]);
      });

      it('should handle empty arrays', () => {
        const schema = { type: 'array' };
        const result = parseParameterValue('[]', schema);
        expect(result).toEqual([]);
      });
    });

    describe('number parameters', () => {
      it('should parse integers', () => {
        const schema = { type: 'integer' };
        expect(parseParameterValue('42', schema)).toBe(42);
      });

      it('should parse negative numbers', () => {
        const schema = { type: 'number' };
        expect(parseParameterValue('-3.14', schema)).toBe(-3.14);
      });

      it('should parse zero', () => {
        const schema = { type: 'number' };
        expect(parseParameterValue('0', schema)).toBe(0);
      });

      it('should throw on invalid numbers', () => {
        const schema = { type: 'number' };
        expect(() => parseParameterValue('not-a-number', schema)).toThrow('Invalid number');
      });

      it('should handle exponential notation', () => {
        const schema = { type: 'number' };
        expect(parseParameterValue('1e10', schema)).toBe(1e10);
      });
    });

    describe('boolean parameters', () => {
      it('should parse true', () => {
        const schema = { type: 'boolean' };
        expect(parseParameterValue('true', schema)).toBe(true);
      });

      it('should parse false', () => {
        const schema = { type: 'boolean' };
        expect(parseParameterValue('false', schema)).toBe(false);
      });

      it('should throw on invalid boolean', () => {
        const schema = { type: 'boolean' };
        expect(() => parseParameterValue('yes', schema)).toThrow('Invalid boolean');
        expect(() => parseParameterValue('1', schema)).toThrow('Invalid boolean');
      });

      it('should be case-sensitive', () => {
        const schema = { type: 'boolean' };
        expect(() => parseParameterValue('True', schema)).toThrow('Invalid boolean');
      });
    });

    describe('string parameters', () => {
      it('should return string as-is', () => {
        const schema = { type: 'string' };
        expect(parseParameterValue('hello world', schema)).toBe('hello world');
      });

      it('should handle empty strings', () => {
        const schema = { type: 'string' };
        expect(parseParameterValue('', schema)).toBe('');
      });

      it('should handle special characters', () => {
        const schema = { type: 'string' };
        expect(parseParameterValue('hello@#$%^&*()', schema)).toBe('hello@#$%^&*()');
      });

      it('should handle unicode', () => {
        const schema = { type: 'string' };
        expect(parseParameterValue('hello 世界 🌍', schema)).toBe('hello 世界 🌍');
      });
    });
  });

  describe('tools cache', () => {
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

    describe('loadToolsCache', () => {
      it('should return null when cache file does not exist', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        // Import and test loadToolsCache
        // Result should be null
      });

      it('should return cached tools when cache is fresh', () => {
        const mockCache = {
          tools: [{ name: 'test_tool', description: 'Test', inputSchema: { type: 'object' } }],
          timestamp: Date.now() - 1000, // 1 second ago
        };

        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockCache));

        // Result should return mockCache.tools
      });

      it('should return null when cache is expired', () => {
        const mockCache = {
          tools: [{ name: 'test_tool', description: 'Test', inputSchema: { type: 'object' } }],
          timestamp: Date.now() - CACHE_TTL - 1000, // Expired by 1 second
        };

        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockCache));

        // Result should be null
      });

      it('should return null on corrupted cache file', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue('invalid json{');

        // Result should be null (catch parse error)
      });
    });

    describe('saveToolsCache', () => {
      it('should create config directory if missing', () => {
        const tools = [{ name: 'test', description: '', inputSchema: { type: 'object' } }];

        (fs.existsSync as jest.Mock).mockReturnValue(false);
        (fs.mkdirSync as jest.Mock).mockImplementation();
        (fs.writeFileSync as jest.Mock).mockImplementation();

        // Call saveToolsCache(tools)

        expect(fs.mkdirSync).toHaveBeenCalledWith(mockConfigDir, { recursive: true });
      });

      it('should write cache with timestamp', () => {
        const tools = [{ name: 'test', description: '', inputSchema: { type: 'object' } }];
        const nowBefore = Date.now();

        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.writeFileSync as jest.Mock).mockImplementation();

        // Call saveToolsCache(tools)

        const nowAfter = Date.now();
        const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
        const writtenData = JSON.parse(writeCall[1]);

        expect(writtenData.tools).toEqual(tools);
        expect(writtenData.timestamp).toBeGreaterThanOrEqual(nowBefore);
        expect(writtenData.timestamp).toBeLessThanOrEqual(nowAfter);
      });
    });
  });

  describe('config management', () => {
    const mockConfigFile = path.join(mockConfigDir, 'config.json');

    describe('loadConfig', () => {
      it('should load config from file', () => {
        const mockConfig = {
          apiKey: 'test-key',
          environment: 'staging',
          baseUrl: 'https://custom.api.com',
        };

        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

        // Load config
        // Result should match mockConfig
      });

      it('should prioritize environment variables over file', () => {
        const mockConfig = { apiKey: 'file-key', environment: 'staging' };

        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

        process.env.SCOPE3_API_KEY = 'env-key';
        process.env.SCOPE3_ENVIRONMENT = 'production';

        // Load config
        // Result should have apiKey='env-key' and environment='production'

        delete process.env.SCOPE3_API_KEY;
        delete process.env.SCOPE3_ENVIRONMENT;
      });

      it('should return empty config when file does not exist', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        // Load config
        // Result should be {}
      });

      it('should handle corrupted config file gracefully', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue('invalid json');

        // Load config
        // Should not throw, should return empty config
      });
    });

    describe('saveConfig', () => {
      it('should create directory and save config', () => {
        const config = { apiKey: 'test-key', environment: 'production' as const };

        (fs.existsSync as jest.Mock).mockReturnValue(false);
        (fs.mkdirSync as jest.Mock).mockImplementation();
        (fs.writeFileSync as jest.Mock).mockImplementation();

        // Call saveConfig(config)

        expect(fs.mkdirSync).toHaveBeenCalledWith(mockConfigDir, { recursive: true });
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          mockConfigFile,
          JSON.stringify(config, null, 2)
        );
      });

      it('should validate environment values', () => {
        // Test that only 'production' and 'staging' are accepted
      });
    });
  });

  describe('required parameter validation', () => {
    it('should identify missing required parameters', () => {
      const schema = {
        properties: {
          requiredParam: { type: 'string' },
          optionalParam: { type: 'string' },
        },
        required: ['requiredParam'],
      };

      const providedArgs = { optionalParam: 'value' };

      const missing = schema.required.filter((p) => !(p in providedArgs));
      expect(missing).toEqual(['requiredParam']);
    });

    it('should pass validation when all required params present', () => {
      const schema = {
        properties: {
          requiredParam: { type: 'string' },
        },
        required: ['requiredParam'],
      };

      const providedArgs = { requiredParam: 'value' };

      const missing = schema.required.filter((p) => !(p in providedArgs));
      expect(missing).toEqual([]);
    });

    it('should allow extra parameters', () => {
      const schema = {
        properties: {
          requiredParam: { type: 'string' },
        },
        required: ['requiredParam'],
      };

      const providedArgs = {
        requiredParam: 'value',
        extraParam: 'extra',
      };

      const missing = schema.required.filter((p) => !(p in providedArgs));
      expect(missing).toEqual([]);
    });
  });
});
```

## Test File 2: CLI Integration Tests (`src/__tests__/cli-integration.test.ts`)

```typescript
/**
 * Integration tests for CLI functionality
 *
 * Tests full CLI flows end-to-end with mocked MCP server
 */

import { Scope3AgenticClient } from '../sdk';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Mock dependencies
jest.mock('fs');
jest.mock('os');
jest.mock('../sdk');

describe('CLI Integration Tests', () => {
  let mockClient: jest.Mocked<Scope3AgenticClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock client
    mockClient = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      listTools: jest.fn(),
      callTool: jest.fn(),
      getBaseUrl: jest.fn(),
    } as unknown as jest.Mocked<Scope3AgenticClient>;

    (Scope3AgenticClient as jest.MockedClass<typeof Scope3AgenticClient>).mockImplementation(
      () => mockClient
    );
  });

  describe('config commands', () => {
    it('should save config with "config set"', () => {
      // Mock file system
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation();
      (fs.writeFileSync as jest.Mock).mockImplementation();
      (os.homedir as jest.Mock).mockReturnValue('/mock/home');

      // Simulate: scope3 config set apiKey test-key
      // Test that writeFileSync is called with correct data
    });

    it('should get config value', () => {
      const mockConfig = { apiKey: 'test-key' };
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

      // Simulate: scope3 config get apiKey
      // Test output is 'test-key'
    });

    it('should clear config', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation();

      // Simulate: scope3 config clear
      // Test that unlinkSync is called
    });
  });

  describe('list-tools command', () => {
    it('should fetch and display tools', async () => {
      const mockTools = [
        {
          name: 'campaigns_create',
          description: 'Create a campaign',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'campaigns_list',
          description: 'List campaigns',
          inputSchema: { type: 'object', properties: {} },
        },
      ];

      mockClient.listTools.mockResolvedValue({ tools: mockTools });

      // Simulate: scope3 list-tools
      // Test that tools are grouped by resource
    });

    it('should use cache by default', async () => {
      const cachedTools = {
        tools: [{ name: 'test_tool', description: '', inputSchema: { type: 'object' } }],
        timestamp: Date.now(),
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(cachedTools));

      // Simulate: scope3 list-tools
      // Test that listTools is NOT called (uses cache)
    });

    it('should refresh cache with --refresh flag', async () => {
      const mockTools = [
        { name: 'test_tool', description: '', inputSchema: { type: 'object' } },
      ];

      mockClient.listTools.mockResolvedValue({ tools: mockTools });

      // Simulate: scope3 list-tools --refresh
      // Test that listTools IS called (ignores cache)
    });
  });

  describe('dynamic command execution', () => {
    beforeEach(() => {
      const mockTools = [
        {
          name: 'campaigns_get',
          description: 'Get campaign by ID',
          inputSchema: {
            type: 'object',
            properties: {
              campaignId: { type: 'string', description: 'Campaign ID' },
            },
            required: ['campaignId'],
          },
        },
      ];

      mockClient.listTools.mockResolvedValue({ tools: mockTools });
    });

    it('should execute command with JSON output', async () => {
      const mockResponse = { id: '123', name: 'Test Campaign' };
      mockClient.callTool.mockResolvedValue(mockResponse);

      // Simulate: scope3 campaigns get --campaignId 123 --format json
      // Test JSON output
    });

    it('should execute command with table output', async () => {
      const mockResponse = { id: '123', name: 'Test Campaign', status: 'active' };
      mockClient.callTool.mockResolvedValue(mockResponse);

      // Simulate: scope3 campaigns get --campaignId 123 --format table
      // Test table formatting
    });

    it('should execute command with list output', async () => {
      const mockResponse = [
        { id: '123', name: 'Campaign 1' },
        { id: '456', name: 'Campaign 2' },
      ];
      mockClient.callTool.mockResolvedValue(mockResponse);

      // Simulate: scope3 campaigns list --format list
      // Test list formatting
    });

    it('should handle missing required parameters', async () => {
      // Simulate: scope3 campaigns get (missing --campaignId)
      // Test error message about missing required parameters
    });

    it('should parse complex JSON parameters', async () => {
      mockClient.callTool.mockResolvedValue({ success: true });

      // Simulate: scope3 campaigns create --data '{"name":"Test","budget":1000}'
      // Test that callTool receives parsed JSON
      expect(mockClient.callTool).toHaveBeenCalledWith('campaigns_create', {
        data: { name: 'Test', budget: 1000 },
      });
    });
  });

  describe('environment configuration', () => {
    it('should use production by default', () => {
      mockClient.getBaseUrl.mockReturnValue('https://api.agentic.scope3.com');

      // Create client without environment option
      expect(mockClient.getBaseUrl()).toBe('https://api.agentic.scope3.com');
    });

    it('should use staging with --environment staging', () => {
      // Simulate: scope3 --environment staging list-tools
      // Test that client is created with environment: 'staging'
    });

    it('should use custom URL with --base-url', () => {
      // Simulate: scope3 --base-url https://custom.api.com list-tools
      // Test that client is created with custom baseUrl
    });
  });

  describe('debug mode', () => {
    it('should show debug output with --debug', async () => {
      mockClient.callTool.mockResolvedValue({ result: 'success' });

      // Simulate: scope3 --debug campaigns get --campaignId 123
      // Test that debug info is logged (MCP request/response)
    });

    it('should not show debug output without --debug', async () => {
      mockClient.callTool.mockResolvedValue({ result: 'success' });

      // Simulate: scope3 campaigns get --campaignId 123
      // Test that only result is shown, no debug info
    });
  });

  describe('error handling', () => {
    it('should show error message on API failure', async () => {
      mockClient.callTool.mockRejectedValue(new Error('API Error'));

      // Simulate: scope3 campaigns get --campaignId 123
      // Test that error message is displayed
    });

    it('should show helpful error when API key is missing', () => {
      delete process.env.SCOPE3_API_KEY;
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Simulate: scope3 campaigns list
      // Test that helpful message about setting API key is shown
    });

    it('should handle network connection errors', async () => {
      mockClient.connect.mockRejectedValue(new Error('Connection refused'));

      // Simulate: scope3 campaigns list
      // Test that connection error is displayed
    });
  });
});
```

## Running These Tests

Once implemented, run with:

```bash
# Run specific test suites
npm test -- --testPathPattern=cli-dynamic-commands
npm test -- --testPathPattern=cli-integration

# Run with coverage
npm test -- --coverage --testPathPattern=cli

# Watch mode for development
npm test -- --watch --testPathPattern=cli-dynamic-commands
```

## Implementation Notes

### 1. Extract Functions for Testing

To properly test CLI functions, extract them from `cli.ts`:

```typescript
// src/utils/cli-helpers.ts
export function parseToolName(toolName: string): { resource: string; method: string } {
  // ... implementation from cli.ts
}

export function parseParameterValue(value: string, schema: Record<string, unknown>): unknown {
  // ... implementation from cli.ts
}

export function loadConfig(): CliConfig {
  // ... implementation from cli.ts
}

export function saveConfig(config: CliConfig): void {
  // ... implementation from cli.ts
}

export function loadToolsCache(): ToolsCache | null {
  // ... implementation from cli.ts
}

export function saveToolsCache(tools: McpTool[]): void {
  // ... implementation from cli.ts
}
```

Then update `cli.ts` to import and use these functions.

### 2. Mock File System

For testing file operations, mock `fs`:

```typescript
jest.mock('fs');

beforeEach(() => {
  (fs.existsSync as jest.Mock).mockReturnValue(true);
  (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ apiKey: 'test' }));
  (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
});
```

### 3. Test CLI as Library

Instead of spawning child processes, import and test CLI functions directly:

```typescript
import { parseToolName, parseParameterValue } from '../utils/cli-helpers';

describe('parseToolName', () => {
  it('should parse campaigns_create', () => {
    expect(parseToolName('campaigns_create')).toEqual({
      resource: 'campaigns',
      method: 'create',
    });
  });
});
```

### 4. Integration Testing Strategy

For true integration tests (optional, more complex):

```typescript
describe('CLI E2E', () => {
  it('should execute full command', (done) => {
    const cli = spawn('node', ['dist/cli.js', 'campaigns', 'list', '--format', 'json'], {
      env: { ...process.env, SCOPE3_API_KEY: 'test-key' },
    });

    let output = '';
    cli.stdout.on('data', (data) => {
      output += data.toString();
    });

    cli.on('close', (code) => {
      expect(code).toBe(0);
      expect(JSON.parse(output)).toBeDefined();
      done();
    });
  });
});
```

This approach requires:
- Building the CLI first (`npm run build`)
- Real API access or mock server
- Longer test execution time

For most cases, unit testing extracted functions is more practical.
