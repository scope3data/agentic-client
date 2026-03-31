/**
 * Creatives resource for managing campaign creatives
 * Scoped to a specific campaign
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';

/**
 * Resource for managing creatives (scoped to a campaign)
 */
export class CreativesResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly campaignId: string
  ) {}

  /**
   * List creatives for this campaign
   * @param params Optional filter and pagination parameters
   * @returns List of creatives
   */
  async list(params?: {
    quality?: string;
    search?: string;
    take?: number;
    skip?: number;
  }): Promise<unknown> {
    return this.adapter.request(
      'GET',
      `/campaigns/${validateResourceId(this.campaignId)}/creatives`,
      undefined,
      {
        params: {
          quality: params?.quality,
          search: params?.search,
          take: params?.take,
          skip: params?.skip,
        },
      }
    );
  }

  /**
   * Get a creative by ID
   * @param creativeId Creative ID
   * @param preview Whether to include preview data
   * @returns Creative details
   */
  async get(creativeId: string, preview?: boolean): Promise<unknown> {
    return this.adapter.request(
      'GET',
      `/campaigns/${validateResourceId(this.campaignId)}/creatives/${validateResourceId(creativeId)}`,
      undefined,
      {
        params: preview ? { preview: true } : undefined,
      }
    );
  }

  /**
   * Update creative metadata
   * @param creativeId Creative ID
   * @param data Update data
   * @returns Updated creative
   */
  async update(creativeId: string, data: unknown): Promise<unknown> {
    return this.adapter.request(
      'PUT',
      `/campaigns/${validateResourceId(this.campaignId)}/creatives/${validateResourceId(creativeId)}`,
      data
    );
  }

  /**
   * Delete a creative
   * @param creativeId Creative ID
   */
  async delete(creativeId: string): Promise<void> {
    await this.adapter.request(
      'DELETE',
      `/campaigns/${validateResourceId(this.campaignId)}/creatives/${validateResourceId(creativeId)}`
    );
  }
}
