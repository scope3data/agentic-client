/**
 * Catalogs resource for managing advertiser catalogs
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type { ApiResponse, Catalog, CatalogSync } from '../types';

/**
 * Resource for managing catalogs (scoped to an advertiser)
 */
export class CatalogsResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * Sync catalogs for this advertiser
   * @param data Catalogs sync payload
   * @returns Sync result
   */
  async sync(data: CatalogSync): Promise<ApiResponse<void>> {
    return this.adapter.request<ApiResponse<void>>(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/catalogs/sync`,
      data
    );
  }

  /**
   * List catalogs for this advertiser
   * @param params Optional filter and pagination parameters
   * @returns List of catalogs
   */
  async list(params?: {
    type?: string;
    take?: number;
    skip?: number;
  }): Promise<ApiResponse<Catalog[]>> {
    return this.adapter.request<ApiResponse<Catalog[]>>(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/catalogs`,
      undefined,
      {
        params: { type: params?.type, take: params?.take, skip: params?.skip },
      }
    );
  }
}
