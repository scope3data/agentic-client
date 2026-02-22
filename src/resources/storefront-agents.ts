/**
 * Storefront agents resource for managing publisher agents
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  StorefrontAgent,
  CreateStorefrontAgentInput,
  UpdateStorefrontAgentInput,
  StorefrontUploadInput,
  StorefrontUploadResult,
} from '../types';
import { StorefrontTasksResource } from './storefront-tasks';

export class StorefrontAgentsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  async list(): Promise<unknown> {
    return this.adapter.request<unknown>('GET', '/agents');
  }

  async get(id: string): Promise<StorefrontAgent> {
    return this.adapter.request<StorefrontAgent>('GET', `/agents/${validateResourceId(id)}`);
  }

  async create(data: CreateStorefrontAgentInput): Promise<StorefrontAgent> {
    return this.adapter.request<StorefrontAgent>('POST', '/agents', data);
  }

  async update(id: string, data: UpdateStorefrontAgentInput): Promise<StorefrontAgent> {
    return this.adapter.request<StorefrontAgent>('PUT', `/agents/${validateResourceId(id)}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.adapter.request<void>('DELETE', `/agents/${validateResourceId(id)}`);
  }

  async upload(id: string, data: StorefrontUploadInput): Promise<StorefrontUploadResult> {
    return this.adapter.request<StorefrontUploadResult>(
      'POST',
      `/agents/${validateResourceId(id)}/upload`,
      data
    );
  }

  async fileUploads(id: string, limit?: number): Promise<unknown> {
    return this.adapter.request<unknown>(
      'GET',
      `/agents/${validateResourceId(id)}/file-uploads`,
      undefined,
      { params: { limit } }
    );
  }

  tasks(agentId: string): StorefrontTasksResource {
    return new StorefrontTasksResource(this.adapter, agentId);
  }
}
