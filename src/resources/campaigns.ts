/**
 * Campaigns resource for managing advertising campaigns
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  Campaign,
  CreateDiscoveryCampaignInput,
  UpdateDiscoveryCampaignInput,
  CreatePerformanceCampaignInput,
  UpdatePerformanceCampaignInput,
  CreateAudienceCampaignInput,
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
   * Create a discovery campaign
   * @param data Discovery campaign creation data
   * @returns Created campaign
   */
  async createDiscovery(data: CreateDiscoveryCampaignInput): Promise<ApiResponse<Campaign>> {
    const result = await this.adapter.request<ApiResponse<Campaign>>(
      'POST',
      '/campaigns/discovery',
      data
    );
    if (shouldValidateResponse(this.adapter.validate)) {
      result.data = validateResponse(campaignSchemas.response, result.data) as unknown as Campaign;
    }
    return result;
  }

  /**
   * Update an existing discovery campaign
   * @param id Campaign ID
   * @param data Discovery campaign update data
   * @returns Updated campaign
   */
  async updateDiscovery(
    id: string,
    data: UpdateDiscoveryCampaignInput
  ): Promise<ApiResponse<Campaign>> {
    const result = await this.adapter.request<ApiResponse<Campaign>>(
      'PUT',
      `/campaigns/discovery/${validateResourceId(id)}`,
      data
    );
    if (shouldValidateResponse(this.adapter.validate)) {
      result.data = validateResponse(campaignSchemas.response, result.data) as unknown as Campaign;
    }
    return result;
  }

  /**
   * Create a performance campaign
   * @param data Performance campaign creation data
   * @returns Created campaign
   */
  async createPerformance(data: CreatePerformanceCampaignInput): Promise<ApiResponse<Campaign>> {
    const result = await this.adapter.request<ApiResponse<Campaign>>(
      'POST',
      '/campaigns/performance',
      data
    );
    if (shouldValidateResponse(this.adapter.validate)) {
      result.data = validateResponse(campaignSchemas.response, result.data) as unknown as Campaign;
    }
    return result;
  }

  /**
   * Update an existing performance campaign
   * @param id Campaign ID
   * @param data Performance campaign update data
   * @returns Updated campaign
   */
  async updatePerformance(
    id: string,
    data: UpdatePerformanceCampaignInput
  ): Promise<ApiResponse<Campaign>> {
    const result = await this.adapter.request<ApiResponse<Campaign>>(
      'PUT',
      `/campaigns/performance/${validateResourceId(id)}`,
      data
    );
    if (shouldValidateResponse(this.adapter.validate)) {
      result.data = validateResponse(campaignSchemas.response, result.data) as unknown as Campaign;
    }
    return result;
  }

  /**
   * Create an audience campaign
   * @param data Audience campaign creation data
   * @returns Created campaign
   */
  async createAudience(data: CreateAudienceCampaignInput): Promise<ApiResponse<Campaign>> {
    const result = await this.adapter.request<ApiResponse<Campaign>>(
      'POST',
      '/campaigns/audience',
      data
    );
    if (shouldValidateResponse(this.adapter.validate)) {
      result.data = validateResponse(campaignSchemas.response, result.data) as unknown as Campaign;
    }
    return result;
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
