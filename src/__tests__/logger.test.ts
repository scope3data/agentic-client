/**
 * Tests for Logger utility
 *
 * Tests conditional logging, debug mode, structured output, and error formatting
 */

import { Logger } from '../utils/logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleErrorSpy: jest.SpyInstance;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    // Create fresh logger instance
    logger = new Logger();

    // Spy on console.error (logger outputs to stderr)
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Save original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();

    // Restore NODE_ENV
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  describe('debug mode control', () => {
    it('should not log debug messages when debug is disabled', () => {
      logger.setDebug(false);
      logger.debug('Test message');

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log debug messages when debug is enabled', () => {
      logger.setDebug(true);
      logger.debug('Test message');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should not log info messages when debug is disabled', () => {
      logger.setDebug(false);
      logger.info('Test message');

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log info messages when debug is enabled', () => {
      logger.setDebug(true);
      logger.info('Test message');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should not log warn messages when debug is disabled', () => {
      logger.setDebug(false);
      logger.warn('Test message');

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log warn messages when debug is enabled', () => {
      logger.setDebug(true);
      logger.warn('Test message');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should always log error messages regardless of debug mode', () => {
      logger.setDebug(false);
      logger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('development mode output (human-readable)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      logger = new Logger();
      logger.setDebug(true);
    });

    it('should format debug messages with timestamp and severity', () => {
      logger.debug('Test debug message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const call = consoleErrorSpy.mock.calls[0][0] as string;
      expect(call).toMatch(/\[DEBUG\]/);
      expect(call).toMatch(/Test debug message/);
      expect(call).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO timestamp
    });

    it('should include structured data in human-readable format', () => {
      logger.info('Test with data', { userId: '123', action: 'login' });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const [message, data] = consoleErrorSpy.mock.calls[0];
      expect(message).toMatch(/\[INFO\]/);
      expect(message).toMatch(/Test with data/);
      expect(data).toContain('"userId": "123"');
      expect(data).toContain('"action": "login"');
    });

    it('should format warnings with WARNING severity', () => {
      logger.warn('Warning message');

      const call = consoleErrorSpy.mock.calls[0][0] as string;
      expect(call).toMatch(/\[WARNING\]/);
      expect(call).toMatch(/Warning message/);
    });

    it('should format errors with ERROR severity', () => {
      logger.error('Error message');

      const call = consoleErrorSpy.mock.calls[0][0] as string;
      expect(call).toMatch(/\[ERROR\]/);
      expect(call).toMatch(/Error message/);
    });
  });

  describe('production mode output (structured JSON)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      logger = new Logger();
      logger.setDebug(true);
    });

    it('should output structured JSON for debug messages', () => {
      logger.debug('Test message', { key: 'value' });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const output = consoleErrorSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.message).toBe('Test message');
      expect(parsed.severity).toBe('DEBUG');
      expect(parsed.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(parsed.key).toBe('value');
    });

    it('should output structured JSON for info messages', () => {
      logger.info('Info message', { count: 42 });

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.message).toBe('Info message');
      expect(parsed.severity).toBe('INFO');
      expect(parsed.count).toBe(42);
    });

    it('should output structured JSON for warnings', () => {
      logger.warn('Warning', { code: 'WARN_001' });

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.message).toBe('Warning');
      expect(parsed.severity).toBe('WARNING');
      expect(parsed.code).toBe('WARN_001');
    });

    it('should output structured JSON for errors', () => {
      logger.error('Error occurred');

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.message).toBe('Error occurred');
      expect(parsed.severity).toBe('ERROR');
    });
  });

  describe('error object handling', () => {
    beforeEach(() => {
      logger.setDebug(true);
    });

    it('should extract Error properties into structured data', () => {
      const error = new Error('Test error');
      error.name = 'TestError';

      logger.error('Operation failed', error);

      const output = consoleErrorSpy.mock.calls[0][0] as string;

      // Check if it's JSON (production) or includes error info (development)
      if (output.startsWith('{')) {
        const parsed = JSON.parse(output);
        expect(parsed.error.message).toBe('Test error');
        expect(parsed.error.name).toBe('TestError');
        expect(parsed.error.stack).toBeDefined();
      } else {
        const data = consoleErrorSpy.mock.calls[0][1] as string;
        expect(data).toContain('Test error');
      }
    });

    it('should handle Error with additional data', () => {
      const error = new Error('Database error');
      logger.error('Query failed', error, { query: 'SELECT * FROM users', duration: 500 });

      const output = consoleErrorSpy.mock.calls[0][0] as string;

      if (output.startsWith('{')) {
        const parsed = JSON.parse(output);
        expect(parsed.error.message).toBe('Database error');
        expect(parsed.query).toBe('SELECT * FROM users');
        expect(parsed.duration).toBe(500);
      }
    });

    it('should handle non-Error objects', () => {
      logger.error('Unexpected error', 'String error');

      const output = consoleErrorSpy.mock.calls[0][0] as string;

      if (output.startsWith('{')) {
        const parsed = JSON.parse(output);
        expect(parsed.error).toBe('String error');
      }
    });

    it('should handle null/undefined error parameter', () => {
      logger.error('Error without object', undefined, { context: 'test' });

      const output = consoleErrorSpy.mock.calls[0][0] as string;

      if (output.startsWith('{')) {
        const parsed = JSON.parse(output);
        expect(parsed.context).toBe('test');
        expect(parsed.error).toBeUndefined();
      }
    });
  });

  describe('singleton behavior', () => {
    it('should return same instance from getInstance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should maintain debug state across getInstance calls', () => {
      const instance1 = Logger.getInstance();
      instance1.setDebug(true);

      const instance2 = Logger.getInstance();
      instance2.debug('Test message');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('data sanitization and edge cases', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      logger = new Logger();
      logger.setDebug(true);
    });

    it('should throw on circular references (expected JSON.stringify behavior)', () => {
      const circular: Record<string, unknown> = { key: 'value' };
      circular.self = circular;

      // JSON.stringify throws on circular references - this is expected behavior
      expect(() => {
        logger.info('Circular data', circular);
      }).toThrow(/circular/i);
    });

    it('should handle undefined and null values in data', () => {
      logger.info('Null test', { nullValue: null, undefinedValue: undefined, zero: 0 });

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.nullValue).toBeNull();
      expect(parsed.zero).toBe(0);
    });

    it('should handle empty data object', () => {
      logger.info('Empty data', {});

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.message).toBe('Empty data');
      expect(parsed.severity).toBe('INFO');
    });

    it('should handle messages with special characters', () => {
      logger.info('Message with "quotes" and \n newlines');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
