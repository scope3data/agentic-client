import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { Scope3AgenticClient } from './sdk';
import type { SimpleMediaAgentConfig, MediaBuyAllocation } from './simple-media-agent/types';
import { getProposedTactics } from './simple-media-agent/get-proposed-tactics';
import { manageTactic } from './simple-media-agent/manage-tactic';

/**
 * Simple Media Agent that exposes MCP tools
 * Called by Scope3 platform via MCP protocol
 */
export class SimpleMediaAgent {
  private server: FastMCP;
  private scope3: Scope3AgenticClient;
  private config: Required<
    Omit<SimpleMediaAgentConfig, 'name' | 'version'> & { name: string; version: string }
  >;
  private activeTactics: Map<string, { allocations: MediaBuyAllocation[] }>;

  constructor(config: SimpleMediaAgentConfig) {
    this.config = {
      scope3ApiKey: config.scope3ApiKey,
      scope3BaseUrl: config.scope3BaseUrl || 'https://api.agentic.scope3.com',
      minDailyBudget: config.minDailyBudget || 100,
      overallocationPercent: config.overallocationPercent || 40,
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
        const result = await getProposedTactics(this.scope3, args);
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
        const result = await manageTactic(
          this.scope3,
          this.config.minDailyBudget,
          this.config.overallocationPercent,
          this.activeTactics,
          args
        );
        return JSON.stringify(result, null, 2);
      },
    });
  }

  async start(): Promise<void> {
    await this.server.start({
      transportType: 'stdio',
    });
  }
}
