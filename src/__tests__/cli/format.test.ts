/**
 * Tests for CLI format utilities
 */

import { formatOutput, printError, printSuccess, printWarning } from '../../cli/format';

// Capture console output
let consoleOutput: string[];
let consoleErrors: string[];

const originalLog = console.log;
const originalError = console.error;

beforeEach(() => {
  consoleOutput = [];
  consoleErrors = [];
  console.log = jest.fn((...args: unknown[]) => {
    consoleOutput.push(args.map(String).join(' '));
  });
  console.error = jest.fn((...args: unknown[]) => {
    consoleErrors.push(args.map(String).join(' '));
  });
});

afterEach(() => {
  console.log = originalLog;
  console.error = originalError;
});

describe('formatOutput', () => {
  describe('json format', () => {
    it('should output JSON with indentation', () => {
      formatOutput({ id: '123', name: 'Test' }, 'json');
      expect(consoleOutput[0]).toBe(JSON.stringify({ id: '123', name: 'Test' }, null, 2));
    });

    it('should output JSON array', () => {
      formatOutput([1, 2, 3], 'json');
      expect(consoleOutput[0]).toBe(JSON.stringify([1, 2, 3], null, 2));
    });

    it('should output null as JSON', () => {
      formatOutput(null, 'json');
      expect(consoleOutput[0]).toBe('null');
    });
  });

  describe('yaml format', () => {
    it('should output object in yaml-like format', () => {
      formatOutput({ name: 'Test', id: '123' }, 'yaml');
      const output = consoleOutput.join('\n');
      expect(output).toContain('name: Test');
      expect(output).toContain('id: 123');
    });

    it('should output array in yaml-like format', () => {
      formatOutput(['a', 'b'], 'yaml');
      const output = consoleOutput.join('\n');
      expect(output).toContain('- a');
      expect(output).toContain('- b');
    });

    it('should handle null', () => {
      formatOutput(null, 'yaml');
      expect(consoleOutput[0]).toContain('null');
    });

    it('should handle empty object', () => {
      formatOutput({}, 'yaml');
      expect(consoleOutput[0]).toContain('{}');
    });

    it('should handle empty array', () => {
      formatOutput([], 'yaml');
      expect(consoleOutput[0]).toContain('[]');
    });
  });

  describe('table format', () => {
    it('should show "No data" for null', () => {
      formatOutput(null, 'table');
      expect(consoleOutput[0]).toContain('No data');
    });

    it('should show "No data" for undefined', () => {
      formatOutput(undefined, 'table');
      expect(consoleOutput[0]).toContain('No data');
    });

    it('should show "No items" for empty array', () => {
      formatOutput([], 'table');
      expect(consoleOutput[0]).toContain('No items');
    });

    it('should show "No items" for paginated response with empty items', () => {
      formatOutput({ items: [], total: 0 }, 'table');
      expect(consoleOutput[0]).toContain('No items');
    });

    it('should render array of objects as table', () => {
      formatOutput(
        [
          { id: '1', name: 'First', status: 'ACTIVE' },
          { id: '2', name: 'Second', status: 'PAUSED' },
        ],
        'table'
      );
      const output = consoleOutput.join('\n');
      expect(output).toContain('id');
      expect(output).toContain('name');
      expect(output).toContain('First');
      expect(output).toContain('Second');
    });

    it('should render paginated response with total count', () => {
      formatOutput(
        {
          items: [{ id: '1', name: 'Test' }],
          total: 100,
        },
        'table'
      );
      const output = consoleOutput.join('\n');
      expect(output).toContain('1');
      expect(output).toContain('Test');
      expect(output).toContain('Showing 1 of 100');
    });

    it('should render single object as vertical table', () => {
      formatOutput({ id: '123', name: 'Test', status: 'ACTIVE' }, 'table');
      const output = consoleOutput.join('\n');
      expect(output).toContain('id');
      expect(output).toContain('123');
      expect(output).toContain('name');
      expect(output).toContain('Test');
    });

    it('should render primitive values', () => {
      formatOutput('hello world', 'table');
      expect(consoleOutput[0]).toBe('hello world');
    });

    it('should use table format as default', () => {
      formatOutput({ id: '123' });
      const output = consoleOutput.join('\n');
      expect(output).toContain('id');
      expect(output).toContain('123');
    });

    it('should prioritize important columns in arrays', () => {
      formatOutput(
        [
          {
            someField: 'x',
            id: '1',
            otherField: 'y',
            name: 'Test',
            status: 'ACTIVE',
            createdAt: '2025-01-01',
          },
        ],
        'table'
      );
      const output = consoleOutput.join('\n');
      // id, name, status, createdAt should appear (priority keys)
      expect(output).toContain('id');
      expect(output).toContain('name');
    });

    it('should print primitives in array', () => {
      formatOutput(['hello', 'world'], 'table');
      const output = consoleOutput.join('\n');
      expect(output).toContain('hello');
      expect(output).toContain('world');
    });
  });
});

describe('printError', () => {
  it('should print error message to stderr', () => {
    printError('Something went wrong');
    expect(consoleErrors[0]).toContain('Error: Something went wrong');
  });
});

describe('printSuccess', () => {
  it('should print success message', () => {
    printSuccess('Done!');
    expect(consoleOutput[0]).toContain('Done!');
  });
});

describe('printWarning', () => {
  it('should print warning message', () => {
    printWarning('Be careful');
    expect(consoleOutput[0]).toContain('Warning: Be careful');
  });
});
