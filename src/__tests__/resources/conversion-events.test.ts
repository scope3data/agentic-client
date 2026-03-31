/**
 * Tests for ConversionEventsResource
 */

import { ConversionEventsResource } from '../../resources/conversion-events';
import type { BaseAdapter } from '../../adapters/base';

describe('ConversionEventsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: ConversionEventsResource;
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
    resource = new ConversionEventsResource(mockAdapter, advertiserId);
  });

  describe('constructor', () => {
    it('should accept adapter and advertiserId', () => {
      expect(resource).toBeDefined();
    });
  });

  describe('list', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ items: [] });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/advertisers/adv-123/conversion-events'
      );
    });
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'evt-1' });

      await resource.get('evt-1');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/advertisers/adv-123/conversion-events/evt-1'
      );
    });
  });

  describe('create', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { name: 'Purchase', type: 'PURCHASE' as const };
      mockAdapter.request.mockResolvedValue({ id: 'evt-1', name: 'Purchase' });

      await resource.create(input);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/conversion-events',
        input
      );
    });
  });

  describe('update', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { name: 'Updated Purchase' };
      mockAdapter.request.mockResolvedValue({ id: 'evt-1', name: 'Updated Purchase' });

      await resource.update('evt-1', input);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'PUT',
        '/advertisers/adv-123/conversion-events/evt-1',
        input
      );
    });
  });
});
