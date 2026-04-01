/**
 * Tests for CreativesResource
 */

import { CreativesResource } from '../../resources/creatives';
import type { BaseAdapter } from '../../adapters/base';

describe('CreativesResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: CreativesResource;

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
    resource = new CreativesResource(mockAdapter, 'camp-123');
  });

  describe('list', () => {
    it('should call adapter with correct path when no params', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.list();
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/campaigns/camp-123/creatives',
        undefined,
        {
          params: {
            quality: undefined,
            search: undefined,
            take: undefined,
            skip: undefined,
          },
        }
      );
    });

    it('should call adapter with correct path and params', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.list({ quality: 'high', take: 5 });
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/campaigns/camp-123/creatives',
        undefined,
        {
          params: {
            quality: 'high',
            search: undefined,
            take: 5,
            skip: undefined,
          },
        }
      );
    });
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'cr-1' });
      await resource.get('cr-1');
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/campaigns/camp-123/creatives/cr-1',
        undefined,
        {
          params: undefined,
        }
      );
    });

    it('should call adapter with preview param when true', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'cr-1', preview: {} });
      await resource.get('cr-1', true);
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/campaigns/camp-123/creatives/cr-1',
        undefined,
        {
          params: { preview: true },
        }
      );
    });
  });

  describe('update', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { name: 'Updated Creative' };
      mockAdapter.request.mockResolvedValue({ id: 'cr-1', name: 'Updated Creative' });
      await resource.update('cr-1', data);
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'PUT',
        '/campaigns/camp-123/creatives/cr-1',
        data
      );
    });
  });

  describe('delete', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue(undefined);
      await resource.delete('cr-1');
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'DELETE',
        '/campaigns/camp-123/creatives/cr-1'
      );
    });
  });
});
