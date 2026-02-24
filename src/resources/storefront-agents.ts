/**
 * Storefront agents resource for managing storefront agents
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  StorefrontAgent,
  CreateStorefrontAgentInput,
  UpdateStorefrontAgentInput,
  StorefrontUploadInput,
  StorefrontUploadResult,
} from '../types';
import { StorefrontTasksResource } from './storefront-tasks';
import { StorefrontTracesResource } from './storefront-traces';
import { StorefrontEvalsResource } from './storefront-evals';

export class StorefrontAgentsResource {
  private readonly _evals: StorefrontEvalsResource;

  constructor(private readonly adapter: BaseAdapter) {
    this._evals = new StorefrontEvalsResource(adapter);
  }

  private storefrontPath(path: string): string {
    return `/storefront${path}`;
  }

  private assertStorefrontId(id: string | undefined): void {
    if (id && id !== 'storefront') {
      throw new Error('Only "storefront" is supported by the current Storefront API');
    }
  }

  // ── Agent CRUD ────────────────────────────────────────────────────

  async list(): Promise<unknown> {
    const storefront = await this.get();
    return { storefronts: [storefront] };
  }

  async get(id?: string): Promise<StorefrontAgent> {
    this.assertStorefrontId(id);
    return this.adapter.request<StorefrontAgent>('GET', this.storefrontPath(''));
  }

  async create(data: CreateStorefrontAgentInput): Promise<StorefrontAgent> {
    const payload = { ...data };
    delete payload.platformId;
    return this.adapter.request<StorefrontAgent>('PUT', this.storefrontPath(''), payload);
  }

  async update(id: string, data: UpdateStorefrontAgentInput): Promise<StorefrontAgent> {
    this.assertStorefrontId(id);
    return this.adapter.request<StorefrontAgent>('PUT', this.storefrontPath(''), data);
  }

  async delete(id: string): Promise<void> {
    this.assertStorefrontId(id);
    throw new Error('Storefront deletion is no longer supported by the Storefront API');
  }

  // ── Product templates ─────────────────────────────────────────────

  async upload(id: string, data: StorefrontUploadInput): Promise<StorefrontUploadResult> {
    this.assertStorefrontId(id);
    return this.adapter.request<StorefrontUploadResult>(
      'POST',
      this.storefrontPath('/upload'),
      data
    );
  }

  async fileUploads(id: string, limit?: number): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/file-uploads'), undefined, {
      params: { limit },
    });
  }

  // ── Sub-resource factories ────────────────────────────────────────

  tasks(agentId: string): StorefrontTasksResource {
    return new StorefrontTasksResource(this.adapter, agentId);
  }

  traces(agentId: string): StorefrontTracesResource {
    return new StorefrontTracesResource(this.adapter, agentId);
  }

  get evals(): StorefrontEvalsResource {
    return this._evals;
  }

  // ── Configuration ─────────────────────────────────────────────────

  async getCapabilities(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/capabilities'));
  }

  async setCapabilities(
    id: string,
    capabilities: Record<string, { mode: string }>
  ): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('PUT', this.storefrontPath('/capabilities'), {
      capabilities,
    });
  }

  async setNotifications(
    id: string,
    channels: { type: string; destination: string }[]
  ): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('PUT', this.storefrontPath('/notifications'), {
      channels,
    });
  }

  async getLlmProvider(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/llm-provider'));
  }

  async setLlmProvider(
    id: string,
    data: { provider: string; model_id?: string; api_key?: string }
  ): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('PUT', this.storefrontPath('/llm-provider'), data);
  }

  async getInboundFilters(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/inbound-filters'));
  }

  async setInboundFilters(id: string, filters: unknown[]): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('PUT', this.storefrontPath('/inbound-filters'), {
      filters,
    });
  }

  // ── Storefront sources ────────────────────────────────────────────

  async getInventorySources(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/inventory-sources'));
  }

  async setInventorySources(id: string, inventorySources: unknown[]): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('PUT', this.storefrontPath('/inventory-sources'), {
      inventorySources,
    });
  }

  async getAudienceSources(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/audience-sources'));
  }

  async setAudienceSources(id: string, audienceSources: unknown[]): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('PUT', this.storefrontPath('/audience-sources'), {
      audienceSources,
    });
  }

  async getSignalsSources(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/signals-sources'));
  }

  async setSignalsSources(id: string, signalsSources: unknown[]): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('PUT', this.storefrontPath('/signals-sources'), {
      signalsSources,
    });
  }

  async getAccountSources(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/account-sources'));
  }

  async setAccountSources(id: string, accountSources: unknown[]): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('PUT', this.storefrontPath('/account-sources'), {
      accountSources,
    });
  }

  async getRateCards(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/rate-cards'));
  }

  async setRateCards(id: string, rateCards: unknown[]): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('PUT', this.storefrontPath('/rate-cards'), {
      rateCards,
    });
  }

  async getProposalTemplates(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/proposal-templates'));
  }

  async setProposalTemplates(id: string, proposalTemplates: unknown[]): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('PUT', this.storefrontPath('/proposal-templates'), {
      proposalTemplates,
    });
  }

  async getResaleProgram(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/resale-program'));
  }

  async setResaleProgram(id: string, resaleProgram: Record<string, unknown>): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('PUT', this.storefrontPath('/resale-program'), {
      resaleProgram,
    });
  }

  // ── Diagnostics ────────────────────────────────────────────────────────────

  async getReadiness(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/readiness'));
  }

  async getCoverage(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/coverage'));
  }

  async getHealth(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/health'));
  }

  // ── Billing ────────────────────────────────────────────────────────────────

  async connectBilling(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('POST', this.storefrontPath('/billing/connect'));
  }

  async getBilling(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/billing'));
  }

  async updateBilling(
    id: string,
    data: {
      platformFeePercent?: number;
      fees?: Array<{ name: string; description?: string; feePercent: number }>;
      currency?: string;
      defaultNetDays?: number;
    }
  ): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('PUT', this.storefrontPath('/billing'), data);
  }

  async getBillingStatus(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/billing/status'));
  }

  async listBillingTransactions(
    id: string,
    params?: { limit?: number; starting_after?: string }
  ): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>(
      'GET',
      this.storefrontPath('/billing/transactions'),
      undefined,
      { params: { limit: params?.limit, starting_after: params?.starting_after } }
    );
  }

  async listBillingPayouts(
    id: string,
    params?: { limit?: number; starting_after?: string }
  ): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>(
      'GET',
      this.storefrontPath('/billing/payouts'),
      undefined,
      { params: { limit: params?.limit, starting_after: params?.starting_after } }
    );
  }

  async getBillingOnboardingUrl(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/billing/onboard'));
  }

  // ── Hosted sales agent ─────────────────────────────────────────────────────

  async provisionHostedSalesAgent(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('POST', this.storefrontPath('/hosted-sales-agent'));
  }

  async getHostedSalesAgent(id: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/hosted-sales-agent'));
  }

  // ── Testing ────────────────────────────────────────────────────────────────

  async provisionSandbox(id: string, data?: { advertiser_name?: string }): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('POST', this.storefrontPath('/sandbox'), data ?? {});
  }

  async runTest(
    id: string,
    data?: { max_briefs?: number; scenarios?: string[] }
  ): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('POST', this.storefrontPath('/test'), data ?? {});
  }

  async listTestRuns(id: string, limit?: number): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/test-runs'), undefined, {
      params: { limit },
    });
  }

  async getTestRun(testRunId: string): Promise<unknown> {
    return this.adapter.request<unknown>(
      'GET',
      `/storefront/test-runs/${validateResourceId(testRunId)}`
    );
  }

  async getSessionThread(id: string, sessionId: string): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/sessions'), undefined, {
      params: { session_id: sessionId },
    });
  }

  // ── Policy and audit ──────────────────────────────────────────────

  async synthesizePolicy(id: string, apply = true): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('POST', this.storefrontPath('/synthesize-policy'), {
      apply,
    });
  }

  async audit(id: string, limit?: number): Promise<unknown> {
    this.assertStorefrontId(id);
    return this.adapter.request<unknown>('GET', this.storefrontPath('/config-changes'), undefined, {
      params: { limit },
    });
  }
}
