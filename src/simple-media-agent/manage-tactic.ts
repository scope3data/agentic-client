import type { Scope3AgenticClient } from '../sdk';
import type { MediaBuyAllocation } from './types';

function calculateBudgetAllocation(
  products: Array<{
    id: string;
    salesAgentId: string;
    floorPrice?: number;
  }>,
  totalBudget: number,
  minDailyBudget: number,
  overallocationPercent: number
): MediaBuyAllocation[] {
  if (products.length === 0) return [];

  // Apply overallocation to total budget
  // The SUM of all media buy budgets = totalBudget * (1 + overallocationPercent/100)
  const overallocationMultiplier = 1 + overallocationPercent / 100;
  const allocatedTotalBudget = totalBudget * overallocationMultiplier;

  // Calculate N = number of products where daily budget >= minDailyBudget
  const assumedDays = 30;
  const maxProducts = Math.floor(allocatedTotalBudget / assumedDays / minDailyBudget);
  const n = Math.min(maxProducts, products.length);

  if (n === 0) return [];

  // Take N cheapest products
  const selectedProducts = products.slice(0, n);

  // Divide overallocated budget equally
  // Each media buy gets: allocatedTotalBudget / N
  const budgetPerProduct = allocatedTotalBudget / n;

  return selectedProducts.map((product) => ({
    mediaProductId: product.id,
    salesAgentId: product.salesAgentId,
    budgetAmount: budgetPerProduct,
    budgetCurrency: 'USD',
    pricingCpm: product.floorPrice || 0,
  }));
}

export async function manageTactic(
  scope3: Scope3AgenticClient,
  minDailyBudget: number,
  overallocationPercent: number,
  tacticAllocations: Map<string, { allocations: MediaBuyAllocation[] }>,
  args: {
    tacticId: string;
    tacticContext: { budget?: number };
    brandAgentId: string;
    seatId: string;
  }
): Promise<{
  acknowledged: boolean;
  reason?: string;
}> {
  const { tacticId, tacticContext } = args;

  console.log(`Managing tactic ${tacticId}`);

  // Get all registered agents (SALES type)
  const agentsResponse = await scope3.agents.list({ type: 'SALES' });
  const agents = agentsResponse.data || [];

  if (!Array.isArray(agents)) {
    throw new Error('Expected agents to be an array');
  }

  // Get products from all agents
  const allProducts: Array<{
    id: string;
    salesAgentId: string;
    floorPrice?: number;
    recommendedPrice?: number;
    name?: string;
  }> = [];

  for (const agent of agents) {
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

  // Calculate budget allocation with overallocation
  const totalBudget = tacticContext.budget || 0;
  const allocations = calculateBudgetAllocation(
    allProducts,
    totalBudget,
    minDailyBudget,
    overallocationPercent
  );

  // Store tactic info for later reallocation
  tacticAllocations.set(tacticId, {
    allocations,
  });

  // Create media buys for each allocation
  for (const allocation of allocations) {
    try {
      await scope3.mediaBuys.create({
        tacticId,
        name: `Media Buy - ${allocation.mediaProductId}`,
        products: [allocation],
        budget: {
          amount: allocation.budgetAmount || 0,
          currency: allocation.budgetCurrency || 'USD',
        },
      });
    } catch (error) {
      console.error(`Error creating media buy for product ${allocation.mediaProductId}:`, error);
      // Return failure if we can't create media buys
      return {
        acknowledged: false,
        reason: `Failed to create media buy for product ${allocation.mediaProductId}`,
      };
    }
  }

  return {
    acknowledged: true,
  };
}
