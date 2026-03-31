/**
 * Tasks resource for checking async task status
 * Top-level buyer resource (not scoped to an advertiser)
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';

/**
 * Resource for managing tasks (Buyer persona, top-level)
 */
export class TasksResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Get task status by ID
   * @param taskId Task ID
   * @returns Task status details
   */
  async get(taskId: string): Promise<unknown> {
    return this.adapter.request('GET', `/tasks/${validateResourceId(taskId)}`);
  }
}
