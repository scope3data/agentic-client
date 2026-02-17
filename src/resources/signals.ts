/**
 * Signals resource for discovering and listing targeting signals
 * Not scoped to a specific advertiser
 */

import type { BaseAdapter } from '../adapters/base';
import type { Signal, DiscoverSignalsInput, ApiResponse } from '../types';

/**
 * Resource for managing signals
 */
export class SignalsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Discover signals for campaign targeting
   * @param data Optional filters for signal discovery
   * @returns Discovered signals
   */
  async discover(data?: DiscoverSignalsInput): Promise<ApiResponse<Signal[]>> {
    return this.adapter.request<ApiResponse<Signal[]>>('POST', '/campaign/signals/discover', data);
  }

  /**
   * List all available signals
   * @returns List of signals
   */
  async list(): Promise<ApiResponse<Signal[]>> {
    return this.adapter.request<ApiResponse<Signal[]>>('GET', '/signals');
  }
}
