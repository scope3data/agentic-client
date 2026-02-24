/**
 * Storefront traces resource for decision trace management
 */

import type { BaseAdapter } from '../adapters/base';

export class StorefrontTracesResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly _agentId: string
  ) {}

  async list(params?: {
    capability?: string;
    trace_type?: string;
    min_confidence?: number;
    limit?: number;
  }): Promise<unknown> {
    return this.adapter.request<unknown>('GET', '/storefront/traces', undefined, {
      params: {
        capability: params?.capability,
        trace_type: params?.trace_type,
        min_confidence: params?.min_confidence,
        limit: params?.limit,
      },
    });
  }

  async add(data: {
    trace_type: string;
    capability: string;
    decision: Record<string, unknown>;
    reasoning?: string;
    valid_until?: string;
    brief_context?: Record<string, unknown>;
  }): Promise<unknown> {
    return this.adapter.request<unknown>('POST', '/storefront/traces', data);
  }
}
