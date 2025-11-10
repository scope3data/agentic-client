import { Scope3Client } from '../../client';
import type { operations } from '../../types/partner-api';

export class TacticsResource {
  constructor(private client: Scope3Client) {}

  /**
   * Create tactic
   * Create a new tactic defining how to achieve campaign objectives.
   */
  async create(params: operations['tactic_create']['requestBody']['content']['application/json']): Promise<operations['tactic_create']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('tactic_create', params);
  }

  /**
   * Update tactic
   * Update an existing tactic with new targeting, budget, or creative requirements.
   */
  async update(params: operations['tactic_update']['requestBody']['content']['application/json']): Promise<operations['tactic_update']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('tactic_update', params);
  }

  /**
   * Delete tactic
   * Delete a tactic and all associated media buys.
   */
  async delete(params: operations['tactic_delete']['requestBody']['content']['application/json']): Promise<operations['tactic_delete']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('tactic_delete', params);
  }

  /**
   * Get tactic
   * Get detailed information about a specific tactic.
   */
  async get(params: operations['tactic_get']['requestBody']['content']['application/json']): Promise<operations['tactic_get']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('tactic_get', params);
  }

  /**
   * List tactics
   * List all tactics with optional filtering by brand agent or campaign.
   */
  async list(params: operations['tactic_list']['requestBody']['content']['application/json']): Promise<operations['tactic_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('tactic_list', params);
  }

  /**
   * Link tactic to campaign
   * Link a tactic to a campaign.
   */
  async linkCampaign(params: operations['tactic_link_campaign']['requestBody']['content']['application/json']): Promise<operations['tactic_link_campaign']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('tactic_link_campaign', params);
  }

  /**
   * Unlink tactic from campaign
   * Unlink a tactic from a campaign.
   */
  async unlinkCampaign(params: operations['tactic_unlink_campaign']['requestBody']['content']['application/json']): Promise<operations['tactic_unlink_campaign']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('tactic_unlink_campaign', params);
  }

}
