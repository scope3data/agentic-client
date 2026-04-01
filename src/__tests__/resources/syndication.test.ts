/**
 * Tests for SyndicationResource
 */

import { SyndicationResource } from '../../resources/syndication';
import type { BaseAdapter } from '../../adapters/base';

describe('SyndicationResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: SyndicationResource;

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
    resource = new SyndicationResource(mockAdapter, 'adv-123');
  });

  describe('syndicate', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { resourceType: 'campaign', resourceId: 'camp-1' };
      mockAdapter.request.mockResolvedValue({ taskId: 'task-1' });
      await resource.syndicate(data);
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/syndicate',
        data
      );
    });
  });

  describe('status', () => {
    it('should call adapter with correct path when no params', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.status();
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/advertisers/adv-123/syndication-status',
        undefined,
        {
          params: {
            resourceType: undefined,
            resourceId: undefined,
            adcpAgentId: undefined,
            enabled: undefined,
            status: undefined,
            limit: undefined,
            offset: undefined,
          },
        }
      );
    });

    it('should call adapter with correct path and params', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.status({ resourceType: 'campaign' });
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/advertisers/adv-123/syndication-status',
        undefined,
        {
          params: {
            resourceType: 'campaign',
            resourceId: undefined,
            adcpAgentId: undefined,
            enabled: undefined,
            status: undefined,
            limit: undefined,
            offset: undefined,
          },
        }
      );
    });
  });
});
