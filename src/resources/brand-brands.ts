/**
 * Brand brands resource for managing brands in the Brand persona
 * Not scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  Brand,
  CreateBrandInput,
  UpdateBrandInput,
  ListBrandsParams,
  PaginatedApiResponse,
  ApiResponse,
} from '../types';

/**
 * Resource for managing brands (Brand persona)
 */
export class BrandBrandsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List all brands
   * @param params Pagination parameters
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

  /**
   * Get a brand by ID
   * @param id Brand ID
   * @returns Brand details
   */
  async get(id: string): Promise<ApiResponse<Brand>> {
    return this.adapter.request<ApiResponse<Brand>>('GET', `/brands/${validateResourceId(id)}`);
  }

  /**
   * Create a new brand
   * @param data Brand creation data
   * @returns Created brand
   */
  async create(data: CreateBrandInput): Promise<ApiResponse<Brand>> {
    return this.adapter.request<ApiResponse<Brand>>('POST', '/brands', data);
  }

  /**
   * Update an existing brand
   * @param id Brand ID
   * @param data Brand update data
   * @returns Updated brand
   */
  async update(id: string, data: UpdateBrandInput): Promise<ApiResponse<Brand>> {
    return this.adapter.request<ApiResponse<Brand>>(
      'PUT',
      `/brands/${validateResourceId(id)}`,
      data
    );
  }

  /**
   * Delete a brand
   * @param id Brand ID
   */
  async delete(id: string): Promise<void> {
    await this.adapter.request<void>('DELETE', `/brands/${validateResourceId(id)}`);
  }
}
