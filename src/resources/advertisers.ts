/**
 * Advertisers resource for managing advertiser accounts
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  Advertiser,
  CreateAdvertiserInput,
  UpdateAdvertiserInput,
  ListAdvertisersParams,
  PaginatedApiResponse,
  ApiResponse,
} from '../types';
import { BuyerLinkedBrandResource } from './brands';
import { ConversionEventsResource } from './conversion-events';
import { CreativeSetsResource } from './creative-sets';
import { TestCohortsResource } from './test-cohorts';
import { ReportingResource } from './reporting';
import { MediaBuysResource } from './media-buys';

/**
 * Resource for managing advertisers (Buyer persona)
 */
export class AdvertisersResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List all advertisers
   * @param params Pagination and filter parameters
   * @returns Paginated list of advertisers
   */
  async list(params?: ListAdvertisersParams): Promise<PaginatedApiResponse<Advertiser>> {
    return this.adapter.request<PaginatedApiResponse<Advertiser>>(
      'GET',
      '/advertisers',
      undefined,
      {
        params: {
          take: params?.take,
          skip: params?.skip,
          status: params?.status,
          name: params?.name,
        },
      }
    );
  }

  /**
   * Get an advertiser by ID
   * @param id Advertiser ID
   * @returns Advertiser details
   */
  async get(id: string): Promise<ApiResponse<Advertiser>> {
    return this.adapter.request<ApiResponse<Advertiser>>(
      'GET',
      `/advertisers/${validateResourceId(id)}`
    );
  }

  /**
   * Create a new advertiser
   * @param data Advertiser creation data
   * @returns Created advertiser
   */
  async create(data: CreateAdvertiserInput): Promise<ApiResponse<Advertiser>> {
    return this.adapter.request<ApiResponse<Advertiser>>('POST', '/advertisers', data);
  }

  /**
   * Update an existing advertiser
   * @param id Advertiser ID
   * @param data Update data
   * @returns Updated advertiser
   */
  async update(id: string, data: UpdateAdvertiserInput): Promise<ApiResponse<Advertiser>> {
    return this.adapter.request<ApiResponse<Advertiser>>(
      'PUT',
      `/advertisers/${validateResourceId(id)}`,
      data
    );
  }

  /**
   * Delete an advertiser
   * @param id Advertiser ID
   */
  async delete(id: string): Promise<void> {
    await this.adapter.request<void>('DELETE', `/advertisers/${validateResourceId(id)}`);
  }

  /**
   * Get the linked brand resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns BuyerLinkedBrandResource scoped to the advertiser
   */
  brand(advertiserId: string): BuyerLinkedBrandResource {
    return new BuyerLinkedBrandResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the conversion events resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns ConversionEventsResource scoped to the advertiser
   */
  conversionEvents(advertiserId: string): ConversionEventsResource {
    return new ConversionEventsResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the creative sets resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns CreativeSetsResource scoped to the advertiser
   */
  creativeSets(advertiserId: string): CreativeSetsResource {
    return new CreativeSetsResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the test cohorts resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns TestCohortsResource scoped to the advertiser
   */
  testCohorts(advertiserId: string): TestCohortsResource {
    return new TestCohortsResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the reporting resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns ReportingResource scoped to the advertiser
   */
  reporting(advertiserId: string): ReportingResource {
    return new ReportingResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the media buys resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns MediaBuysResource scoped to the advertiser
   */
  mediaBuys(advertiserId: string): MediaBuysResource {
    return new MediaBuysResource(this.adapter, validateResourceId(advertiserId));
  }
}
