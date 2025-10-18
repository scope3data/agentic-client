import { Scope3Client } from '../client';
import { ToolResponse } from '../types';

export interface BrandStoryListRequest {
  brandAgentId: string;
}

export interface BrandStoryCreateRequest {
  brandAgentId: string;
  name: string;
  prompt: string;
  countries?: string[];
  channels?: string[];
  languages?: string[];
  brands?: string[];
}

export interface BrandStoryUpdateRequest {
  brandStoryId: string;
  prompt: string;
}

export interface BrandStoryDeleteRequest {
  brandStoryId: string;
}

export class BrandStoriesResource {
  constructor(private client: Scope3Client) {}

  async list(request: BrandStoryListRequest): Promise<ToolResponse> {
    return this.client['post']('/brand-story-list', request);
  }

  async create(request: BrandStoryCreateRequest): Promise<ToolResponse> {
    return this.client['post']('/brand-story-create', request);
  }

  async update(request: BrandStoryUpdateRequest): Promise<ToolResponse> {
    return this.client['post']('/brand-story-update', request);
  }

  async delete(request: BrandStoryDeleteRequest): Promise<ToolResponse> {
    return this.client['post']('/brand-story-delete', request);
  }
}
