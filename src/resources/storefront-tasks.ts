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
    private readonly agentId: string
  ) {}

  async list(params?: StorefrontTaskListParams): Promise<unknown> {
    return this.adapter.request<unknown>(
      'GET',
      `/agents/${validateResourceId(this.agentId)}/tasks`,
      undefined,
      {
        params: {
          status: params?.status,
          capability: params?.capability,
          limit: params?.limit,
        },
      }
    );
  }

  async get(taskId: string): Promise<StorefrontTask> {
    return this.adapter.request<StorefrontTask>('GET', `/tasks/${validateResourceId(taskId)}`);
  }

  async claim(taskId: string, data?: ClaimTaskInput): Promise<unknown> {
    return this.adapter.request<unknown>(
      'POST',
      `/tasks/${validateResourceId(taskId)}/claim`,
      data ?? {}
    );
  }

  async complete(taskId: string, data: CompleteTaskInput): Promise<unknown> {
    return this.adapter.request<unknown>(
      'POST',
      `/tasks/${validateResourceId(taskId)}/complete`,
      data
    );
  }
}
