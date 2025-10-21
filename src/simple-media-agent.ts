import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { Scope3AgenticClient } from './sdk';
import type { MediaBuyProduct } from './resources/media-buys';

interface SimpleMediaAgentMCPConfig {
  scope3ApiKey: string;
  scope3BaseUrl?: string;
  minDailyBudget?: number;
  name?: string;
  version?: string;
}

// MediaBuyAllocation extends MediaBuyProduct from the ADCP client library
// and adds overallocation percentage per media buy
interface MediaBuyAllocation extends MediaBuyProduct {
  overallocationPercent: number;
}

/**
 * Simple Media Agent that exposes MCP tools
 * Called by Scope3 platform via MCP protocol
 */
export class SimpleMediaAgent {
  private server: FastMCP;
  private scope3: Scope3AgenticClient;
  private config: Required<
    Omit<SimpleMediaAgentMCPConfig, 'name' | 'version'> & { name: string; version: string }
  >;
  private activeTactics: Map<string, { allocations: MediaBuyAllocation[] }>;

  constructor(config: SimpleMediaAgentMCPConfig) {
    this.config = {
      scope3ApiKey: config.scope3ApiKey,
      scope3BaseUrl: config.scope3BaseUrl || 'https://api.agentic.scope3.com',
      minDailyBudget: config.minDailyBudget || 100,
      name: config.name || 'simple-media-agent',
      version: (config.version as `${number}.${number}.${number}`) || '1.0.0',
    };

    this.server = new FastMCP({
      name: this.config.name,
      version: this.config.version as `${number}.${number}.${number}`,
    });

    this.scope3 = new Scope3AgenticClient({
      apiKey: this.config.scope3ApiKey,
      baseUrl: this.config.scope3BaseUrl,
    });

    this.activeTactics = new Map();
    this.setupTools();
  }

  private setupTools(): void {
    // get_proposed_tactics tool
    this.server.addTool({
      name: 'get_proposed_tactics',
      description:
        'Get tactic proposals from this media agent. Returns budget allocation based on floor prices from sales agents.',
      parameters: z.object({
        campaignId: z.string().describe('Campaign ID'),
        budgetRange: z
          .object({
            min: z.number(),
            max: z.number(),
            currency: z.string(),
          })
          .optional(),
        channels: z.array(z.string()).optional().describe('Media channels'),
        countries: z.array(z.string()).optional().describe('ISO country codes'),
        seatId: z.string().describe('Seat/account ID'),
      }),
      execute: async (args) => {
        const result = await this.handleGetProposedTactics(args);
        return JSON.stringify(result, null, 2);
      },
    });

    // manage_tactic tool
    this.server.addTool({
      name: 'manage_tactic',
      description:
        'Assign this media agent to manage a tactic. Creates media buys with overallocated budgets.',
      parameters: z.object({
        tacticId: z.string().describe('Tactic ID'),
        tacticContext: z.object({}).passthrough().describe('Tactic details including budget'),
        brandAgentId: z.string().describe('Brand agent ID'),
        seatId: z.string().describe('Seat/account ID'),
      }),
      execute: async (args) => {
        const result = await this.handleManageTactic(args);
        return JSON.stringify(result, null, 2);
      },
    });
  }

  private async handleGetProposedTactics(args: {
    campaignId: string;
    budgetRange?: { min: number; max: number; currency: string };
    seatId: string;
  }): Promise<unknown> {
    const { campaignId, budgetRange } = args;

    // Get all registered sales agents
    const salesAgentsResponse = await this.scope3.salesAgents.list();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const salesAgents = (salesAgentsResponse.data as any[]) || [];

    // Call getProducts for each sales agent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allProducts: any[] = [];
    for (const agent of salesAgents) {
      try {
        const productsResponse = await this.scope3.products.discover({
          salesAgentId: agent.id,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const products = ((productsResponse.data as any[]) || []).map((p: any) => ({
          id: p.id,
          salesAgentId: agent.id,
          floorPrice: p.floorPrice,
          recommendedPrice: p.recommendedPrice,
          name: p.name,
        }));

        allProducts.push(...products);
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
          execution: `Passthrough strategy: distribute budget across ${allProducts.length} products based on floor prices. Each media buy gets 40% overallocation.`,
          budgetCapacity: budgetRange?.max || 0,
          pricing: {
            method: 'passthrough',
            estimatedCpm: avgFloorPrice,
            currency: 'USD',
          },
          sku: 'simple-passthrough',
          metadata: {
            productCount: allProducts.length,
            avgFloorPrice,
            overallocationPerMediaBuy: 40,
          },
        },
      ],
    };
  }

  private async handleManageTactic(args: {
    tacticId: string;
    tacticContext: { budget?: { amount: number } };
    brandAgentId: string;
    seatId: string;
  }): Promise<unknown> {
    const { tacticId, tacticContext } = args;

    console.log(`Managing tactic ${tacticId}`);

    // Get all registered sales agents
    const salesAgentsResponse = await this.scope3.salesAgents.list();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const salesAgents = (salesAgentsResponse.data as any[]) || [];

    // Get products from all sales agents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allProducts: any[] = [];
    for (const agent of salesAgents) {
      try {
        const productsResponse = await this.scope3.products.discover({
          salesAgentId: agent.id,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const products = ((productsResponse.data as any[]) || []).map((p: any) => ({
          id: p.id,
          salesAgentId: agent.id,
          floorPrice: p.floorPrice,
          recommendedPrice: p.recommendedPrice,
          name: p.name,
        }));

        allProducts.push(...products);
      } catch (error) {
        console.error(`Error fetching products from agent ${agent.id}:`, error);
      }
    }

    // Sort by floor price (cheapest first)
    allProducts.sort((a, b) => (a.floorPrice || 0) - (b.floorPrice || 0));

    // Calculate budget allocation
    const totalBudget = tacticContext.budget?.amount || 0;
    const allocations = this.calculateBudgetAllocation(allProducts, totalBudget);

    // Store tactic info for later reallocation
    this.activeTactics.set(tacticId, {
      allocations,
    });

    // Create media buys for each allocation
    // Each media buy has its own overallocation percentage
    const createdBuys = [];
    for (const allocation of allocations) {
      try {
        const result = await this.scope3.mediaBuys.create({
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
        productId: a.mediaProductId,
        budget: a.budgetAmount,
        cpm: a.pricingCpm,
        overallocationPercent: a.overallocationPercent,
      })),
    };
  }

  private calculateBudgetAllocation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products: any[],
    totalBudget: number
  ): MediaBuyAllocation[] {
    if (products.length === 0) return [];

    // Calculate N = number of products where daily budget >= minDailyBudget
    const assumedDays = 30;
    const maxProducts = Math.floor(totalBudget / assumedDays / this.config.minDailyBudget);
    const n = Math.min(maxProducts, products.length);

    if (n === 0) return [];

    // Take N cheapest products
    const selectedProducts = products.slice(0, n);

    // Divide budget equally
    const budgetPerProduct = totalBudget / n;

    // Each media buy gets its own overallocation percentage
    // This allows per-buy customization and better delivery control
    return selectedProducts.map((product) => ({
      mediaProductId: product.id,
      salesAgentId: product.salesAgentId,
      budgetAmount: budgetPerProduct,
      budgetCurrency: 'USD',
      pricingCpm: product.floorPrice || 0,
      overallocationPercent: 40, // Default 40% overallocation per media buy
    }));
  }

  async start(): Promise<void> {
    await this.server.start({
      transportType: 'stdio',
    });
  }
}
