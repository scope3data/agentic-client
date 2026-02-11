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
import { BuyerBrandsResource } from './resources/brands';
import { CampaignsResource } from './resources/campaigns';
import { BundlesResource } from './resources/bundles';
import { SignalsResource } from './resources/signals';
import { BrandBrandsResource } from './resources/brand-brands';
import { PartnerHealthResource } from './resources/partner-health';
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
 * // Brand persona
 * const brandClient = new Scope3Client({ apiKey: 'token', persona: 'brand' });
 * const brands = await brandClient.brands.list();
 *
 * // Partner persona
 * const partnerClient = new Scope3Client({ apiKey: 'token', persona: 'partner' });
 * const health = await partnerClient.health.check();
 * ```
 */
export class Scope3Client {
  // Buyer persona resources
  private _advertisers?: AdvertisersResource;
  private _buyerBrands?: BuyerBrandsResource;
  private _campaigns?: CampaignsResource;
  private _bundles?: BundlesResource;
  private _signals?: SignalsResource;

  // Brand persona resources
  private _brandBrands?: BrandBrandsResource;

  // Partner persona resources
  private _health?: PartnerHealthResource;

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
      throw new Error('persona is required (buyer, brand, or partner)');
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
        this._buyerBrands = new BuyerBrandsResource(this.adapter);
        this._campaigns = new CampaignsResource(this.adapter);
        this._bundles = new BundlesResource(this.adapter);
        this._signals = new SignalsResource(this.adapter);
        break;
      case 'brand':
        this._brandBrands = new BrandBrandsResource(this.adapter);
        break;
      case 'partner':
        this._health = new PartnerHealthResource(this.adapter);
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

  /** Brand listing for buyers (buyer persona) */
  get buyerBrands(): BuyerBrandsResource {
    if (!this._buyerBrands) {
      throw new Error('buyerBrands is only available with the buyer persona');
    }
    return this._buyerBrands;
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

  // ── Brand persona resources ──────────────────────────────────────

  /** Brand identity management (brand persona) */
  get brands(): BrandBrandsResource {
    if (!this._brandBrands) {
      throw new Error('brands is only available with the brand persona');
    }
    return this._brandBrands;
  }

  // ── Partner persona resources ────────────────────────────────────

  /** Health check (partner persona) */
  get health(): PartnerHealthResource {
    if (!this._health) {
      throw new Error('health is only available with the partner persona');
    }
    return this._health;
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
