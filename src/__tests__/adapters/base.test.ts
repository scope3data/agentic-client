/**
 * Tests for base adapter utilities
 */

import {
  Scope3ApiError,
  getDefaultBaseUrl,
  resolveBaseUrl,
  resolveVersion,
  resolvePersona,
  validateResourceId,
  sanitizeForLogging,
} from '../../adapters/base';

describe('Scope3ApiError', () => {
  it('should create error with status and message', () => {
    const error = new Scope3ApiError(404, 'Not found');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not found');
    expect(error.name).toBe('Scope3ApiError');
    expect(error.details).toBeUndefined();
  });

  it('should create error with details', () => {
    const details = { field: 'name', reason: 'required' };
    const error = new Scope3ApiError(400, 'Validation error', details);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Validation error');
    expect(error.details).toEqual(details);
  });

  it('should be an instance of Error', () => {
    const error = new Scope3ApiError(500, 'Internal error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(Scope3ApiError);
  });

  it('should have a stack trace', () => {
    const error = new Scope3ApiError(500, 'Internal error');
    expect(error.stack).toBeDefined();
  });
});

describe('getDefaultBaseUrl', () => {
  it('should return production URL by default', () => {
    expect(getDefaultBaseUrl()).toBe('https://api.agentic.scope3.com');
  });

  it('should return production URL when specified', () => {
    expect(getDefaultBaseUrl('production')).toBe('https://api.agentic.scope3.com');
  });

  it('should return staging URL', () => {
    expect(getDefaultBaseUrl('staging')).toBe('https://api.agentic.staging.scope3.com');
  });
});

describe('resolveBaseUrl', () => {
  it('should use custom base URL when provided', () => {
    expect(resolveBaseUrl({ apiKey: 'k', persona: 'buyer', baseUrl: 'https://custom.com' })).toBe(
      'https://custom.com'
    );
  });

  it('should strip trailing slash from custom URL', () => {
    expect(resolveBaseUrl({ apiKey: 'k', persona: 'buyer', baseUrl: 'https://custom.com/' })).toBe(
      'https://custom.com'
    );
  });

  it('should use production URL by default', () => {
    expect(resolveBaseUrl({ apiKey: 'k', persona: 'buyer' })).toBe(
      'https://api.agentic.scope3.com'
    );
  });

  it('should use staging URL when environment is staging', () => {
    expect(resolveBaseUrl({ apiKey: 'k', persona: 'buyer', environment: 'staging' })).toBe(
      'https://api.agentic.staging.scope3.com'
    );
  });

  it('should prefer custom baseUrl over environment', () => {
    expect(
      resolveBaseUrl({
        apiKey: 'k',
        persona: 'buyer',
        baseUrl: 'https://custom.com',
        environment: 'staging',
      })
    ).toBe('https://custom.com');
  });
});

describe('resolveVersion', () => {
  it('should default to v2', () => {
    expect(resolveVersion({ apiKey: 'k', persona: 'buyer' })).toBe('v2');
  });

  it('should use v1 when specified', () => {
    expect(resolveVersion({ apiKey: 'k', persona: 'buyer', version: 'v1' })).toBe('v1');
  });

  it('should use latest when specified', () => {
    expect(resolveVersion({ apiKey: 'k', persona: 'buyer', version: 'latest' })).toBe('latest');
  });
});

describe('resolvePersona', () => {
  it('should return buyer', () => {
    expect(resolvePersona({ apiKey: 'k', persona: 'buyer' })).toBe('buyer');
  });

  it('should return partner', () => {
    expect(resolvePersona({ apiKey: 'k', persona: 'partner' })).toBe('partner');
  });
});

describe('validateResourceId', () => {
  it('should throw Scope3ApiError with status 400 for empty string', () => {
    expect(() => validateResourceId('')).toThrow(Scope3ApiError);
    try {
      validateResourceId('');
    } catch (e) {
      expect(e).toBeInstanceOf(Scope3ApiError);
      expect((e as Scope3ApiError).status).toBe(400);
    }
  });

  it('should throw for string with /', () => {
    expect(() => validateResourceId('foo/bar')).toThrow(Scope3ApiError);
  });

  it('should throw for string with \\', () => {
    expect(() => validateResourceId('foo\\bar')).toThrow(Scope3ApiError);
  });

  it('should throw for string with ?', () => {
    expect(() => validateResourceId('foo?bar')).toThrow(Scope3ApiError);
  });

  it('should throw for string with #', () => {
    expect(() => validateResourceId('foo#bar')).toThrow(Scope3ApiError);
  });

  it('should throw for string with ..', () => {
    expect(() => validateResourceId('..')).toThrow(Scope3ApiError);
  });

  it('should return encoded string for normal input', () => {
    expect(validateResourceId('abc-123')).toBe('abc-123');
  });

  it('should URI-encode string with spaces', () => {
    expect(validateResourceId('hello world')).toBe('hello%20world');
  });

  it('should URI-encode string with unicode', () => {
    expect(validateResourceId('caf\u00e9')).toBe('caf%C3%A9');
  });
});

describe('sanitizeForLogging', () => {
  it('should return null as-is', () => {
    expect(sanitizeForLogging(null)).toBeNull();
  });

  it('should return undefined as-is', () => {
    expect(sanitizeForLogging(undefined)).toBeUndefined();
  });

  it('should return primitives as-is', () => {
    expect(sanitizeForLogging('hello')).toBe('hello');
    expect(sanitizeForLogging(42)).toBe(42);
    expect(sanitizeForLogging(true)).toBe(true);
  });

  it('should redact keys containing api_key', () => {
    expect(sanitizeForLogging({ api_key: 'secret123' })).toEqual({
      api_key: '[REDACTED]',
    });
    expect(sanitizeForLogging({ my_api_key: 'secret123' })).toEqual({
      my_api_key: '[REDACTED]',
    });
  });

  it('should redact keys containing token', () => {
    expect(sanitizeForLogging({ accessToken: 'abc' })).toEqual({
      accessToken: '[REDACTED]',
    });
  });

  it('should redact keys containing password', () => {
    expect(sanitizeForLogging({ password: 'abc' })).toEqual({
      password: '[REDACTED]',
    });
  });

  it('should redact keys containing secret', () => {
    expect(sanitizeForLogging({ clientSecret: 'abc' })).toEqual({
      clientSecret: '[REDACTED]',
    });
  });

  it('should redact keys containing authorization', () => {
    expect(sanitizeForLogging({ authorization: 'Bearer xyz' })).toEqual({
      authorization: '[REDACTED]',
    });
  });

  it('should NOT redact non-sensitive keys', () => {
    expect(sanitizeForLogging({ name: 'Alice', age: 30 })).toEqual({
      name: 'Alice',
      age: 30,
    });
  });

  it('should handle nested objects and redact at any depth', () => {
    const input = {
      user: {
        name: 'Alice',
        credentials: {
          password: 'supersecret',
        },
      },
    };
    expect(sanitizeForLogging(input)).toEqual({
      user: {
        name: 'Alice',
        credentials: {
          password: '[REDACTED]',
        },
      },
    });
  });

  it('should handle arrays', () => {
    const input = [{ token: 'secret' }, { name: 'safe' }];
    expect(sanitizeForLogging(input)).toEqual([{ token: '[REDACTED]' }, { name: 'safe' }]);
  });

  it('should skip __proto__, constructor, prototype keys', () => {
    const obj = Object.create(null);
    obj['__proto__'] = 'bad';
    obj['constructor'] = 'bad';
    obj['prototype'] = 'bad';
    obj['name'] = 'good';

    const result = sanitizeForLogging(obj) as Record<string, unknown>;
    expect(result).toEqual({ name: 'good' });
    expect(Object.keys(result)).not.toContain('__proto__');
    expect(Object.keys(result)).not.toContain('constructor');
    expect(Object.keys(result)).not.toContain('prototype');
  });

  it('should stop recursing at depth > 10', () => {
    // Build a deeply nested object (12 levels of wrapping)
    let nested: Record<string, unknown> = { token: 'should-stay' };
    for (let i = 0; i < 12; i++) {
      nested = { child: nested };
    }

    const result = sanitizeForLogging(nested) as Record<string, unknown>;

    // Walk 12 levels deep to reach the innermost object
    let current: unknown = result;
    for (let i = 0; i < 12; i++) {
      current = (current as Record<string, unknown>).child;
    }
    // At depth > 10, the object is returned as-is without sanitizing
    expect((current as Record<string, unknown>).token).toBe('should-stay');
  });
});
