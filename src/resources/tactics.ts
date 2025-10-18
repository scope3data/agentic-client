import { Scope3Client } from '../client';
import { ToolResponse } from '../types';

export type ChannelCode =
  | 'DIGITAL-AUDIO'
  | 'DISPLAY-WEB'
  | 'DISPLAY-APP'
  | 'CTV-BVOD'
  | 'OLV'
  | 'DOOH'
  | 'SOCIAL';

export interface TacticListRequest {
  campaignId?: string;
  includeArchived?: boolean;
}

export interface TacticCreateRequest {
  name: string;
  campaignId: string;
  prompt?: string;
  channelCodes?: ChannelCode[];
  countryCodes?: string[];
}

export interface TacticGetRequest {
  tacticId: string;
}

export interface TacticUpdateRequest {
  tacticId: string;
  name?: string;
  prompt?: string;
  channelCodes?: ChannelCode[];
  countryCodes?: string[];
}

export interface TacticDeleteRequest {
  tacticId: string;
}

export interface TacticLinkCampaignRequest {
  tacticId: string;
  campaignId: string;
}

export interface TacticUnlinkCampaignRequest {
  tacticId: string;
  campaignId: string;
}

export class TacticsResource {
  constructor(private client: Scope3Client) {}

  async list(request: TacticListRequest = {}): Promise<ToolResponse> {
    return this.client['post']('/tactic-list', request);
  }

  async create(request: TacticCreateRequest): Promise<ToolResponse> {
    return this.client['post']('/tactic-create', request);
  }

  async get(request: TacticGetRequest): Promise<ToolResponse> {
    return this.client['post']('/tactic-get', request);
  }

  async update(request: TacticUpdateRequest): Promise<ToolResponse> {
    return this.client['post']('/tactic-update', request);
  }

  async delete(request: TacticDeleteRequest): Promise<ToolResponse> {
    return this.client['post']('/tactic-delete', request);
  }

  async linkCampaign(request: TacticLinkCampaignRequest): Promise<ToolResponse> {
    return this.client['post']('/tactic-link-campaign', request);
  }

  async unlinkCampaign(request: TacticUnlinkCampaignRequest): Promise<ToolResponse> {
    return this.client['post']('/tactic-unlink-campaign', request);
  }
}
