/**
 * Creatives resource for managing campaign creatives
 * Scoped to a specific campaign
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type { ApiResponse, Creative, UpdateCreativeInput } from '../types';

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
  }): Promise<ApiResponse<Creative[]>> {
    return this.adapter.request<ApiResponse<Creative[]>>(
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
  async get(creativeId: string, preview?: boolean): Promise<ApiResponse<Creative>> {
    return this.adapter.request<ApiResponse<Creative>>(
      'GET',
      `/campaigns/${validateResourceId(this.campaignId)}/creatives/${validateResourceId(creativeId)}`,
      undefined,
      {
        params: preview ? { preview: true } : undefined,
      }
    );
  }

  /**
   * Create a new creative for this campaign
   * @param data Creative creation data
   * @returns Created creative
   */
  async create(data: Record<string, unknown>): Promise<ApiResponse<Creative>> {
    return this.adapter.request<ApiResponse<Creative>>(
      'POST',
      `/campaigns/${validateResourceId(this.campaignId)}/creatives/create`,
      data
    );
  }

  /**
   * Update creative metadata
   * @param creativeId Creative ID
   * @param data Update data
   * @returns Updated creative
   */
  async update(creativeId: string, data: UpdateCreativeInput): Promise<ApiResponse<Creative>> {
    return this.adapter.request<ApiResponse<Creative>>(
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
    await this.adapter.request<void>(
      'DELETE',
      `/campaigns/${validateResourceId(this.campaignId)}/creatives/${validateResourceId(creativeId)}`
    );
  }

  /**
   * List creative manifests for this campaign
   * @returns Creative manifests
   */
  async listManifests(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>[]>>(
      'GET',
      `/campaigns/${validateResourceId(this.campaignId)}/creativeManifest`
    );
  }
}
