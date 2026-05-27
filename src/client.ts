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
import { ReportingResource } from './resources/reporting';
import { TasksResource } from './resources/tasks';
import { PropertyListChecksResource } from './resources/property-lists';
import { DiscoveryResource } from './resources/discovery';
import { AccountsResource } from './resources/accounts';
import { NotificationPreferencesResource } from './resources/notification-preferences';
import { ModerationResource } from './resources/moderation';
import { StorefrontsResource } from './resources/storefronts';
import { AuditLogsResource } from './resources/audit-logs';
import { PlanningBriefsResource } from './resources/planning-briefs';
import { BuyerBillingResource } from './resources/billing';
import { fetchSkillMd, parseSkillMd, ParsedSkill } from './skill';

/**
 * REST client for interacting with the Scope3 Agentic Platform.
 * Provides typed resource methods for each API surface.
 *
 * @example
 * ```typescript
 * const client = new Scope3Client({ apiKey: 'token', persona: 'buyer' });
 * const advertisers = await client.advertisers.list();
 * ```
 */
export class Scope3Client {
  private readonly _advertisers: AdvertisersResource;
  private readonly _campaigns: CampaignsResource;
  private readonly _reporting: ReportingResource;
  private readonly _tasks: TasksResource;
  private readonly _propertyListChecks: PropertyListChecksResource;
  private readonly _discovery: DiscoveryResource;
  private readonly _accounts: AccountsResource;
  private readonly _notificationPreferences: NotificationPreferencesResource;
  private readonly _moderation: ModerationResource;
  private readonly _storefronts: StorefrontsResource;
  private readonly _auditLogs: AuditLogsResource;
  private readonly _planningBriefs: PlanningBriefsResource;
  private readonly _billing: BuyerBillingResource;

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

    this._advertisers = new AdvertisersResource(this.adapter);
    this._campaigns = new CampaignsResource(this.adapter);
    this._reporting = new ReportingResource(this.adapter);
    this._tasks = new TasksResource(this.adapter);
    this._propertyListChecks = new PropertyListChecksResource(this.adapter);
    this._discovery = new DiscoveryResource(this.adapter);
    this._accounts = new AccountsResource(this.adapter);
    this._notificationPreferences = new NotificationPreferencesResource(this.adapter);
    this._moderation = new ModerationResource(this.adapter);
    this._storefronts = new StorefrontsResource(this.adapter);
    this._auditLogs = new AuditLogsResource(this.adapter);
    this._planningBriefs = new PlanningBriefsResource(this.adapter);
    this._billing = new BuyerBillingResource(this.adapter);
  }

  get advertisers(): AdvertisersResource {
    return this._advertisers;
  }

  get campaigns(): CampaignsResource {
    return this._campaigns;
  }

  get reporting(): ReportingResource {
    return this._reporting;
  }

  get tasks(): TasksResource {
    return this._tasks;
  }

  get propertyListChecks(): PropertyListChecksResource {
    return this._propertyListChecks;
  }

  get discovery(): DiscoveryResource {
    return this._discovery;
  }

  get accounts(): AccountsResource {
    return this._accounts;
  }

  get notificationPreferences(): NotificationPreferencesResource {
    return this._notificationPreferences;
  }

  get moderation(): ModerationResource {
    return this._moderation;
  }

  get storefronts(): StorefrontsResource {
    return this._storefronts;
  }

  get auditLogs(): AuditLogsResource {
    return this._auditLogs;
  }

  get planningBriefs(): PlanningBriefsResource {
    return this._planningBriefs;
  }

  get billing(): BuyerBillingResource {
    return this._billing;
  }

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
