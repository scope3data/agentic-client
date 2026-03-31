/**
 * Catalogs resource for managing advertiser catalogs
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';

/**
 * Resource for managing catalogs (scoped to an advertiser)
 */
export class CatalogsResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * Sync catalogs for this advertiser
   * @param data Catalogs sync payload
   * @returns Sync result
   */
  async sync(data: unknown): Promise<unknown> {
    return this.adapter.request(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/catalogs/sync`,
      data
    );
  }

  /**
   * List catalogs for this advertiser
   * @param params Optional filter and pagination parameters
   * @returns List of catalogs
   */
  async list(params?: { type?: string; take?: number; skip?: number }): Promise<unknown> {
    return this.adapter.request(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/catalogs`,
      undefined,
      {
        params: { type: params?.type, take: params?.take, skip: params?.skip },
      }
    );
  }
}
