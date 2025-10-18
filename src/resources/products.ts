import { Scope3Client } from '../client';
import { ToolResponse } from '../types';

export interface MediaProductListRequest {
  salesAgentId?: string;
}

export interface MediaProductDiscoverRequest {
  salesAgentId?: string;
}

export interface MediaProductSyncRequest {
  salesAgentId: string;
}

export class ProductsResource {
  constructor(private client: Scope3Client) {}

  async list(request: MediaProductListRequest = {}): Promise<ToolResponse> {
    return this.client['callTool']('media_product_list', request);
  }

  async discover(request: MediaProductDiscoverRequest = {}): Promise<ToolResponse> {
    return this.client['callTool']('media_product_discover', request);
  }

  async sync(request: MediaProductSyncRequest): Promise<ToolResponse> {
    return this.client['callTool']('media_product_sync', request);
  }
}
