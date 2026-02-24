/**
 * Storefront tasks resource for HITL task management
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  StorefrontTask,
  StorefrontTaskListParams,
  ClaimTaskInput,
  CompleteTaskInput,
} from '../types';

export class StorefrontTasksResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly _agentId: string
  ) {}

  async list(params?: StorefrontTaskListParams): Promise<unknown> {
    return this.adapter.request<unknown>('GET', '/storefront/tasks', undefined, {
      params: {
        status: params?.status,
        capability: params?.capability,
        limit: params?.limit,
      },
    });
  }

  async get(taskId: string): Promise<StorefrontTask> {
    return this.adapter.request<StorefrontTask>(
      'GET',
      `/storefront/tasks/${validateResourceId(taskId)}`
    );
  }

  async claim(taskId: string, data?: ClaimTaskInput): Promise<unknown> {
    return this.adapter.request<unknown>(
      'POST',
      `/storefront/tasks/${validateResourceId(taskId)}/claim`,
      data ?? {}
    );
  }

  async complete(taskId: string, data: CompleteTaskInput): Promise<unknown> {
    return this.adapter.request<unknown>(
      'POST',
      `/storefront/tasks/${validateResourceId(taskId)}/complete`,
      data
    );
  }
}
