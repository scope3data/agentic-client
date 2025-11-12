import { Scope3Client } from '../../client';
import type { operations } from '../../types/partner-api';

export class MediaProductsResource {
  constructor(private client: Scope3Client) {}

  /**
   * Discover media products
   * Discover available media products from connected sales agents based on targeting criteria.
   */
  async discover(
    params: operations['media_product_discover']['requestBody']['content']['application/json']
  ): Promise<
    operations['media_product_discover']['responses'][200]['content']['application/json']
  > {
    return this.client['callTool']('media_product_discover', params);
  }

  /**
   * Save media product
   * Save a discovered media product for future use in media buys.
   */
  async save(
    params: operations['media_product_save']['requestBody']['content']['application/json']
  ): Promise<operations['media_product_save']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_product_save', params);
  }

  /**
   * List media products
   * List saved media products with optional filtering.
   */
  async list(
    params: operations['media_product_list']['requestBody']['content']['application/json']
  ): Promise<operations['media_product_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_product_list', params);
  }

  /**
   * Sync media products
   * Synchronize media product catalog from connected sales agents.
   */
  async sync(
    params: operations['media_product_sync']['requestBody']['content']['application/json']
  ): Promise<operations['media_product_sync']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_product_sync', params);
  }
}
