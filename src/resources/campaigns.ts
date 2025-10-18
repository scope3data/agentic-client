import { Scope3Client } from '../client';
import { ToolResponse } from '../types';

export interface Budget {
  amount: number;
  currency?: string;
  dailyCap?: number;
  pacing?: 'asap' | 'even' | 'front_loaded';
}

export interface ScoringWeights {
  affinity?: number;
  outcome?: number;
  quality?: number;
}

export interface CampaignListRequest {
  brandAgentId?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  limit?: number;
  offset?: number;
}

export interface CampaignCreateRequest {
  prompt: string;
  brandAgentId?: string;
  name?: string;
  budget?: Budget;
  startDate?: string;
  endDate?: string;
  scoringWeights?: ScoringWeights;
  outcomeScoreWindowDays?: number;
  segmentIds?: string[];
  dealIds?: string[];
  visibility?: 'PUBLIC' | 'PRIVATE';
  status?: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
}

export interface CampaignUpdateRequest {
  campaignId: string;
  name?: string;
  prompt?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  budget?: Budget;
  startDate?: string;
  endDate?: string;
  scoringWeights?: ScoringWeights;
  outcomeScoreWindowDays?: number;
  segmentIds?: string[];
  dealIds?: string[];
  visibility?: 'PUBLIC' | 'PRIVATE';
}

export interface CampaignDeleteRequest {
  campaignId: string;
  hardDelete?: boolean;
}

export interface CampaignGetSummaryRequest {
  campaignId: string;
}

export interface CampaignListTacticsRequest {
  campaignId: string;
  includeArchived?: boolean;
}

export interface CampaignValidateBriefRequest {
  brief: string;
  brandAgentId?: string;
  threshold?: number;
}

export class CampaignsResource {
  constructor(private client: Scope3Client) {}

  async list(request: CampaignListRequest = {}): Promise<ToolResponse> {
    return this.client['callTool']('campaign_list', request);
  }

  async create(request: CampaignCreateRequest): Promise<ToolResponse> {
    return this.client['callTool']('campaign_create', request);
  }

  async update(request: CampaignUpdateRequest): Promise<ToolResponse> {
    return this.client['callTool']('campaign_update', request);
  }

  async delete(request: CampaignDeleteRequest): Promise<ToolResponse> {
    return this.client['callTool']('campaign_delete', request);
  }

  async getSummary(request: CampaignGetSummaryRequest): Promise<ToolResponse> {
    return this.client['callTool']('campaign_get_summary', request);
  }

  async listTactics(request: CampaignListTacticsRequest): Promise<ToolResponse> {
    return this.client['callTool']('campaign_list_tactics', request);
  }

  async validateBrief(request: CampaignValidateBriefRequest): Promise<ToolResponse> {
    return this.client['callTool']('campaign_validate_brief', request);
  }
}
