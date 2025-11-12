import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class AssetsResource {
  constructor(private client: Scope3Client) {}

  /**
   * List assets
   * List all uploaded assets with optional filtering by brand agent.
   */
  async list(
    params: operations['asset_list']['requestBody']['content']['application/json']
  ): Promise<operations['asset_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('asset_list', params);
  }
}
