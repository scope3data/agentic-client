/**
 * Tests for AudiencesResource
 */

import { AudiencesResource } from '../../resources/audiences';
import type { BaseAdapter } from '../../adapters/base';

describe('AudiencesResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: AudiencesResource;

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
    resource = new AudiencesResource(mockAdapter, 'adv-123');
  });

  describe('sync', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { audiences: [{ name: 'Retargeting' }] };
      mockAdapter.request.mockResolvedValue({ synced: 1 });
      await resource.sync(data);
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/audiences/sync',
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
        '/advertisers/adv-123/audiences',
        undefined,
        {
          params: { take: undefined, skip: undefined },
        }
      );
    });
  });
});
