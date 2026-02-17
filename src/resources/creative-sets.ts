/**
 * Creative sets resource for managing advertiser creative assets
 * Scoped to a specific advertiser
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  CreativeSet,
  CreateCreativeSetInput,
  CreativeAsset,
  CreateCreativeAssetInput,
  ApiResponse,
} from '../types';

/**
 * Resource for managing creative sets (scoped to an advertiser)
 */
export class CreativeSetsResource {
  constructor(
    private readonly adapter: BaseAdapter,
    private readonly advertiserId: string
  ) {}

  /**
   * List all creative sets for this advertiser
   * @returns List of creative sets
   */
  async list(): Promise<ApiResponse<CreativeSet[]>> {
    return this.adapter.request<ApiResponse<CreativeSet[]>>(
      'GET',
      `/advertisers/${this.advertiserId}/creative-sets`
    );
  }

  /**
   * Create a new creative set
   * @param data Creative set creation data
   * @returns Created creative set
   */
  async create(data: CreateCreativeSetInput): Promise<ApiResponse<CreativeSet>> {
    return this.adapter.request<ApiResponse<CreativeSet>>(
      'POST',
      `/advertisers/${this.advertiserId}/creative-sets`,
      data
    );
  }

  /**
   * Add an asset to a creative set
   * @param creativeSetId Creative set ID
   * @param data Asset creation data
   * @returns Created creative asset
   */
  async addAsset(
    creativeSetId: string,
    data: CreateCreativeAssetInput
  ): Promise<ApiResponse<CreativeAsset>> {
    return this.adapter.request<ApiResponse<CreativeAsset>>(
      'POST',
      `/advertisers/${this.advertiserId}/creative-sets/${validateResourceId(creativeSetId)}/assets`,
      data
    );
  }

  /**
   * Remove an asset from a creative set
   * @param creativeSetId Creative set ID
   * @param assetId Asset ID to remove
   */
  async removeAsset(creativeSetId: string, assetId: string): Promise<void> {
    await this.adapter.request<void>(
      'DELETE',
      `/advertisers/${this.advertiserId}/creative-sets/${validateResourceId(creativeSetId)}/assets/${validateResourceId(assetId)}`
    );
  }
}
