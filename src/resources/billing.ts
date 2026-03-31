/**
 * Billing resource for managing storefront Stripe Connect billing
 */

import { type BaseAdapter } from '../adapters/base';
import type {
  StorefrontBillingConfig,
  StripeConnectResponse,
  BillingStatus,
  BillingTransaction,
  BillingPayout,
  ApiResponse,
} from '../types';

/**
 * Resource for managing billing (Storefront persona)
 */
export class BillingResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Get billing configuration
   * @returns Billing config with Stripe Connect details
   */
  async get(): Promise<StorefrontBillingConfig> {
    return this.adapter.request<StorefrontBillingConfig>('GET', '/billing');
  }

  /**
   * Connect to Stripe via Stripe Connect
   * @returns Stripe Connect response with onboarding URL
   */
  async connect(): Promise<StripeConnectResponse> {
    return this.adapter.request<StripeConnectResponse>('POST', '/billing/connect');
  }

  /**
   * Get billing status
   * @returns Billing status
   */
  async status(): Promise<BillingStatus> {
    return this.adapter.request<BillingStatus>('GET', '/billing/status');
  }

  /**
   * List billing transactions
   * @param params Pagination parameters
   * @returns List of transactions
   */
  async transactions(params?: {
    limit?: number;
    starting_after?: string;
  }): Promise<ApiResponse<BillingTransaction[]>> {
    return this.adapter.request<ApiResponse<BillingTransaction[]>>(
      'GET',
      '/billing/transactions',
      undefined,
      {
        params: {
          limit: params?.limit,
          starting_after: params?.starting_after,
        },
      }
    );
  }

  /**
   * List billing payouts
   * @param params Pagination parameters
   * @returns List of payouts
   */
  async payouts(params?: {
    limit?: number;
    starting_after?: string;
  }): Promise<ApiResponse<BillingPayout[]>> {
    return this.adapter.request<ApiResponse<BillingPayout[]>>(
      'GET',
      '/billing/payouts',
      undefined,
      {
        params: {
          limit: params?.limit,
          starting_after: params?.starting_after,
        },
      }
    );
  }

  /**
   * Get Stripe onboarding URL
   * @returns Onboarding URL details
   */
  async onboardingUrl(): Promise<StripeConnectResponse> {
    return this.adapter.request<StripeConnectResponse>('GET', '/billing/onboard');
  }
}
