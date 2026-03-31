/**
 * Storefront resource for managing the storefront profile
 */

import { type BaseAdapter } from '../adapters/base';
import type {
  Storefront,
  CreateStorefrontInput,
  UpdateStorefrontInput,
  ApiResponse,
} from '../types';

/**
 * Resource for managing the storefront (Storefront persona)
 */
export class StorefrontResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Get the current storefront profile
   * @returns Storefront details
   */
  async get(): Promise<ApiResponse<Storefront>> {
    return this.adapter.request<ApiResponse<Storefront>>('GET', '');
  }

  /**
   * Create a new storefront
   * @param data Storefront creation data
   * @returns Created storefront
   */
  async create(data: CreateStorefrontInput): Promise<ApiResponse<Storefront>> {
    return this.adapter.request<ApiResponse<Storefront>>('POST', '', data);
  }

  /**
   * Update the storefront profile
   * @param data Update data
   * @returns Updated storefront
   */
  async update(data: UpdateStorefrontInput): Promise<ApiResponse<Storefront>> {
    return this.adapter.request<ApiResponse<Storefront>>('PUT', '', data);
  }

  /**
   * Delete the storefront
   */
  async delete(): Promise<void> {
    await this.adapter.request<void>('DELETE', '');
  }
}
