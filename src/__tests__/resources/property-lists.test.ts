/**
 * Tests for PropertyListsResource and PropertyListChecksResource
 */

import { PropertyListsResource, PropertyListChecksResource } from '../../resources/property-lists';
import type { BaseAdapter } from '../../adapters/base';

describe('PropertyListsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: PropertyListsResource;

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
    resource = new PropertyListsResource(mockAdapter, 'adv-123');
  });

  describe('create', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { name: 'Blocklist', purpose: 'exclusion' };
      mockAdapter.request.mockResolvedValue({ id: 'pl-1' });
      await resource.create(data);
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/property-lists',
        data
      );
    });
  });

  describe('list', () => {
    it('should call adapter with correct path when no params', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.list();
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/advertisers/adv-123/property-lists',
        undefined,
        {
          params: { purpose: undefined },
        }
      );
    });

    it('should call adapter with correct path and params', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.list({ purpose: 'inclusion' });
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/advertisers/adv-123/property-lists',
        undefined,
        {
          params: { purpose: 'inclusion' },
        }
      );
    });
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'pl-1' });
      await resource.get('pl-1');
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/advertisers/adv-123/property-lists/pl-1'
      );
    });
  });

  describe('update', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { name: 'Updated Blocklist' };
      mockAdapter.request.mockResolvedValue({ id: 'pl-1', name: 'Updated Blocklist' });
      await resource.update('pl-1', data);
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'PUT',
        '/advertisers/adv-123/property-lists/pl-1',
        data
      );
    });
  });

  describe('delete', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue(undefined);
      await resource.delete('pl-1');
      expect(mockAdapter.request).toHaveBeenCalledWith(
        'DELETE',
        '/advertisers/adv-123/property-lists/pl-1'
      );
    });
  });
});

describe('PropertyListChecksResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: PropertyListChecksResource;

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
    resource = new PropertyListChecksResource(mockAdapter);
  });

  describe('check', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { domains: ['example.com'] };
      mockAdapter.request.mockResolvedValue({ results: [] });
      await resource.check(data);
      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/property-lists/check', data);
    });
  });

  describe('getReport', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'rpt-1' });
      await resource.getReport('rpt-1');
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/property-lists/reports/rpt-1');
    });
  });
});
