import { Scope3Client } from '../../client';
import type { operations } from '../../types/partner-api';

export class MediaBuysResource {
  constructor(private client: Scope3Client) {}

  /**
   * Create media buy
   * Create a new media buy with budget, targeting, and creative specifications.
   */
  async create(params: operations['media_buy_create']['requestBody']['content']['application/json']): Promise<operations['media_buy_create']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_buy_create', params);
  }

  /**
   * Update media buy
   * Update an existing media buy with new budget, targeting, or creative assignments.
   */
  async update(params: operations['media_buy_update']['requestBody']['content']['application/json']): Promise<operations['media_buy_update']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_buy_update', params);
  }

  /**
   * Delete media buy
   * Delete a media buy and cancel any active placements.
   */
  async delete(params: operations['media_buy_delete']['requestBody']['content']['application/json']): Promise<operations['media_buy_delete']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_buy_delete', params);
  }

  /**
   * Execute media buy
   * Execute a media buy, sending it to the configured sales agents for placement.
   */
  async execute(params: operations['media_buy_execute']['requestBody']['content']['application/json']): Promise<operations['media_buy_execute']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_buy_execute', params);
  }

  /**
   * Get media buy
   * Get detailed information about a specific media buy.
   */
  async get(params: operations['media_buy_get']['requestBody']['content']['application/json']): Promise<operations['media_buy_get']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_buy_get', params);
  }

  /**
   * List media buys
   * List all media buys with optional filtering by brand agent, campaign, or status.
   */
  async list(params: operations['media_buy_list']['requestBody']['content']['application/json']): Promise<operations['media_buy_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_buy_list', params);
  }

  /**
   * Validate media buy budget
   * Validate a media buy budget against campaign constraints and available funds.
   */
  async validateBudget(params: operations['media_buy_validate_budget']['requestBody']['content']['application/json']): Promise<operations['media_buy_validate_budget']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('media_buy_validate_budget', params);
  }

}
