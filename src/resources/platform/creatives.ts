import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class CreativesResource {
  constructor(private client: Scope3Client) {}

  /**
   * Assign creative
   * Assign a creative to a tactic or media buy.
   */
  async assign(params: operations['creative_assign']['requestBody']['content']['application/json']): Promise<operations['creative_assign']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('creative_assign', params);
  }

  /**
   * Create creative
   * Create a new creative with assets, copy, and targeting specifications.
   */
  async create(params: operations['creative_create']['requestBody']['content']['application/json']): Promise<operations['creative_create']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('creative_create', params);
  }

  /**
   * Update creative
   * Update an existing creative with new assets, copy, or specifications.
   */
  async update(params: operations['creative_update']['requestBody']['content']['application/json']): Promise<operations['creative_update']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('creative_update', params);
  }

  /**
   * Delete creative
   * Delete a creative and remove it from any associated tactics or media buys.
   */
  async delete(params: operations['creative_delete']['requestBody']['content']['application/json']): Promise<operations['creative_delete']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('creative_delete', params);
  }

  /**
   * Get creative
   * Get detailed information about a specific creative.
   */
  async get(params: operations['creative_get']['requestBody']['content']['application/json']): Promise<operations['creative_get']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('creative_get', params);
  }

  /**
   * List creatives
   * List all creatives with optional filtering by brand agent or campaign.
   */
  async list(params: operations['creative_list']['requestBody']['content']['application/json']): Promise<operations['creative_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('creative_list', params);
  }

}
