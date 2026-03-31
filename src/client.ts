/**
 * Scope3Client - REST client for the Scope3 Agentic Platform
 *
 * Provides typed resource methods for REST consumers (humans, CLI, programmatic use).
 *
 * For MCP consumers (AI agents), use Scope3McpClient instead — it's a thin
 * connection helper that gives you direct access to callTool/readResource
 * without unnecessary abstraction layers.
 */

import type { Scope3ClientConfig, ApiVersion, Persona } from './types';
import { RestAdapter } from './adapters/rest';
import { AdvertisersResource } from './resources/advertisers';
import { CampaignsResource } from './resources/campaigns';
import { BundlesResource } from './resources/bundles';
import { SignalsResource } from './resources/signals';
import { ReportingResource } from './resources/reporting';
import { SalesAgentsResource } from './resources/sales-agents';
import { StorefrontResource } from './resources/storefront';
import { InventorySourcesResource } from './resources/inventory-sources';
import { AgentsResource } from './resources/agents';
import { ReadinessResource } from './resources/readiness';
import { BillingResource } from './resources/billing';
import { NotificationsResource } from './resources/notifications';
import { TasksResource } from './resources/tasks';
import { PropertyListChecksResource } from './resources/property-lists';
import { fetchSkillMd, parseSkillMd, ParsedSkill } from './skill';

/**
 * REST client for interacting with the Scope3 Agentic Platform.
 * Provides typed resource methods for each API surface.
 *
 * @example
 * ```typescript
 * // Buyer persona
 * const client = new Scope3Client({ apiKey: 'token', persona: 'buyer' });
 * const advertisers = await client.advertisers.list();
 *
 * // Storefront persona
 * const sfClient = new Scope3Client({ apiKey: 'token', persona: 'storefront' });
 * const sf = await sfClient.storefront.get();
 * ```
 */
export class Scope3Client {
  // Buyer persona resources
  private _advertisers?: AdvertisersResource;
  private _campaigns?: CampaignsResource;
  private _bundles?: BundlesResource;
  private _signals?: SignalsResource;
  private _reporting?: ReportingResource;
  private _salesAgents?: SalesAgentsResource;
  private _tasks?: TasksResource;
  private _propertyListChecks?: PropertyListChecksResource;

  // Storefront persona resources
  private _storefront?: StorefrontResource;
  private _inventorySources?: InventorySourcesResource;
  private _agents?: AgentsResource;
  private _readiness?: ReadinessResource;
  private _billing?: BillingResource;
  private _notifications?: NotificationsResource;

  private readonly adapter: RestAdapter;

  public readonly version: ApiVersion;
  public readonly persona: Persona;

  private skillPromise: Promise<ParsedSkill> | null = null;

  constructor(config: Scope3ClientConfig) {
    const trimmedKey = config.apiKey?.trim();
    if (!trimmedKey) {
      throw new Error('apiKey is required');
    }
    if (!config.persona) {
      throw new Error('persona is required (buyer or storefront)');
    }

    this.version = config.version ?? 'v2';
    this.persona = config.persona;
    this.adapter = new RestAdapter({ ...config, apiKey: trimmedKey });

    switch (this.persona) {
      case 'buyer':
        this._advertisers = new AdvertisersResource(this.adapter);
        this._campaigns = new CampaignsResource(this.adapter);
        this._bundles = new BundlesResource(this.adapter);
        this._signals = new SignalsResource(this.adapter);
        this._reporting = new ReportingResource(this.adapter);
        this._salesAgents = new SalesAgentsResource(this.adapter);
        this._tasks = new TasksResource(this.adapter);
        this._propertyListChecks = new PropertyListChecksResource(this.adapter);
        break;
      case 'storefront':
        this._storefront = new StorefrontResource(this.adapter);
        this._inventorySources = new InventorySourcesResource(this.adapter);
        this._agents = new AgentsResource(this.adapter);
        this._readiness = new ReadinessResource(this.adapter);
        this._billing = new BillingResource(this.adapter);
        this._notifications = new NotificationsResource(this.adapter);
        break;
      default: {
        const _exhaustive: never = this.persona;
        throw new Error(`Unknown persona: ${_exhaustive}`);
      }
    }
  }

  // ── Buyer persona resources ──────────────────────────────────────

  get advertisers(): AdvertisersResource {
    if (!this._advertisers) {
      throw new Error('advertisers is only available with the buyer persona');
    }
    return this._advertisers;
  }

  get campaigns(): CampaignsResource {
    if (!this._campaigns) {
      throw new Error('campaigns is only available with the buyer persona');
    }
    return this._campaigns;
  }

  get bundles(): BundlesResource {
    if (!this._bundles) {
      throw new Error('bundles is only available with the buyer persona');
    }
    return this._bundles;
  }

  get signals(): SignalsResource {
    if (!this._signals) {
      throw new Error('signals is only available with the buyer persona');
    }
    return this._signals;
  }

  get reporting(): ReportingResource {
    if (!this._reporting) {
      throw new Error('reporting is only available with the buyer persona');
    }
    return this._reporting;
  }

  get salesAgents(): SalesAgentsResource {
    if (!this._salesAgents) {
      throw new Error('salesAgents is only available with the buyer persona');
    }
    return this._salesAgents;
  }

  get tasks(): TasksResource {
    if (!this._tasks) {
      throw new Error('tasks is only available with the buyer persona');
    }
    return this._tasks;
  }

  get propertyListChecks(): PropertyListChecksResource {
    if (!this._propertyListChecks) {
      throw new Error('propertyListChecks is only available with the buyer persona');
    }
    return this._propertyListChecks;
  }

  // ── Storefront persona resources ─────────────────────────────────

  get storefront(): StorefrontResource {
    if (!this._storefront) {
      throw new Error('storefront is only available with the storefront persona');
    }
    return this._storefront;
  }

  get inventorySources(): InventorySourcesResource {
    if (!this._inventorySources) {
      throw new Error('inventorySources is only available with the storefront persona');
    }
    return this._inventorySources;
  }

  get agents(): AgentsResource {
    if (!this._agents) {
      throw new Error('agents is only available with the storefront persona');
    }
    return this._agents;
  }

  get readiness(): ReadinessResource {
    if (!this._readiness) {
      throw new Error('readiness is only available with the storefront persona');
    }
    return this._readiness;
  }

  get billing(): BillingResource {
    if (!this._billing) {
      throw new Error('billing is only available with the storefront persona');
    }
    return this._billing;
  }

  get notifications(): NotificationsResource {
    if (!this._notifications) {
      throw new Error('notifications is only available with the storefront persona');
    }
    return this._notifications;
  }

  // ── Shared methods ───────────────────────────────────────────────

  async getSkill(): Promise<ParsedSkill> {
    if (!this.skillPromise) {
      this.skillPromise = fetchSkillMd({
        version: this.version,
        persona: this.persona,
        baseUrl: this.adapter.baseUrl,
      })
        .then((content) => parseSkillMd(content))
        .catch((err) => {
          this.skillPromise = null;
          throw err;
        });
    }
    return this.skillPromise;
  }

  get baseUrl(): string {
    return this.adapter.baseUrl;
  }

  get debug(): boolean {
    return this.adapter.debug;
  }
}
