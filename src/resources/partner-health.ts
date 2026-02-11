/**
 * Partner health resource for checking API health status
 * For the Partner persona
 */

import type { BaseAdapter } from '../adapters/base';
import type { HealthCheckResponse, ApiResponse } from '../types';

/**
 * Resource for checking API health (Partner persona)
 */
export class PartnerHealthResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Check the health of the API
   * @returns Health check response with status, version, and timestamp
   */
  async check(): Promise<ApiResponse<HealthCheckResponse>> {
    return this.adapter.request<ApiResponse<HealthCheckResponse>>('GET', '/health');
  }
}
