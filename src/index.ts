/**
 * Scope3 SDK - REST and MCP client for the Agentic Platform
 *
 * Supports 3 personas: buyer, brand, and partner.
 *
 * @example
 * ```typescript
 * import { Scope3Client } from 'scope3';
 *
 * // Buyer persona
 * const buyer = new Scope3Client({ apiKey: 'sk_xxx', persona: 'buyer' });
 * const advertisers = await buyer.advertisers.list();
 *
 * // Brand persona
 * const brand = new Scope3Client({ apiKey: 'sk_xxx', persona: 'brand' });
 * const brands = await brand.brands.list();
 *
 * // Partner persona
 * const partner = new Scope3Client({ apiKey: 'sk_xxx', persona: 'partner' });
 * const health = await partner.health.check();
 * ```
 */

// Main client
export { Scope3Client } from './client';

// Adapters
export { RestAdapter } from './adapters/rest';
export { McpAdapter } from './adapters/mcp';
export { Scope3ApiError } from './adapters/base';
export type { BaseAdapter } from './adapters/base';

// Resources
export {
  AdvertisersResource,
  BuyerBrandsResource,
  BuyerLinkedBrandResource,
  BrandBrandsResource,
  BundlesResource,
  BundleProductsResource,
  CampaignsResource,
  ConversionEventsResource,
  CreativeSetsResource,
  MediaBuysResource,
  PartnerHealthResource,
  ReportingResource,
  SignalsResource,
  TestCohortsResource,
} from './resources';

// skill.md support
export { fetchSkillMd, parseSkillMd, getBundledSkillMd } from './skill';
export type { ParsedSkill, SkillCommand, SkillParameter, SkillExample } from './skill';

// Webhook server (optional)
export { WebhookServer } from './webhook-server';
export type { WebhookEvent, WebhookHandler, WebhookServerConfig } from './webhook-server';

// Types
export type {
  // Config
  Scope3ClientConfig,
  ApiVersion,
  Persona,
  Environment,
  AdapterType,
  // API Response Wrappers
  ApiResponse,
  PaginatedApiResponse,
  PaginationInfo,
  ApiErrorResponse,
  // Pagination
  PaginationParams,
  // Advertiser
  Advertiser,
  AdvertiserStatus,
  CreateAdvertiserInput,
  UpdateAdvertiserInput,
  ListAdvertisersParams,
  // Brand (standalone - brand persona)
  Brand,
  CreateBrandInput,
  UpdateBrandInput,
  ListBrandsParams,
  BrandManifest,
  BrandLogo,
  BrandColors,
  BrandFonts,
  BrandAsset,
  // Linked Brand (buyer persona)
  LinkedBrand,
  LinkBrandInput,
  // Campaign
  Campaign,
  CampaignStatus,
  CampaignType,
  FlightDates,
  Budget,
  BudgetPacing,
  CampaignConstraints,
  PerformanceObjective,
  PerformanceConfig,
  CreateBundleCampaignInput,
  UpdateBundleCampaignInput,
  CreatePerformanceCampaignInput,
  UpdatePerformanceCampaignInput,
  CreateAudienceCampaignInput,
  ListCampaignsParams,
  // Bundle
  Bundle,
  CreateBundleInput,
  DiscoverProductsParams,
  DiscoverProductsResponse,
  ProductGroup,
  Product,
  ProductSummary,
  BudgetContext,
  BundleProductInput,
  AddBundleProductsInput,
  RemoveBundleProductsInput,
  BundleProductsResponse,
  SelectedBundleProduct,
  BrowseProductsInput,
  // Conversion Events
  ConversionEvent,
  ConversionEventType,
  CreateConversionEventInput,
  UpdateConversionEventInput,
  // Creative Sets
  CreativeSet,
  CreateCreativeSetInput,
  CreativeAsset,
  CreateCreativeAssetInput,
  // Test Cohorts
  TestCohort,
  CreateTestCohortInput,
  // Reporting
  ReportingParams,
  ReportingResponse,
  DailyMetric,
  MetricTotals,
  // Media Buys
  MediaBuy,
  ListMediaBuysParams,
  // Signals
  Signal,
  DiscoverSignalsInput,
  // Partner
  HealthCheckResponse,
} from './types';
