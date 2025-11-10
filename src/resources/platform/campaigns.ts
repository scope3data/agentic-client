import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class CampaignsResource {
  constructor(private client: Scope3Client) {}

  /**
   * List campaigns
   * List all campaigns with optional filtering by brand agent.
   */
  async list(
    params: operations['campaign_list']['requestBody']['content']['application/json']
  ): Promise<operations['campaign_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('campaign_list', params);
  }

  /**
   * Create campaign
   * Create a new campaign with natural language prompt. The backend will parse the prompt to extract targeting, budget, and creative requirements.
   */
  async create(
    params: operations['campaign_create']['requestBody']['content']['application/json']
  ): Promise<operations['campaign_create']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('campaign_create', params);
  }

  /**
   * Get campaign
   * Get detailed information about a specific campaign.
   */
  async get(
    params: operations['campaign_get']['requestBody']['content']['application/json']
  ): Promise<operations['campaign_get']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('campaign_get', params);
  }

  /**
   * Update campaign
   * Update an existing campaign with new information.
   */
  async update(
    params: operations['campaign_update']['requestBody']['content']['application/json']
  ): Promise<operations['campaign_update']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('campaign_update', params);
  }

  /**
   * Delete campaign
   * Delete a campaign and all associated resources.
   */
  async delete(
    params: operations['campaign_delete']['requestBody']['content']['application/json']
  ): Promise<operations['campaign_delete']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('campaign_delete', params);
  }

  /**
   * Get campaign summary
   * Get a high-level summary of a campaign including key metrics and status.
   */
  async getSummary(
    params: operations['campaign_get_summary']['requestBody']['content']['application/json']
  ): Promise<operations['campaign_get_summary']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('campaign_get_summary', params);
  }

  /**
   * List campaign tactics
   * List all tactics associated with a specific campaign.
   */
  async listTactics(
    params: operations['campaign_list_tactics']['requestBody']['content']['application/json']
  ): Promise<operations['campaign_list_tactics']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('campaign_list_tactics', params);
  }

  /**
   * Validate campaign brief
   * Validate a campaign brief to ensure it contains all necessary information for campaign creation.
   */
  async validateBrief(
    params: operations['campaign_validate_brief']['requestBody']['content']['application/json']
  ): Promise<
    operations['campaign_validate_brief']['responses'][200]['content']['application/json']
  > {
    return this.client['callTool']('campaign_validate_brief', params);
  }
}
