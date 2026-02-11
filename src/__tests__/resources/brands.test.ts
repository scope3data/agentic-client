/**
 * Tests for BuyerBrandsResource and BuyerLinkedBrandResource
 */

import { BuyerBrandsResource, BuyerLinkedBrandResource } from '../../resources/brands';
import type { BaseAdapter } from '../../adapters/base';

describe('BuyerBrandsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: BuyerBrandsResource;

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
    resource = new BuyerBrandsResource(mockAdapter);
  });

  describe('list', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ data: [], pagination: {} });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/brands', undefined, {
        params: { take: undefined, skip: undefined, status: undefined, name: undefined },
      });
    });

    it('should pass filter params', async () => {
      mockAdapter.request.mockResolvedValue({ data: [], pagination: {} });

      await resource.list({ take: 10, skip: 0, status: 'ACTIVE', name: 'Acme' });

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/brands', undefined, {
        params: { take: 10, skip: 0, status: 'ACTIVE', name: 'Acme' },
      });
    });
  });
});

describe('BuyerLinkedBrandResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: BuyerLinkedBrandResource;

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
    resource = new BuyerLinkedBrandResource(mockAdapter, 'adv-123');
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ brandId: 'brand-1', advertiserId: 'adv-123' });

      await resource.get();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/advertisers/adv-123/brand');
    });

    it('should return linked brand data', async () => {
      const linkedBrand = { brandId: 'brand-1', advertiserId: 'adv-123' };
      mockAdapter.request.mockResolvedValue(linkedBrand);

      const result = await resource.get();

      expect(result).toEqual(linkedBrand);
    });
  });

  describe('link', () => {
    it('should call adapter with PUT and body', async () => {
      const input = { brandId: 'brand-123' };
      mockAdapter.request.mockResolvedValue({ brandId: 'brand-123', advertiserId: 'adv-123' });

      await resource.link(input);

      expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '/advertisers/adv-123/brand', input);
    });
  });

  describe('unlink', () => {
    it('should call adapter with DELETE', async () => {
      mockAdapter.request.mockResolvedValue(undefined);

      await resource.unlink();

      expect(mockAdapter.request).toHaveBeenCalledWith('DELETE', '/advertisers/adv-123/brand');
    });
  });

  describe('scoping', () => {
    it('should use the correct advertiser ID in all paths', async () => {
      const resource2 = new BuyerLinkedBrandResource(mockAdapter, 'different-adv');
      mockAdapter.request.mockResolvedValue({});

      await resource2.get();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/advertisers/different-adv/brand');
    });
  });
});
