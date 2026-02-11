/**
 * Scope3 SDK Types
 */

// ============================================================================
// Core Configuration
// ============================================================================

/** API version supported by the SDK */
export type ApiVersion = 'v1' | 'v2' | 'latest';

/** API persona - determines which API surface to use */
export type Persona = 'buyer' | 'brand' | 'partner';

/** Environment for API endpoints */
export type Environment = 'production' | 'staging';

/** Adapter type for communication protocol */
export type AdapterType = 'rest' | 'mcp';

/**
 * Configuration for Scope3Client
 */
export interface Scope3ClientConfig {
  /** API key (Bearer token) for authentication */
  apiKey: string;
  /** API persona - buyer, brand, or partner */
  persona: Persona;
  /** API version to use (default: 'v2') */
  version?: ApiVersion;
  /** Environment (default: 'production') */
  environment?: Environment;
  /** Custom base URL (overrides environment) */
  baseUrl?: string;
  /** Adapter type: 'rest' for HTTP, 'mcp' for AI agents (default: 'rest') */
  adapter?: AdapterType;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
  /** Enable debug logging */
  debug?: boolean;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdvertiserInput {
  name: string;
  description?: string;
}

export interface UpdateAdvertiserInput {
  name?: string;
  description?: string;
}

export interface ListAdvertisersParams extends PaginationParams {
  status?: AdvertiserStatus;
  name?: string;
}

// ============================================================================
// Brand Types (Brand Persona - standalone)
// ============================================================================

export interface Brand {
  id: string;
  name: string;
  manifestUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandInput {
  manifestUrl?: string;
  manifestJson?: BrandManifest;
}

export interface UpdateBrandInput {
  manifestUrl?: string;
  manifestJson?: BrandManifest;
}

export interface ListBrandsParams extends PaginationParams {
  status?: string;
  name?: string;
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
// Buyer Linked Brand Types (brand linked to advertiser)
// ============================================================================

export interface LinkedBrand {
  brandId: string;
  advertiserId: string;
  brand?: Brand;
}

export interface LinkBrandInput {
  brandId: string;
}

// ============================================================================
// Campaign Types (Buyer Persona)
// ============================================================================

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
export type CampaignType = 'bundle' | 'performance' | 'audience';
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

/** Input for creating a bundle campaign */
export interface CreateBundleCampaignInput {
  advertiserId: string;
  name: string;
  bundleId: string;
  flightDates: FlightDates;
  budget: Budget;
  productIds?: string[];
  constraints?: CampaignConstraints;
  brief?: string;
}

/** Input for updating a bundle campaign */
export interface UpdateBundleCampaignInput {
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
}

/** Parameters for discovering products in a bundle */
export interface DiscoverProductsParams {
  /** Max groups to return (default: 10, max: 50) */
  groupLimit?: number;
  /** Groups to skip for pagination */
  groupOffset?: number;
  /** Products per group (default: 5, max: 50) */
  productsPerGroup?: number;
  /** Filter by publisher domain */
  publisherDomain?: string;
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
}

export interface Product {
  productId: string;
  name: string;
  publisher: string;
  channel: string;
  cpm: number;
  salesAgentId: string;
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

export interface ReportingParams {
  days?: number;
  startDate?: string;
  endDate?: string;
  campaignId?: string;
  mediaBuyId?: string;
}

export interface ReportingResponse {
  dailyMetrics: DailyMetric[];
  totals: MetricTotals;
  periodStart: string;
  periodEnd: string;
}

export interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
}

export interface MetricTotals {
  impressions: number;
  clicks: number;
  spend: number;
}

// ============================================================================
// Media Buy Types (Buyer Persona)
// ============================================================================

export interface MediaBuy {
  id: string;
  campaignId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListMediaBuysParams extends PaginationParams {
  campaignId?: string;
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
// Partner Types
// ============================================================================

export interface HealthCheckResponse {
  status: string;
  version: string;
  apiVersion: string;
  timestamp: string;
}
