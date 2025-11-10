import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class AgentsResource {
  constructor(private client: Scope3Client) {}

  /**
   * Get agent
   * Get detailed information about a specific agent (SALES or OUTCOME type). Type is automatically inferred from the agent ID.
   */
  async get(params: operations['agent_get']['requestBody']['content']['application/json']): Promise<operations['agent_get']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('agent_get', params);
  }

  /**
   * List agents
   * List all registered agents with comprehensive filtering. Supports filtering by type (SALES/OUTCOME), status, organization, relationship (SELF/SCOPE3/MARKETPLACE), and name.
   */
  async list(params: operations['agent_list']['requestBody']['content']['application/json']): Promise<operations['agent_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('agent_list', params);
  }

}
