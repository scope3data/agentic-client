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
import { StorefrontTracesResource } from './storefront-traces';
import { StorefrontEvalsResource } from './storefront-evals';

export class StorefrontAgentsResource {
  private readonly _evals: StorefrontEvalsResource;

  constructor(private readonly adapter: BaseAdapter) {
    this._evals = new StorefrontEvalsResource(adapter);
  }

  // ── Agent CRUD ────────────────────────────────────────────────────

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

  // ── Product templates ─────────────────────────────────────────────

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

  // ── Sub-resource factories ────────────────────────────────────────

  tasks(agentId: string): StorefrontTasksResource {
    return new StorefrontTasksResource(this.adapter, agentId);
  }

  traces(agentId: string): StorefrontTracesResource {
    return new StorefrontTracesResource(this.adapter, agentId);
  }

  get evals(): StorefrontEvalsResource {
    return this._evals;
  }

  // ── Configuration ─────────────────────────────────────────────────

  async getCapabilities(id: string): Promise<unknown> {
    return this.adapter.request<unknown>('GET', `/agents/${validateResourceId(id)}/capabilities`);
  }

  async setCapabilities(
    id: string,
    capabilities: Record<string, { mode: string }>
  ): Promise<unknown> {
    return this.adapter.request<unknown>('PUT', `/agents/${validateResourceId(id)}/capabilities`, {
      capabilities,
    });
  }

  async setNotifications(
    id: string,
    channels: { type: string; destination: string }[]
  ): Promise<unknown> {
    return this.adapter.request<unknown>('PUT', `/agents/${validateResourceId(id)}/notifications`, {
      channels,
    });
  }

  async getLlmProvider(id: string): Promise<unknown> {
    return this.adapter.request<unknown>('GET', `/agents/${validateResourceId(id)}/llm-provider`);
  }

  async setLlmProvider(
    id: string,
    data: { provider: string; model_id?: string; api_key?: string }
  ): Promise<unknown> {
    return this.adapter.request<unknown>(
      'PUT',
      `/agents/${validateResourceId(id)}/llm-provider`,
      data
    );
  }

  async getInboundFilters(id: string): Promise<unknown> {
    return this.adapter.request<unknown>(
      'GET',
      `/agents/${validateResourceId(id)}/inbound-filters`
    );
  }

  async setInboundFilters(id: string, filters: unknown[]): Promise<unknown> {
    return this.adapter.request<unknown>(
      'PUT',
      `/agents/${validateResourceId(id)}/inbound-filters`,
      { filters }
    );
  }

  // ── Storefront sources ────────────────────────────────────────────

  async getInventorySources(id: string): Promise<unknown> {
    return this.adapter.request<unknown>(
      'GET',
      `/agents/${validateResourceId(id)}/inventory-sources`
    );
  }

  async setInventorySources(id: string, inventorySources: unknown[]): Promise<unknown> {
    return this.adapter.request<unknown>(
      'PUT',
      `/agents/${validateResourceId(id)}/inventory-sources`,
      { inventorySources }
    );
  }

  async getAudienceSources(id: string): Promise<unknown> {
    return this.adapter.request<unknown>(
      'GET',
      `/agents/${validateResourceId(id)}/audience-sources`
    );
  }

  async setAudienceSources(id: string, audienceSources: unknown[]): Promise<unknown> {
    return this.adapter.request<unknown>(
      'PUT',
      `/agents/${validateResourceId(id)}/audience-sources`,
      { audienceSources }
    );
  }

  async getAccountSources(id: string): Promise<unknown> {
    return this.adapter.request<unknown>(
      'GET',
      `/agents/${validateResourceId(id)}/account-sources`
    );
  }

  async setAccountSources(id: string, accountSources: unknown[]): Promise<unknown> {
    return this.adapter.request<unknown>(
      'PUT',
      `/agents/${validateResourceId(id)}/account-sources`,
      { accountSources }
    );
  }

  async getRateCards(id: string): Promise<unknown> {
    return this.adapter.request<unknown>('GET', `/agents/${validateResourceId(id)}/rate-cards`);
  }

  async setRateCards(id: string, rateCards: unknown[]): Promise<unknown> {
    return this.adapter.request<unknown>('PUT', `/agents/${validateResourceId(id)}/rate-cards`, {
      rateCards,
    });
  }

  // ── Policy and audit ──────────────────────────────────────────────

  async synthesizePolicy(id: string, apply = true): Promise<unknown> {
    return this.adapter.request<unknown>(
      'POST',
      `/agents/${validateResourceId(id)}/synthesize-policy`,
      { apply }
    );
  }

  async audit(id: string, limit?: number): Promise<unknown> {
    return this.adapter.request<unknown>(
      'GET',
      `/agents/${validateResourceId(id)}/config-changes`,
      undefined,
      { params: { limit } }
    );
  }
}
