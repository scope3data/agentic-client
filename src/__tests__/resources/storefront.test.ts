/**
 * Tests for StorefrontResource
 */

import { StorefrontResource } from '../../resources/storefront';
import type { BaseAdapter } from '../../adapters/base';

describe('StorefrontResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: StorefrontResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'storefront' as const,
      debug: false,
      validate: false,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new StorefrontResource(mockAdapter);
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ platformId: 'acme' });
      await resource.get();
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '');
    });
  });

  describe('create', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { platformId: 'acme', name: 'Acme Media' };
      mockAdapter.request.mockResolvedValue({ platformId: 'acme', name: 'Acme Media' });
      await resource.create(input);
      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '', input);
    });
  });

  describe('update', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { name: 'Updated Name', enabled: true };
      mockAdapter.request.mockResolvedValue({ platformId: 'acme', name: 'Updated Name' });
      await resource.update(input);
      expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '', input);
    });
  });

  describe('delete', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue(undefined);
      await resource.delete();
      expect(mockAdapter.request).toHaveBeenCalledWith('DELETE', '');
    });
  });
});
