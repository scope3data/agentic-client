import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class BrandStandardsResource {
  constructor(private client: Scope3Client) {}

  /**
   * Create brand standards
   * Create brand standards including guidelines, tone of voice, visual requirements, and content rules for a brand agent.
   */
  async standardsCreate(params: operations['brand_standards_create']['requestBody']['content']['application/json']): Promise<operations['brand_standards_create']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('brand_standards_create', params);
  }

  /**
   * Delete brand standards
   * Delete brand standards for a brand agent.
   */
  async standardsDelete(params: operations['brand_standards_delete']['requestBody']['content']['application/json']): Promise<operations['brand_standards_delete']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('brand_standards_delete', params);
  }

  /**
   * List brand standards
   * List all brand standards with optional filtering by brand agent.
   */
  async standardsList(params: operations['brand_standards_list']['requestBody']['content']['application/json']): Promise<operations['brand_standards_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('brand_standards_list', params);
  }

}
