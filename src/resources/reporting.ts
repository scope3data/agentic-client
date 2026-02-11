/**
 * Reporting resource for retrieving advertiser campaign metrics
 * Scoped to a specific advertiser
 */

import type { BaseAdapter } from '../adapters/base';
import type { ReportingResponse, ReportingParams, ApiResponse } from '../types';

/**
 * Resource for accessing reporting data (scoped to an advertiser)
 */
export class ReportingResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * Get reporting metrics for this advertiser
   * @param params Reporting filter parameters (days, date range, campaign, media buy)
   * @returns Reporting response with daily metrics and totals
   */
  async get(params?: ReportingParams): Promise<ApiResponse<ReportingResponse>> {
    return this.adapter.request<ApiResponse<ReportingResponse>>(
      'GET',
      `/advertisers/${this.advertiserId}/reporting`,
      undefined,
      {
        params: {
          days: params?.days,
          startDate: params?.startDate,
          endDate: params?.endDate,
          campaignId: params?.campaignId,
          mediaBuyId: params?.mediaBuyId,
        },
      }
    );
  }
}
