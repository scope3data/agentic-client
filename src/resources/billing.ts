/**
 * Billing resource for managing storefront Stripe Connect billing
 */

import { type BaseAdapter } from '../adapters/base';
import type { StorefrontBillingConfig, StripeConnectResponse } from '../types';

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
  async status(): Promise<unknown> {
    return this.adapter.request<unknown>('GET', '/billing/status');
  }

  /**
   * List billing transactions
   * @param params Pagination parameters
   * @returns List of transactions
   */
  async transactions(params?: { limit?: number; starting_after?: string }): Promise<unknown> {
    return this.adapter.request<unknown>('GET', '/billing/transactions', undefined, {
      params: {
        limit: params?.limit,
        starting_after: params?.starting_after,
      },
    });
  }

  /**
   * List billing payouts
   * @param params Pagination parameters
   * @returns List of payouts
   */
  async payouts(params?: { limit?: number; starting_after?: string }): Promise<unknown> {
    return this.adapter.request<unknown>('GET', '/billing/payouts', undefined, {
      params: {
        limit: params?.limit,
        starting_after: params?.starting_after,
      },
    });
  }

  /**
   * Get Stripe onboarding URL
   * @returns Onboarding URL details
   */
  async onboardingUrl(): Promise<unknown> {
    return this.adapter.request<unknown>('GET', '/billing/onboard');
  }
}
