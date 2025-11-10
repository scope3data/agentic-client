import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class ChannelsResource {
  constructor(private client: Scope3Client) {}

  /**
   * List channels
   * List all available advertising channels and platforms.
   */
  async list(params: operations['channel_list']['requestBody']['content']['application/json']): Promise<operations['channel_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('channel_list', params);
  }

}
