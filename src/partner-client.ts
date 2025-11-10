import { Scope3Client } from './client';
import { ClientConfig } from './types';
import { ChannelsResource } from './resources/partner/channels';
import { TargetingResource } from './resources/partner/targeting';
import { CreativesResource } from './resources/partner/creatives';
import { MediaBuysResource } from './resources/partner/mediaBuys';
import { NotificationsResource } from './resources/partner/notifications';
import { MediaProductsResource } from './resources/partner/mediaProducts';
import { AgentsResource } from './resources/partner/agents';
import { TacticsResource } from './resources/partner/tactics';
import { WebhooksResource } from './resources/partner/webhooks';
import { ServiceTokensResource } from './resources/partner/serviceTokens';
import { CustomersResource } from './resources/partner/customers';

/**
 * Scope3 Partner API
 * 
 * API for partners to register agents, manage tactics and media buys, and configure webhooks.
 * 
 * This API provides partners with tools to:
 * - Register and manage sales agents (DSPs, publisher platforms)
 * - Full CRUD operations for tactics and media buys
 * - Link tactics to buyer campaigns (read-only campaign access)
 * - Manage media products and product discovery
 * - Configure webhooks for event notifications
 * - Execute media buys and manage placements
 */
export class PartnerClient extends Scope3Client {
  public readonly channels: ChannelsResource;
  public readonly targeting: TargetingResource;
  public readonly creatives: CreativesResource;
  public readonly mediaBuys: MediaBuysResource;
  public readonly notifications: NotificationsResource;
  public readonly mediaProducts: MediaProductsResource;
  public readonly agents: AgentsResource;
  public readonly tactics: TacticsResource;
  public readonly webhooks: WebhooksResource;
  public readonly serviceTokens: ServiceTokensResource;
  public readonly customers: CustomersResource;

  constructor(config: ClientConfig) {
    super(config);

    this.channels = new ChannelsResource(this);
    this.targeting = new TargetingResource(this);
    this.creatives = new CreativesResource(this);
    this.mediaBuys = new MediaBuysResource(this);
    this.notifications = new NotificationsResource(this);
    this.mediaProducts = new MediaProductsResource(this);
    this.agents = new AgentsResource(this);
    this.tactics = new TacticsResource(this);
    this.webhooks = new WebhooksResource(this);
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
