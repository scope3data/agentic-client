import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class TacticsResource {
  constructor(private client: Scope3Client) {}

  /**
   * Get tactic
   * Get detailed information about a specific tactic.
   */
  async get(
    params: operations['tactic_get']['requestBody']['content']['application/json']
  ): Promise<operations['tactic_get']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('tactic_get', params);
  }

  /**
   * List tactics
   * List all tactics with optional filtering by brand agent or campaign.
   */
  async list(
    params: operations['tactic_list']['requestBody']['content']['application/json']
  ): Promise<operations['tactic_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('tactic_list', params);
  }
}
