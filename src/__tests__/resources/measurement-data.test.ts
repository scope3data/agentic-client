/**
 * Tests for MeasurementDataResource
 */

import { MeasurementDataResource } from '../../resources/measurement-data';
import type { BaseAdapter } from '../../adapters/base';

describe('MeasurementDataResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: MeasurementDataResource;

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
    resource = new MeasurementDataResource(mockAdapter, 'adv-123');
  });

  describe('sync', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { measurements: [{ metric: 'impressions', value: 100 }] };
      mockAdapter.request.mockResolvedValue({ synced: 1 });
      await resource.sync(data);
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/measurement-data/sync',
        data
      );
    });
  });
});
