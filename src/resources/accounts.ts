import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  Account,
  CreateChildAccountInput,
  UpdateDomainInput,
  MembershipSettings,
  UpdateMembershipInput,
  ApiResponse,
} from '../types';

/**
 * Resource for managing accounts
 */
export class AccountsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Get the current account
   * @returns Current account details
   */
  async getCurrent(): Promise<ApiResponse<Account>> {
    return this.adapter.request<ApiResponse<Account>>('GET', '/accounts/current');
  }

  /**
   * List all accounts
   * @returns List of accounts
   */
  async list(): Promise<ApiResponse<Account[]>> {
    return this.adapter.request<ApiResponse<Account[]>>('GET', '/accounts');
  }

  /**
   * Create a child account
   * @param data Child account creation data
   * @returns Created child account
   */
  async createChild(data: CreateChildAccountInput): Promise<ApiResponse<Account>> {
    return this.adapter.request<ApiResponse<Account>>('POST', '/accounts/create-child', data);
  }

  /**
   * Update an account's domain
   * @param customerId Customer ID
   * @param data Domain update data
   * @returns Updated account
   */
  async updateDomain(customerId: string, data: UpdateDomainInput): Promise<ApiResponse<Account>> {
    return this.adapter.request<ApiResponse<Account>>(
      'PATCH',
      `/accounts/${validateResourceId(customerId)}/domain`,
      data
    );
  }

  /**
   * Delete an account
   * @param customerId Customer ID
   */
  async delete(customerId: string): Promise<void> {
    await this.adapter.request<void>('DELETE', `/accounts/${validateResourceId(customerId)}`);
  }

  /**
   * Get membership settings for an account
   * @param customerId Customer ID
   * @returns Membership settings
   */
  async getMembership(customerId: string): Promise<ApiResponse<MembershipSettings>> {
    return this.adapter.request<ApiResponse<MembershipSettings>>(
      'GET',
      `/accounts/${validateResourceId(customerId)}/membership`
    );
  }

  /**
   * Update membership settings for an account
   * @param customerId Customer ID
   * @param data Membership update data
   * @returns Updated membership settings
   */
  async updateMembership(
    customerId: string,
    data: UpdateMembershipInput
  ): Promise<ApiResponse<MembershipSettings>> {
    return this.adapter.request<ApiResponse<MembershipSettings>>(
      'PATCH',
      `/accounts/${validateResourceId(customerId)}/membership`,
      data
    );
  }
}
