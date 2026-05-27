/**
 * Scope3 SDK Types
 */

// ============================================================================
// Core Configuration
// ============================================================================

/** API version supported by the SDK */
export type ApiVersion = 'v1' | 'v2' | 'latest';

/** API persona - determines which API surface to use */
export type Persona = 'buyer' | 'storefront';

/** Environment for API endpoints */
export type Environment = 'production' | 'staging';

/**
 * Configuration for Scope3Client (REST client)
 *
 * For MCP consumers, use Scope3McpClient with Scope3McpClientConfig instead.
 */
export interface Scope3ClientConfig {
  /** API key (Bearer token) for authentication */
  apiKey: string;
  /** API persona - buyer or storefront */
  persona: Persona;
  /** API version to use (default: 'v2') */
  version?: ApiVersion;
  /** Environment (default: 'production') */
  environment?: Environment;
  /** Custom base URL (overrides environment) */
  baseUrl?: string;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Enable runtime validation with Zod schemas (default: true). Set false to disable. */
  validate?: boolean | 'input' | 'response';
}

// ============================================================================
// API Response Wrappers
// ============================================================================

/**
 * Standard API response envelope
 */
export interface ApiResponse<T> {
  data: T;
  error?: ApiErrorResponse;
}

/**
 * Paginated API response envelope
 */
export interface PaginatedApiResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  error?: ApiErrorResponse;
}

/**
 * Pagination metadata from API
 */
export interface PaginationInfo {
  total: number;
  take: number;
  skip: number;
  hasMore: boolean;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  /** Maximum number of results (default: 50, max: 250) */
  take?: number;
  /** Number of results to skip */
  skip?: number;
}

// ============================================================================
// Advertiser Types (Buyer Persona)
// ============================================================================

export type AdvertiserStatus = 'ACTIVE' | 'ARCHIVED';

export interface Advertiser {
  id: string;
  name: string;
  description?: string;
  status: AdvertiserStatus;
  brandDomain?: string;
  brandWarning?: string;
  linkedBrand?: LinkedBrand;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdvertiserInput {
  name: string;
  brandDomain: string;
  description?: string;
}

export interface UpdateAdvertiserInput {
  name?: string;
  description?: string;
  brandDomain?: string;
}

export interface ListAdvertisersParams extends PaginationParams {
  status?: AdvertiserStatus;
  name?: string;
  /** Include resolved brand information for each advertiser */
  includeBrand?: boolean;
}

// ============================================================================
// Linked Brand Types (brand resolved from advertiser's brandDomain)
// ============================================================================

export interface LinkedBrand {
  id: string;
  name: string;
  domain: string;
  manifest?: BrandManifest;
  logoUrl?: string;
  industry?: string;
  colors?: BrandColors;
  tagline?: string;
  tone?: string;
}

/**
 * Brand manifest document (ADCP v2)
 */
export interface BrandManifest {
  name: string;
  url?: string;
  logos?: BrandLogo[];
  colors?: BrandColors;
  fonts?: BrandFonts;
  tone?: string;
  tagline?: string;
  assets?: BrandAsset[];
  product_catalog?: Record<string, unknown>;
  disclaimers?: string[];
  industry?: string;
  target_audience?: string;
  contact?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface BrandLogo {
  url: string;
  tags?: string[];
  width?: number;
  height?: number;
}

export interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
}

export interface BrandFonts {
  primary?: string;
  secondary?: string;
  font_urls?: string[];
}

export interface BrandAsset {
  url: string;
  type: string;
  name?: string;
}

// ============================================================================
// Campaign Types (Buyer Persona)
// ============================================================================

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
export type CampaignType = 'discovery' | 'performance' | 'audience';
export type BudgetPacing = 'EVEN' | 'ASAP' | 'FRONTLOADED';
export type PerformanceObjective = 'ROAS' | 'CONVERSIONS' | 'LEADS' | 'SALES';

export interface FlightDates {
  startDate: string;
  endDate: string;
}

export interface Budget {
  total: number;
  currency?: string;
  dailyCap?: number;
  pacing?: BudgetPacing;
}

export interface CampaignConstraints {
  channels?: string[];
  countries?: string[];
}

export interface PerformanceConfig {
  objective: PerformanceObjective;
  goals?: {
    targetRoas?: number;
  };
}

export interface Campaign {
  id: string;
  advertiserId: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  flightDates: FlightDates;
  budget: Budget;
  brief?: string;
  constraints?: CampaignConstraints;
  bundleId?: string;
  performanceConfig?: PerformanceConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignInput {
  advertiserId: string;
  name: string;
  type: CampaignType;
  flightDates: FlightDates;
  budget: Budget;
  brief?: string;
  constraints?: CampaignConstraints;
  performanceConfig?: PerformanceConfig;
}

export interface UpdateCampaignInput {
  name?: string;
  type?: CampaignType;
  flightDates?: FlightDates;
  budget?: Budget;
  brief?: string;
  constraints?: CampaignConstraints;
  performanceConfig?: PerformanceConfig;
}

export interface ListCampaignsParams extends PaginationParams {
  advertiserId?: string;
  type?: CampaignType;
  status?: CampaignStatus;
}

export type RefinementItem =
  | { scope: 'request'; ask: string }
  | { scope: 'product'; id: string; action: 'include' | 'omit' | 'moreLikeThis'; ask?: string };

export interface AutoSelectProductsResult {
  campaignId: string;
  discoveryId: string;
  selectedProducts: Array<{
    productId: string;
    name: string;
    salesAgentId: string;
    groupId: string;
    groupName: string;
    cpm?: number;
    budget: number;
    pricingOptionId?: string;
  }>;
  budgetContext: {
    campaignBudget: number;
    totalAllocated: number;
    remainingBudget: number;
    currency: string;
  };
  productCount: number;
  previouslySelectedCount?: number;
}

export interface CampaignProductEntry {
  productId: string;
  productName?: string;
  salesAgentId: string;
  salesAgentName?: string;
  publisherDomain?: string;
  publisherName?: string;
  bidPrice?: number;
  budget?: number;
  pricingOptionId?: string;
  pricingModel?: string;
  selectedAt: string;
  searchContext?: { id: string; brief: string };
  mediaBuys: Array<{ MediaBuyId: string; Status: string; name: string }>;
}

export interface CampaignProductsResult {
  campaignId: string;
  discoveryId: string | null;
  products: CampaignProductEntry[];
  searchContexts: Array<{
    id: string;
    brief: string;
    channels: string[];
    countries: string[];
    createdAt: string;
    productCount: number;
  }>;
  summary: {
    totalProducts: number;
    productsOnMediaBuys: number;
    productsPending: number;
  };
}

export type MediaBuyStatusValue =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'INPUT_REQUIRED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELED'
  | 'FAILED'
  | 'REJECTED'
  | 'ARCHIVED';

export interface CampaignMediaBuyStatus {
  campaign_id: string;
  media_buys: Array<{
    media_buy_id: string;
    adcp_media_buy_id: string;
    internal_status: string;
    adcp_status: string | null;
    previous_internal_status: string;
    previous_adcp_status: string | null;
    updated: boolean;
  }>;
  agents_queried: number;
  errors: Array<{ media_buy_id: string; error: string }>;
}

// ============================================================================
// Test Cohort Types (Buyer Persona)
// ============================================================================

export interface TestCohort {
  id: string;
  name: string;
  description?: string;
  splitPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestCohortInput {
  name: string;
  description?: string;
  splitPercentage: number;
}

export interface UpdateTestCohortInput {
  name?: string;
  description?: string;
  splitPercentage?: number;
}

// ============================================================================
// Reporting Types (Buyer Persona)
// ============================================================================

export type ReportingView = 'summary' | 'timeseries';

export interface ReportingParams {
  /** Response format: summary (hierarchical) or timeseries (daily) */
  view?: ReportingView;
  /** Number of days to include (default: 7, max: 90) */
  days?: number;
  startDate?: string;
  endDate?: string;
  advertiserId?: string;
  campaignId?: string;
  /** Return demo data instead of real data */
  demo?: boolean;
}

export interface ReportingMetrics {
  impressions: number;
  spend: number;
  clicks: number;
  views: number;
  completedViews: number;
  conversions: number;
  leads: number;
  videoCompletions: number;
  ecpm: number;
  cpc: number;
  ctr: number;
  completionRate: number;
}

export interface ReportingSummaryResponse {
  advertisers: ReportingAdvertiser[];
  totals: Partial<ReportingMetrics>;
  periodStart: string;
  periodEnd: string;
}

export interface ReportingAdvertiser {
  advertiserId: string;
  advertiserName: string;
  metrics: Partial<ReportingMetrics>;
  campaigns: ReportingCampaign[];
}

export interface ReportingCampaign {
  campaignId: string;
  campaignName: string;
  metrics: Partial<ReportingMetrics>;
  mediaBuys: ReportingMediaBuy[];
}

export interface ReportingMediaBuy {
  mediaBuyId: string;
  name: string;
  status: string;
  metrics: Partial<ReportingMetrics>;
  packages: ReportingPackage[];
}

export interface ReportingPackage {
  packageId: string;
  metrics: Partial<ReportingMetrics>;
}

export interface ReportingTimeseriesResponse {
  timeseries: ReportingTimeseriesEntry[];
  totals: Partial<ReportingMetrics>;
  periodStart: string;
  periodEnd: string;
}

export interface ReportingTimeseriesEntry {
  date: string;
  metrics: Partial<ReportingMetrics>;
}

// ============================================================================
// Event Source Types (Buyer Persona)
// ============================================================================

export interface EventSource {
  id: string;
  advertiserId: string;
  name: string;
  type: string;
  status: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventSourceInput {
  name: string;
  type: string;
  config?: Record<string, unknown>;
}

export interface UpdateEventSourceInput {
  name?: string;
  type?: string;
  config?: Record<string, unknown>;
}

// ============================================================================
// Measurement Data Types (Buyer Persona)
// ============================================================================

export interface MeasurementDataSync {
  type?: string;
  source?: string;
  data?: Record<string, unknown>;
  measurements?: Record<string, unknown>[];
  [key: string]: unknown;
}

// ============================================================================
// Catalog Types (Buyer Persona)
// ============================================================================

export interface Catalog {
  id: string;
  advertiserId: string;
  name: string;
  status: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogSync {
  source?: string;
  data?: Record<string, unknown>;
  catalogs?: Record<string, unknown>[];
  [key: string]: unknown;
}

// ============================================================================
// Audience Types (Buyer Persona)
// ============================================================================

export interface Audience {
  id: string;
  advertiserId: string;
  name: string;
  size: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceSync {
  source?: string;
  data?: Record<string, unknown>;
  audiences?: Record<string, unknown>[];
  [key: string]: unknown;
}

// ============================================================================
// Syndication Types (Buyer Persona)
// ============================================================================

export interface SyndicationRequest {
  targets?: string[];
  resourceType?: string;
  resourceId?: string;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SyndicationStatus {
  id: string;
  status: string;
  targets: string[];
  createdAt: string;
}

// ============================================================================
// Creative Types (Buyer Persona)
// ============================================================================

export interface Creative {
  id: string;
  campaignId: string;
  name: string;
  type: string;
  status: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreativeInput {
  name: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateCreativeInput {
  name?: string;
  type?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Task Types (Buyer Persona)
// ============================================================================

export interface Task {
  id: string;
  type: string;
  status: string;
  progress?: number;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Property List Types (Buyer Persona)
// ============================================================================

export interface PropertyList {
  id: string;
  advertiserId: string;
  name: string;
  properties: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyListInput {
  name: string;
  properties?: string[];
  purpose?: string;
  [key: string]: unknown;
}

export interface UpdatePropertyListInput {
  name?: string;
  properties?: string[];
}

export interface PropertyListCheck {
  id: string;
  status: string;
  results?: Record<string, unknown>;
  createdAt: string;
}

export interface PropertyListReport {
  id: string;
  checkId: string;
  data: Record<string, unknown>;
  createdAt: string;
}

// ============================================================================
// Discovery Types (Buyer Persona)
// ============================================================================

export interface DiscoverProductsInput {
  advertiserId: string;
  channels?: string[];
  brief?: string;
  budget?: number;
  [key: string]: unknown;
}

export interface DiscoveryProduct {
  productId: string;
  name: string;
  publisher: string;
  channel: string;
  cpm: number;
  [key: string]: unknown;
}

export interface AddProductsInput {
  products: Array<{ productId: string; [key: string]: unknown }>;
}

export interface RemoveProductsInput {
  productIds: string[];
}

export interface ApplyProposalInput {
  proposalId: string;
  [key: string]: unknown;
}

// ============================================================================
// Account Types (Buyer Persona)
// ============================================================================

export interface Account {
  id: string;
  name: string;
  domain?: string;
  parentId?: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface CreateChildAccountInput {
  name: string;
  domain?: string;
  [key: string]: unknown;
}

export interface UpdateDomainInput {
  domain: string;
}

export interface MembershipSettings {
  [key: string]: unknown;
}

export interface UpdateMembershipInput {
  [key: string]: unknown;
}

// ============================================================================
// Notification Preferences Types (Buyer Persona)
// ============================================================================

export interface NotificationPreferences {
  [key: string]: unknown;
}

export interface UpdateNotificationPreferencesInput {
  [key: string]: unknown;
}

// ============================================================================
// Moderation Types (Buyer Persona)
// ============================================================================

export interface ModerationCheckInput {
  content: string;
  [key: string]: unknown;
}

export interface ModerationCheckResult {
  passed: boolean;
  [key: string]: unknown;
}

// ============================================================================
// Buyer Storefront Types (Buyer Persona)
// ============================================================================

export interface BuyerStorefront {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface StorefrontCredential {
  [key: string]: unknown;
}

export interface RegisterCredentialsInput {
  [key: string]: unknown;
}

// ============================================================================
// Audit Log Types (Buyer Persona)
// ============================================================================

export interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface ListAuditLogsParams extends PaginationParams {
  resourceType?: string;
  action?: string;
}

// ============================================================================
// Planning Brief Types (Buyer Persona)
// ============================================================================

export interface PlanningBrief {
  id: string;
  status: string;
  brief: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface CreatePlanningBriefInput {
  brief: string;
  [key: string]: unknown;
}

export interface PlanningBriefResponse {
  id: string;
  briefId: string;
  [key: string]: unknown;
}

// ============================================================================
// Buyer Billing Types (Buyer Persona)
// ============================================================================

export interface BuyerInvoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface BuyerPendingInvoiceItem {
  id: string;
  amount: number;
  description: string;
  [key: string]: unknown;
}

// ============================================================================
// Measurement Types (Buyer Persona)
// ============================================================================

export interface MeasurementConfig {
  [key: string]: unknown;
}

export interface UpdateMeasurementConfigInput {
  [key: string]: unknown;
}

export interface MeasurementSource {
  id: string;
  [key: string]: unknown;
}

export interface CreateMeasurementSourceInput {
  [key: string]: unknown;
}

export interface UpdateMeasurementSourceInput {
  [key: string]: unknown;
}

export interface UploadMeasurementRecordsInput {
  [key: string]: unknown;
}

export interface UploadContextRecordsInput {
  [key: string]: unknown;
}

export interface MeasurementFreshness {
  [key: string]: unknown;
}

// ============================================================================
// Event Summary Types (Buyer Persona)
// ============================================================================

export interface EventSummary {
  [key: string]: unknown;
}

export interface LogEventInput {
  events: Array<Record<string, unknown>>;
  [key: string]: unknown;
}
