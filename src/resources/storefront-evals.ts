/**
 * Storefront evals resource for testing agent recommendations
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';

export class StorefrontEvalsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  async run(_agentId: string, briefs: { brief: string }[]): Promise<unknown> {
    return this.adapter.request<unknown>('POST', '/storefront/evals', { briefs });
  }

  async get(evalId: string): Promise<unknown> {
    return this.adapter.request<unknown>('GET', `/storefront/evals/${validateResourceId(evalId)}`);
  }

  async compare(evalIdA: string, evalIdB: string): Promise<unknown> {
    return this.adapter.request<unknown>('POST', '/storefront/evals/compare', {
      eval_id_a: evalIdA,
      eval_id_b: evalIdB,
    });
  }
}
