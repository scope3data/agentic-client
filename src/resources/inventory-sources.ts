/**
 * Inventory Sources resource for managing storefront inventory sources
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  InventorySource,
  CreateInventorySourceInput,
  UpdateInventorySourceInput,
  ApiResponse,
} from '../types';

/**
 * Resource for managing inventory sources (Storefront persona)
 */
export class InventorySourcesResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List all inventory sources
   * @returns List of inventory sources
   */
  async list(): Promise<ApiResponse<InventorySource[]>> {
    return this.adapter.request<ApiResponse<InventorySource[]>>('GET', '/inventory-sources');
  }

  /**
   * Get an inventory source by ID
   * @param sourceId Inventory source ID
   * @returns Inventory source details
   */
  async get(sourceId: string): Promise<ApiResponse<InventorySource>> {
    return this.adapter.request<ApiResponse<InventorySource>>(
      'GET',
      `/inventory-sources/${validateResourceId(sourceId)}`
    );
  }

  /**
   * Create a new inventory source
   * @param data Inventory source creation data
   * @returns Created inventory source
   */
  async create(data: CreateInventorySourceInput): Promise<ApiResponse<InventorySource>> {
    return this.adapter.request<ApiResponse<InventorySource>>('POST', '/inventory-sources', data);
  }

  /**
   * Update an inventory source
   * @param sourceId Inventory source ID
   * @param data Update data
   * @returns Updated inventory source
   */
  async update(
    sourceId: string,
    data: UpdateInventorySourceInput
  ): Promise<ApiResponse<InventorySource>> {
    return this.adapter.request<ApiResponse<InventorySource>>(
      'PUT',
      `/inventory-sources/${validateResourceId(sourceId)}`,
      data
    );
  }

  /**
   * Delete an inventory source
   * @param sourceId Inventory source ID
   */
  async delete(sourceId: string): Promise<void> {
    await this.adapter.request<void>(
      'DELETE',
      `/inventory-sources/${validateResourceId(sourceId)}`
    );
  }
}
