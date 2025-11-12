import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class MediaBuysResource {
  constructor(private client: Scope3Client) {}

  /**
   * Get media buy
   * Get detailed information about a specific media buy.
   */
  async get(
    params: operations['media_buy_get']['requestBody']['content']['application/json']
  ): Promise<operations['media_buy_get']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_buy_get', params);
  }

  /**
   * List media buys
   * List all media buys with optional filtering by brand agent, campaign, or status.
   */
  async list(
    params: operations['media_buy_list']['requestBody']['content']['application/json']
  ): Promise<operations['media_buy_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_buy_list', params);
  }
}
