/**
 * Tests for CatalogsResource
 */

import { CatalogsResource } from '../../resources/catalogs';
import type { BaseAdapter } from '../../adapters/base';

describe('CatalogsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: CatalogsResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'buyer' as const,
      debug: false,
      validate: false,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new CatalogsResource(mockAdapter, 'adv-123');
  });

  describe('sync', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { catalogs: [{ name: 'Summer Sale' }] };
      mockAdapter.request.mockResolvedValue({ synced: 1 });
      await resource.sync(data);
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/catalogs/sync',
        data
      );
    });
  });

  describe('list', () => {
    it('should call adapter with correct path when no params', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.list();
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/advertisers/adv-123/catalogs',
        undefined,
        {
          params: { type: undefined, take: undefined, skip: undefined },
        }
      );
    });

    it('should call adapter with correct path and params', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.list({ type: 'product', take: 10 });
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/advertisers/adv-123/catalogs',
        undefined,
        {
          params: { type: 'product', take: 10, skip: undefined },
        }
      );
    });
  });
});
