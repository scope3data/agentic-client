/**
 * Tests for AdvertisersResource
 */

import { AdvertisersResource } from '../../resources/advertisers';
import type { BaseAdapter } from '../../adapters/base';

describe('AdvertisersResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: AdvertisersResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'buyer' as const,
      debug: false,
      validate: undefined,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new AdvertisersResource(mockAdapter);
  });

  describe('list', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ items: [], total: 0 });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/advertisers', undefined, {
        params: {
          take: undefined,
          skip: undefined,
          status: undefined,
          name: undefined,
          includeBrand: undefined,
        },
      });
    });

    it('should pass pagination and filter params', async () => {
      mockAdapter.request.mockResolvedValue({ items: [], total: 0 });

      await resource.list({ take: 10, skip: 20, status: 'ACTIVE', name: 'Acme' });

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/advertisers', undefined, {
        params: { take: 10, skip: 20, status: 'ACTIVE', name: 'Acme', includeBrand: undefined },
      });
    });
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ id: '123', name: 'Test' });

      await resource.get('123');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/advertisers/123');
    });
  });

  describe('create', () => {
    it('should call adapter with correct path and body', async () => {
      mockAdapter.request.mockResolvedValue({ id: '123', name: 'New Advertiser' });

      await resource.create({
        name: 'New Advertiser',
        brandDomain: 'test.com',
        description: 'Test desc',
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/advertisers', {
        name: 'New Advertiser',
        brandDomain: 'test.com',
        description: 'Test desc',
      });
    });
  });

  describe('update', () => {
    it('should call adapter with correct path and body', async () => {
      mockAdapter.request.mockResolvedValue({ id: '123', name: 'Updated' });

      await resource.update('123', { name: 'Updated' });

      expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '/advertisers/123', {
        name: 'Updated',
      });
    });
  });

  describe('delete', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue(undefined);

      await resource.delete('123');

      expect(mockAdapter.request).toHaveBeenCalledWith('DELETE', '/advertisers/123');
    });
  });

  describe('sub-resources', () => {
    it('should return conversionEvents resource for advertiser', () => {
      const convEvents = resource.conversionEvents('adv-123');
      expect(convEvents).toBeDefined();
    });

    it('should return creativeSets resource for advertiser', () => {
      const creativeSets = resource.creativeSets('adv-123');
      expect(creativeSets).toBeDefined();
    });

    it('should return testCohorts resource for advertiser', () => {
      const testCohorts = resource.testCohorts('adv-123');
      expect(testCohorts).toBeDefined();
    });
  });
});
