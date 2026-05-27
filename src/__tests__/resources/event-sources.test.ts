/**
 * Tests for EventSourcesResource
 */

import { EventSourcesResource } from '../../resources/event-sources';
import type { BaseAdapter } from '../../adapters/base';

describe('EventSourcesResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: EventSourcesResource;

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
    resource = new EventSourcesResource(mockAdapter, 'adv-123');
  });

  describe('list', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.list();
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/advertisers/adv-123/event-sources');
    });
  });

  describe('sync', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { sources: [{ name: 'pixel' }] };
      mockAdapter.request.mockResolvedValue({ synced: 1 });
      await resource.sync(data);
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/event-sources/sync',
        data
      );
    });
  });

  describe('getEventSummary', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ data: {} });
      await resource.getEventSummary();
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/advertisers/adv-123/events/summary'
      );
    });
  });

  describe('logEvent', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { events: [{ eventType: 'conversion', value: 100 }] };
      mockAdapter.request.mockResolvedValue({ data: { success: true } });
      await resource.logEvent(data);
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/log-event',
        data
      );
    });
  });
});
