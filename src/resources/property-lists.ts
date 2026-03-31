/**
 * Property lists resource for managing advertiser property lists
 * Scoped to a specific advertiser, with top-level check endpoints
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';

/**
 * Resource for managing property lists (scoped to an advertiser)
 */
export class PropertyListsResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * Create a new property list
   * @param data Property list creation data
   * @returns Created property list
   */
  async create(data: unknown): Promise<unknown> {
    return this.adapter.request(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/property-lists`,
      data
    );
  }

  /**
   * List property lists for this advertiser
   * @param params Optional filter parameters
   * @returns List of property lists
   */
  async list(params?: { purpose?: string }): Promise<unknown> {
    return this.adapter.request(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/property-lists`,
      undefined,
      {
        params: { purpose: params?.purpose },
      }
    );
  }

  /**
   * Get a property list by ID
   * @param listId Property list ID
   * @returns Property list details
   */
  async get(listId: string): Promise<unknown> {
    return this.adapter.request(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/property-lists/${validateResourceId(listId)}`
    );
  }

  /**
   * Update an existing property list
   * @param listId Property list ID
   * @param data Update data
   * @returns Updated property list
   */
  async update(listId: string, data: unknown): Promise<unknown> {
    return this.adapter.request(
      'PUT',
      `/advertisers/${validateResourceId(this.advertiserId)}/property-lists/${validateResourceId(listId)}`,
      data
    );
  }

  /**
   * Delete a property list
   * @param listId Property list ID
   */
  async delete(listId: string): Promise<void> {
    await this.adapter.request(
      'DELETE',
      `/advertisers/${validateResourceId(this.advertiserId)}/property-lists/${validateResourceId(listId)}`
    );
  }
}

/**
 * Resource for property list check operations (top-level, not scoped to an advertiser)
 */
export class PropertyListChecksResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Check domains against property lists
   * @param data Domains to check
   * @returns Check result
   */
  async check(data: { domains: string[] }): Promise<unknown> {
    return this.adapter.request('POST', '/property-lists/check', data);
  }

  /**
   * Get a property list check report
   * @param reportId Report ID
   * @returns Check report details
   */
  async getReport(reportId: string): Promise<unknown> {
    return this.adapter.request('GET', `/property-lists/reports/${validateResourceId(reportId)}`);
  }
}
