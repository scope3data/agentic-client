import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class ServiceTokensResource {
  constructor(private client: Scope3Client) {}

  /**
   * Create service token
   * Create a new service token for API authentication. Returns the full token which should be stored securely as it cannot be retrieved later.
   */
  async create(params: operations['service_token_create']['requestBody']['content']['application/json']): Promise<operations['service_token_create']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('service_token_create', params);
  }

  /**
   * List service tokens
   * List all service tokens for the authenticated customer. Secrets are never returned, only metadata.
   */
  async list(params: operations['service_token_list']['requestBody']['content']['application/json']): Promise<operations['service_token_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('service_token_list', params);
  }

  /**
   * Get service token
   * Get detailed information about a specific service token. The secret is never returned.
   */
  async get(params: operations['service_token_get']['requestBody']['content']['application/json']): Promise<operations['service_token_get']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('service_token_get', params);
  }

  /**
   * Update service token
   * Update a service token. Only name, description, and expiration can be modified.
   */
  async update(params: operations['service_token_update']['requestBody']['content']['application/json']): Promise<operations['service_token_update']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('service_token_update', params);
  }

  /**
   * Archive service token
   * Archive (soft delete) a service token. This immediately invalidates the token for authentication.
   */
  async archive(params: operations['service_token_archive']['requestBody']['content']['application/json']): Promise<operations['service_token_archive']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('service_token_archive', params);
  }

}
