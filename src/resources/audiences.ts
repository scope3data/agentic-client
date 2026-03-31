/**
 * Audiences resource for managing advertiser audiences
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';

/**
 * Resource for managing audiences (scoped to an advertiser)
 */
export class AudiencesResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * Sync audiences for this advertiser
   * @param data Audiences sync payload
   * @returns Sync result
   */
  async sync(data: unknown): Promise<unknown> {
    return this.adapter.request(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/audiences/sync`,
      data
    );
  }

  /**
   * List audiences for this advertiser
   * @param params Optional pagination parameters
   * @returns List of audiences
   */
  async list(params?: { take?: number; skip?: number }): Promise<unknown> {
    return this.adapter.request(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/audiences`,
      undefined,
      {
        params: { take: params?.take, skip: params?.skip },
      }
    );
  }
}
