/**
 * Measurement data resource for managing advertiser measurement configuration and data
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  ApiResponse,
  MeasurementConfig,
  UpdateMeasurementConfigInput,
  MeasurementSource,
  CreateMeasurementSourceInput,
  UpdateMeasurementSourceInput,
  UploadMeasurementRecordsInput,
  UploadContextRecordsInput,
  MeasurementFreshness,
  MeasurementDataSync,
} from '../types';

/**
 * Resource for managing measurement data (scoped to an advertiser)
 */
export class MeasurementDataResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * Get measurement configuration for this advertiser
   * @returns Measurement configuration
   */
  async getConfig(): Promise<ApiResponse<MeasurementConfig>> {
    return this.adapter.request<ApiResponse<MeasurementConfig>>(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/measurement-config`
    );
  }

  /**
   * Update measurement configuration for this advertiser
   * @param data Configuration update data
   * @returns Updated measurement configuration
   */
  async updateConfig(data: UpdateMeasurementConfigInput): Promise<ApiResponse<MeasurementConfig>> {
    return this.adapter.request<ApiResponse<MeasurementConfig>>(
      'PUT',
      `/advertisers/${validateResourceId(this.advertiserId)}/measurement-config`,
      data
    );
  }

  /**
   * List measurement sources for this advertiser
   * @returns List of measurement sources
   */
  async listSources(): Promise<ApiResponse<MeasurementSource[]>> {
    return this.adapter.request<ApiResponse<MeasurementSource[]>>(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/measurement-sources`
    );
  }

  /**
   * Create a measurement source for this advertiser
   * @param data Source creation data
   * @returns Created measurement source
   */
  async createSource(data: CreateMeasurementSourceInput): Promise<ApiResponse<MeasurementSource>> {
    return this.adapter.request<ApiResponse<MeasurementSource>>(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/measurement-sources`,
      data
    );
  }

  /**
   * Get a measurement source by ID
   * @param sourceId Source ID
   * @returns Measurement source details
   */
  async getSource(sourceId: string): Promise<ApiResponse<MeasurementSource>> {
    return this.adapter.request<ApiResponse<MeasurementSource>>(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/measurement-sources/${validateResourceId(sourceId)}`
    );
  }

  /**
   * Update a measurement source
   * @param sourceId Source ID
   * @param data Source update data
   * @returns Updated measurement source
   */
  async updateSource(
    sourceId: string,
    data: UpdateMeasurementSourceInput
  ): Promise<ApiResponse<MeasurementSource>> {
    return this.adapter.request<ApiResponse<MeasurementSource>>(
      'PATCH',
      `/advertisers/${validateResourceId(this.advertiserId)}/measurement-sources/${validateResourceId(sourceId)}`,
      data
    );
  }

  /**
   * Upload measurement records for this advertiser
   * @param data Records to upload
   * @returns Upload result
   */
  async uploadRecords(
    data: UploadMeasurementRecordsInput
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/measurement-records`,
      data
    );
  }

  /**
   * List measurement records for this advertiser
   * @returns Measurement records
   */
  async listRecords(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>[]>>(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/measurement-records`
    );
  }

  /**
   * Upload context records for this advertiser
   * @param data Context records to upload
   * @returns Upload result
   */
  async uploadContextRecords(
    data: UploadContextRecordsInput
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.adapter.request<ApiResponse<Record<string, unknown>>>(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/context-records`,
      data
    );
  }

  /**
   * Get measurement data freshness for this advertiser
   * @returns Freshness information
   */
  async getFreshness(): Promise<ApiResponse<MeasurementFreshness>> {
    return this.adapter.request<ApiResponse<MeasurementFreshness>>(
      'GET',
      `/advertisers/${validateResourceId(this.advertiserId)}/measurement-freshness`
    );
  }

  /**
   * Sync measurement data for this advertiser
   * @param data Measurement data sync payload
   * @returns Sync result
   */
  async sync(data: MeasurementDataSync): Promise<ApiResponse<void>> {
    return this.adapter.request<ApiResponse<void>>(
      'POST',
      `/advertisers/${validateResourceId(this.advertiserId)}/measurement-data/sync`,
      data
    );
  }
}
