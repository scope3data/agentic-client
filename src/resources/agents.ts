/**
 * Agents resource for discovering and managing agents under storefront
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  Agent,
  UpdateAgentInput,
  ListAgentsParams,
  OAuthAuthorizeResponse,
  OAuthCallbackInput,
  ApiResponse,
} from '../types';

/**
 * Resource for managing agents (Storefront persona)
 */
export class AgentsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List all visible agents
   * @param params Filter parameters
   * @returns List of agents
   */
  async list(params?: ListAgentsParams): Promise<ApiResponse<Agent[]>> {
    return this.adapter.request<ApiResponse<Agent[]>>('GET', '/agents', undefined, {
      params: {
        type: params?.type,
        status: params?.status,
        relationship: params?.relationship,
      },
    });
  }

  /**
   * Get agent details
   * @param agentId Agent ID
   * @returns Agent details
   */
  async get(agentId: string): Promise<ApiResponse<Agent>> {
    return this.adapter.request<ApiResponse<Agent>>(
      'GET',
      `/agents/${validateResourceId(agentId)}`
    );
  }

  /**
   * Update an agent's configuration
   * @param agentId Agent ID
   * @param data Update data
   * @returns Updated agent
   */
  async update(agentId: string, data: UpdateAgentInput): Promise<ApiResponse<Agent>> {
    return this.adapter.request<ApiResponse<Agent>>(
      'PATCH',
      `/agents/${validateResourceId(agentId)}`,
      data
    );
  }

  /**
   * Start agent-level OAuth flow
   * @param agentId Agent ID
   * @returns Authorization URL to present to the user
   */
  async authorizeOAuth(agentId: string): Promise<OAuthAuthorizeResponse> {
    return this.adapter.request<OAuthAuthorizeResponse>(
      'POST',
      `/agents/${validateResourceId(agentId)}/oauth/authorize`,
      {}
    );
  }

  /**
   * Start per-account OAuth flow
   * @param agentId Agent ID
   * @returns Authorization URL to present to the user
   */
  async authorizeAccountOAuth(agentId: string): Promise<OAuthAuthorizeResponse> {
    return this.adapter.request<OAuthAuthorizeResponse>(
      'POST',
      `/agents/${validateResourceId(agentId)}/accounts/oauth/authorize`,
      {}
    );
  }

  /**
   * Exchange OAuth authorization code for tokens
   * @param agentId Agent ID
   * @param data Code and state from OAuth callback
   * @returns Exchange result
   */
  async exchangeOAuthCode(
    agentId: string,
    data: OAuthCallbackInput
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'POST',
      `/agents/${validateResourceId(agentId)}/oauth/callback`,
      data
    );
  }
}
