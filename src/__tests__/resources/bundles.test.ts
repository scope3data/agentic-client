/**
 * Tests for BundlesResource
 */

import { BundlesResource } from '../../resources/bundles';
import { BundleProductsResource } from '../../resources/products';
import type { BaseAdapter } from '../../adapters/base';

function createMockAdapter(overrides?: Partial<BaseAdapter>): jest.Mocked<BaseAdapter> {
  return {
    baseUrl: 'https://api.test.com',
    version: 'v2',
    persona: 'buyer' as const,
    debug: false,
    validate: false,
    request: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    ...overrides,
  } as jest.Mocked<BaseAdapter>;
}

describe('BundlesResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: BundlesResource;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    resource = new BundlesResource(mockAdapter);
  });

  describe('create', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { advertiserId: 'adv-1', channels: ['display'] };
      mockAdapter.request.mockResolvedValue({ bundleId: 'b-1' });

      await resource.create(input);

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/bundles', input);
    });
  });

  describe('discoverProducts', () => {
    it('should call adapter with correct path and query params', async () => {
      mockAdapter.request.mockResolvedValue({ groups: [] });

      await resource.discoverProducts('bundle-123', {
        groupLimit: 5,
        groupOffset: 0,
        productsPerGroup: 10,
        productOffset: 0,
        publisherDomain: 'example.com',
        salesAgentIds: 'sa-1',
        salesAgentNames: 'Agent One',
      });

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/bundles/bundle-123/discover-products',
        undefined,
        {
          params: {
            groupLimit: 5,
            groupOffset: 0,
            productsPerGroup: 10,
            productOffset: 0,
            publisherDomain: 'example.com',
            salesAgentIds: 'sa-1',
            salesAgentNames: 'Agent One',
          },
        }
      );
    });

    it('should call adapter with no params when none provided', async () => {
      mockAdapter.request.mockResolvedValue({ groups: [] });

      await resource.discoverProducts('bundle-456');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/bundles/bundle-456/discover-products',
        undefined,
        {
          params: {
            groupLimit: undefined,
            groupOffset: undefined,
            productsPerGroup: undefined,
            productOffset: undefined,
            publisherDomain: undefined,
            salesAgentIds: undefined,
            salesAgentNames: undefined,
          },
        }
      );
    });
  });

  describe('browseProducts', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { advertiserId: 'adv-1', channels: ['display'] };
      mockAdapter.request.mockResolvedValue({ groups: [], bundleId: 'b-auto' });

      await resource.browseProducts(input);

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/bundles/discover-products', input);
    });
  });

  describe('products', () => {
    it('should return a BundleProductsResource instance', () => {
      const productsResource = resource.products('bundle-789');
      expect(productsResource).toBeInstanceOf(BundleProductsResource);
    });
  });
});
