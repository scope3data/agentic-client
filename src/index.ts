/**
 * Scope3 SDK for the Agentic Platform
 *
 * Two entry points for two audiences:
 *
 * 1. REST consumers (humans, CLI, programmatic) → Scope3Client
 *    Typed resource methods: client.advertisers.list(), client.campaigns.create(), etc.
 *
 * 2. MCP consumers (AI agents) → Scope3McpClient
 *    Thin connection helper: connect, callTool, readResource, listTools.
 *    The MCP server already handles auth, routing, and validation —
 *    this just wires up the connection and gets out of the way.
 *
 * @example
 * ```typescript
 * // REST consumer
 * import { Scope3Client } from 'scope3';
 * const client = new Scope3Client({ apiKey: 'sk_xxx', persona: 'buyer' });
 * const advertisers = await client.advertisers.list();
 *
 * // MCP consumer (AI agent)
 * import { Scope3McpClient } from 'scope3';
 * const mcp = new Scope3McpClient({ apiKey: 'sk_xxx' });
 * await mcp.connect();
 * const result = await mcp.callTool('api_call', { method: 'GET', path: '/api/v2/buyer/advertisers' });
 * ```
 */

// ── Clients ────────────────────────────────────────────────────────

// REST client with typed resource methods
export { Scope3Client } from './client';

// MCP client — thin connection helper for AI agents
export { Scope3McpClient } from './mcp-client';
export type {
  Scope3McpClientConfig,
  CallToolResult,
  ReadResourceResult,
  ListToolsResult,
} from './mcp-client';

// ── REST Adapter (for advanced use) ────────────────────────────────

export { RestAdapter } from './adapters/rest';
export { Scope3ApiError } from './adapters/base';
export type { BaseAdapter } from './adapters/base';

// ── Resources (used by Scope3Client, exported for typing) ──────────

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

// ── skill.md support ───────────────────────────────────────────────

export { fetchSkillMd, parseSkillMd, getBundledSkillMd } from './skill';
export type { ParsedSkill, SkillCommand, SkillParameter, SkillExample } from './skill';

// ── Webhook server ─────────────────────────────────────────────────

export { WebhookServer } from './webhook-server';
export type { WebhookEvent, WebhookHandler, WebhookServerConfig } from './webhook-server';

// ── Validation (Zod schemas for optional client-side validation) ───

export { validateInput, validateResponse } from './validation';
export type { ValidateMode } from './validation';

// Schemas (auto-generated from OpenAPI spec)
export * from './schemas';

// ── Types ──────────────────────────────────────────────────────────

export type {
  // Config
  Scope3ClientConfig,
  ApiVersion,
  Persona,
  Environment,
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
