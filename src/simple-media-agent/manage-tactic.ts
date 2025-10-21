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
    tacticContext: { budget?: { amount: number } };
    brandAgentId: string;
    seatId: string;
  }
): Promise<{
  acknowledged: boolean;
  mediaBuysCreated: number;
  allocations: Array<{
    productId: string;
    budget: number | undefined;
    cpm: number | undefined;
  }>;
}> {
  const { tacticId, tacticContext } = args;

  console.log(`Managing tactic ${tacticId}`);

  // Get all registered sales agents
  const salesAgentsResponse = await scope3.salesAgents.list();
  const salesAgents = salesAgentsResponse.data || [];

  if (!Array.isArray(salesAgents)) {
    throw new Error('Expected salesAgents to be an array');
  }

  // Get products from all sales agents
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

  // Calculate budget allocation with overallocation
  const totalBudget = tacticContext.budget?.amount || 0;
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
  const createdBuys = [];
  for (const allocation of allocations) {
    try {
      const result = await scope3.mediaBuys.create({
        tacticId,
        name: `Media Buy - ${allocation.mediaProductId}`,
        products: [allocation],
        budget: {
          amount: allocation.budgetAmount || 0,
          currency: allocation.budgetCurrency || 'USD',
        },
      });
      createdBuys.push(result.data);
    } catch (error) {
      console.error(`Error creating media buy for product ${allocation.mediaProductId}:`, error);
    }
  }

  return {
    acknowledged: true,
    mediaBuysCreated: createdBuys.length,
    allocations: allocations.map((a) => ({
      productId: a.mediaProductId || '',
      budget: a.budgetAmount,
      cpm: a.pricingCpm,
    })),
  };
}
