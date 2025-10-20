import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import type { components } from './types/media-agent-api.js';

type GetProposedTacticsRequest = components['schemas']['GetProposedTacticsRequest'];
type GetProposedTacticsResponse = components['schemas']['GetProposedTacticsResponse'];
type ManageTacticRequest = components['schemas']['ManageTacticRequest'];
type ManageTacticResponse = components['schemas']['ManageTacticResponse'];
type TacticContextUpdatedRequest = components['schemas']['TacticContextUpdatedRequest'];
type TacticCreativesUpdatedRequest = components['schemas']['TacticCreativesUpdatedRequest'];
type TacticFeedbackRequest = components['schemas']['TacticFeedbackRequest'];

export interface MediaAgentMCPConfig {
  name?: string;
  version?: string;
  mediaAgentUrl: string;
  apiKey?: string;
}

export class MediaAgentMCP {
  private server: Server;
  private config: MediaAgentMCPConfig;

  constructor(config: MediaAgentMCPConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: config.name || 'media-agent-mcp',
        version: config.version || '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'get_proposed_tactics':
          return this.handleGetProposedTactics(args as GetProposedTacticsRequest);
        case 'manage_tactic':
          return this.handleManageTactic(args as ManageTacticRequest);
        case 'tactic_context_updated':
          return this.handleTacticContextUpdated(args as TacticContextUpdatedRequest);
        case 'tactic_creatives_updated':
          return this.handleTacticCreativesUpdated(args as TacticCreativesUpdatedRequest);
        case 'tactic_feedback':
          return this.handleTacticFeedback(args as TacticFeedbackRequest);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'get_proposed_tactics',
        description:
          'Get tactic proposals from the media agent. Called when setting up a campaign to ask what tactics the agent can handle.',
        inputSchema: {
          type: 'object',
          properties: {
            campaignId: {
              type: 'string',
              description: 'Campaign ID',
            },
            budgetRange: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
                currency: { type: 'string' },
              },
            },
            startDate: {
              type: 'string',
              description: 'Campaign start date (ISO 8601)',
            },
            endDate: {
              type: 'string',
              description: 'Campaign end date (ISO 8601)',
            },
            channels: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['display', 'video', 'audio', 'native', 'ctv'],
              },
            },
            countries: {
              type: 'array',
              items: { type: 'string' },
              description: 'ISO 3166-1 alpha-2 country codes',
            },
            objectives: {
              type: 'array',
              items: { type: 'string' },
            },
            brief: {
              type: 'string',
            },
            acceptedPricingMethods: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['cpm', 'vcpm', 'cpc', 'cpcv', 'cpv', 'cpp', 'flat_rate'],
              },
            },
            seatId: {
              type: 'string',
              description: 'Seat/account ID',
            },
          },
          required: ['campaignId', 'seatId'],
        },
      },
      {
        name: 'manage_tactic',
        description:
          'Accept or decline tactic assignment. Called when the agent is assigned to manage a tactic.',
        inputSchema: {
          type: 'object',
          properties: {
            tacticId: {
              type: 'string',
              description: 'ID of the tactic',
            },
            tacticContext: {
              type: 'object',
              description: 'Complete tactic details',
            },
            brandAgentId: {
              type: 'string',
              description: 'Brand agent ID',
            },
            seatId: {
              type: 'string',
              description: 'Seat/account ID',
            },
            customFields: {
              type: 'object',
              description: 'Custom fields from advertiser',
            },
          },
          required: ['tacticId', 'tacticContext', 'brandAgentId', 'seatId'],
        },
      },
      {
        name: 'tactic_context_updated',
        description:
          'Notification of tactic changes. MUST be handled as changes may impact targeting or budget.',
        inputSchema: {
          type: 'object',
          properties: {
            tacticId: {
              type: 'string',
              description: 'Tactic ID',
            },
            tactic: {
              type: 'object',
              description: 'Current tactic state',
            },
            patch: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  op: { type: 'string', enum: ['add', 'remove', 'replace'] },
                  path: { type: 'string' },
                  value: {},
                },
              },
            },
          },
          required: ['tacticId', 'tactic', 'patch'],
        },
      },
      {
        name: 'tactic_creatives_updated',
        description:
          'Notification of creative changes. Update media buys to use new creative assets.',
        inputSchema: {
          type: 'object',
          properties: {
            tacticId: {
              type: 'string',
              description: 'Tactic ID',
            },
            creatives: {
              type: 'array',
              description: 'Updated creative assets',
            },
            patch: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  op: { type: 'string', enum: ['add', 'remove', 'replace'] },
                  path: { type: 'string' },
                  value: {},
                },
              },
            },
          },
          required: ['tacticId', 'creatives', 'patch'],
        },
      },
      {
        name: 'tactic_feedback',
        description:
          'Performance feedback from orchestrator. MAY trigger updates to improve performance.',
        inputSchema: {
          type: 'object',
          properties: {
            tacticId: {
              type: 'string',
              description: 'Tactic ID',
            },
            startDate: {
              type: 'string',
              description: 'Start of feedback interval (ISO 8601)',
            },
            endDate: {
              type: 'string',
              description: 'End of feedback interval (ISO 8601)',
            },
            deliveryIndex: {
              type: 'number',
              description: 'Delivery performance (100 = on target)',
            },
            performanceIndex: {
              type: 'number',
              description: 'Performance vs target (100 = maximum)',
            },
          },
          required: ['tacticId', 'startDate', 'endDate', 'deliveryIndex', 'performanceIndex'],
        },
      },
    ];
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

  private async handleGetProposedTactics(args: GetProposedTacticsRequest) {
    const response = (await this.callMediaAgent(
      '/get-proposed-tactics',
      args
    )) as GetProposedTacticsResponse;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async handleManageTactic(args: ManageTacticRequest) {
    const response = (await this.callMediaAgent('/manage-tactic', args)) as ManageTacticResponse;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async handleTacticContextUpdated(args: TacticContextUpdatedRequest) {
    await this.callMediaAgent('/tactic-context-updated', args);

    return {
      content: [
        {
          type: 'text',
          text: 'Tactic context update sent successfully',
        },
      ],
    };
  }

  private async handleTacticCreativesUpdated(args: TacticCreativesUpdatedRequest) {
    await this.callMediaAgent('/tactic-creatives-updated', args);

    return {
      content: [
        {
          type: 'text',
          text: 'Tactic creatives update sent successfully',
        },
      ],
    };
  }

  private async handleTacticFeedback(args: TacticFeedbackRequest) {
    await this.callMediaAgent('/tactic-feedback', args);

    return {
      content: [
        {
          type: 'text',
          text: 'Tactic feedback sent successfully',
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
