/**
 * Syndication resource for managing advertiser content syndication
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';

/**
 * Resource for managing syndication (scoped to an advertiser)
 */
export class SyndicationResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * Syndicate a resource for this advertiser
   * @param data Syndication request payload
   * @returns Syndication result
   */
  async syndicate(data: unknown): Promise<unknown> {
    return this.adapter.request(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/syndicate`,
      data
    );
  }

  /**
   * Query syndication status for this advertiser
   * @param params Optional filter and pagination parameters
   * @returns Syndication status results
   */
  async status(params?: {
    resourceType?: string;
    resourceId?: string;
    adcpAgentId?: string;
    enabled?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<unknown> {
    return this.adapter.request(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/syndication-status`,
      undefined,
      {
        params: {
          resourceType: params?.resourceType,
          resourceId: params?.resourceId,
          adcpAgentId: params?.adcpAgentId,
          enabled: params?.enabled,
          status: params?.status,
          limit: params?.limit,
          offset: params?.offset,
        },
      }
    );
  }
}
