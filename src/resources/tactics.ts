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
    return this.client['callTool']('tactic_list', request);
  }

  async create(request: TacticCreateRequest): Promise<ToolResponse> {
    return this.client['callTool']('tactic_create', request);
  }

  async get(request: TacticGetRequest): Promise<ToolResponse> {
    return this.client['callTool']('tactic_get', request);
  }

  async update(request: TacticUpdateRequest): Promise<ToolResponse> {
    return this.client['callTool']('tactic_update', request);
  }

  async delete(request: TacticDeleteRequest): Promise<ToolResponse> {
    return this.client['callTool']('tactic_delete', request);
  }

  async linkCampaign(request: TacticLinkCampaignRequest): Promise<ToolResponse> {
    return this.client['callTool']('tactic_link_campaign', request);
  }

  async unlinkCampaign(request: TacticUnlinkCampaignRequest): Promise<ToolResponse> {
    return this.client['callTool']('tactic_unlink_campaign', request);
  }
}
