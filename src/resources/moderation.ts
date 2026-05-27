import { type BaseAdapter } from '../adapters/base';
import type { ModerationCheckInput, ModerationCheckResult, ApiResponse } from '../types';

/**
 * Resource for content moderation
 */
export class ModerationResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Check content against moderation rules
   * @param data Content to check
   * @returns Moderation check result
   */
  async check(data: ModerationCheckInput): Promise<ApiResponse<ModerationCheckResult>> {
    return this.adapter.request<ApiResponse<ModerationCheckResult>>(
      'POST',
      '/moderation/check',
      data
    );
  }
}
