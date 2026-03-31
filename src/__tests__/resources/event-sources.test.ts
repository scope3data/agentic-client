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

  describe('list', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.list();
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/advertisers/adv-123/event-sources');
    });
  });

  describe('create', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { name: 'new-source', type: 'pixel' };
      mockAdapter.request.mockResolvedValue({ id: 'es-1' });
      await resource.create(data);
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/event-sources',
        data
      );
    });
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'es-1' });
      await resource.get('es-1');
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/advertisers/adv-123/event-sources/es-1'
      );
    });
  });

  describe('update', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { name: 'updated-source' };
      mockAdapter.request.mockResolvedValue({ id: 'es-1', name: 'updated-source' });
      await resource.update('es-1', data);
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'PUT',
        '/advertisers/adv-123/event-sources/es-1',
        data
      );
    });
  });

  describe('delete', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue(undefined);
      await resource.delete('es-1');
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'DELETE',
        '/advertisers/adv-123/event-sources/es-1'
      );
    });
  });
});
