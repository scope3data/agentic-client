/**
 * Tests for TasksResource
 */

import { TasksResource } from '../../resources/tasks';
import type { BaseAdapter } from '../../adapters/base';

describe('TasksResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: TasksResource;

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
    resource = new TasksResource(mockAdapter);
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'task-123', status: 'completed' });
      await resource.get('task-123');
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/tasks/task-123');
    });
  });
});
