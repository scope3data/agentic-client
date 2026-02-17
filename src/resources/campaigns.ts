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
    return this.adapter.request<ApiResponse<Campaign>>(
      'GET',
      `/campaigns/${validateResourceId(id)}`
    );
  }

  /**
   * Create a discovery campaign
   * @param data Discovery campaign creation data
   * @returns Created campaign
   */
  async createDiscovery(data: CreateDiscoveryCampaignInput): Promise<ApiResponse<Campaign>> {
    return this.adapter.request<ApiResponse<Campaign>>('POST', '/campaigns/discovery', data);
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
    return this.adapter.request<ApiResponse<Campaign>>(
      'PUT',
      `/campaigns/discovery/${validateResourceId(id)}`,
      data
    );
  }

  /**
   * Create a performance campaign
   * @param data Performance campaign creation data
   * @returns Created campaign
   */
  async createPerformance(data: CreatePerformanceCampaignInput): Promise<ApiResponse<Campaign>> {
    return this.adapter.request<ApiResponse<Campaign>>('POST', '/campaigns/performance', data);
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
    return this.adapter.request<ApiResponse<Campaign>>(
      'PUT',
      `/campaigns/performance/${validateResourceId(id)}`,
      data
    );
  }

  /**
   * Create an audience campaign
   * @param data Audience campaign creation data
   * @returns Created campaign
   */
  async createAudience(data: CreateAudienceCampaignInput): Promise<ApiResponse<Campaign>> {
    return this.adapter.request<ApiResponse<Campaign>>('POST', '/campaigns/audience', data);
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
}
