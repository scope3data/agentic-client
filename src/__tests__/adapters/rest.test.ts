/**
 * Tests for REST adapter
 */

import { RestAdapter } from '../../adapters/rest';
import { Scope3ApiError } from '../../adapters/base';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('RestAdapter', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });
      expect(adapter.baseUrl).toBe('https://api.agentic.scope3.com');
      expect(adapter.version).toBe('v2');
      expect(adapter.persona).toBe('buyer');
      expect(adapter.debug).toBe(false);
    });

    it('should use staging URL', () => {
      const adapter = new RestAdapter({
        apiKey: 'test-key',
        persona: 'buyer',
        environment: 'staging',
      });
      expect(adapter.baseUrl).toBe('https://api.agentic.staging.scope3.com');
    });

    it('should use custom base URL', () => {
      const adapter = new RestAdapter({
        apiKey: 'test-key',
        persona: 'buyer',
        baseUrl: 'https://custom.com',
      });
      expect(adapter.baseUrl).toBe('https://custom.com');
    });
  });

  describe('request', () => {
    it('should make GET request with correct URL including persona', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: (key: string) => (key === 'content-type' ? 'application/json' : null) },
        json: () => Promise.resolve({ id: '123' }),
      });

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });
      await adapter.request('GET', '/advertisers/123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.agentic.scope3.com/api/v2/buyer/advertisers/123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
        })
      );
    });

    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: (key: string) => (key === 'content-type' ? 'application/json' : null) },
        json: () => Promise.resolve({ id: '123', name: 'Test' }),
      });

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });
      await adapter.request('POST', '/advertisers', { name: 'Test' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.agentic.scope3.com/api/v2/buyer/advertisers',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
        })
      );
    });

    it('should add query params for GET', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: (key: string) => (key === 'content-type' ? 'application/json' : null) },
        json: () => Promise.resolve({ items: [] }),
      });

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });
      await adapter.request('GET', '/advertisers', undefined, {
        params: { take: 10, skip: 0, status: 'ACTIVE' },
      });

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('take=10'), expect.anything());
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=ACTIVE'),
        expect.anything()
      );
    });

    it('should throw Scope3ApiError on 4xx', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        headers: { get: (key: string) => (key === 'content-type' ? 'application/json' : null) },
        json: () => Promise.resolve({ message: 'Not found' }),
      });

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });

      await expect(adapter.request('GET', '/advertisers/999')).rejects.toThrow(Scope3ApiError);
      await expect(adapter.request('GET', '/advertisers/999')).rejects.toMatchObject({
        status: 404,
        message: 'Not found',
      });
    });

    it('should throw Scope3ApiError on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });

      await expect(adapter.request('GET', '/advertisers')).rejects.toThrow(Scope3ApiError);
    });

    it('should send body with DELETE requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: (key: string) => (key === 'content-type' ? 'application/json' : null) },
        json: () => Promise.resolve({}),
      });

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });
      await adapter.request('DELETE', '/bundles/123/products', {
        productIds: ['prod-1', 'prod-2'],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ productIds: ['prod-1', 'prod-2'] }),
        })
      );
    });

    it('should send body with PUT requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: (key: string) => (key === 'content-type' ? 'application/json' : null) },
        json: () => Promise.resolve({ id: '123', name: 'Updated' }),
      });

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });
      await adapter.request('PUT', '/advertisers/123', { name: 'Updated' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' }),
        })
      );
    });

    it('should map "latest" version to v2 in URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: (key: string) => (key === 'content-type' ? 'application/json' : null) },
        json: () => Promise.resolve({}),
      });

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer', version: 'latest' });
      await adapter.request('GET', '/advertisers');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.agentic.scope3.com/api/v2/buyer/advertisers',
        expect.anything()
      );
    });

    it('should not send body for GET requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: (key: string) => (key === 'content-type' ? 'application/json' : null) },
        json: () => Promise.resolve({}),
      });

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });
      await adapter.request('GET', '/advertisers', { ignored: true });

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.body).toBeUndefined();
    });

    it('should handle non-JSON response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: (key: string) => (key === 'content-type' ? 'text/plain' : null) },
        text: () => Promise.resolve('OK'),
      });

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });
      const result = await adapter.request('POST', '/campaigns/123/execute');

      expect(result).toEqual({ message: 'OK' });
    });

    it('should handle error response without message field', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        headers: { get: (key: string) => (key === 'content-type' ? 'application/json' : null) },
        json: () => Promise.resolve({ code: 'INTERNAL_ERROR' }),
      });

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });

      await expect(adapter.request('GET', '/advertisers')).rejects.toMatchObject({
        status: 500,
        message: 'HTTP 500',
      });
    });

    it('should skip undefined query params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: (key: string) => (key === 'content-type' ? 'application/json' : null) },
        json: () => Promise.resolve({ items: [] }),
      });

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });
      await adapter.request('GET', '/advertisers', undefined, {
        params: { take: 10, skip: undefined, status: undefined },
      });

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('take=10');
      expect(url).not.toContain('skip');
      expect(url).not.toContain('status');
    });

    it('should throw timeout error on AbortError', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValue(abortError);

      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });

      await expect(adapter.request('GET', '/advertisers')).rejects.toMatchObject({
        status: 408,
      });
    });
  });

  describe('connect/disconnect', () => {
    it('should be no-op for REST adapter', async () => {
      const adapter = new RestAdapter({ apiKey: 'test-key', persona: 'buyer' });

      await expect(adapter.connect()).resolves.toBeUndefined();
      await expect(adapter.disconnect()).resolves.toBeUndefined();
    });
  });
});
