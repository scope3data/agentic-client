/**
 * Tests for CampaignsResource
 */

import { CampaignsResource } from '../../resources/campaigns';
import type { BaseAdapter } from '../../adapters/base';

describe('CampaignsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: CampaignsResource;

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
    resource = new CampaignsResource(mockAdapter);
  });

  describe('list', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ items: [], total: 0 });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/campaigns', undefined, {
        params: {
          take: undefined,
          skip: undefined,
          advertiserId: undefined,
          type: undefined,
          status: undefined,
        },
      });
    });

    it('should pass filter params', async () => {
      mockAdapter.request.mockResolvedValue({ items: [], total: 0 });

      await resource.list({ advertiserId: 'adv-123', status: 'ACTIVE', type: 'discovery' });

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/campaigns', undefined, {
        params: {
          take: undefined,
          skip: undefined,
          advertiserId: 'adv-123',
          type: 'discovery',
          status: 'ACTIVE',
        },
      });
    });
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ data: { id: 'camp-123', name: 'Test Campaign' } });

      await resource.get('camp-123');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/campaigns/camp-123');
    });
  });

  describe('create', () => {
    it('should call adapter with POST /campaigns', async () => {
      const input = {
        advertiserId: 'adv-123',
        name: 'Q1 Campaign',
        type: 'discovery' as const,
        flightDates: { startDate: '2025-01-01', endDate: '2025-03-31' },
        budget: { total: 50000, currency: 'USD' },
      };

      mockAdapter.request.mockResolvedValue({ data: { id: 'camp-123', ...input } });

      await resource.create(input);

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/campaigns', input);
    });
  });

  describe('update', () => {
    it('should call adapter with PUT /campaigns/{id}', async () => {
      mockAdapter.request.mockResolvedValue({ data: { id: 'camp-123', name: 'Updated' } });

      await resource.update('camp-123', { name: 'Updated' });

      expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '/campaigns/camp-123', {
        name: 'Updated',
      });
    });
  });

  describe('delete', () => {
    it('should call adapter with DELETE /campaigns/{id}', async () => {
      mockAdapter.request.mockResolvedValue(undefined);

      await resource.delete('camp-123');

      expect(mockAdapter.request).toHaveBeenCalledWith('DELETE', '/campaigns/camp-123');
    });
  });

  describe('execute', () => {
    it('should call execute endpoint', async () => {
      mockAdapter.request.mockResolvedValue({ data: { success: true } });

      await resource.execute('camp-123');

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/campaigns/camp-123/execute');
    });
  });

  describe('pause', () => {
    it('should call pause endpoint', async () => {
      mockAdapter.request.mockResolvedValue({ data: { id: 'camp-123', status: 'PAUSED' } });

      await resource.pause('camp-123');

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/campaigns/camp-123/pause');
    });
  });

  describe('autoSelectProducts', () => {
    it('should call auto-select-products endpoint', async () => {
      mockAdapter.request.mockResolvedValue({ data: { selected: 5 } });

      await resource.autoSelectProducts('camp-123');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/campaigns/camp-123/auto-select-products',
        undefined
      );
    });
  });

  describe('getMediaBuyStatus', () => {
    it('should call media-buy-status endpoint', async () => {
      mockAdapter.request.mockResolvedValue({ data: { status: 'ACTIVE' } });

      await resource.getMediaBuyStatus('camp-123');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/campaigns/camp-123/media-buy-status'
      );
    });
  });

  describe('getProducts', () => {
    it('should call products endpoint', async () => {
      mockAdapter.request.mockResolvedValue({ data: { products: [] } });

      await resource.getProducts('camp-123');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/campaigns/camp-123/products');
    });
  });
});
