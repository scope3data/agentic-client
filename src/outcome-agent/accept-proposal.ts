import type { Scope3AgenticClient } from '../sdk';
import type { AcceptProposalRequest, AcceptProposalResponse } from './types';

/**
 * Handler for /accept-proposal endpoint
 * Called when a proposal is accepted by users and assigned to this agent
 *
 * Business Logic:
 * - Default to accepting all assignments (acknowledged: true)
 * - Log the assignment details for tracking
 * - Future: Could add validation logic to decline if unable to fulfill
 */
export async function acceptProposal(
  scope3: Scope3AgenticClient,
  request: AcceptProposalRequest
): Promise<AcceptProposalResponse> {
  // Note: Using console.error for logging because stdout is reserved for MCP protocol communication
  console.error('[accept-proposal] Received assignment:', {
    tacticId: request.tacticId,
    proposalId: request.proposalId,
    brandAgentId: request.brandAgentId,
    seatId: request.seatId,
    budget: request.campaignContext.budget,
    budgetCurrency: request.campaignContext.budgetCurrency,
    startDate: request.campaignContext.startDate,
    endDate: request.campaignContext.endDate,
    channel: request.campaignContext.channel,
    countries: request.campaignContext.countries,
    creativesCount: request.campaignContext.creatives?.length || 0,
    customFields: request.customFields,
  });

  // Basic validation: check if we have required information
  if (!request.tacticId || !request.campaignContext) {
    console.error('[accept-proposal] Missing required fields, declining assignment');
    return {
      acknowledged: false,
      reason: 'Missing required fields: tacticId or campaignContext',
    };
  }

  // Check if budget is reasonable (simple validation)
  if (request.campaignContext.budget <= 0) {
    console.error('[accept-proposal] Invalid budget, declining assignment');
    return {
      acknowledged: false,
      reason: 'Budget must be greater than 0',
    };
  }

  // Default: Accept the assignment
  console.error('[accept-proposal] Assignment accepted successfully');
  return {
    acknowledged: true,
  };
}
