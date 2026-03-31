/**
 * Tests for PartnersResource
 */

import { PartnersResource } from '../../resources/partners';
import type { BaseAdapter } from '../../adapters/base';

describe('PartnersResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: PartnersResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'partner' as const,
      debug: false,
      validate: false,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new PartnersResource(mockAdapter);
  });

  describe('list', () => {
    it('should call adapter with correct path and no params', async () => {
      mockAdapter.request.mockResolvedValue({ items: [] });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/partners', undefined, {
        params: {
          status: undefined,
          name: undefined,
          take: undefined,
          skip: undefined,
        },
      });
    });

    it('should pass filter params when provided', async () => {
      mockAdapter.request.mockResolvedValue({ items: [] });

      await resource.list({
        status: 'ACTIVE',
        name: 'Acme Partner',
        take: 10,
        skip: 20,
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/partners', undefined, {
        params: {
          status: 'ACTIVE',
          name: 'Acme Partner',
          take: 10,
          skip: 20,
        },
      });
    });
  });

  describe('create', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { name: 'New Partner', domain: 'partner.com' };
      mockAdapter.request.mockResolvedValue({ id: 'p-1', name: 'New Partner' });

      await resource.create(input);

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/partners', input);
    });
  });

  describe('update', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { name: 'Updated Partner' };
      mockAdapter.request.mockResolvedValue({ id: 'p-1', name: 'Updated Partner' });

      await resource.update('p-1', input);

      expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '/partners/p-1', input);
    });
  });

  describe('archive', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue(undefined);

      await resource.archive('p-1');

      expect(mockAdapter.request).toHaveBeenCalledWith('DELETE', '/partners/p-1');
    });
  });
});
