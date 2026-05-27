/**
 * Event sources resource for managing advertiser event sources
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type { ApiResponse, EventSource, LogEventInput } from '../types';

/**
 * Resource for managing event sources (scoped to an advertiser)
 */
export class EventSourcesResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * List all event sources for this advertiser
   * @returns List of event sources
   */
  async list(): Promise<ApiResponse<EventSource[]>> {
    return this.adapter.request<ApiResponse<EventSource[]>>(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/event-sources`
    );
  }

  /**
   * Sync (bulk upsert) event sources for this advertiser
   * @param data Event sources sync payload
   * @returns Sync result
   */
  async sync(data: Record<string, unknown>): Promise<ApiResponse<EventSource[]>> {
    return this.adapter.request<ApiResponse<EventSource[]>>(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/event-sources/sync`,
      data
    );
  }

  /**
   * Get event summary for this advertiser
   * @returns Event summary
   */
  async getEventSummary(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/events/summary`
    );
  }

  /**
   * Log an event for this advertiser
   * @param data Event data to log
   * @returns Log result
   */
  async logEvent(data: LogEventInput): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/log-event`,
      data
    );
  }
}
