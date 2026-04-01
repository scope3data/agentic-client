/**
 * Tests for TestCohortsResource
 */

import { TestCohortsResource } from '../../resources/test-cohorts';
import type { BaseAdapter } from '../../adapters/base';

describe('TestCohortsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: TestCohortsResource;
  const advertiserId = 'adv-123';

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
    resource = new TestCohortsResource(mockAdapter, advertiserId);
  });

  describe('list', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ items: [] });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/advertisers/adv-123/test-cohorts');
    });
  });

  describe('create', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { name: 'Test Cohort A', splitPercentage: 50 };
      mockAdapter.request.mockResolvedValue({ id: 'tc-1', name: 'Test Cohort A' });

      await resource.create(input);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/test-cohorts',
        input
      );
    });
  });
});
