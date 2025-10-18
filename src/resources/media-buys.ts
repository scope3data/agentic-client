import { Scope3Client } from '../client';
import { ToolResponse } from '../types';
import { Budget } from './campaigns';

export interface MediaBuyProduct {
  mediaProductId: string;
  salesAgentId: string;
  budgetAmount?: number;
  budgetCurrency?: string;
  pricingCpm?: number;
  pricingSignalCost?: number;
  displayOrder?: number;
}

export interface MediaBuyListRequest {
  tacticId?: string;
  campaignId?: string;
  includeArchived?: boolean;
}

export interface MediaBuyCreateRequest {
  tacticId: string;
  name: string;
  description?: string;
  products: MediaBuyProduct[];
  budget: Budget;
  creativeIds?: string[];
}

export interface MediaBuyGetRequest {
  mediaBuyId: string;
}

export interface MediaBuyUpdateRequest {
  mediaBuyId: string;
  name?: string;
  budget?: {
    amount?: number;
    dailyCap?: number;
    pacing?: 'asap' | 'even' | 'front_loaded';
  };
  cpm?: number;
  creativeIds?: string[];
}

export interface MediaBuyDeleteRequest {
  mediaBuyId: string;
}

export interface MediaBuyExecuteRequest {
  mediaBuyId: string;
}

export class MediaBuysResource {
  constructor(private client: Scope3Client) {}

  async list(request: MediaBuyListRequest = {}): Promise<ToolResponse> {
    return this.client['post']('/media-buy-list', request);
  }

  async create(request: MediaBuyCreateRequest): Promise<ToolResponse> {
    return this.client['post']('/media-buy-create', request);
  }

  async get(request: MediaBuyGetRequest): Promise<ToolResponse> {
    return this.client['post']('/media-buy-get', request);
  }

  async update(request: MediaBuyUpdateRequest): Promise<ToolResponse> {
    return this.client['post']('/media-buy-update', request);
  }

  async delete(request: MediaBuyDeleteRequest): Promise<ToolResponse> {
    return this.client['post']('/media-buy-delete', request);
  }

  async execute(request: MediaBuyExecuteRequest): Promise<ToolResponse> {
    return this.client['post']('/media-buy-execute', request);
  }
}
