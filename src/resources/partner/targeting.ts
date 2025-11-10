import { Scope3Client } from '../../client';
import type { operations } from '../../types/partner-api';

export class TargetingResource {
  constructor(private client: Scope3Client) {}

  /**
   * List countries
   * Get all available countries for targeting. Use this to get valid country codes before creating brand agents.
   */
  async countryList(params: operations['country_list']['requestBody']['content']['application/json']): Promise<operations['country_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('country_list', params);
  }

  /**
   * List languages
   * Get all available languages for targeting. Use this to get valid language codes before creating brand stories.
   */
  async languageList(params: operations['language_list']['requestBody']['content']['application/json']): Promise<operations['language_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('language_list', params);
  }

}
