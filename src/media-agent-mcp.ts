import { FastMCP } from 'fastmcp';
import { z } from 'zod';

export interface MediaAgentMCPConfig {
  name?: string;
  version?: string;
  mediaAgentUrl: string;
  apiKey?: string;
}

export class MediaAgentMCP {
  private server: FastMCP;
  private config: MediaAgentMCPConfig;

  constructor(config: MediaAgentMCPConfig) {
    this.config = config;
    this.server = new FastMCP({
      name: config.name || 'media-agent-mcp',
      version: (config.version as `${number}.${number}.${number}`) || '1.0.0',
    });

    this.setupTools();
  }

  private async callMediaAgent(endpoint: string, body: unknown): Promise<unknown> {
    const url = `${this.config.mediaAgentUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Media agent request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private setupTools(): void {
    // get_proposed_tactics tool
    this.server.addTool({
      name: 'get_proposed_tactics',
      description:
        'Get tactic proposals from the media agent. Called when setting up a campaign to ask what tactics the agent can handle.',
      parameters: z.object({
        campaignId: z.string().describe('Campaign ID'),
        budgetRange: z
          .object({
            min: z.number(),
            max: z.number(),
            currency: z.string(),
          })
          .optional(),
        startDate: z.string().optional().describe('Campaign start date (ISO 8601)'),
        endDate: z.string().optional().describe('Campaign end date (ISO 8601)'),
        channels: z
          .array(z.enum(['display', 'video', 'audio', 'native', 'ctv']))
          .optional()
          .describe('Media channels'),
        countries: z.array(z.string()).optional().describe('ISO 3166-1 alpha-2 country codes'),
        objectives: z.array(z.string()).optional().describe('Campaign objectives'),
        brief: z.string().optional().describe('Campaign brief text'),
        acceptedPricingMethods: z
          .array(z.enum(['cpm', 'vcpm', 'cpc', 'cpcv', 'cpv', 'cpp', 'flat_rate']))
          .optional()
          .describe('Accepted pricing methods'),
        seatId: z.string().describe('Seat/account ID'),
      }),
      execute: async (args) => {
        const response = await this.callMediaAgent('/get-proposed-tactics', args);
        return JSON.stringify(response, null, 2);
      },
    });

    // manage_tactic tool
    this.server.addTool({
      name: 'manage_tactic',
      description:
        'Accept or decline tactic assignment. Called when the agent is assigned to manage a tactic.',
      parameters: z.object({
        tacticId: z.string().describe('ID of the tactic'),
        tacticContext: z.object({}).passthrough().describe('Complete tactic details'),
        brandAgentId: z.string().describe('Brand agent ID'),
        seatId: z.string().describe('Seat/account ID'),
        customFields: z
          .object({})
          .passthrough()
          .optional()
          .describe('Custom fields from advertiser'),
      }),
      execute: async (args) => {
        const response = await this.callMediaAgent('/manage-tactic', args);
        return JSON.stringify(response, null, 2);
      },
    });

    // tactic_context_updated tool
    this.server.addTool({
      name: 'tactic_context_updated',
      description:
        'Notification of tactic changes. MUST be handled as changes may impact targeting or budget.',
      parameters: z.object({
        tacticId: z.string().describe('Tactic ID'),
        tactic: z.object({}).passthrough().describe('Current tactic state'),
        patch: z
          .array(
            z.object({
              op: z.enum(['add', 'remove', 'replace']),
              path: z.string(),
              value: z.unknown().optional(),
            })
          )
          .describe('JSON Patch format changes'),
      }),
      execute: async (args) => {
        await this.callMediaAgent('/tactic-context-updated', args);
        return 'Tactic context update sent successfully';
      },
    });

    // tactic_creatives_updated tool
    this.server.addTool({
      name: 'tactic_creatives_updated',
      description:
        'Notification of creative changes. Update media buys to use new creative assets.',
      parameters: z.object({
        tacticId: z.string().describe('Tactic ID'),
        creatives: z.array(z.unknown()).describe('Updated creative assets'),
        patch: z
          .array(
            z.object({
              op: z.enum(['add', 'remove', 'replace']),
              path: z.string(),
              value: z.unknown().optional(),
            })
          )
          .describe('JSON Patch format changes'),
      }),
      execute: async (args) => {
        await this.callMediaAgent('/tactic-creatives-updated', args);
        return 'Tactic creatives update sent successfully';
      },
    });

    // tactic_feedback tool
    this.server.addTool({
      name: 'tactic_feedback',
      description:
        'Performance feedback from orchestrator. MAY trigger updates to improve performance.',
      parameters: z.object({
        tacticId: z.string().describe('Tactic ID'),
        startDate: z.string().describe('Start of feedback interval (ISO 8601)'),
        endDate: z.string().describe('End of feedback interval (ISO 8601)'),
        deliveryIndex: z.number().describe('Delivery performance (100 = on target)'),
        performanceIndex: z.number().describe('Performance vs target (100 = maximum)'),
      }),
      execute: async (args) => {
        await this.callMediaAgent('/tactic-feedback', args);
        return 'Tactic feedback sent successfully';
      },
    });
  }

  async start(): Promise<void> {
    await this.server.start({
      transportType: 'stdio',
    });
  }
}
