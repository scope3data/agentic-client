/**
 * Test cohorts resource for managing A/B test cohorts
 * Scoped to a specific advertiser
 */

import type { BaseAdapter } from '../adapters/base';
import type { TestCohort, CreateTestCohortInput, ApiResponse } from '../types';

/**
 * Resource for managing test cohorts (scoped to an advertiser)
 */
export class TestCohortsResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * List all test cohorts for this advertiser
   * @returns List of test cohorts
   */
  async list(): Promise<ApiResponse<TestCohort[]>> {
    return this.adapter.request<ApiResponse<TestCohort[]>>(
      'GET',
      `/advertisers/${this.advertiserId}/test-cohorts`
    );
  }

  /**
   * Create a new test cohort
   * @param data Test cohort creation data
   * @returns Created test cohort
   */
  async create(data: CreateTestCohortInput): Promise<ApiResponse<TestCohort>> {
    return this.adapter.request<ApiResponse<TestCohort>>(
      'POST',
      `/advertisers/${this.advertiserId}/test-cohorts`,
      data
    );
  }
}
