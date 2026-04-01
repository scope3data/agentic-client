/**
 * Tests for NotificationsResource
 */

import { NotificationsResource } from '../../resources/notifications';
import type { BaseAdapter } from '../../adapters/base';

describe('NotificationsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: NotificationsResource;

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
    resource = new NotificationsResource(mockAdapter);
  });

  describe('list', () => {
    it('should call adapter with correct path and no params', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.list();
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/notifications', undefined, {
        params: {
          unreadOnly: undefined,
          brandAgentId: undefined,
          types: undefined,
          limit: undefined,
          offset: undefined,
        },
      });
    });

    it('should pass filter params when provided', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.list({ unreadOnly: true, limit: 20 });
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/notifications', undefined, {
        params: {
          unreadOnly: true,
          brandAgentId: undefined,
          types: undefined,
          limit: 20,
          offset: undefined,
        },
      });
    });
  });

  describe('markAsRead', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue(undefined);
      await resource.markAsRead('notif-1');
      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/notifications/notif-1/read');
    });
  });

  describe('acknowledge', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue(undefined);
      await resource.acknowledge('notif-1');
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/notifications/notif-1/acknowledge'
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should call adapter with correct path and no body', async () => {
      mockAdapter.request.mockResolvedValue(undefined);
      await resource.markAllAsRead();
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/notifications/read-all',
        undefined
      );
    });

    it('should pass brandAgentId when provided', async () => {
      mockAdapter.request.mockResolvedValue(undefined);
      await resource.markAllAsRead(123);
      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/notifications/read-all', {
        brandAgentId: 123,
      });
    });
  });
});
