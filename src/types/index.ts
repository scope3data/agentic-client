/**
 * Scope3 SDK Types
 */

// ============================================================================
// Core Configuration
// ============================================================================

/** API version supported by the SDK */
export type ApiVersion = 'v1' | 'v2' | 'latest';

/** API persona - determines which API surface to use */
export type Persona = 'buyer' | 'partner';

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
  /** API persona - buyer or partner */
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

/** Input for creating a discovery campaign */
export interface CreateDiscoveryCampaignInput {
  advertiserId: string;
  name: string;
  bundleId: string;
  flightDates: FlightDates;
  budget: Budget;
  productIds?: string[];
  constraints?: CampaignConstraints;
  brief?: string;
}

/** Input for updating a discovery campaign */
export interface UpdateDiscoveryCampaignInput {
  name?: string;
  flightDates?: FlightDates;
  budget?: Budget;
  productIds?: string[];
  constraints?: CampaignConstraints;
  brief?: string;
}

/** Input for creating a performance campaign */
export interface CreatePerformanceCampaignInput {
  advertiserId: string;
  name: string;
  flightDates: FlightDates;
  budget: Budget;
  performanceConfig: PerformanceConfig;
  constraints?: CampaignConstraints;
}

/** Input for updating a performance campaign */
export interface UpdatePerformanceCampaignInput {
  name?: string;
  flightDates?: FlightDates;
  budget?: Budget;
  performanceConfig?: PerformanceConfig;
  constraints?: CampaignConstraints;
}

/** Input for creating an audience campaign (not yet implemented) */
export interface CreateAudienceCampaignInput {
  advertiserId: string;
  name: string;
  flightDates: FlightDates;
  budget: Budget;
  signals?: string[];
  constraints?: CampaignConstraints;
}

export interface ListCampaignsParams extends PaginationParams {
  advertiserId?: string;
  type?: CampaignType;
  status?: CampaignStatus;
}

// ============================================================================
// Bundle Types (Buyer Persona)
// ============================================================================

export interface Bundle {
  bundleId: string;
}

export interface CreateBundleInput {
  advertiserId: string;
  channels?: string[];
  countries?: string[];
  brief?: string;
  budget?: number;
  flightDates?: FlightDates;
  salesAgentIds?: string[];
  salesAgentNames?: string[];
}

/** Parameters for discovering products in a bundle */
export interface DiscoverProductsParams {
  /** Max groups to return (default: 10, max: 50) */
  groupLimit?: number;
  /** Groups to skip for pagination */
  groupOffset?: number;
  /** Products per group (default: 5, max: 50) */
  productsPerGroup?: number;
  /** Products to skip within each group */
  productOffset?: number;
  /** Filter by publisher domain */
  publisherDomain?: string;
  /** Filter by sales agent IDs (comma-separated) */
  salesAgentIds?: string;
  /** Filter by sales agent names (comma-separated) */
  salesAgentNames?: string;
}

/** Response from discover-products endpoint */
export interface DiscoverProductsResponse {
  bundleId: string;
  productGroups: ProductGroup[];
  totalGroups: number;
  hasMoreGroups: boolean;
  summary: ProductSummary;
  budgetContext?: BudgetContext;
}

export interface ProductGroup {
  groupId: string;
  groupName: string;
  products: Product[];
  productCount: number;
  totalProducts: number;
  hasMoreProducts: boolean;
}

export interface Product {
  productId: string;
  name: string;
  publisher: string;
  channel: string;
  cpm: number;
  salesAgentId: string;
  briefRelevance?: string;
}

export interface ProductSummary {
  totalProducts: number;
  publishersCount: number;
  priceRange?: {
    min: number;
    max: number;
    avg: number;
  };
}

export interface BudgetContext {
  sessionBudget: number;
  allocatedBudget: number;
  remainingBudget: number;
}

/** Product selection for adding to a bundle */
export interface BundleProductInput {
  productId: string;
  salesAgentId: string;
  groupId: string;
  groupName: string;
  cpm?: number;
  budget?: number;
}

export interface AddBundleProductsInput {
  products: BundleProductInput[];
}

export interface RemoveBundleProductsInput {
  productIds: string[];
}

export interface BundleProductsResponse {
  bundleId: string;
  products: SelectedBundleProduct[];
  totalProducts: number;
  budgetContext?: BudgetContext;
}

export interface SelectedBundleProduct {
  productId: string;
  salesAgentId: string;
  cpm?: number;
  budget?: number;
  selectedAt: string;
  groupId: string;
  groupName: string;
}

/** Input for browse products without a campaign */
export interface BrowseProductsInput {
  advertiserId: string;
  channels?: string[];
  countries?: string[];
  brief?: string;
  publisherDomain?: string;
  salesAgentIds?: string[];
  salesAgentNames?: string[];
}

// ============================================================================
// Conversion Event Types (Buyer Persona)
// ============================================================================

export type ConversionEventType =
  | 'PURCHASE'
  | 'SIGNUP'
  | 'LEAD'
  | 'PAGE_VIEW'
  | 'ADD_TO_CART'
  | 'CUSTOM';

export interface ConversionEvent {
  id: string;
  name: string;
  type: ConversionEventType;
  description?: string;
  value?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversionEventInput {
  name: string;
  type: ConversionEventType;
  description?: string;
  value?: number;
  currency?: string;
}

export interface UpdateConversionEventInput {
  name?: string;
  value?: number;
  currency?: string;
  description?: string;
}

// ============================================================================
// Creative Set Types (Buyer Persona)
// ============================================================================

export interface CreativeSet {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreativeSetInput {
  name: string;
  type: string;
}

export interface CreativeAsset {
  id: string;
  assetUrl: string;
  name: string;
  type: string;
  duration?: number;
}

export interface CreateCreativeAssetInput {
  assetUrl: string;
  name: string;
  type: string;
  duration?: number;
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
// Sales Agent Types (Buyer Persona)
// ============================================================================

export interface SalesAgent {
  agentId: string;
  type: string;
  name: string;
  description?: string;
  endpointUrl?: string;
  protocol?: string;
  authenticationType?: string;
  accountPolicy?: string[];
  status: string;
  relationship?: string;
  customerAccounts?: SalesAgentAccount[];
  requiresAccount?: boolean;
  authConfigured?: boolean;
  createdAt: string;
}

export interface SalesAgentAccount {
  id?: string;
  accountIdentifier: string;
  status: string;
  registeredBy?: string;
  createdAt?: string;
  oauth?: {
    authorizationUrl: string;
    agentId: string;
    agentName: string;
  };
}

export interface ListSalesAgentsParams {
  status?: string;
  relationship?: string;
  name?: string;
  limit?: number;
  offset?: number;
}

export interface RegisterSalesAgentAccountInput {
  advertiserId: string;
  accountIdentifier: string;
  auth?: {
    type: string;
    token?: string;
  };
  marketplaceAccount?: boolean;
}

// ============================================================================
// Signal Types (Buyer Persona)
// ============================================================================

export interface Signal {
  id: string;
  name: string;
  type: string;
  catalogType?: string;
}

export interface DiscoverSignalsInput {
  filters?: {
    catalogTypes?: string[];
  };
}

// ============================================================================
// Partner Types (Partner Persona)
// ============================================================================

export interface Partner {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerInput {
  name: string;
  description?: string;
}

export interface UpdatePartnerInput {
  name?: string;
  description?: string;
}

export interface ListPartnersParams extends PaginationParams {
  status?: string;
  name?: string;
}

// ============================================================================
// Agent Types (Partner Persona)
// ============================================================================

export type AgentType = 'SALES' | 'SIGNAL' | 'CREATIVE' | 'OUTCOME';
export type AgentStatus = 'PENDING' | 'ACTIVE' | 'DISABLED' | 'COMING_SOON';
export type AgentAuthenticationType = 'API_KEY' | 'NO_AUTH' | 'JWT' | 'OAUTH';
export type AgentProtocol = 'MCP' | 'A2A';

export interface Agent {
  agentId: string;
  type: AgentType;
  name: string;
  description?: string;
  endpointUrl?: string;
  protocol?: AgentProtocol;
  authenticationType?: AgentAuthenticationType;
  accountPolicy?: string[];
  status: AgentStatus;
  relationship?: string;
  customerAccounts?: SalesAgentAccount[];
  requiresAccount?: boolean;
  authConfigured?: boolean;
  customerId?: number;
  reportingType?: string;
  reportingPollingCadence?: string;
  oauth?: {
    authorizationUrl: string;
    agentId: string;
    agentName: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface RegisterAgentInput {
  partnerId: string;
  type: AgentType;
  name: string;
  endpointUrl: string;
  protocol: AgentProtocol;
  accountPolicy: string[];
  authenticationType: AgentAuthenticationType;
  auth?: {
    type: string;
    token?: string;
    privateKey?: string;
  };
  description?: string;
  reportingType?: string;
  reportingPollingCadence?: string;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  endpointUrl?: string;
  protocol?: AgentProtocol;
  accountPolicy?: string[];
  authenticationType?: AgentAuthenticationType;
  auth?: {
    type: string;
    token?: string;
  };
  reportingType?: string;
  reportingPollingCadence?: string;
  status?: string;
}

export interface ListAgentsParams {
  type?: AgentType;
  status?: string;
  relationship?: string;
}

export interface OAuthAuthorizeResponse {
  authorizationUrl: string;
  agentId: string;
  agentName: string;
}

export interface OAuthCallbackInput {
  code: string;
  state: string;
}
