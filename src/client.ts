/**
 * Scope3Client - Unified client for the Scope3 Agentic Platform
 *
 * Supports both REST (for humans/CLI) and MCP (for AI agents) adapters.
 * Requires a persona to determine which API surface to use.
 */

import type { Scope3ClientConfig, ApiVersion, Persona } from './types';
import { BaseAdapter } from './adapters/base';
import { RestAdapter } from './adapters/rest';
import { McpAdapter } from './adapters/mcp';
import { AdvertisersResource } from './resources/advertisers';
import { CampaignsResource } from './resources/campaigns';
import { BundlesResource } from './resources/bundles';
import { SignalsResource } from './resources/signals';
import { ReportingResource } from './resources/reporting';
import { SalesAgentsResource } from './resources/sales-agents';
import { PartnersResource } from './resources/partners';
import { AgentsResource } from './resources/agents';
import { fetchSkillMd, parseSkillMd, ParsedSkill } from './skill';

/**
 * Main client for interacting with the Scope3 Agentic Platform
 *
 * @example
 * ```typescript
 * // Buyer persona
 * const client = new Scope3Client({ apiKey: 'token', persona: 'buyer' });
 * const advertisers = await client.advertisers.list();
 * const bundle = await client.bundles.create({ advertiserId: '123', channels: ['display'] });
 *
 * // Partner persona
 * const partnerClient = new Scope3Client({ apiKey: 'token', persona: 'partner' });
 * const partners = await partnerClient.partners.list();
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

  // Partner persona resources
  private _partners?: PartnersResource;
  private _agents?: AgentsResource;

  /** The adapter used for API communication */
  private readonly adapter: BaseAdapter;

  /** API version being used */
  public readonly version: ApiVersion;

  /** API persona being used */
  public readonly persona: Persona;

  /** Cached parsed skill.md */
  private skillPromise: Promise<ParsedSkill> | null = null;

  constructor(config: Scope3ClientConfig) {
    if (!config.apiKey) {
      throw new Error('apiKey is required');
    }
    if (!config.persona) {
      throw new Error('persona is required (buyer, partner, or storefront)');
    }

    this.version = config.version ?? 'v2';
    this.persona = config.persona;

    // Select adapter based on config
    if (config.adapter === 'mcp') {
      this.adapter = new McpAdapter(config);
    } else {
      this.adapter = new RestAdapter(config);
    }

    // Initialize persona-specific resources
    switch (this.persona) {
      case 'buyer':
        this._advertisers = new AdvertisersResource(this.adapter);
        this._campaigns = new CampaignsResource(this.adapter);
        this._bundles = new BundlesResource(this.adapter);
        this._signals = new SignalsResource(this.adapter);
        this._reporting = new ReportingResource(this.adapter);
        this._salesAgents = new SalesAgentsResource(this.adapter);
        break;
      case 'partner':
        this._partners = new PartnersResource(this.adapter);
        this._agents = new AgentsResource(this.adapter);
        break;
      case 'storefront':
        // Storefront persona: seller/network management via /api/v1
        // Resources will be added as the storefront API stabilizes
        break;
    }
  }

  // ── Buyer persona resources ──────────────────────────────────────

  /** Advertiser management (buyer persona) */
  get advertisers(): AdvertisersResource {
    if (!this._advertisers) {
      throw new Error('advertisers is only available with the buyer persona');
    }
    return this._advertisers;
  }

  /** Campaign management (buyer persona) */
  get campaigns(): CampaignsResource {
    if (!this._campaigns) {
      throw new Error('campaigns is only available with the buyer persona');
    }
    return this._campaigns;
  }

  /** Bundle management for inventory selection (buyer persona) */
  get bundles(): BundlesResource {
    if (!this._bundles) {
      throw new Error('bundles is only available with the buyer persona');
    }
    return this._bundles;
  }

  /** Signal discovery (buyer persona) */
  get signals(): SignalsResource {
    if (!this._signals) {
      throw new Error('signals is only available with the buyer persona');
    }
    return this._signals;
  }

  /** Reporting metrics (buyer persona) */
  get reporting(): ReportingResource {
    if (!this._reporting) {
      throw new Error('reporting is only available with the buyer persona');
    }
    return this._reporting;
  }

  /** Sales agents (buyer persona) */
  get salesAgents(): SalesAgentsResource {
    if (!this._salesAgents) {
      throw new Error('salesAgents is only available with the buyer persona');
    }
    return this._salesAgents;
  }

  // ── Partner persona resources ────────────────────────────────────

  /** Partner management (partner persona) */
  get partners(): PartnersResource {
    if (!this._partners) {
      throw new Error('partners is only available with the partner persona');
    }
    return this._partners;
  }

  /** Agent management (partner persona) */
  get agents(): AgentsResource {
    if (!this._agents) {
      throw new Error('agents is only available with the partner persona');
    }
    return this._agents;
  }

  // ── Shared methods ───────────────────────────────────────────────

  /**
   * Get the parsed skill.md for this persona and API version
   */
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

  /**
   * Connect to the API (required for MCP adapter)
   */
  async connect(): Promise<void> {
    await this.adapter.connect();
  }

  /**
   * Disconnect from the API (for cleanup)
   */
  async disconnect(): Promise<void> {
    await this.adapter.disconnect();
  }

  /** Get the base URL being used */
  get baseUrl(): string {
    return this.adapter.baseUrl;
  }

  /** Check if debug mode is enabled */
  get debug(): boolean {
    return this.adapter.debug;
  }
}
