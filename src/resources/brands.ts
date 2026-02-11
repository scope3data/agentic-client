/**
 * Brand resources for buyer persona
 *
 * BuyerBrandsResource - flat list of all brands available to the buyer
 * BuyerLinkedBrandResource - manage the brand linked to a specific advertiser
 */

import type { BaseAdapter } from '../adapters/base';
import type {
  Brand,
  ListBrandsParams,
  LinkedBrand,
  LinkBrandInput,
  PaginatedApiResponse,
  ApiResponse,
} from '../types';

/**
 * Resource for listing buyer brands (not scoped to an advertiser)
 */
export class BuyerBrandsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List all brands available to the buyer
   * @param params Pagination and filter parameters
   * @returns Paginated list of brands
   */
  async list(params?: ListBrandsParams): Promise<PaginatedApiResponse<Brand>> {
    return this.adapter.request<PaginatedApiResponse<Brand>>('GET', '/brands', undefined, {
      params: {
        take: params?.take,
        skip: params?.skip,
        status: params?.status,
        name: params?.name,
      },
    });
  }
}

/**
 * Resource for managing the brand linked to a specific advertiser
 */
export class BuyerLinkedBrandResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * Get the brand linked to this advertiser
   * @returns Linked brand details
   */
  async get(): Promise<ApiResponse<LinkedBrand>> {
    return this.adapter.request<ApiResponse<LinkedBrand>>(
      'GET',
      `/advertisers/${this.advertiserId}/brand`
    );
  }

  /**
   * Link a brand to this advertiser
   * @param data Brand link data containing brandId
   * @returns Linked brand details
   */
  async link(data: LinkBrandInput): Promise<ApiResponse<LinkedBrand>> {
    return this.adapter.request<ApiResponse<LinkedBrand>>(
      'PUT',
      `/advertisers/${this.advertiserId}/brand`,
      data
    );
  }

  /**
   * Unlink the brand from this advertiser
   */
  async unlink(): Promise<void> {
    await this.adapter.request<void>('DELETE', `/advertisers/${this.advertiserId}/brand`);
  }
}
