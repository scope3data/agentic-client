/**
 * Readiness resource for checking storefront readiness status
 */

import { type BaseAdapter } from '../adapters/base';
import type { StorefrontReadiness } from '../types';

/**
 * Resource for checking storefront readiness (Storefront persona)
 */
export class ReadinessResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Check storefront readiness
   * @returns Readiness status with individual checks
   */
  async check(): Promise<StorefrontReadiness> {
    return this.adapter.request<StorefrontReadiness>('GET', '/readiness');
  }
}
