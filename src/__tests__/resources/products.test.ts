/**
 * Tests for BundleProductsResource
 */

import { BundleProductsResource } from '../../resources/products';
import type { BaseAdapter } from '../../adapters/base';

describe('BundleProductsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: BundleProductsResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'buyer' as const,
      debug: false,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new BundleProductsResource(mockAdapter, 'bundle-123');
  });

  describe('list', () => {
    it('should call adapter with GET /bundles/{bundleId}/products', async () => {
      mockAdapter.request.mockResolvedValue({
        bundleId: 'bundle-123',
        products: [],
        totalProducts: 0,
      });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/bundles/bundle-123/products');
    });
  });

  describe('add', () => {
    it('should call adapter with POST /bundles/{bundleId}/products and products array', async () => {
      const input = {
        products: [
          {
            productId: 'prod-1',
            salesAgentId: 'agent-1',
            groupId: 'group-0',
            groupName: 'Publisher A',
            cpm: 12.5,
            budget: 5000,
          },
        ],
      };
      mockAdapter.request.mockResolvedValue({
        bundleId: 'bundle-123',
        products: input.products,
        totalProducts: 1,
      });

      await resource.add(input);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/bundles/bundle-123/products',
        input
      );
    });
  });

  describe('remove', () => {
    it('should call adapter with DELETE /bundles/{bundleId}/products and productIds', async () => {
      const input = { productIds: ['prod-1', 'prod-2'] };
      mockAdapter.request.mockResolvedValue(undefined);

      await resource.remove(input);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'DELETE',
        '/bundles/bundle-123/products',
        input
      );
    });
  });

  describe('scoping', () => {
    it('should use the correct bundle ID in all paths', async () => {
      const resource2 = new BundleProductsResource(mockAdapter, 'different-bundle');
      mockAdapter.request.mockResolvedValue({
        bundleId: 'different-bundle',
        products: [],
        totalProducts: 0,
      });

      await resource2.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/bundles/different-bundle/products');
    });
  });
});
