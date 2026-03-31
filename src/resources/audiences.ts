/**
 * Audiences resource for managing advertiser audiences
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type { ApiResponse, Audience, AudienceSync } from '../types';

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
  async sync(data: AudienceSync): Promise<ApiResponse<void>> {
    return this.adapter.request<ApiResponse<void>>(
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
  async list(params?: { take?: number; skip?: number }): Promise<ApiResponse<Audience[]>> {
    return this.adapter.request<ApiResponse<Audience[]>>(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/audiences`,
      undefined,
      {
        params: { take: params?.take, skip: params?.skip },
      }
    );
  }
}
