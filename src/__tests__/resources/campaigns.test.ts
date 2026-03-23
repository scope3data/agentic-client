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

    it('should pass filter params including type', async () => {
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
      mockAdapter.request.mockResolvedValue({ id: 'camp-123', name: 'Test Campaign' });

      await resource.get('camp-123');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/campaigns/camp-123');
    });
  });

  describe('createDiscovery', () => {
    it('should call adapter with POST /campaigns/discovery', async () => {
      const input = {
        advertiserId: 'adv-123',
        name: 'Q1 Campaign',
        bundleId: 'bundle-456',
        flightDates: { startDate: '2025-01-01', endDate: '2025-03-31' },
        budget: { total: 50000, currency: 'USD' },
      };

      mockAdapter.request.mockResolvedValue({ id: 'camp-123', ...input });

      await resource.createDiscovery(input);

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/campaigns/discovery', input);
    });
  });

  describe('updateDiscovery', () => {
    it('should call adapter with PUT /campaigns/discovery/{id}', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'camp-123', name: 'Updated' });

      await resource.updateDiscovery('camp-123', { name: 'Updated' });

      expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '/campaigns/discovery/camp-123', {
        name: 'Updated',
      });
    });
  });

  describe('createPerformance', () => {
    it('should call adapter with POST /campaigns/performance', async () => {
      const input = {
        advertiserId: 'adv-123',
        name: 'Q1 ROAS',
        flightDates: { startDate: '2025-01-01', endDate: '2025-03-31' },
        budget: { total: 100000, currency: 'USD' },
        performanceConfig: { objective: 'ROAS' as const, goals: { targetRoas: 4.0 } },
      };

      mockAdapter.request.mockResolvedValue({ id: 'camp-456', ...input });

      await resource.createPerformance(input);

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/campaigns/performance', input);
    });
  });

  describe('updatePerformance', () => {
    it('should call adapter with PUT /campaigns/performance/{id}', async () => {
      const update = { performanceConfig: { goals: { targetRoas: 5.0 } } };
      mockAdapter.request.mockResolvedValue({ id: 'camp-456' });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await resource.updatePerformance('camp-456', update as any);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'PUT',
        '/campaigns/performance/camp-456',
        update
      );
    });
  });

  describe('createAudience', () => {
    it('should call adapter with POST /campaigns/audience', async () => {
      const input = {
        advertiserId: 'adv-123',
        name: 'Audience Campaign',
        flightDates: { startDate: '2025-01-01', endDate: '2025-03-31' },
        budget: { total: 25000, currency: 'USD' },
        signals: ['signal-1'],
      };

      mockAdapter.request.mockResolvedValue({ id: 'camp-789', ...input });

      await resource.createAudience(input);

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/campaigns/audience', input);
    });
  });

  describe('execute', () => {
    it('should call execute endpoint', async () => {
      mockAdapter.request.mockResolvedValue({ success: true, executedAt: '2025-01-01' });

      await resource.execute('camp-123');

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/campaigns/camp-123/execute');
    });
  });

  describe('pause', () => {
    it('should call pause endpoint', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'camp-123', status: 'PAUSED' });

      await resource.pause('camp-123');

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/campaigns/camp-123/pause');
    });
  });
});
