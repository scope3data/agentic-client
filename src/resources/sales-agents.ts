/**
 * Sales agents resource for browsing and connecting with sales agents
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  SalesAgentAccount,
  ListSalesAgentsParams,
  RegisterSalesAgentAccountInput,
} from '../types';
import { salesAgentSchemas } from '../schemas/registry';
import { shouldValidateInput, shouldValidateResponse, validateInput, validateResponse } from '../validation';

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
    const result = await this.adapter.request<unknown>('GET', '/sales-agents', undefined, {
      params: {
        status: params?.status,
        relationship: params?.relationship,
        name: params?.name,
        limit: params?.limit,
        offset: params?.offset,
      },
    });
    if (shouldValidateResponse(this.adapter.validate)) {
      validateResponse(salesAgentSchemas.listResponse, result);
    }
    return result;
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
    if (shouldValidateInput(this.adapter.validate)) {
      validateInput(salesAgentSchemas.registerAccountInput, data);
    }
    const result = await this.adapter.request<SalesAgentAccount>(
      'POST',
      `/sales-agents/${validateResourceId(agentId)}/accounts`,
      data
    );
    if (shouldValidateResponse(this.adapter.validate)) {
      validateResponse(salesAgentSchemas.accountResponse, result);
    }
    return result;
  }
}
