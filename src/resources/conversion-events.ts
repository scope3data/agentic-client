/**
 * Conversion events resource for managing advertiser conversion tracking
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  ConversionEvent,
  CreateConversionEventInput,
  UpdateConversionEventInput,
  ApiResponse,
} from '../types';

/**
 * Resource for managing conversion events (scoped to an advertiser)
 */
export class ConversionEventsResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * List all conversion events for this advertiser
   * @returns List of conversion events
   */
  async list(): Promise<ApiResponse<ConversionEvent[]>> {
    return this.adapter.request<ApiResponse<ConversionEvent[]>>(
      'GET',
      `/advertisers/${this.advertiserId}/conversion-events`
    );
  }

  /**
   * Get a conversion event by ID
   * @param eventId Conversion event ID
   * @returns Conversion event details
   */
  async get(eventId: string): Promise<ApiResponse<ConversionEvent>> {
    return this.adapter.request<ApiResponse<ConversionEvent>>(
      'GET',
      `/advertisers/${this.advertiserId}/conversion-events/${validateResourceId(eventId)}`
    );
  }

  /**
   * Create a new conversion event
   * @param data Conversion event creation data
   * @returns Created conversion event
   */
  async create(data: CreateConversionEventInput): Promise<ApiResponse<ConversionEvent>> {
    return this.adapter.request<ApiResponse<ConversionEvent>>(
      'POST',
      `/advertisers/${this.advertiserId}/conversion-events`,
      data
    );
  }

  /**
   * Update an existing conversion event
   * @param eventId Conversion event ID
   * @param data Update data
   * @returns Updated conversion event
   */
  async update(
    eventId: string,
    data: UpdateConversionEventInput
  ): Promise<ApiResponse<ConversionEvent>> {
    return this.adapter.request<ApiResponse<ConversionEvent>>(
      'PUT',
      `/advertisers/${this.advertiserId}/conversion-events/${validateResourceId(eventId)}`,
      data
    );
  }
}
