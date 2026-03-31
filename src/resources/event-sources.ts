/**
 * Event sources resource for managing advertiser event sources
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  ApiResponse,
  EventSource,
  CreateEventSourceInput,
  UpdateEventSourceInput,
} from '../types';

/**
 * Resource for managing event sources (scoped to an advertiser)
 */
export class EventSourcesResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

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
   * Create a new event source
   * @param data Event source creation data
   * @returns Created event source
   */
  async create(data: CreateEventSourceInput): Promise<ApiResponse<EventSource>> {
    return this.adapter.request<ApiResponse<EventSource>>(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/event-sources`,
      data
    );
  }

  /**
   * Get an event source by ID
   * @param id Event source ID
   * @returns Event source details
   */
  async get(id: string): Promise<ApiResponse<EventSource>> {
    return this.adapter.request<ApiResponse<EventSource>>(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/event-sources/${validateResourceId(id)}`
    );
  }

  /**
   * Update an existing event source
   * @param id Event source ID
   * @param data Update data
   * @returns Updated event source
   */
  async update(id: string, data: UpdateEventSourceInput): Promise<ApiResponse<EventSource>> {
    return this.adapter.request<ApiResponse<EventSource>>(
      'PUT',
      `/advertisers/${validateResourceId(this.advertiserId)}/event-sources/${validateResourceId(id)}`,
      data
    );
  }

  /**
   * Delete an event source
   * @param id Event source ID
   */
  async delete(id: string): Promise<void> {
    await this.adapter.request<void>(
      'DELETE',
      `/advertisers/${validateResourceId(this.advertiserId)}/event-sources/${validateResourceId(id)}`
    );
  }
}
