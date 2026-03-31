/**
 * Tests for CreativeSetsResource
 */

import { CreativeSetsResource } from '../../resources/creative-sets';
import type { BaseAdapter } from '../../adapters/base';

describe('CreativeSetsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: CreativeSetsResource;
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
    resource = new CreativeSetsResource(mockAdapter, advertiserId);
  });

  describe('list', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ items: [] });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/advertisers/adv-123/creative-sets');
    });
  });

  describe('create', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { name: 'Holiday Set', type: 'DISPLAY' };
      mockAdapter.request.mockResolvedValue({ id: 'cs-1', name: 'Holiday Set' });

      await resource.create(input);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/creative-sets',
        input
      );
    });
  });

  describe('addAsset', () => {
    it('should call adapter with correct path and body', async () => {
      const input = {
        assetUrl: 'https://cdn.example.com/image.png',
        name: 'Banner',
        type: 'IMAGE',
      };
      mockAdapter.request.mockResolvedValue({ id: 'asset-1' });

      await resource.addAsset('cs-1', input);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/creative-sets/cs-1/assets',
        input
      );
    });
  });

  describe('removeAsset', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue(undefined);

      await resource.removeAsset('cs-1', 'asset-1');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'DELETE',
        '/advertisers/adv-123/creative-sets/cs-1/assets/asset-1'
      );
    });
  });
});
