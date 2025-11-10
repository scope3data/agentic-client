import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { Scope3AgenticClient } from './sdk';
import type { OutcomeAgentConfig } from './outcome-agent/types';
import { getProposals } from './outcome-agent/get-proposals';
import { acceptProposal } from './outcome-agent/accept-proposal';

/**
 * Outcome Agent that exposes MCP tools for proposal generation and management
 * Called by Scope3 platform via MCP protocol
 */
export class OutcomeAgent {
  private server: FastMCP;
  private scope3: Scope3AgenticClient;
  private config: Required<
    Omit<OutcomeAgentConfig, 'name' | 'version'> & { name: string; version: string }
  >;

  constructor(config: OutcomeAgentConfig) {
    this.config = {
      scope3ApiKey: config.scope3ApiKey,
      scope3BaseUrl: config.scope3BaseUrl || 'https://api.agentic.scope3.com',
      name: config.name || 'outcome-agent',
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

    this.setupTools();
  }

  private setupTools(): void {
    // get_proposals tool
    this.server.addTool({
      name: 'get_proposals',
      description:
        'Get proposal recommendations from this outcome agent. Returns proposals with execution strategies, budget capacity, and pricing.',
      parameters: z.object({
        campaignId: z.string().describe('Campaign ID'),
        seatId: z.string().describe('Seat/account ID'),
        budgetRange: z
          .object({
            min: z.number().optional(),
            max: z.number().optional(),
            currency: z.string().optional(),
          })
          .optional()
          .describe('Budget range with min/max and currency'),
        startDate: z.string().optional().describe('Campaign start date (ISO 8601 UTC)'),
        endDate: z.string().optional().describe('Campaign end date (ISO 8601 UTC)'),
        channels: z
          .array(z.enum(['display', 'video', 'native', 'audio', 'connected_tv']))
          .optional()
          .describe('Ad channels'),
        countries: z.array(z.string()).optional().describe('ISO 3166-1 alpha-2 country codes'),
        brief: z.string().optional().describe('Campaign description'),
        products: z.array(z.object({}).passthrough()).optional().describe('Product references'),
        propertyListIds: z.array(z.number()).optional().describe('Property list IDs'),
      }),
      execute: async (args) => {
        const result = await getProposals(this.scope3, args);
        return JSON.stringify(result, null, 2);
      },
    });

    // accept_proposal tool
    this.server.addTool({
      name: 'accept_proposal',
      description:
        'Accept or decline a proposal assignment. Called when a proposal is accepted by users.',
      parameters: z.object({
        tacticId: z.string().describe('Tactic ID'),
        proposalId: z.string().optional().describe('Proposal ID from get_proposals response'),
        campaignContext: z
          .object({
            budget: z.number(),
            budgetCurrency: z.string().optional(),
            startDate: z.string(),
            endDate: z.string(),
            channel: z.enum(['display', 'video', 'native', 'audio', 'connected_tv']),
            countries: z.array(z.string()).optional(),
            creatives: z.array(z.object({}).passthrough()).optional(),
            brandStandards: z.array(z.object({}).passthrough()).optional(),
          })
          .passthrough()
          .describe('Campaign details including budget, schedule, targeting, and creatives'),
        brandAgentId: z.string().describe('Brand agent ID'),
        seatId: z.string().describe('Seat/account ID'),
        customFields: z.record(z.unknown()).optional().describe('Custom advertiser fields'),
        additional_info: z.record(z.unknown()).optional().describe('Additional metadata'),
      }),
      execute: async (args) => {
        const result = await acceptProposal(this.scope3, args);
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
