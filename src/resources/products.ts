/**
 * Bundle Products resource for managing products within a bundle
 * Scoped to a specific bundle
 */

import type { BaseAdapter } from '../adapters/base';
import type {
  BundleProductsResponse,
  AddBundleProductsInput,
  RemoveBundleProductsInput,
  ApiResponse,
} from '../types';

/**
 * Resource for managing products within a bundle
 */
export class BundleProductsResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly bundleId: string
  ) {}

  /**
   * List all products in this bundle
   * @returns Bundle products response with product list and budget context
   */
  async list(): Promise<ApiResponse<BundleProductsResponse>> {
    return this.adapter.request<ApiResponse<BundleProductsResponse>>(
      'GET',
      `/bundles/${this.bundleId}/products`
    );
  }

  /**
   * Add products to this bundle
   * @param data Products to add with selection details
   * @returns Updated bundle products response
   */
  async add(data: AddBundleProductsInput): Promise<ApiResponse<BundleProductsResponse>> {
    return this.adapter.request<ApiResponse<BundleProductsResponse>>(
      'POST',
      `/bundles/${this.bundleId}/products`,
      data
    );
  }

  /**
   * Remove products from this bundle
   * @param data Product IDs to remove
   */
  async remove(data: RemoveBundleProductsInput): Promise<void> {
    await this.adapter.request<void>('DELETE', `/bundles/${this.bundleId}/products`, data);
  }
}
