import { Scope3Client } from '../client';
import { ToolResponse } from '../types';

export interface AssetUploadRequest {
  brandAgentId: string;
  assets: Array<{
    name: string;
    contentType: string;
    data: string;
    assetType: 'image' | 'video' | 'audio' | 'logo' | 'font';
    tags?: string[];
  }>;
}

export interface AssetListRequest {
  brandAgentId?: string;
}

export class AssetsResource {
  constructor(private client: Scope3Client) {}

  async upload(request: AssetUploadRequest): Promise<ToolResponse> {
    return this.client['callTool']('asset_upload', request);
  }

  async list(request: AssetListRequest = {}): Promise<ToolResponse> {
    return this.client['callTool']('asset_list', request);
  }
}
