/**
 * Advertisers resource for managing advertiser accounts
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  Advertiser,
  CreateAdvertiserInput,
  UpdateAdvertiserInput,
  ListAdvertisersParams,
  PaginatedApiResponse,
  ApiResponse,
} from '../types';
import { ConversionEventsResource } from './conversion-events';
import { CreativeSetsResource } from './creative-sets';
import { TestCohortsResource } from './test-cohorts';
import { EventSourcesResource } from './event-sources';
import { MeasurementDataResource } from './measurement-data';
import { CatalogsResource } from './catalogs';
import { AudiencesResource } from './audiences';
import { SyndicationResource } from './syndication';
import { PropertyListsResource } from './property-lists';

/**
 * Resource for managing advertisers (Buyer persona)
 */
export class AdvertisersResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List all advertisers
   * @param params Pagination and filter parameters
   * @returns Paginated list of advertisers
   */
  async list(params?: ListAdvertisersParams): Promise<PaginatedApiResponse<Advertiser>> {
    return this.adapter.request<PaginatedApiResponse<Advertiser>>(
      'GET',
      '/advertisers',
      undefined,
      {
        params: {
          take: params?.take,
          skip: params?.skip,
          status: params?.status,
          name: params?.name,
          includeBrand: params?.includeBrand,
        },
      }
    );
  }

  /**
   * Get an advertiser by ID (always includes brand details)
   * @param id Advertiser ID
   * @returns Advertiser details
   */
  async get(id: string): Promise<ApiResponse<Advertiser>> {
    return this.adapter.request<ApiResponse<Advertiser>>(
      'GET',
      `/advertisers/${validateResourceId(id)}`
    );
  }

  /**
   * Create a new advertiser
   * @param data Advertiser creation data (brandDomain required)
   * @returns Created advertiser
   */
  async create(data: CreateAdvertiserInput): Promise<ApiResponse<Advertiser>> {
    return this.adapter.request<ApiResponse<Advertiser>>('POST', '/advertisers', data);
  }

  /**
   * Update an existing advertiser
   * @param id Advertiser ID
   * @param data Update data
   * @returns Updated advertiser
   */
  async update(id: string, data: UpdateAdvertiserInput): Promise<ApiResponse<Advertiser>> {
    return this.adapter.request<ApiResponse<Advertiser>>(
      'PUT',
      `/advertisers/${validateResourceId(id)}`,
      data
    );
  }

  /**
   * Delete an advertiser
   * @param id Advertiser ID
   */
  async delete(id: string): Promise<void> {
    await this.adapter.request<void>('DELETE', `/advertisers/${validateResourceId(id)}`);
  }

  /**
   * Get the conversion events resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns ConversionEventsResource scoped to the advertiser
   */
  conversionEvents(advertiserId: string): ConversionEventsResource {
    return new ConversionEventsResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the creative sets resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns CreativeSetsResource scoped to the advertiser
   */
  creativeSets(advertiserId: string): CreativeSetsResource {
    return new CreativeSetsResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the test cohorts resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns TestCohortsResource scoped to the advertiser
   */
  testCohorts(advertiserId: string): TestCohortsResource {
    return new TestCohortsResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the event sources resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns EventSourcesResource scoped to the advertiser
   */
  eventSources(advertiserId: string): EventSourcesResource {
    return new EventSourcesResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the measurement data resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns MeasurementDataResource scoped to the advertiser
   */
  measurementData(advertiserId: string): MeasurementDataResource {
    return new MeasurementDataResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the catalogs resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns CatalogsResource scoped to the advertiser
   */
  catalogs(advertiserId: string): CatalogsResource {
    return new CatalogsResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the audiences resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns AudiencesResource scoped to the advertiser
   */
  audiences(advertiserId: string): AudiencesResource {
    return new AudiencesResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the syndication resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns SyndicationResource scoped to the advertiser
   */
  syndication(advertiserId: string): SyndicationResource {
    return new SyndicationResource(this.adapter, validateResourceId(advertiserId));
  }

  /**
   * Get the property lists resource for a specific advertiser
   * @param advertiserId Advertiser ID
   * @returns PropertyListsResource scoped to the advertiser
   */
  propertyLists(advertiserId: string): PropertyListsResource {
    return new PropertyListsResource(this.adapter, validateResourceId(advertiserId));
  }
}
