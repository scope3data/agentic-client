import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class BrandAgentsResource {
  constructor(private client: Scope3Client) {}

  /**
   * List brand agents
   * List all brand agents (advertiser accounts) for the authenticated customer. Authentication is automatic - no parameters required.
   */
  async list(params: operations['brand_agent_list']['requestBody']['content']['application/json']): Promise<operations['brand_agent_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('brand_agent_list', params);
  }

  /**
   * Get brand agent
   * Get detailed information about a specific brand agent (advertiser account) by ID.
   */
  async get(params: operations['brand_agent_get']['requestBody']['content']['application/json']): Promise<operations['brand_agent_get']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('brand_agent_get', params);
  }

  /**
   * Create brand agent
   * Create a new brand agent (advertiser account). This creates the top-level container that will own campaigns, creatives, audiences, standards, and measurement sources.
   */
  async create(params: operations['brand_agent_create']['requestBody']['content']['application/json']): Promise<operations['brand_agent_create']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('brand_agent_create', params);
  }

  /**
   * Update brand agent
   * Update an existing brand agent with new information.
   */
  async update(params: operations['brand_agent_update']['requestBody']['content']['application/json']): Promise<operations['brand_agent_update']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('brand_agent_update', params);
  }

  /**
   * Delete brand agent
   * Delete a brand agent. This will also delete all associated campaigns, creatives, and other resources.
   */
  async delete(params: operations['brand_agent_delete']['requestBody']['content']['application/json']): Promise<operations['brand_agent_delete']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('brand_agent_delete', params);
  }

}
