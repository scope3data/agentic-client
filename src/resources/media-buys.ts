/**
 * Media buys resource for managing advertiser media buy orders
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type { MediaBuy, ListMediaBuysParams, PaginatedApiResponse, ApiResponse } from '../types';

/**
 * Resource for managing media buys (scoped to an advertiser)
 */
export class MediaBuysResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * List media buys for this advertiser
   * @param params Pagination and filter parameters
   * @returns Paginated list of media buys
   */
  async list(params?: ListMediaBuysParams): Promise<PaginatedApiResponse<MediaBuy>> {
    return this.adapter.request<PaginatedApiResponse<MediaBuy>>(
      'GET',
      `/advertisers/${this.advertiserId}/media-buys`,
      undefined,
      {
        params: {
          take: params?.take,
          skip: params?.skip,
          campaignId: params?.campaignId,
        },
      }
    );
  }

  /**
   * Get a media buy by ID
   * @param mediaBuyId Media buy ID
   * @returns Media buy details
   */
  async get(mediaBuyId: string): Promise<ApiResponse<MediaBuy>> {
    return this.adapter.request<ApiResponse<MediaBuy>>(
      'GET',
      `/advertisers/${this.advertiserId}/media-buys/${validateResourceId(mediaBuyId)}`
    );
  }
}
