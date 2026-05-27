/**
 * Test cohorts resource for managing A/B test cohorts
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  TestCohort,
  CreateTestCohortInput,
  UpdateTestCohortInput,
  ApiResponse,
} from '../types';

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
      `/advertisers/${validateResourceId(this.advertiserId)}/test-cohorts`
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
      `/advertisers/${validateResourceId(this.advertiserId)}/test-cohorts`,
      data
    );
  }

  /**
   * Get a test cohort by ID
   * @param cohortId Test cohort ID
   * @returns Test cohort details
   */
  async get(cohortId: string): Promise<ApiResponse<TestCohort>> {
    return this.adapter.request<ApiResponse<TestCohort>>(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/test-cohorts/${validateResourceId(cohortId)}`
    );
  }

  /**
   * Update a test cohort
   * @param cohortId Test cohort ID
   * @param data Update data
   * @returns Updated test cohort
   */
  async update(cohortId: string, data: UpdateTestCohortInput): Promise<ApiResponse<TestCohort>> {
    return this.adapter.request<ApiResponse<TestCohort>>(
      'PUT',
      `/advertisers/${validateResourceId(this.advertiserId)}/test-cohorts/${validateResourceId(cohortId)}`,
      data
    );
  }

  /**
   * Delete a test cohort
   * @param cohortId Test cohort ID
   */
  async delete(cohortId: string): Promise<void> {
    await this.adapter.request<void>(
      'DELETE',
      `/advertisers/${validateResourceId(this.advertiserId)}/test-cohorts/${validateResourceId(cohortId)}`
    );
  }
}
