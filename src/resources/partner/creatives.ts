import { Scope3Client } from '../../client';
import type { operations } from '../../types/partner-api';

export class CreativesResource {
  constructor(private client: Scope3Client) {}

  /**
   * Sync creatives to sales agents
   * Synchronize creatives to connected sales agents (DSPs, publisher platforms).
   */
  async syncSalesAgents(
    params: operations['creative_sync_sales_agents']['requestBody']['content']['application/json']
  ): Promise<
    operations['creative_sync_sales_agents']['responses'][200]['content']['application/json']
  > {
    return this.client['callTool']('creative_sync_sales_agents', params);
  }
}
