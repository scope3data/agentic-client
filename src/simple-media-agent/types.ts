import type { MediaBuyProduct } from '../resources/media-buys';

export interface SimpleMediaAgentConfig {
  scope3ApiKey: string;
  scope3BaseUrl?: string;
  minDailyBudget?: number;
  overallocationPercent?: number;
  name?: string;
  version?: string;
}

// MediaBuyAllocation uses MediaBuyProduct from the ADCP client library
export type MediaBuyAllocation = MediaBuyProduct;

export interface ProposedTactic {
  tacticId: string;
  execution: string;
  budgetCapacity: number;
  pricing: {
    method: string;
    estimatedCpm: number;
    currency: string;
  };
  sku: string;
}
