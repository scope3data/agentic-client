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
import { discoverySchemas } from '../schemas/registry';
import { shouldValidateInput, shouldValidateResponse, validateInput, validateResponse } from '../validation';

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
    const result = await this.adapter.request<ApiResponse<BundleProductsResponse>>(
      'GET',
      `/bundles/${this.bundleId}/products`
    );
    if (shouldValidateResponse(this.adapter.validate)) {
      validateResponse(discoverySchemas.sessionProductsResponse, result.data);
    }
    return result;
  }

  /**
   * Add products to this bundle
   * @param data Products to add with selection details
   * @returns Updated bundle products response
   */
  async add(data: AddBundleProductsInput): Promise<ApiResponse<BundleProductsResponse>> {
    if (shouldValidateInput(this.adapter.validate)) {
      validateInput(discoverySchemas.addProductsInput, data);
    }
    const result = await this.adapter.request<ApiResponse<BundleProductsResponse>>(
      'POST',
      `/bundles/${this.bundleId}/products`,
      data
    );
    if (shouldValidateResponse(this.adapter.validate)) {
      validateResponse(discoverySchemas.sessionProductsResponse, result.data);
    }
    return result;
  }

  /**
   * Remove products from this bundle
   * @param data Product IDs to remove
   */
  async remove(data: RemoveBundleProductsInput): Promise<void> {
    if (shouldValidateInput(this.adapter.validate)) {
      validateInput(discoverySchemas.removeProductsInput, data);
    }
    await this.adapter.request<void>('DELETE', `/bundles/${this.bundleId}/products`, data);
  }
}
