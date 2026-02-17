/**
 * Tests for base adapter utilities
 */

import {
  Scope3ApiError,
  getDefaultBaseUrl,
  resolveBaseUrl,
  resolveVersion,
  resolvePersona,
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
