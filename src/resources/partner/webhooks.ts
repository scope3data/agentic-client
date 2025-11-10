import { Scope3Client } from '../../client';
import type { operations } from '../../types/partner-api';

export class WebhooksResource {
  constructor(private client: Scope3Client) {}

  /**
   * Register webhook
   * Register a webhook to receive real-time notifications about events.
   */
  async register(
    params: operations['webhook_register']['requestBody']['content']['application/json']
  ): Promise<operations['webhook_register']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('webhook_register', params);
  }

  /**
   * List webhooks
   * List all registered webhooks.
   */
  async list(
    params: operations['webhook_list']['requestBody']['content']['application/json']
  ): Promise<operations['webhook_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('webhook_list', params);
  }

  /**
   * Delete webhook
   * Delete a registered webhook.
   */
  async delete(
    params: operations['webhook_delete']['requestBody']['content']['application/json']
  ): Promise<operations['webhook_delete']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('webhook_delete', params);
  }
}
