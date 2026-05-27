import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  DiscoverProductsInput,
  AddProductsInput,
  RemoveProductsInput,
  ApplyProposalInput,
  ApiResponse,
} from '../types';

/**
 * Resource for product discovery sessions
 */
export class DiscoveryResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Start a new product discovery session
   * @param data Discovery input parameters
   * @returns Discovery session with initial results
   */
  async discoverProducts(
    data: DiscoverProductsInput
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'POST',
      '/discovery/discover-products',
      data
    );
  }

  /**
   * Browse discovered products with pagination
   * @param discoveryId Discovery session ID
   * @param params Pagination parameters for groups and products
   * @returns Paginated product groups
   */
  async browseProducts(
    discoveryId: string,
    params?: {
      groupLimit?: number;
      groupOffset?: number;
      productsPerGroup?: number;
      productOffset?: number;
    }
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'GET',
      `/discovery/${validateResourceId(discoveryId)}/discover-products`,
      undefined,
      { params }
    );
  }

  /**
   * Get selected products for a discovery session
   * @param discoveryId Discovery session ID
   * @returns Selected products
   */
  async getProducts(discoveryId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'GET',
      `/discovery/${validateResourceId(discoveryId)}/products`
    );
  }

  /**
   * Add products to a discovery session
   * @param discoveryId Discovery session ID
   * @param data Products to add
   * @returns Updated product selection
   */
  async addProducts(
    discoveryId: string,
    data: AddProductsInput
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'POST',
      `/discovery/${validateResourceId(discoveryId)}/products`,
      data
    );
  }

  /**
   * Remove products from a discovery session
   * @param discoveryId Discovery session ID
   * @param data Products to remove
   * @returns Updated product selection
   */
  async removeProducts(
    discoveryId: string,
    data: RemoveProductsInput
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'DELETE',
      `/discovery/${validateResourceId(discoveryId)}/products`,
      data
    );
  }

  /**
   * Apply a proposal from a discovery session
   * @param discoveryId Discovery session ID
   * @param data Proposal application input
   * @returns Result of applying the proposal
   */
  async applyProposal(
    discoveryId: string,
    data: ApplyProposalInput
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'POST',
      `/discovery/${validateResourceId(discoveryId)}/apply-proposal`,
      data
    );
  }
}
