import { Scope3Client } from './client';
import { ClientConfig } from './types';
import { AssetsResource } from './resources/assets';
import { BrandAgentsResource } from './resources/brand-agents';
import { BrandStandardsResource } from './resources/brand-standards';
import { BrandStoriesResource } from './resources/brand-stories';
import { CampaignsResource } from './resources/campaigns';
import { ChannelsResource } from './resources/channels';
import { CreativesResource } from './resources/creatives';
import { SalesAgentsResource } from './resources/sales-agents';
import { TacticsResource } from './resources/tactics';
import { MediaBuysResource } from './resources/media-buys';
import { NotificationsResource } from './resources/notifications';
import { ProductsResource } from './resources/products';

export class Scope3SDK extends Scope3Client {
  public readonly assets: AssetsResource;
  public readonly brandAgents: BrandAgentsResource;
  public readonly brandStandards: BrandStandardsResource;
  public readonly brandStories: BrandStoriesResource;
  public readonly campaigns: CampaignsResource;
  public readonly channels: ChannelsResource;
  public readonly creatives: CreativesResource;
  public readonly salesAgents: SalesAgentsResource;
  public readonly tactics: TacticsResource;
  public readonly mediaBuys: MediaBuysResource;
  public readonly notifications: NotificationsResource;
  public readonly products: ProductsResource;

  constructor(config: ClientConfig) {
    super(config);

    this.assets = new AssetsResource(this);
    this.brandAgents = new BrandAgentsResource(this);
    this.brandStandards = new BrandStandardsResource(this);
    this.brandStories = new BrandStoriesResource(this);
    this.campaigns = new CampaignsResource(this);
    this.channels = new ChannelsResource(this);
    this.creatives = new CreativesResource(this);
    this.salesAgents = new SalesAgentsResource(this);
    this.tactics = new TacticsResource(this);
    this.mediaBuys = new MediaBuysResource(this);
    this.notifications = new NotificationsResource(this);
    this.products = new ProductsResource(this);
  }
}
