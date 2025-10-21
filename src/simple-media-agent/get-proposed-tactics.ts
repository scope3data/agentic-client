import type { Scope3AgenticClient } from '../sdk';
import type { ProposedTactic } from './types';

export async function getProposedTactics(
  scope3: Scope3AgenticClient,
  args: {
    campaignId: string;
    budgetRange?: { min: number; max: number; currency: string };
    seatId: string;
  }
): Promise<{ proposedTactics: ProposedTactic[] }> {
  const { campaignId, budgetRange } = args;

  // Get all registered sales agents
  const salesAgentsResponse = await scope3.salesAgents.list();
  const salesAgents = salesAgentsResponse.data || [];

  if (!Array.isArray(salesAgents)) {
    throw new Error('Expected salesAgents to be an array');
  }

  // Call getProducts for each sales agent
  const allProducts: Array<{
    id: string;
    salesAgentId: string;
    floorPrice?: number;
    recommendedPrice?: number;
    name?: string;
  }> = [];

  for (const agent of salesAgents) {
    try {
      const productsResponse = await scope3.products.discover({
        salesAgentId: agent.id,
      });

      const products = productsResponse.data;
      if (!Array.isArray(products)) continue;

      const mappedProducts = products.map((p) => ({
        id: p.id,
        salesAgentId: agent.id,
        floorPrice: p.floorPrice,
        recommendedPrice: p.recommendedPrice,
        name: p.name,
      }));

      allProducts.push(...mappedProducts);
    } catch (error) {
      console.error(`Error fetching products from agent ${agent.id}:`, error);
    }
  }

  // Sort by floor price (cheapest first)
  allProducts.sort((a, b) => (a.floorPrice || 0) - (b.floorPrice || 0));

  // Calculate average floor price for proposal
  const avgFloorPrice =
    allProducts.length > 0
      ? allProducts.reduce((sum, p) => sum + (p.floorPrice || 0), 0) / allProducts.length
      : 0;

  return {
    proposedTactics: [
      {
        tacticId: `simple-passthrough-${campaignId}`,
        execution: `Passthrough strategy: distribute budget across ${allProducts.length} products based on floor prices with 40% overallocation.`,
        budgetCapacity: budgetRange?.max || 0,
        pricing: {
          method: 'passthrough',
          estimatedCpm: avgFloorPrice,
          currency: 'USD',
        },
        sku: 'simple-passthrough',
      },
    ],
  };
}
