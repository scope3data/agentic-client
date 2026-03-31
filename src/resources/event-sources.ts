/**
 * Event sources resource for managing advertiser event sources
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';

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
  async sync(data: unknown): Promise<unknown> {
    return this.adapter.request(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/event-sources/sync`,
      data
    );
  }

  /**
   * List all event sources for this advertiser
   * @returns List of event sources
   */
  async list(): Promise<unknown> {
    return this.adapter.request(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/event-sources`
    );
  }

  /**
   * Create a new event source
   * @param data Event source creation data
   * @returns Created event source
   */
  async create(data: unknown): Promise<unknown> {
    return this.adapter.request(
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
  async get(id: string): Promise<unknown> {
    return this.adapter.request(
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
  async update(id: string, data: unknown): Promise<unknown> {
    return this.adapter.request(
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
    await this.adapter.request(
      'DELETE',
      `/advertisers/${validateResourceId(this.advertiserId)}/event-sources/${validateResourceId(id)}`
    );
  }
}
