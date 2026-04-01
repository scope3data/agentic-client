/**
 * Measurement data resource for syncing advertiser measurement data
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type { ApiResponse, MeasurementDataSync } from '../types';

/**
 * Resource for managing measurement data (scoped to an advertiser)
 */
export class MeasurementDataResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * Sync measurement data for this advertiser
   * @param data Measurement data sync payload
   * @returns Sync result
   */
  async sync(data: MeasurementDataSync): Promise<ApiResponse<void>> {
    return this.adapter.request<ApiResponse<void>>(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/measurement-data/sync`,
      data
    );
  }
}
