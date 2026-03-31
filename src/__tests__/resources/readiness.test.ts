/**
 * Tests for ReadinessResource
 */

import { ReadinessResource } from '../../resources/readiness';
import type { BaseAdapter } from '../../adapters/base';

describe('ReadinessResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: ReadinessResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'storefront' as const,
      debug: false,
      validate: false,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new ReadinessResource(mockAdapter);
  });

  describe('check', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({
        platformId: 'acme',
        status: 'ready',
        checks: [],
      });
      await resource.check();
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/readiness');
    });
  });
});
