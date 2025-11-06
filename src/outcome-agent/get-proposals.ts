import type { Scope3AgenticClient } from '../sdk';
import type { GetProposalsRequest, GetProposalsResponse, Proposal, Product } from './types';

/**
 * Handler for /get-proposals endpoint
 * Called when campaigns are created to get proposal recommendations from the outcome agent
 *
 * Business Logic:
 * 1. Receive products from the request (from sales agents)
 * 2. Filter products that fit our criteria (budget, channels, countries)
 * 3. Generate proposals with budget optimization strategy
 * 4. Use revshare pricing model (default 15%)
 */
export async function getProposals(
  scope3: Scope3AgenticClient,
  request: GetProposalsRequest
): Promise<GetProposalsResponse> {
  // Note: Using console.error for logging because stdout is reserved for MCP protocol communication
  console.error('[get-proposals] Received request:', {
    campaignId: request.campaignId,
    seatId: request.seatId,
    budgetRange: request.budgetRange,
    channels: request.channels,
    countries: request.countries,
    productsCount: request.products?.length || 0,
  });

  // TEMPORARY: For now, returning empty proposals if no products provided.
  // TODO: In the future, this will be a "simple mirror agent" that can discover
  // products from sales agents directly, rather than requiring them in the request.
  if (!request.products || request.products.length === 0) {
    console.error('[get-proposals] No products provided, returning empty proposals');
    return { proposals: [] };
  }

  // Filter products based on campaign criteria
  const eligibleProducts = filterProducts(request.products, request);

  if (eligibleProducts.length === 0) {
    console.error('[get-proposals] No eligible products found after filtering');
    return { proposals: [] };
  }

  // Generate proposals using simple budget optimization
  const proposals = generateProposals(eligibleProducts, request);

  console.error(`[get-proposals] Generated ${proposals.length} proposals`);

  return { proposals };
}

/**
 * Filter products based on campaign requirements
 */
function filterProducts(products: Product[], request: GetProposalsRequest): Product[] {
  return products.filter((product) => {
    // Filter by channels if specified
    if (request.channels && request.channels.length > 0) {
      const productChannels = product.targeting?.channels || [];
      const hasMatchingChannel = request.channels.some((channel) =>
        productChannels.includes(channel)
      );
      if (!hasMatchingChannel && productChannels.length > 0) {
        return false;
      }
    }

    // Filter by countries if specified
    if (request.countries && request.countries.length > 0) {
      const productCountries = product.targeting?.countries || [];
      const hasMatchingCountry = request.countries.some((country) =>
        productCountries.includes(country)
      );
      if (!hasMatchingCountry && productCountries.length > 0) {
        return false;
      }
    }

    // Filter by budget (basic check - floor price should be reasonable)
    if (request.budgetRange?.max && product.floor_price) {
      // Simple heuristic: floor price shouldn't be more than 10% of max budget
      const maxAcceptableFloorPrice = request.budgetRange.max * 0.1;
      if (product.floor_price > maxAcceptableFloorPrice) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Generate proposals with simple budget optimization
 * Strategy: Allocate budget across products to maximize reach
 */
function generateProposals(
  products: Product[],
  request: GetProposalsRequest
): Proposal[] {
  const proposals: Proposal[] = [];

  // Group products by channel for diversification
  const productsByChannel = groupByChannel(products);

  // Generate one proposal per channel group (simple strategy)
  for (const [channel, channelProducts] of Object.entries(productsByChannel)) {
    // Calculate total budget capacity (sum of all product potential)
    const budgetCapacity = calculateBudgetCapacity(channelProducts, request);

    if (budgetCapacity <= 0) continue;

    const proposal: Proposal = {
      proposalId: generateProposalId(request.campaignId, channel),
      execution: `Optimized ${channel} campaign across ${channelProducts.length} products. Budget allocation strategy: maximize reach while maintaining quality thresholds.`,
      budgetCapacity,
      pricing: {
        method: 'revshare',
        rate: 0.15, // 15% revenue share
        currency: request.budgetRange?.currency || 'USD',
      },
      sku: `outcome-agent-${channel.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      additional_info: {
        channel,
        productCount: channelProducts.length,
        products: channelProducts.map((p) => ({
          product_ref: p.product_ref,
          sales_agent_url: p.sales_agent_url,
          pricing_option_id: p.pricing_option_id,
        })),
      },
    };

    proposals.push(proposal);
  }

  return proposals;
}

/**
 * Group products by channel
 */
function groupByChannel(products: Product[]): Record<string, Product[]> {
  const grouped: Record<string, Product[]> = {};

  for (const product of products) {
    const channels = product.targeting?.channels || ['unknown'];
    for (const channel of channels) {
      if (!grouped[channel]) {
        grouped[channel] = [];
      }
      grouped[channel].push(product);
    }
  }

  return grouped;
}

/**
 * Calculate budget capacity for a set of products
 * Simple heuristic: use budget range max, or sum of floor prices * 100
 */
function calculateBudgetCapacity(
  products: Product[],
  request: GetProposalsRequest
): number {
  // If budget range provided, use max as capacity
  if (request.budgetRange?.max) {
    return request.budgetRange.max;
  }

  // Otherwise, estimate based on floor prices
  const totalFloorPrice = products.reduce((sum, p) => {
    return sum + (p.floor_price || 0);
  }, 0);

  // Simple heuristic: capacity is 100x the floor price sum
  return totalFloorPrice * 100;
}

/**
 * Generate unique proposal ID
 */
function generateProposalId(campaignId: string, channel: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `prop-${campaignId}-${channel}-${timestamp}-${random}`;
}
