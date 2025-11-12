import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class MediaProductsResource {
  constructor(private client: Scope3Client) {}

  /**
   * List media products
   * List saved media products with optional filtering.
   */
  async list(
    params: operations['media_product_list']['requestBody']['content']['application/json']
  ): Promise<operations['media_product_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_product_list', params);
  }
}
