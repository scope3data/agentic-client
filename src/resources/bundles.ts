/**
 * Bundles resource for creating and managing media bundles
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  Bundle,
  CreateBundleInput,
  DiscoverProductsParams,
  DiscoverProductsResponse,
  BrowseProductsInput,
  ApiResponse,
} from '../types';
import { BundleProductsResource } from './products';

/**
 * Resource for managing bundles (Buyer persona)
 */
export class BundlesResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Create a new bundle
   * @param data Bundle creation data
   * @returns Created bundle with bundleId
   */
  async create(data: CreateBundleInput): Promise<ApiResponse<Bundle>> {
    return this.adapter.request<ApiResponse<Bundle>>('POST', '/bundles', data);
  }

  /**
   * Discover products available for a bundle
   * @param bundleId Bundle ID
   * @param params Query parameters for pagination and filtering
   * @returns Discovered product groups with budget context
   */
  async discoverProducts(
    bundleId: string,
    params?: DiscoverProductsParams
  ): Promise<ApiResponse<DiscoverProductsResponse>> {
    return this.adapter.request<ApiResponse<DiscoverProductsResponse>>(
      'GET',
      `/bundles/${validateResourceId(bundleId)}/discover-products`,
      undefined,
      {
        params: {
          groupLimit: params?.groupLimit,
          groupOffset: params?.groupOffset,
          productsPerGroup: params?.productsPerGroup,
          publisherDomain: params?.publisherDomain,
        },
      }
    );
  }

  /**
   * Browse products without an existing bundle
   * @param data Browse criteria including advertiser, channels, and filters
   * @returns Discovered product groups
   */
  async browseProducts(data: BrowseProductsInput): Promise<ApiResponse<DiscoverProductsResponse>> {
    return this.adapter.request<ApiResponse<DiscoverProductsResponse>>(
      'POST',
      '/bundles/discover-products',
      data
    );
  }

  /**
   * Get the products resource for a specific bundle
   * @param bundleId Bundle ID
   * @returns BundleProductsResource scoped to the bundle
   */
  products(bundleId: string): BundleProductsResource {
    return new BundleProductsResource(this.adapter, validateResourceId(bundleId));
  }
}
