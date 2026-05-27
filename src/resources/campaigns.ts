/**
 * Campaigns resource for managing advertising campaigns
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  ListCampaignsParams,
  PaginatedApiResponse,
  ApiResponse,
} from '../types';
import { campaignSchemas } from '../schemas/registry';
import { shouldValidateResponse, validateResponse } from '../validation';
import { CreativesResource } from './creatives';

/**
 * Resource for managing campaigns (Buyer persona)
 */
export class CampaignsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List all campaigns
   * @param params Pagination and filter parameters
   * @returns Paginated list of campaigns
   */
  async list(params?: ListCampaignsParams): Promise<PaginatedApiResponse<Campaign>> {
    return this.adapter.request<PaginatedApiResponse<Campaign>>('GET', '/campaigns', undefined, {
      params: {
        take: params?.take,
        skip: params?.skip,
        advertiserId: params?.advertiserId,
        type: params?.type,
        status: params?.status,
      },
    });
  }

  /**
   * Get a campaign by ID
   * @param id Campaign ID
   * @returns Campaign details
   */
  async get(id: string): Promise<ApiResponse<Campaign>> {
    const result = await this.adapter.request<ApiResponse<Campaign>>(
      'GET',
      `/campaigns/${validateResourceId(id)}`
    );
    if (shouldValidateResponse(this.adapter.validate)) {
      result.data = validateResponse(campaignSchemas.response, result.data) as unknown as Campaign;
    }
    return result;
  }

  /**
   * Create a campaign
   * @param data Campaign creation data
   * @returns Created campaign
   */
  async create(data: CreateCampaignInput): Promise<ApiResponse<Campaign>> {
    return this.adapter.request<ApiResponse<Campaign>>('POST', '/campaigns', data);
  }

  /**
   * Update an existing campaign
   * @param id Campaign ID
   * @param data Campaign update data
   * @returns Updated campaign
   */
  async update(id: string, data: UpdateCampaignInput): Promise<ApiResponse<Campaign>> {
    return this.adapter.request<ApiResponse<Campaign>>(
      'PUT',
      `/campaigns/${validateResourceId(id)}`,
      data
    );
  }

  /**
   * Delete a campaign
   * @param id Campaign ID
   */
  async delete(id: string): Promise<void> {
    await this.adapter.request<void>('DELETE', `/campaigns/${validateResourceId(id)}`);
  }

  /**
   * Auto-select products for a campaign
   * @param id Campaign ID
   * @param data Optional configuration for product selection
   * @returns Auto-selection result
   */
  async autoSelectProducts(
    id: string,
    data?: Record<string, unknown>
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'POST',
      `/campaigns/${validateResourceId(id)}/auto-select-products`,
      data
    );
  }

  /**
   * Get media buy status for a campaign
   * @param id Campaign ID
   * @returns Media buy status
   */
  async getMediaBuyStatus(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'GET',
      `/campaigns/${validateResourceId(id)}/media-buy-status`
    );
  }

  /**
   * Get products associated with a campaign
   * @param id Campaign ID
   * @returns Campaign products
   */
  async getProducts(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'GET',
      `/campaigns/${validateResourceId(id)}/products`
    );
  }

  /**
   * Execute a campaign (go live)
   * @param id Campaign ID
   * @returns Updated campaign
   */
  async execute(id: string): Promise<ApiResponse<Campaign>> {
    return this.adapter.request<ApiResponse<Campaign>>(
      'POST',
      `/campaigns/${validateResourceId(id)}/execute`
    );
  }

  /**
   * Pause an active campaign
   * @param id Campaign ID
   * @returns Updated campaign
   */
  async pause(id: string): Promise<ApiResponse<Campaign>> {
    return this.adapter.request<ApiResponse<Campaign>>(
      'POST',
      `/campaigns/${validateResourceId(id)}/pause`
    );
  }

  /**
   * Get the creatives resource for a specific campaign
   * @param campaignId Campaign ID
   * @returns CreativesResource scoped to the campaign
   */
  creatives(campaignId: string): CreativesResource {
    return new CreativesResource(this.adapter, validateResourceId(campaignId));
  }
}
