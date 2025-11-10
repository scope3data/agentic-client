import { Scope3Client } from '../../client';
import type { operations } from '../../types/partner-api';

export class AgentsResource {
  constructor(private client: Scope3Client) {}

  /**
   * Get agent
   * Get detailed information about a specific agent (SALES or OUTCOME type). Type is automatically inferred from the agent ID.
   */
  async get(
    params: operations['agent_get']['requestBody']['content']['application/json']
  ): Promise<operations['agent_get']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('agent_get', params);
  }

  /**
   * List agents
   * List all registered agents with comprehensive filtering. Supports filtering by type (SALES/OUTCOME), status, organization, relationship (SELF/SCOPE3/MARKETPLACE), and name.
   */
  async list(
    params: operations['agent_list']['requestBody']['content']['application/json']
  ): Promise<operations['agent_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('agent_list', params);
  }

  /**
   * Register agent
   * Register a new agent for media buying (SALES type) or outcome optimization (OUTCOME type).
   */
  async register(
    params: operations['agent_register']['requestBody']['content']['application/json']
  ): Promise<operations['agent_register']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('agent_register', params);
  }

  /**
   * Unregister agent
   * Unregister an agent and disconnect it from the platform. Type is automatically inferred from the agent ID.
   */
  async unregister(
    params: operations['agent_unregister']['requestBody']['content']['application/json']
  ): Promise<operations['agent_unregister']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('agent_unregister', params);
  }

  /**
   * Update agent
   * Update agent configuration and credentials. Type is automatically inferred from the agent ID.
   */
  async update(
    params: operations['agent_update']['requestBody']['content']['application/json']
  ): Promise<operations['agent_update']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('agent_update', params);
  }
}
