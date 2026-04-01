/**
 * Reporting resource for retrieving campaign metrics
 */

import type { BaseAdapter } from '../adapters/base';
import type { ReportingParams } from '../types';
import { reportingSchemas } from '../schemas/registry';
import { shouldValidateResponse, validateResponse } from '../validation';

/**
 * Resource for accessing reporting data (Buyer persona)
 */
export class ReportingResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Get reporting metrics
   * @param params Reporting filter parameters (view, days, date range, advertiser, campaign)
   * @returns Reporting response (summary or timeseries depending on view param)
   */
  async get<T = unknown>(params?: ReportingParams): Promise<T> {
    const result = await this.adapter.request<T>('GET', '/reporting/metrics', undefined, {
      params: {
        view: params?.view,
        days: params?.days,
        startDate: params?.startDate,
        endDate: params?.endDate,
        advertiserId: params?.advertiserId,
        campaignId: params?.campaignId,
        demo: params?.demo,
      },
    });
    if (shouldValidateResponse(this.adapter.validate)) {
      return validateResponse(reportingSchemas.response, result) as T;
    }
    return result;
  }
}
