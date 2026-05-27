import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  BuyerStorefront,
  StorefrontCredential,
  RegisterCredentialsInput,
  ApiResponse,
} from '../types';

/**
 * Resource for browsing storefronts as a buyer
 */
export class StorefrontsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List available storefronts
   * @returns List of storefronts
   */
  async list(): Promise<ApiResponse<BuyerStorefront[]>> {
    return this.adapter.request<ApiResponse<BuyerStorefront[]>>('GET', '/storefronts');
  }

  /**
   * Get a specific storefront
   * @param storefrontId Storefront ID
   * @returns Storefront details
   */
  async get(storefrontId: string): Promise<ApiResponse<BuyerStorefront>> {
    return this.adapter.request<ApiResponse<BuyerStorefront>>(
      'GET',
      `/storefronts/${validateResourceId(storefrontId)}`
    );
  }

  /**
   * List credentials for all storefronts
   * @returns List of storefront credentials
   */
  async listCredentials(): Promise<ApiResponse<StorefrontCredential[]>> {
    return this.adapter.request<ApiResponse<StorefrontCredential[]>>(
      'GET',
      '/storefronts/credentials'
    );
  }

  /**
   * Register credentials for a storefront source
   * @param storefrontId Storefront ID
   * @param sourceId Source ID
   * @param data Credentials registration data
   * @returns Registered credential
   */
  async registerCredentials(
    storefrontId: string,
    sourceId: string,
    data: RegisterCredentialsInput
  ): Promise<ApiResponse<StorefrontCredential>> {
    return this.adapter.request<ApiResponse<StorefrontCredential>>(
      'POST',
      `/storefronts/${validateResourceId(storefrontId)}/sources/${validateResourceId(sourceId)}/credentials`,
      data
    );
  }
}
