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
  AccountsResource,
  AdvertisersResource,
  AuditLogsResource,
  BuyerBillingResource,
  CampaignsResource,
  CreativesResource,
  DiscoveryResource,
  ModerationResource,
  NotificationPreferencesResource,
  PlanningBriefsResource,
  ReportingResource,
  StorefrontsResource,
  TestCohortsResource,
  EventSourcesResource,
  MeasurementDataResource,
  CatalogsResource,
  AudiencesResource,
  SyndicationResource,
  TasksResource,
  PropertyListsResource,
  PropertyListChecksResource,
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
  // Linked Brand
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
  CreateCampaignInput,
  UpdateCampaignInput,
  ListCampaignsParams,
  AutoSelectProductsResult,
  CampaignProductEntry,
  CampaignProductsResult,
  CampaignMediaBuyStatus,
  MediaBuyStatusValue,
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
  // Event Sources
  EventSource,
  CreateEventSourceInput,
  UpdateEventSourceInput,
  // Measurement Data
  MeasurementDataSync,
  MeasurementConfig,
  UpdateMeasurementConfigInput,
  MeasurementSource,
  CreateMeasurementSourceInput,
  UpdateMeasurementSourceInput,
  UploadMeasurementRecordsInput,
  UploadContextRecordsInput,
  MeasurementFreshness,
  // Catalogs
  Catalog,
  CatalogSync,
  // Audiences
  Audience,
  AudienceSync,
  // Syndication
  SyndicationRequest,
  SyndicationStatus,
  // Creatives
  Creative,
  CreateCreativeInput,
  UpdateCreativeInput,
  // Tasks
  Task,
  // Property Lists
  PropertyList,
  CreatePropertyListInput,
  UpdatePropertyListInput,
  PropertyListCheck,
  PropertyListReport,
  // Discovery
  DiscoverProductsInput,
  DiscoveryProduct,
  AddProductsInput,
  RemoveProductsInput,
  ApplyProposalInput,
  // Accounts
  Account,
  CreateChildAccountInput,
  UpdateDomainInput,
  MembershipSettings,
  UpdateMembershipInput,
  // Notification Preferences
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
  // Moderation
  ModerationCheckInput,
  ModerationCheckResult,
  // Storefronts (buyer browsing)
  BuyerStorefront,
  StorefrontCredential,
  RegisterCredentialsInput,
  // Audit Logs
  AuditLog,
  ListAuditLogsParams,
  // Planning Briefs
  PlanningBrief,
  CreatePlanningBriefInput,
  PlanningBriefResponse,
  // Buyer Billing
  BuyerInvoice,
  BuyerPendingInvoiceItem,
  // Event Summary
  EventSummary,
  LogEventInput,
} from './types';
