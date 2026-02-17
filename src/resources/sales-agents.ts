/**
 * Sales agents resource for browsing and connecting with sales agents
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  SalesAgentAccount,
  ListSalesAgentsParams,
  RegisterSalesAgentAccountInput,
} from '../types';

/**
 * Resource for managing sales agents (Buyer persona)
 */
export class SalesAgentsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List all visible sales agents
   * @param params Filter and pagination parameters
   * @returns Sales agents with account info
   */
  async list(params?: ListSalesAgentsParams): Promise<unknown> {
    return this.adapter.request<unknown>('GET', '/sales-agents', undefined, {
      params: {
        status: params?.status,
        relationship: params?.relationship,
        name: params?.name,
        limit: params?.limit,
        offset: params?.offset,
      },
    });
  }

  /**
   * Register an account for a sales agent
   * @param agentId Agent ID
   * @param data Account registration data
   * @returns Registered account details
   */
  async registerAccount(
    agentId: string,
    data: RegisterSalesAgentAccountInput
  ): Promise<SalesAgentAccount> {
    return this.adapter.request<SalesAgentAccount>(
      'POST',
      `/sales-agents/${validateResourceId(agentId)}/accounts`,
      data
    );
  }
}
