import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class OutcomeAgentsResource {
  constructor(private client: Scope3Client) {}

  /**
   * Get proposals from outcome agents
   * Request tactical proposals from outcome agents for a campaign. Outcome agents analyze the campaign brief and budget to propose execution strategies.
   */
  async outcomesAgentGetProposals(
    params: operations['outcomes_agent_get_proposals']['requestBody']['content']['application/json']
  ): Promise<
    operations['outcomes_agent_get_proposals']['responses'][200]['content']['application/json']
  > {
    return this.client['callTool']('outcomes_agent_get_proposals', params);
  }

  /**
   * Accept outcome agent proposal
   * Accept a proposal from an outcome agent, creating a tactic and assigning it to the agent for management.
   */
  async outcomesAgentAcceptProposal(
    params: operations['outcomes_agent_accept_proposal']['requestBody']['content']['application/json']
  ): Promise<
    operations['outcomes_agent_accept_proposal']['responses'][200]['content']['application/json']
  > {
    return this.client['callTool']('outcomes_agent_accept_proposal', params);
  }

  /**
   * List tactics by outcome agent
   * List all tactics managed by a specific outcome agent.
   */
  async outcomesAgentListTactics(
    params: operations['outcomes_agent_list_tactics']['requestBody']['content']['application/json']
  ): Promise<
    operations['outcomes_agent_list_tactics']['responses'][200]['content']['application/json']
  > {
    return this.client['callTool']('outcomes_agent_list_tactics', params);
  }
}
