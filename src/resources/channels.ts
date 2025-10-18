import { Scope3Client } from '../client';
import { ToolResponse } from '../types';

export class ChannelsResource {
  constructor(private client: Scope3Client) {}

  async list(): Promise<ToolResponse> {
    return this.client['post']('/channel-list', {});
  }
}
