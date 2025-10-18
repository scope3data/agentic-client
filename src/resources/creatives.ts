import { Scope3Client } from '../client';
import { ToolResponse } from '../types';

export interface CreativeListRequest {
  brandAgentId?: string;
  campaignId?: string;
}

export interface CreativeCreateRequest {
  brandAgentId: number;
  name: string;
  organizationId?: number;
  description?: string;
  formatSource?: 'ADCP' | 'CREATIVE_AGENT' | 'PUBLISHER';
  formatId?: string;
  mediaUrl?: string;
  content?: {
    assetIds?: string[];
    htmlSnippet?: string;
    vastTag?: string;
  };
  assemblyMethod?: 'CREATIVE_AGENT' | 'ACTIVATION' | 'PUBLISHER';
  campaignId?: number;
}

export interface CreativeGetRequest {
  creativeId: number;
}

export interface CreativeUpdateRequest {
  creativeId: number;
  name?: string;
  status?: string;
}

export interface CreativeDeleteRequest {
  creativeId: number;
}

export interface CreativeAssignRequest {
  creativeId: number;
  campaignId: number;
}

export interface CreativeSyncSalesAgentsRequest {
  creativeId: number;
}

export class CreativesResource {
  constructor(private client: Scope3Client) {}

  async list(request: CreativeListRequest = {}): Promise<ToolResponse> {
    return this.client['callTool']('creative_list', request);
  }

  async create(request: CreativeCreateRequest): Promise<ToolResponse> {
    return this.client['callTool']('creative_create', request);
  }

  async get(request: CreativeGetRequest): Promise<ToolResponse> {
    return this.client['callTool']('creative_get', request);
  }

  async update(request: CreativeUpdateRequest): Promise<ToolResponse> {
    return this.client['callTool']('creative_update', request);
  }

  async delete(request: CreativeDeleteRequest): Promise<ToolResponse> {
    return this.client['callTool']('creative_delete', request);
  }

  async assign(request: CreativeAssignRequest): Promise<ToolResponse> {
    return this.client['callTool']('creative_assign', request);
  }

  async syncSalesAgents(request: CreativeSyncSalesAgentsRequest): Promise<ToolResponse> {
    return this.client['callTool']('creative_sync_sales_agents', request);
  }
}
