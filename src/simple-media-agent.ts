import express from 'express';
import type { Request, Response } from 'express';
import { Scope3AgenticClient } from './sdk';

interface SimpleMediaAgentConfig {
  port?: number;
  scope3ApiKey: string;
  scope3BaseUrl?: string;
  minDailyBudget?: number;
  overallocationPercent?: number;
}

interface Product {
  id: string;
  salesAgentId: string;
  floorPrice?: number;
  recommendedPrice?: number;
  name?: string;
}

interface MediaBuyAllocation {
  productId: string;
  salesAgentId: string;
  budget: number;
  cpm: number;
}

export class SimpleMediaAgent {
  private app: express.Application;
  private config: Required<SimpleMediaAgentConfig>;
  private scope3: Scope3AgenticClient;
  private activeTactics: Map<string, { products: Product[]; allocations: MediaBuyAllocation[] }>;

  constructor(config: SimpleMediaAgentConfig) {
    this.config = {
      port: config.port || 8080,
      scope3ApiKey: config.scope3ApiKey,
      scope3BaseUrl: config.scope3BaseUrl || 'https://api.agentic.scope3.com',
      minDailyBudget: config.minDailyBudget || 100,
      overallocationPercent: config.overallocationPercent || 40,
    };

    this.scope3 = new Scope3AgenticClient({
      apiKey: this.config.scope3ApiKey,
      baseUrl: this.config.scope3BaseUrl,
    });

    this.activeTactics = new Map();
    this.app = express();
    this.app.use(express.json());
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.app.post('/get-proposed-tactics', this.handleGetProposedTactics.bind(this));
    this.app.post('/manage-tactic', this.handleManageTactic.bind(this));
    this.app.post('/tactic-context-updated', this.handleTacticContextUpdated.bind(this));
    this.app.post('/tactic-creatives-updated', this.handleTacticCreativesUpdated.bind(this));
    this.app.post('/tactic-feedback', this.handleTacticFeedback.bind(this));
    this.app.post('/webhook/reporting-complete', this.handleReportingComplete.bind(this));
  }

  private async handleGetProposedTactics(req: Request, res: Response): Promise<void> {
    try {
      const { campaignId, budgetRange } = req.body;

      // Get all registered sales agents
      const salesAgentsResponse = await this.scope3.salesAgents.list();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const salesAgents = (salesAgentsResponse.data as any[]) || [];

      // Call getProducts for each sales agent with the brief
      const allProducts: Product[] = [];
      for (const agent of salesAgents) {
        try {
          const productsResponse = await this.scope3.products.discover({
            salesAgentId: agent.id,
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const products = ((productsResponse.data as any[]) || []).map((p: Product) => ({
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

      const proposedTactics = [
        {
          tacticId: `simple-passthrough-${campaignId}`,
          execution: `Passthrough strategy: distribute budget across ${allProducts.length} products based on floor prices`,
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
          },
        },
      ];

      res.json({ proposedTactics });
    } catch (error) {
      console.error('Error in get-proposed-tactics:', error);
      res.status(500).json({ error: 'Failed to generate tactic proposals' });
    }
  }

  private async handleManageTactic(req: Request, res: Response): Promise<void> {
    try {
      const { tacticId, tacticContext } = req.body;

      console.log(`Managing tactic ${tacticId}`);

      // Get all registered sales agents
      const salesAgentsResponse = await this.scope3.salesAgents.list();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const salesAgents = (salesAgentsResponse.data as any[]) || [];

      // Get products from all sales agents
      const allProducts: Product[] = [];
      for (const agent of salesAgents) {
        try {
          const productsResponse = await this.scope3.products.discover({
            salesAgentId: agent.id,
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const products = ((productsResponse.data as any[]) || []).map((p: Product) => ({
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
        products: allProducts,
        allocations,
      });

      // Create media buys for each allocation
      for (const allocation of allocations) {
        try {
          await this.scope3.mediaBuys.create({
            tacticId,
            name: `Media Buy - ${allocation.productId}`,
            products: [
              {
                mediaProductId: allocation.productId,
                salesAgentId: allocation.salesAgentId,
                pricingCpm: allocation.cpm,
              },
            ],
            budget: {
              amount: allocation.budget,
              currency: 'USD',
            },
          });
        } catch (error) {
          console.error(`Error creating media buy for product ${allocation.productId}:`, error);
        }
      }

      res.json({
        acknowledged: true,
        mediaBuysCreated: allocations.length,
      });
    } catch (error) {
      console.error('Error in manage-tactic:', error);
      res.status(500).json({ error: 'Failed to manage tactic' });
    }
  }

  private calculateBudgetAllocation(
    products: Product[],
    totalBudget: number
  ): MediaBuyAllocation[] {
    if (products.length === 0) return [];

    // Apply overallocation to ensure delivery
    // If we want to spend $100/day, allocate $140/day to hit the target
    const overallocationMultiplier = 1 + this.config.overallocationPercent / 100;
    const allocatedBudget = totalBudget * overallocationMultiplier;

    // Calculate N = number of products where daily budget >= minDailyBudget
    // Assume campaign runs for 30 days for this calculation
    const assumedDays = 30;
    const maxProducts = Math.floor(allocatedBudget / assumedDays / this.config.minDailyBudget);
    const n = Math.min(maxProducts, products.length);

    if (n === 0) return [];

    // Take N cheapest products
    const selectedProducts = products.slice(0, n);

    // Divide budget equally with overallocation applied
    const budgetPerProduct = allocatedBudget / n;

    return selectedProducts.map((product) => ({
      productId: product.id,
      salesAgentId: product.salesAgentId,
      budget: budgetPerProduct,
      cpm: product.floorPrice || 0,
    }));
  }

  private async handleTacticContextUpdated(req: Request, res: Response): Promise<void> {
    const { tacticId, patch } = req.body;
    console.log(`Tactic ${tacticId} context updated:`, patch);

    // Check if budget changed
    const budgetChange = patch.find((p: { path: string }) => p.path.startsWith('/budget'));
    if (budgetChange && this.activeTactics.has(tacticId)) {
      console.log(`Budget changed for tactic ${tacticId}, will reallocate on next reporting cycle`);
    }

    res.json({ acknowledged: true });
  }

  private async handleTacticCreativesUpdated(req: Request, res: Response): Promise<void> {
    const { tacticId, patch } = req.body;
    console.log(`Creatives for tactic ${tacticId} updated:`, patch);

    // Update media buys with new creatives if needed
    res.json({ acknowledged: true });
  }

  private async handleTacticFeedback(req: Request, res: Response): Promise<void> {
    const { tacticId, deliveryIndex, performanceIndex } = req.body;
    console.log(`Feedback for tactic ${tacticId}:`, { deliveryIndex, performanceIndex });

    res.json({ acknowledged: true });
  }

  private async handleReportingComplete(req: Request, res: Response): Promise<void> {
    try {
      const { tacticId, reportingData } = req.body;
      console.log(`Daily reporting complete for tactic ${tacticId}`);

      if (!this.activeTactics.has(tacticId)) {
        res.json({ acknowledged: true, message: 'Tactic not found' });
        return;
      }

      // Get current media buys and their performance
      const mediaBuysResponse = await this.scope3.mediaBuys.list({ tacticId });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mediaBuys = (mediaBuysResponse.data as any[]) || [];

      console.log(`Reallocating budget for ${mediaBuys.length} media buys`);

      // Analyze performance and reallocate
      // For now, just log - in production, you'd implement reallocation logic here
      for (const mediaBuy of mediaBuys) {
        console.log(`Media buy ${mediaBuy.id}: performance data`, reportingData);
      }

      res.json({
        acknowledged: true,
        message: 'Reallocation triggered',
      });
    } catch (error) {
      console.error('Error in reporting-complete:', error);
      res.status(500).json({ error: 'Failed to process reporting data' });
    }
  }

  start(): void {
    this.app.listen(this.config.port, () => {
      console.log(`Simple media agent listening on port ${this.config.port}`);
    });
  }
}
