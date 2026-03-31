/**
 * Tests for InventorySourcesResource
 */

import { InventorySourcesResource } from '../../resources/inventory-sources';
import type { BaseAdapter } from '../../adapters/base';

describe('InventorySourcesResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: InventorySourcesResource;

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
    resource = new InventorySourcesResource(mockAdapter);
  });

  describe('list', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue([]);
      await resource.list();
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/inventory-sources');
    });
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ sourceId: 'src-1' });
      await resource.get('src-1');
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/inventory-sources/src-1');
    });
  });

  describe('create', () => {
    it('should call adapter with correct path and body', async () => {
      const input = {
        sourceId: 'snap-agent',
        name: 'Snap Agent',
        executionType: 'agent' as const,
        type: 'SALES' as const,
        endpointUrl: 'https://agent.example.com',
        protocol: 'MCP' as const,
        authenticationType: 'API_KEY' as const,
      };
      mockAdapter.request.mockResolvedValue({ sourceId: 'snap-agent', agentId: 'snap_abc' });
      await resource.create(input);
      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/inventory-sources', input);
    });
  });

  describe('update', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { status: 'active' };
      mockAdapter.request.mockResolvedValue({ sourceId: 'src-1', status: 'active' });
      await resource.update('src-1', input);
      expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '/inventory-sources/src-1', input);
    });
  });

  describe('delete', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue(undefined);
      await resource.delete('src-1');
      expect(mockAdapter.request).toHaveBeenCalledWith('DELETE', '/inventory-sources/src-1');
    });
  });
});
