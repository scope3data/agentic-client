import { Scope3Client } from './client';
import { ClientConfig } from './types';
import { BrandAgentsResource } from './resources/platform/brandAgents';
import { CampaignsResource } from './resources/platform/campaigns';
import { AssetsResource } from './resources/platform/assets';
import { BrandStandardsResource } from './resources/platform/brandStandards';
import { BrandStoriesResource } from './resources/platform/brandStories';
import { ChannelsResource } from './resources/platform/channels';
import { TargetingResource } from './resources/platform/targeting';
import { CreativesResource } from './resources/platform/creatives';
import { MediaBuysResource } from './resources/platform/mediaBuys';
import { MediaProductsResource } from './resources/platform/mediaProducts';
import { AgentsResource } from './resources/platform/agents';
import { TacticsResource } from './resources/platform/tactics';
import { OutcomeAgentsResource } from './resources/platform/outcomeAgents';
import { ServiceTokensResource } from './resources/platform/serviceTokens';
import { CustomersResource } from './resources/platform/customers';

/**
 * Scope3 Platform API
 *
 * API for brand advertisers to manage brand agents, campaigns, creatives, and discover marketplace offerings.
 *
 * This API provides buyers with tools to:
 * - Manage brand agents and campaign briefs
 * - Create and manage creatives
 * - Discover and save media products from the marketplace
 * - View campaigns, tactics, and media buys (read-only)
 * - Configure brand standards and brand stories
 */
export class PlatformClient extends Scope3Client {
  public readonly brandAgents: BrandAgentsResource;
  public readonly campaigns: CampaignsResource;
  public readonly assets: AssetsResource;
  public readonly brandStandards: BrandStandardsResource;
  public readonly brandStories: BrandStoriesResource;
  public readonly channels: ChannelsResource;
  public readonly targeting: TargetingResource;
  public readonly creatives: CreativesResource;
  public readonly mediaBuys: MediaBuysResource;
  public readonly mediaProducts: MediaProductsResource;
  public readonly agents: AgentsResource;
  public readonly tactics: TacticsResource;
  public readonly outcomeAgents: OutcomeAgentsResource;
  public readonly serviceTokens: ServiceTokensResource;
  public readonly customers: CustomersResource;

  constructor(config: ClientConfig) {
    super(config);

    this.brandAgents = new BrandAgentsResource(this);
    this.campaigns = new CampaignsResource(this);
    this.assets = new AssetsResource(this);
    this.brandStandards = new BrandStandardsResource(this);
    this.brandStories = new BrandStoriesResource(this);
    this.channels = new ChannelsResource(this);
    this.targeting = new TargetingResource(this);
    this.creatives = new CreativesResource(this);
    this.mediaBuys = new MediaBuysResource(this);
    this.mediaProducts = new MediaProductsResource(this);
    this.agents = new AgentsResource(this);
    this.tactics = new TacticsResource(this);
    this.outcomeAgents = new OutcomeAgentsResource(this);
    this.serviceTokens = new ServiceTokensResource(this);
    this.customers = new CustomersResource(this);
  }

  // Expose MCP methods for CLI dynamic command generation
  async listTools(): Promise<unknown> {
    if (!this.getClient()) {
      await this.connect();
    }
    return this.getClient().listTools();
  }

  async callTool<TRequest = Record<string, unknown>, TResponse = unknown>(
    toolName: string,
    args: TRequest
  ): Promise<TResponse> {
    return super.callTool(toolName, args);
  }
}
