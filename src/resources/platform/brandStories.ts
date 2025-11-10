import { Scope3Client } from '../../client';
import type { operations } from '../../types/platform-api';

export class BrandStoriesResource {
  constructor(private client: Scope3Client) {}

  /**
   * Create brand story
   * Create a brand story containing the narrative, history, values, and key messaging for a brand agent.
   */
  async storyCreate(params: operations['brand_story_create']['requestBody']['content']['application/json']): Promise<operations['brand_story_create']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('brand_story_create', params);
  }

  /**
   * Update brand story
   * Update an existing brand story with new information.
   */
  async storyUpdate(params: operations['brand_story_update']['requestBody']['content']['application/json']): Promise<operations['brand_story_update']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('brand_story_update', params);
  }

  /**
   * Delete brand story
   * Delete a brand story.
   */
  async storyDelete(params: operations['brand_story_delete']['requestBody']['content']['application/json']): Promise<operations['brand_story_delete']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('brand_story_delete', params);
  }

  /**
   * List brand stories
   * List all brand stories with optional filtering by brand agent.
   */
  async storyList(params: operations['brand_story_list']['requestBody']['content']['application/json']): Promise<operations['brand_story_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('brand_story_list', params);
  }

}
