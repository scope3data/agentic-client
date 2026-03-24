/**
 * Scope3 SDK - REST and MCP client for the Agentic Platform
 *
 * Supports 2 personas: buyer and partner.
 *
 * @example
 * ```typescript
 * import { Scope3Client } from 'scope3';
 *
 * // Buyer persona
 * const buyer = new Scope3Client({ apiKey: 'sk_xxx', persona: 'buyer' });
 * const advertisers = await buyer.advertisers.list();
 *
 * // Partner persona
 * const partner = new Scope3Client({ apiKey: 'sk_xxx', persona: 'partner' });
 * const partners = await partner.partners.list();
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
  AgentsResource,
  BundlesResource,
  BundleProductsResource,
  CampaignsResource,
  ConversionEventsResource,
  CreativeSetsResource,
  PartnersResource,
  ReportingResource,
  SalesAgentsResource,
  SignalsResource,
  TestCohortsResource,
} from './resources';

// skill.md support
export { fetchSkillMd, parseSkillMd, getBundledSkillMd } from './skill';
export type { ParsedSkill, SkillCommand, SkillParameter, SkillExample } from './skill';

// Webhook server (optional)
export { WebhookServer } from './webhook-server';
export type { WebhookEvent, WebhookHandler, WebhookServerConfig } from './webhook-server';

// Validation
export { validateInput, validateResponse } from './validation';
export type { ValidateMode } from './validation';

// Schemas (auto-generated from OpenAPI spec)
export * from './schemas';

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
  // Linked Brand (resolved from advertiser brandDomain)
  LinkedBrand,
  BrandManifest,
  BrandLogo,
  BrandColors,
  BrandFonts,
  BrandAsset,
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
  CreateDiscoveryCampaignInput,
  UpdateDiscoveryCampaignInput,
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
  ReportingView,
  ReportingParams,
  ReportingMetrics,
  ReportingSummaryResponse,
  ReportingAdvertiser,
  ReportingCampaign,
  ReportingMediaBuy,
  ReportingPackage,
  ReportingTimeseriesResponse,
  ReportingTimeseriesEntry,
  // Sales Agents
  SalesAgent,
  SalesAgentAccount,
  ListSalesAgentsParams,
  RegisterSalesAgentAccountInput,
  // Signals
  Signal,
  DiscoverSignalsInput,
  // Partner
  Partner,
  CreatePartnerInput,
  UpdatePartnerInput,
  ListPartnersParams,
  // Agent
  Agent,
  AgentType,
  AgentStatus,
  AgentAuthenticationType,
  AgentProtocol,
  RegisterAgentInput,
  UpdateAgentInput,
  ListAgentsParams,
  OAuthAuthorizeResponse,
  OAuthCallbackInput,
} from './types';
