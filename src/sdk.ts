import { Scope3Client } from './client';
import { ClientConfig } from './types';
import { AgentsResource } from './resources/agents';
import { AssetsResource } from './resources/assets';
import { BrandAgentsResource } from './resources/brand-agents';
import { BrandStandardsResource } from './resources/brand-standards';
import { BrandStoriesResource } from './resources/brand-stories';
import { CampaignsResource } from './resources/campaigns';
import { ChannelsResource } from './resources/channels';
import { CreativesResource } from './resources/creatives';
import { TacticsResource } from './resources/tactics';
import { MediaBuysResource } from './resources/media-buys';
import { NotificationsResource } from './resources/notifications';
import { ProductsResource } from './resources/products';

export class Scope3AgenticClient extends Scope3Client {
  public readonly agents: AgentsResource;
  public readonly assets: AssetsResource;
  public readonly brandAgents: BrandAgentsResource;
  public readonly brandStandards: BrandStandardsResource;
  public readonly brandStories: BrandStoriesResource;
  public readonly campaigns: CampaignsResource;
  public readonly channels: ChannelsResource;
  public readonly creatives: CreativesResource;
  public readonly tactics: TacticsResource;
  public readonly mediaBuys: MediaBuysResource;
  public readonly notifications: NotificationsResource;
  public readonly products: ProductsResource;

  constructor(config: ClientConfig) {
    super(config);

    this.agents = new AgentsResource(this);
    this.assets = new AssetsResource(this);
    this.brandAgents = new BrandAgentsResource(this);
    this.brandStandards = new BrandStandardsResource(this);
    this.brandStories = new BrandStoriesResource(this);
    this.campaigns = new CampaignsResource(this);
    this.channels = new ChannelsResource(this);
    this.creatives = new CreativesResource(this);
    this.tactics = new TacticsResource(this);
    this.mediaBuys = new MediaBuysResource(this);
    this.notifications = new NotificationsResource(this);
    this.products = new ProductsResource(this);
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
