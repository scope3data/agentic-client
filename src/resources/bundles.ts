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
import { discoverySchemas } from '../schemas/registry';
import {
  shouldValidateInput,
  shouldValidateResponse,
  validateInput,
  validateResponse,
} from '../validation';
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
    if (shouldValidateInput(this.adapter.validate)) {
      validateInput(discoverySchemas.discoverInput, data);
    }
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
    const result = await this.adapter.request<ApiResponse<DiscoverProductsResponse>>(
      'GET',
      `/bundles/${validateResourceId(bundleId)}/discover-products`,
      undefined,
      {
        params: {
          groupLimit: params?.groupLimit,
          groupOffset: params?.groupOffset,
          productsPerGroup: params?.productsPerGroup,
          productOffset: params?.productOffset,
          publisherDomain: params?.publisherDomain,
          salesAgentIds: params?.salesAgentIds,
          salesAgentNames: params?.salesAgentNames,
        },
      }
    );
    if (shouldValidateResponse(this.adapter.validate)) {
      validateResponse(discoverySchemas.discoverResponse, result.data);
    }
    return result;
  }

  /**
   * Browse products without an existing bundle (auto-creates bundle)
   * @param data Browse criteria including advertiser, channels, and filters
   * @returns Discovered product groups with auto-created bundleId
   */
  async browseProducts(data: BrowseProductsInput): Promise<ApiResponse<DiscoverProductsResponse>> {
    if (shouldValidateInput(this.adapter.validate)) {
      validateInput(discoverySchemas.discoverInput, data);
    }
    const result = await this.adapter.request<ApiResponse<DiscoverProductsResponse>>(
      'POST',
      '/bundles/discover-products',
      data
    );
    if (shouldValidateResponse(this.adapter.validate)) {
      validateResponse(discoverySchemas.discoverResponse, result.data);
    }
    return result;
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
