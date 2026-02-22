/**
 * Tests for StorefrontAgentsResource and StorefrontTasksResource
 */

import { StorefrontAgentsResource } from '../../resources/storefront-agents';
import { StorefrontTasksResource } from '../../resources/storefront-tasks';
import type { BaseAdapter } from '../../adapters/base';

describe('StorefrontAgentsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: StorefrontAgentsResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'storefront' as const,
      debug: false,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new StorefrontAgentsResource(mockAdapter);
  });

  describe('list', () => {
    it('should call GET /agents', async () => {
      mockAdapter.request.mockResolvedValue({ agents: [] });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents');
    });
  });

  describe('get', () => {
    it('should call GET /agents/{id}', async () => {
      mockAdapter.request.mockResolvedValue({ platformId: 'my-network' });

      await resource.get('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents/my-network');
    });
  });

  describe('create', () => {
    it('should call POST /agents with body', async () => {
      mockAdapter.request.mockResolvedValue({ platformId: 'my-network' });

      await resource.create({
        platformId: 'my-network',
        platformName: 'My Network',
        publisherDomain: 'mynetwork.com',
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/agents', {
        platformId: 'my-network',
        platformName: 'My Network',
        publisherDomain: 'mynetwork.com',
      });
    });
  });

  describe('update', () => {
    it('should call PUT /agents/{id} with body', async () => {
      mockAdapter.request.mockResolvedValue({ platformId: 'my-network' });

      await resource.update('my-network', { platformName: 'Updated Name' });

      expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '/agents/my-network', {
        platformName: 'Updated Name',
      });
    });
  });

  describe('delete', () => {
    it('should call DELETE /agents/{id}', async () => {
      mockAdapter.request.mockResolvedValue(undefined);

      await resource.delete('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith('DELETE', '/agents/my-network');
    });
  });

  describe('upload', () => {
    it('should call POST /agents/{id}/upload', async () => {
      mockAdapter.request.mockResolvedValue({ templatesAdded: 1 });

      await resource.upload('my-network', {
        content: 'name,description\nBanner,Display',
        file_type: 'csv',
        replace: true,
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/agents/my-network/upload', {
        content: 'name,description\nBanner,Display',
        file_type: 'csv',
        replace: true,
      });
    });
  });

  describe('fileUploads', () => {
    it('should call GET /agents/{id}/file-uploads with limit', async () => {
      mockAdapter.request.mockResolvedValue({ uploads: [] });

      await resource.fileUploads('my-network', 10);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/agents/my-network/file-uploads',
        undefined,
        { params: { limit: 10 } }
      );
    });
  });

  describe('tasks', () => {
    it('should return a StorefrontTasksResource scoped to the agent', () => {
      const tasks = resource.tasks('my-network');
      expect(tasks).toBeInstanceOf(StorefrontTasksResource);
    });
  });
});

describe('StorefrontTasksResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: StorefrontTasksResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'storefront' as const,
      debug: false,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new StorefrontTasksResource(mockAdapter, 'my-network');
  });

  describe('list', () => {
    it('should call GET /agents/{agentId}/tasks', async () => {
      mockAdapter.request.mockResolvedValue({ tasks: [] });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/agents/my-network/tasks',
        undefined,
        { params: { status: undefined, capability: undefined, limit: undefined } }
      );
    });

    it('should pass filter params', async () => {
      mockAdapter.request.mockResolvedValue({ tasks: [] });

      await resource.list({ status: 'pending', capability: 'get_products', limit: 5 });

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/agents/my-network/tasks',
        undefined,
        { params: { status: 'pending', capability: 'get_products', limit: 5 } }
      );
    });
  });

  describe('get', () => {
    it('should call GET /tasks/{taskId}', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'pending' });

      await resource.get('task-1');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/tasks/task-1');
    });
  });

  describe('claim', () => {
    it('should call POST /tasks/{taskId}/claim', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'claimed' });

      await resource.claim('task-1', { claimed_by: 'reviewer' });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/tasks/task-1/claim', {
        claimed_by: 'reviewer',
      });
    });

    it('should default to empty body when no input provided', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'claimed' });

      await resource.claim('task-1');

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/tasks/task-1/claim', {});
    });
  });

  describe('complete', () => {
    it('should call POST /tasks/{taskId}/complete with result', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'completed' });

      await resource.complete('task-1', { result: { approved: true } });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/tasks/task-1/complete', {
        result: { approved: true },
      });
    });

    it('should include correction when provided', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'completed' });

      await resource.complete('task-1', {
        result: { approved: true },
        correction: {
          original: { budget: 1000 },
          corrected: { budget: 500 },
          reason: 'Budget cap exceeded',
        },
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/tasks/task-1/complete', {
        result: { approved: true },
        correction: {
          original: { budget: 1000 },
          corrected: { budget: 500 },
          reason: 'Budget cap exceeded',
        },
      });
    });
  });
});
