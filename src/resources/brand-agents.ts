import { Scope3Client } from '../client';
import { ToolResponse } from '../types';

export interface BrandAgentCreateRequest {
  name: string;
  description?: string;
  nickname?: string;
  externalId?: string;
  advertiserDomains?: string[];
}

export interface BrandAgentUpdateRequest {
  brandAgentId: string;
  name?: string;
  description?: string;
  tacticSeedDataCoop?: boolean;
}

export interface BrandAgentGetRequest {
  brandAgentId: string;
}

export interface BrandAgentDeleteRequest {
  brandAgentId: string;
}

export class BrandAgentsResource {
  constructor(private client: Scope3Client) {}

  async list(): Promise<ToolResponse> {
    return this.client['callTool']('brand_agent_list', {});
  }

  async create(request: BrandAgentCreateRequest): Promise<ToolResponse> {
    return this.client['callTool']('brand_agent_create', request);
  }

  async get(request: BrandAgentGetRequest): Promise<ToolResponse> {
    return this.client['callTool']('brand_agent_get', request);
  }

  async update(request: BrandAgentUpdateRequest): Promise<ToolResponse> {
    return this.client['callTool']('brand_agent_update', request);
  }

  async delete(request: BrandAgentDeleteRequest): Promise<ToolResponse> {
    return this.client['callTool']('brand_agent_delete', request);
  }
}
