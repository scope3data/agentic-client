/**
 * Tests for SignalsResource
 */

import { SignalsResource } from '../../resources/signals';
import type { BaseAdapter } from '../../adapters/base';

describe('SignalsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: SignalsResource;

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
    resource = new SignalsResource(mockAdapter);
  });

  describe('discover', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { filters: { catalogTypes: ['PRODUCT'] } };
      mockAdapter.request.mockResolvedValue([{ id: 'sig-1' }]);

      await resource.discover(input);

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/campaign/signals/discover', input);
    });

    it('should call adapter with no data when none provided', async () => {
      mockAdapter.request.mockResolvedValue([]);

      await resource.discover();

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/campaign/signals/discover',
        undefined
      );
    });
  });

  describe('list', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue([{ id: 'sig-1' }, { id: 'sig-2' }]);

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/signals');
    });
  });
});
