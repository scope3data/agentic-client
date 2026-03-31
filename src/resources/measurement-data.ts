/**
 * Measurement data resource for syncing advertiser measurement data
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';

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
  async sync(data: unknown): Promise<unknown> {
    return this.adapter.request(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/measurement-data/sync`,
      data
    );
  }
}
