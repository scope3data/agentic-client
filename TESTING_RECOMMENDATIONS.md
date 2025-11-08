# Testing Assessment and Recommendations for Scope3 Agentic Client CLI

## Executive Summary

**Current State**: Basic smoke tests only (9 tests, ~15% coverage of critical paths)
**After Improvements**: 83 tests covering core MCP protocol, logger, and output formatting
**Priority**: Add CLI integration tests and dynamic command generation tests

## Test Coverage Analysis

### Current Coverage (Before)

```
src/__tests__/client.test.ts         - 5 tests  (initialization only)
src/__tests__/webhook-server.test.ts - 4 tests  (initialization only)
```

**Critical Gaps**:
- No MCP protocol testing (structuredContent, text fallback, errors)
- No CLI dynamic command generation testing
- No output formatting testing (table/list/json)
- No logger debug mode testing
- No environment/config management testing
- No error scenario testing

### New Coverage (After)

```
src/__tests__/client-mcp.test.ts     - 26 tests (MCP protocol comprehensive)
src/__tests__/logger.test.ts         - 29 tests (logger behavior complete)
src/__tests__/cli-format.test.ts     - 19 tests (output formatting core)
```

**What's Covered Now**:
- ✅ MCP structuredContent handling (preferred path)
- ✅ Text content JSON parsing (fallback path)
- ✅ Connection management and lifecycle
- ✅ Debug mode and lastDebugInfo storage
- ✅ Logger conditional output (debug vs production)
- ✅ Logger structured JSON vs human-readable output
- ✅ Output formatting (JSON, table, list patterns)
- ✅ Environment and baseUrl configuration
- ✅ Error propagation and handling

## Testing Anti-Patterns Found and Fixed

### 1. Over-Mocking (Original Tests)
**Problem**: Tests only verified object initialization, not behavior
```typescript
// Bad: Only tests that modules exist
it('should have all resource modules', () => {
  expect(client.agents).toBeDefined();
  expect(client.assets).toBeDefined();
});
```

**Fix**: Test actual behavior with transport-level mocking
```typescript
// Good: Test MCP protocol behavior
it('should return structuredContent when present', async () => {
  mockMcpClient.callTool.mockResolvedValue({
    structuredContent: { id: '123', name: 'Test' },
    content: [],
  });

  const result = await client['callTool']('campaigns_get', { campaignId: '123' });
  expect(result).toEqual({ id: '123', name: 'Test' });
});
```

### 2. Missing Error Path Testing
**Problem**: No tests for failures, timeouts, or malformed responses

**Fix**: Added comprehensive error scenarios
```typescript
describe('error handling', () => {
  it('should throw error when no content is returned', async () => {
    mockMcpClient.callTool.mockResolvedValue({ content: [] });
    await expect(client['callTool']('test_tool', {})).rejects.toThrow(
      'Unexpected tool response format'
    );
  });

  it('should propagate MCP client errors', async () => {
    mockMcpClient.callTool.mockRejectedValue(new Error('MCP transport failure'));
    await expect(client['callTool']('test_tool', {})).rejects.toThrow('MCP transport failure');
  });
});
```

### 3. Untested Debug Features
**Problem**: Debug mode and logging completely untested

**Fix**: Comprehensive logger tests with NODE_ENV switching
```typescript
describe('debug mode', () => {
  it('should store debug info when debug mode is enabled', async () => {
    const client = new Scope3Client({ apiKey: 'test', debug: true });
    await client['callTool']('campaigns_get', { campaignId: '123' });

    expect(client.lastDebugInfo).toBeDefined();
    expect(client.lastDebugInfo?.toolName).toBe('campaigns_get');
    expect(client.lastDebugInfo?.durationMs).toBeGreaterThanOrEqual(0);
  });
});
```

## Priority Testing Gaps (Still Missing)

### Priority 1: CLI Dynamic Command Generation (HIGH)

**Risk**: 86+ commands generated dynamically - completely untested
**Impact**: Regression could break entire CLI

**Recommended Test File**: `src/__tests__/cli-dynamic-commands.test.ts`

```typescript
describe('CLI Dynamic Command Generation', () => {
  describe('tool fetching and caching', () => {
    it('should fetch tools from MCP server', async () => {
      // Test fetchAvailableTools with mocked client
    });

    it('should cache tools for 24 hours', async () => {
      // Test cache TTL behavior
    });

    it('should use stale cache on network failure', async () => {
      // Test fallback to expired cache
    });

    it('should refresh cache with --refresh flag', async () => {
      // Test cache invalidation
    });
  });

  describe('command parsing', () => {
    it('should parse tool names into resource and method', () => {
      expect(parseToolName('campaigns_create')).toEqual({
        resource: 'campaigns',
        method: 'create'
      });
    });

    it('should handle multi-word resources', () => {
      expect(parseToolName('brand_agents_list')).toEqual({
        resource: 'brand-agents',
        method: 'list'
      });
    });
  });

  describe('parameter parsing', () => {
    it('should parse JSON objects', () => {
      const schema = { type: 'object' };
      const value = '{"key":"value"}';
      expect(parseParameterValue(value, schema)).toEqual({ key: 'value' });
    });

    it('should parse numbers', () => {
      const schema = { type: 'number' };
      expect(parseParameterValue('42', schema)).toBe(42);
    });

    it('should parse booleans', () => {
      const schema = { type: 'boolean' };
      expect(parseParameterValue('true', schema)).toBe(true);
    });

    it('should exit on invalid JSON', () => {
      const schema = { type: 'object' };
      expect(() => parseParameterValue('{invalid', schema)).toThrow();
    });
  });

  describe('command registration', () => {
    it('should create commands for each resource', async () => {
      // Mock tools response and verify commander.js commands are registered
    });

    it('should add required options with correct flags', async () => {
      // Verify --param flags are added for tool schema
    });
  });
});
```

### Priority 2: CLI Integration Tests (MEDIUM)

**Risk**: Full CLI flow (config, cache, format, output) untested
**Impact**: User-facing bugs in production usage

**Recommended Test File**: `src/__tests__/cli-integration.test.ts`

```typescript
describe('CLI Integration Tests', () => {
  describe('config management', () => {
    it('should save and load config from file', () => {
      // Test config set/get/clear commands
    });

    it('should prioritize env vars over config file', () => {
      // Test precedence: env > config file
    });

    it('should handle missing config gracefully', () => {
      // Test fallback when no config exists
    });
  });

  describe('full command execution flow', () => {
    it('should execute a simple command with JSON output', async () => {
      // Mock MCP response, run command, verify JSON output
    });

    it('should format output as table', async () => {
      // Test table format rendering
    });

    it('should format output as list', async () => {
      // Test list format rendering
    });

    it('should display error messages on failure', async () => {
      // Test error handling and display
    });
  });

  describe('environment switching', () => {
    it('should use production URL by default', () => {
      // Test default environment
    });

    it('should use staging URL with --environment staging', () => {
      // Test environment flag
    });

    it('should use custom URL with --base-url', () => {
      // Test custom URL override
    });
  });

  describe('debug mode', () => {
    it('should show request/response with --debug', async () => {
      // Test debug output
    });

    it('should not show debug info without --debug', async () => {
      // Test normal output
    });
  });

  describe('list-tools command', () => {
    it('should display all available tools grouped by resource', async () => {
      // Test list-tools output
    });

    it('should refresh cache with --refresh', async () => {
      // Test cache refresh
    });
  });
});
```

### Priority 3: Config and Cache File Operations (LOW)

**Risk**: File I/O errors, permission issues, race conditions
**Impact**: CLI fails to start or loses configuration

**Recommended Tests**:
```typescript
describe('Config File Operations', () => {
  it('should create config directory if missing', () => {});
  it('should handle permission errors gracefully', () => {});
  it('should handle corrupted config files', () => {});
  it('should handle concurrent writes', () => {});
});

describe('Tools Cache Operations', () => {
  it('should validate cache timestamp', () => {});
  it('should handle corrupted cache files', () => {});
  it('should compute cache age correctly', () => {});
});
```

## Recommended Test Architecture

### Mock Strategy

**Principle**: Mock at boundaries, not internals

```
┌─────────────────────────────────────────┐
│         Test Boundary                   │
│  (Mock at transport/HTTP layer)        │
├─────────────────────────────────────────┤
│                                          │
│  ✅ Real: MCP Client SDK                │
│  ✅ Real: Protocol handling              │
│  ✅ Real: Serialization/deserialization │
│  ✅ Real: Error propagation             │
│                                          │
├─────────────────────────────────────────┤
│  🔧 Mock: StreamableHTTPClientTransport │
│  🔧 Mock: Network responses              │
│  🔧 Mock: File system (for CLI tests)   │
└─────────────────────────────────────────┘
```

**Good Mocking**:
```typescript
// Mock at transport layer
const mockTransport = {
  send: jest.fn().mockResolvedValue({
    structuredContent: { data: 'test' }
  })
};
```

**Bad Mocking**:
```typescript
// Don't mock internal client logic
jest.mock('../client', () => ({
  Scope3Client: jest.fn() // Loses all real behavior
}));
```

### Test Organization

```
src/__tests__/
├── client.test.ts              # Basic client initialization (existing)
├── client-mcp.test.ts          # ✅ NEW: MCP protocol behavior
├── logger.test.ts              # ✅ NEW: Logger functionality
├── cli-format.test.ts          # ✅ NEW: Output formatting
├── cli-dynamic-commands.test.ts # ⏳ TODO: Command generation
├── cli-integration.test.ts     # ⏳ TODO: Full CLI flows
├── webhook-server.test.ts      # Webhook server (existing)
└── helpers/
    ├── mock-mcp-server.ts      # Reusable MCP mocks
    └── test-fixtures.ts        # Test data fixtures
```

## Code Quality Improvements for Testability

### 1. Extract formatOutput to Separate Module

**Current Problem**: formatOutput is embedded in cli.ts, hard to test in isolation

**Recommendation**: Extract to `src/utils/format-output.ts`

```typescript
// src/utils/format-output.ts
export function formatOutput(data: unknown, format: OutputFormat): void {
  // ... existing implementation
}

export type OutputFormat = 'json' | 'table' | 'list';
```

**Benefit**:
- Easier to test in isolation
- Reusable in other contexts
- Clear separation of concerns

### 2. Extract CLI Helpers

**Recommendation**: Create `src/utils/cli-helpers.ts`

```typescript
export function parseToolName(toolName: string): { resource: string; method: string } {
  // ... existing implementation
}

export function parseParameterValue(value: string, schema: Record<string, unknown>): unknown {
  // ... existing implementation
}

export function loadConfig(): CliConfig {
  // ... existing implementation
}

export function saveConfig(config: CliConfig): void {
  // ... existing implementation
}
```

**Benefit**:
- Each function testable independently
- Reduces cli.ts complexity
- Enables unit testing without CLI setup

### 3. Add Type Exports

**Recommendation**: Export types for testing

```typescript
// src/types/cli.ts
export interface CliConfig {
  apiKey?: string;
  environment?: 'production' | 'staging';
  baseUrl?: string;
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolsCache {
  tools: McpTool[];
  timestamp: number;
}
```

## Testing Best Practices Applied

### ✅ Test Behavior, Not Implementation
```typescript
// Good: Test output behavior
it('should return structuredContent when present', async () => {
  const data = { id: '123', name: 'Test' };
  mockMcpClient.callTool.mockResolvedValue({ structuredContent: data });

  const result = await client['callTool']('test_tool', {});
  expect(result).toEqual(data);
});

// Bad: Test internal variables
it('should set connected flag', async () => {
  await client.connect();
  expect(client['connected']).toBe(true); // Testing implementation detail
});
```

### ✅ One Assertion Per Test (When Possible)
```typescript
// Good: Focused test
it('should use staging URL when environment is staging', () => {
  const client = new Scope3Client({ apiKey: 'test', environment: 'staging' });
  expect(client.getBaseUrl()).toBe('https://api.agentic.staging.scope3.com');
});

// Acceptable: Related assertions
it('should extract Error properties into structured data', () => {
  const error = new Error('Test error');
  logger.error('Failed', error);

  const parsed = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
  expect(parsed.error.message).toBe('Test error');
  expect(parsed.error.name).toBe('Error');
  expect(parsed.error.stack).toBeDefined();
});
```

### ✅ Clear Test Names (Given-When-Then)
```typescript
describe('debug mode', () => {
  describe('when debug is enabled', () => {
    it('should store debug info after callTool', async () => {
      // Test implementation
    });
  });

  describe('when debug is disabled', () => {
    it('should not store debug info', async () => {
      // Test implementation
    });
  });
});
```

### ✅ Test Error Paths
```typescript
describe('error handling', () => {
  it('should throw error when no content is returned', async () => {
    mockMcpClient.callTool.mockResolvedValue({ content: [] });
    await expect(client['callTool']('test_tool', {})).rejects.toThrow();
  });

  it('should propagate MCP client errors', async () => {
    mockMcpClient.callTool.mockRejectedValue(new Error('Network failure'));
    await expect(client['callTool']('test_tool', {})).rejects.toThrow('Network failure');
  });
});
```

## Test Coverage Goals

### Current Coverage (Estimated)
```
Core Client (MCP):        ~75% (good!)
Logger:                   ~95% (excellent!)
CLI Output Formatting:    ~60% (good, but simplified tests)
CLI Dynamic Commands:     ~5%  (critical gap!)
CLI Integration:          ~0%  (critical gap!)
Config/Cache Management:  ~0%  (low priority gap)
```

### Target Coverage
```
Core Client (MCP):        80%+ (maintain)
Logger:                   90%+ (maintain)
CLI Output Formatting:    80%+ (improve)
CLI Dynamic Commands:     70%+ (add tests!)
CLI Integration:          60%+ (add tests!)
Config/Cache Management:  50%+ (add tests)
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- --testPathPattern=client-mcp
npm test -- --testPathPattern=logger
npm test -- --testPathPattern=cli-format
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Watch Mode (Development)
```bash
npm test -- --watch
```

## Edge Cases to Test

### CLI Parameter Parsing
- ✅ Valid JSON objects and arrays
- ✅ Numbers (integer vs float)
- ✅ Booleans
- ⏳ Invalid JSON (should show clear error)
- ⏳ Missing required parameters
- ⏳ Extra parameters (should ignore or warn?)
- ⏳ Empty strings vs null vs undefined

### MCP Protocol
- ✅ structuredContent with nested objects
- ✅ Text content with valid JSON
- ✅ Text content with plain text
- ✅ Empty content array
- ⏳ Multiple content items (which to use?)
- ⏳ Non-text content types (image, etc.)
- ⏳ Malformed responses

### Output Formatting
- ✅ Empty arrays
- ✅ Single objects
- ✅ Nested objects
- ✅ Null/undefined values
- ⏳ Very long strings (truncation?)
- ⏳ Unicode and emoji
- ⏳ ANSI color codes in data
- ⏳ Large datasets (performance)

### Configuration
- ⏳ Config file permission errors
- ⏳ Corrupted config JSON
- ⏳ Concurrent config writes
- ⏳ Environment variable precedence
- ⏳ Missing home directory

### Caching
- ⏳ Expired cache
- ⏳ Corrupted cache file
- ⏳ Cache write failures
- ⏳ Concurrent cache access
- ⏳ Cache invalidation on error

## Performance Testing Considerations

While not critical now, consider adding performance tests for:

1. **Large Tool Lists**: Test with 100+ tools (realistic for future growth)
2. **Large Response Data**: Test table rendering with 1000+ rows
3. **Cache Operations**: Measure cache save/load times
4. **Tool Discovery**: Measure time to fetch and parse all tools

Example:
```typescript
describe('performance', () => {
  it('should handle 1000 tools efficiently', async () => {
    const largeToolList = Array.from({ length: 1000 }, (_, i) => ({
      name: `tool_${i}`,
      description: `Tool number ${i}`,
      inputSchema: { type: 'object', properties: {} }
    }));

    const startTime = Date.now();
    // Run tool parsing
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(1000); // Should complete in under 1 second
  });
});
```

## Continuous Integration Recommendations

### Test Configuration for CI
```json
// jest.config.ci.js
module.exports = {
  ...require('./jest.config.js'),
  maxWorkers: 2,
  ci: true,
  bail: true,
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --ci --coverage
      - uses: codecov/codecov-action@v3
        if: always()
```

## Summary

### What's Done ✅
- Comprehensive MCP protocol tests (26 tests)
- Complete logger tests (29 tests)
- Core output formatting tests (19 tests)
- All tests passing (83 total)
- Test infrastructure improved

### What's Missing ⏳
1. **CLI dynamic command generation** (HIGH PRIORITY)
   - Tool fetching and caching
   - Parameter parsing
   - Command registration

2. **CLI integration tests** (MEDIUM PRIORITY)
   - Full command execution flows
   - Config management end-to-end
   - Output formatting with real data

3. **Edge case coverage** (LOW PRIORITY)
   - File I/O error handling
   - Concurrent access scenarios
   - Malformed data handling

### Next Steps
1. Extract formatOutput and CLI helpers to separate modules
2. Add CLI dynamic command tests (Priority 1)
3. Add CLI integration tests (Priority 2)
4. Add coverage reporting to CI/CD
5. Consider performance tests for large datasets

### Key Takeaways
- **Mock at boundaries**: Test real behavior by mocking transports, not business logic
- **Test behavior**: Focus on what the code does, not how it does it
- **Cover error paths**: Most bugs happen in error scenarios
- **Maintain testability**: Extract functions, export types, keep code modular

---

*Test files created*:
- `/Users/brianokelley/conductor/agentic-client/.conductor/panama-v3/src/__tests__/client-mcp.test.ts`
- `/Users/brianokelley/conductor/agentic-client/.conductor/panama-v3/src/__tests__/logger.test.ts`
- `/Users/brianokelley/conductor/agentic-client/.conductor/panama-v3/src/__tests__/cli-format.test.ts`

*Current test count*: 83 tests, all passing
*Coverage improvement*: ~15% → ~60% of critical paths
