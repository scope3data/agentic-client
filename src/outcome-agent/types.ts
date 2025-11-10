/**
 * Types for Outcome Agent API
 * Based on Scope3 Outcome Agent Protocol Specification
 */

// Request/Response types for /get-proposals endpoint

export interface GetProposalsRequest {
  campaignId: string;
  seatId: string;
  budgetRange?: BudgetRange;
  startDate?: string; // ISO 8601 UTC
  endDate?: string; // ISO 8601 UTC
  channels?: Channel[];
  countries?: string[]; // ISO 3166-1 alpha-2
  brief?: string;
  products?: Product[];
  propertyListIds?: number[];
}

export interface BudgetRange {
  min?: number;
  max?: number;
  currency?: string; // ISO 4217, default USD
}

export type Channel = 'display' | 'video' | 'native' | 'audio' | 'connected_tv';

export interface Product {
  sales_agent_url?: string;
  product_ref?: string;
  pricing_option_id?: string;
  // Additional fields from the sales agent response
  floor_price?: number;
  floor_price_currency?: string;
  name?: string;
  description?: string;
  targeting?: {
    countries?: string[];
    channels?: Channel[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface GetProposalsResponse {
  proposals: Proposal[];
}

export interface Proposal {
  proposalId: string;
  execution: string;
  budgetCapacity: number;
  pricing: ProposalPricing;
  sku: string;
  customFieldsRequired?: CustomFieldDefinition[];
  additional_info?: Record<string, unknown>;
}

export interface ProposalPricing {
  method: 'revshare' | 'cost_per_unit';
  rate: number;
  unit?: 'cpm' | 'cpc' | 'cpa' | 'cpv' | 'cpcv';
  currency?: string; // ISO 4217, default USD
}

export interface CustomFieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required?: boolean;
  description?: string;
  [key: string]: unknown;
}

// Request/Response types for /accept-proposal endpoint

export interface AcceptProposalRequest {
  tacticId: string;
  proposalId?: string;
  campaignContext: CampaignContext;
  brandAgentId: string;
  seatId: string;
  customFields?: Record<string, unknown>;
  additional_info?: Record<string, unknown>;
}

export interface CampaignContext {
  budget: number;
  budgetCurrency?: string; // ISO 4217, default USD
  startDate: string; // ISO 8601 UTC
  endDate: string; // ISO 8601 UTC
  channel: Channel;
  countries?: string[]; // ISO 3166-1 alpha-2
  creatives?: Creative[];
  brandStandards?: BrandStandard[];
  [key: string]: unknown;
}

export interface Creative {
  creativeId?: string;
  assetUrl?: string;
  format?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  [key: string]: unknown;
}

export interface BrandStandard {
  type?: string;
  value?: unknown;
  [key: string]: unknown;
}

export interface AcceptProposalResponse {
  acknowledged: boolean;
  reason?: string; // Required if acknowledged is false
}

// Configuration for OutcomeAgent

export interface OutcomeAgentConfig {
  scope3ApiKey: string;
  scope3BaseUrl?: string;
  name?: string;
  version?: string;
}
