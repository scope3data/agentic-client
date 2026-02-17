/**
 * Partners resource for managing activation partnerships
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  Partner,
  CreatePartnerInput,
  UpdatePartnerInput,
  ListPartnersParams,
  ApiResponse,
} from '../types';

/**
 * Resource for managing partners (Partner persona)
 */
export class PartnersResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List all partners
   * @param params Filter and pagination parameters
   * @returns List of partners with pagination
   */
  async list(params?: ListPartnersParams): Promise<unknown> {
    return this.adapter.request<unknown>('GET', '/partners', undefined, {
      params: {
        status: params?.status,
        name: params?.name,
        take: params?.take,
        skip: params?.skip,
      },
    });
  }

  /**
   * Create a new partner
   * @param data Partner creation data
   * @returns Created partner
   */
  async create(data: CreatePartnerInput): Promise<ApiResponse<Partner>> {
    return this.adapter.request<ApiResponse<Partner>>('POST', '/partners', data);
  }

  /**
   * Update an existing partner
   * @param id Partner ID
   * @param data Update data
   * @returns Updated partner
   */
  async update(id: string, data: UpdatePartnerInput): Promise<ApiResponse<Partner>> {
    return this.adapter.request<ApiResponse<Partner>>(
      'PUT',
      `/partners/${validateResourceId(id)}`,
      data
    );
  }

  /**
   * Archive a partner
   * @param id Partner ID
   */
  async archive(id: string): Promise<void> {
    await this.adapter.request<void>('DELETE', `/partners/${validateResourceId(id)}`);
  }
}
