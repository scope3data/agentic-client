import { Scope3Client } from '../client';
import { ToolResponse } from '../types';

export interface BrandStandardsListRequest {
  where?: {
    name?: string;
  };
  orderBy?: {
    id?: 'asc' | 'desc';
    name?: 'asc' | 'desc';
  };
  take?: number;
  skip?: number;
}

export interface BrandStandardsCreateRequest {
  brandAgentId: string;
  prompt: string;
  name?: string;
  description?: string;
  isArchived?: boolean;
  countries?: string[];
  channels?: string[];
  brands?: string[];
}

export interface BrandStandardsDeleteRequest {
  brandStandardId: string;
}

export class BrandStandardsResource {
  constructor(private client: Scope3Client) {}

  async list(request: BrandStandardsListRequest = {}): Promise<ToolResponse> {
    return this.client['callTool']('brand_standards_list', request);
  }

  async create(request: BrandStandardsCreateRequest): Promise<ToolResponse> {
    return this.client['callTool']('brand_standards_create', request);
  }

  async delete(request: BrandStandardsDeleteRequest): Promise<ToolResponse> {
    return this.client['callTool']('brand_standards_delete', request);
  }
}
