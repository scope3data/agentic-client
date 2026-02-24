/**
 * Tests for StorefrontAgentsResource and StorefrontTasksResource
 */

import type { BaseAdapter } from '../../adapters/base';
import { StorefrontAgentsResource } from '../../resources/storefront-agents';
import { StorefrontTasksResource } from '../../resources/storefront-tasks';

describe('StorefrontAgentsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: StorefrontAgentsResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'storefront' as const,
      debug: false,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new StorefrontAgentsResource(mockAdapter);
  });

  it('list should wrap GET /storefront response', async () => {
    const storefront = { platformId: 'storefront' };
    mockAdapter.request.mockResolvedValue(storefront);

    const result = await resource.list();

    expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/storefront');
    expect(result).toEqual({ storefronts: [storefront] });
  });

  it('get should call GET /storefront', async () => {
    mockAdapter.request.mockResolvedValue({ platformId: 'storefront' });

    await resource.get('storefront');

    expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/storefront');
  });

  it('create should call PUT /storefront and omit platformId', async () => {
    mockAdapter.request.mockResolvedValue({ platformId: 'storefront' });

    await resource.create({
      platformId: 'legacy-id',
      platformName: 'My Storefront',
      publisherDomain: 'example.com',
      role: 'sales',
    });

    expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '/storefront', {
      platformName: 'My Storefront',
      publisherDomain: 'example.com',
      role: 'sales',
    });
  });

  it('update should call PUT /storefront', async () => {
    mockAdapter.request.mockResolvedValue({ platformId: 'storefront' });

    await resource.update('storefront', { platformName: 'Updated Name' });

    expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '/storefront', {
      platformName: 'Updated Name',
    });
  });

  it('delete should throw because storefront deletion is unsupported', async () => {
    await expect(resource.delete('storefront')).rejects.toThrow(
      'Storefront deletion is no longer supported by the Storefront API'
    );
    expect(mockAdapter.request).not.toHaveBeenCalled();
  });

  it('upload should call POST /storefront/upload', async () => {
    mockAdapter.request.mockResolvedValue({ templatesAdded: 1 });

    await resource.upload('storefront', {
      content: 'name,description\nBanner,Display',
      file_type: 'csv',
      replace: true,
    });

    expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/storefront/upload', {
      content: 'name,description\nBanner,Display',
      file_type: 'csv',
      replace: true,
    });
  });

  it('fileUploads should call GET /storefront/file-uploads', async () => {
    mockAdapter.request.mockResolvedValue({ uploads: [] });

    await resource.fileUploads('storefront', 10);

    expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/storefront/file-uploads', undefined, {
      params: { limit: 10 },
    });
  });

  it('signals sources should use /storefront/signals-sources', async () => {
    mockAdapter.request.mockResolvedValue({ signalsSources: [] });

    await resource.getSignalsSources('storefront');
    await resource.setSignalsSources('storefront', [{ id: 'sig-1' }]);

    expect(mockAdapter.request).toHaveBeenNthCalledWith(1, 'GET', '/storefront/signals-sources');
    expect(mockAdapter.request).toHaveBeenNthCalledWith(2, 'PUT', '/storefront/signals-sources', {
      signalsSources: [{ id: 'sig-1' }],
    });
  });

  it('proposal templates should use /storefront/proposal-templates', async () => {
    mockAdapter.request.mockResolvedValue({ proposalTemplates: [] });

    await resource.getProposalTemplates('storefront');
    await resource.setProposalTemplates('storefront', [{ id: 'template-1' }]);

    expect(mockAdapter.request).toHaveBeenNthCalledWith(1, 'GET', '/storefront/proposal-templates');
    expect(mockAdapter.request).toHaveBeenNthCalledWith(
      2,
      'PUT',
      '/storefront/proposal-templates',
      {
        proposalTemplates: [{ id: 'template-1' }],
      }
    );
  });

  it('diagnostics should use singleton storefront routes', async () => {
    mockAdapter.request.mockResolvedValue({});

    await resource.getReadiness('storefront');
    await resource.getCoverage('storefront');
    await resource.getHealth('storefront');

    expect(mockAdapter.request).toHaveBeenNthCalledWith(1, 'GET', '/storefront/readiness');
    expect(mockAdapter.request).toHaveBeenNthCalledWith(2, 'GET', '/storefront/coverage');
    expect(mockAdapter.request).toHaveBeenNthCalledWith(3, 'GET', '/storefront/health');
  });

  it('billing routes should use /storefront/billing*', async () => {
    mockAdapter.request.mockResolvedValue({});

    await resource.connectBilling('storefront');
    await resource.getBilling('storefront');
    await resource.updateBilling('storefront', { platformFeePercent: 5.5 });
    await resource.getBillingStatus('storefront');
    await resource.listBillingTransactions('storefront', { limit: 25, starting_after: 'txn_123' });
    await resource.listBillingPayouts('storefront', { limit: 10, starting_after: 'po_123' });
    await resource.getBillingOnboardingUrl('storefront');

    expect(mockAdapter.request).toHaveBeenNthCalledWith(1, 'POST', '/storefront/billing/connect');
    expect(mockAdapter.request).toHaveBeenNthCalledWith(2, 'GET', '/storefront/billing');
    expect(mockAdapter.request).toHaveBeenNthCalledWith(3, 'PUT', '/storefront/billing', {
      platformFeePercent: 5.5,
    });
    expect(mockAdapter.request).toHaveBeenNthCalledWith(4, 'GET', '/storefront/billing/status');
    expect(mockAdapter.request).toHaveBeenNthCalledWith(
      5,
      'GET',
      '/storefront/billing/transactions',
      undefined,
      { params: { limit: 25, starting_after: 'txn_123' } }
    );
    expect(mockAdapter.request).toHaveBeenNthCalledWith(
      6,
      'GET',
      '/storefront/billing/payouts',
      undefined,
      { params: { limit: 10, starting_after: 'po_123' } }
    );
    expect(mockAdapter.request).toHaveBeenNthCalledWith(7, 'GET', '/storefront/billing/onboard');
  });

  it('hosted sales agent routes should use /storefront/hosted-sales-agent', async () => {
    mockAdapter.request.mockResolvedValue({});

    await resource.provisionHostedSalesAgent('storefront');
    await resource.getHostedSalesAgent('storefront');

    expect(mockAdapter.request).toHaveBeenNthCalledWith(
      1,
      'POST',
      '/storefront/hosted-sales-agent'
    );
    expect(mockAdapter.request).toHaveBeenNthCalledWith(2, 'GET', '/storefront/hosted-sales-agent');
  });

  it('testing endpoints should use singleton storefront routes', async () => {
    mockAdapter.request.mockResolvedValue({});

    await resource.provisionSandbox('storefront', { advertiser_name: 'Test Advertiser' });
    await resource.runTest('storefront', { max_briefs: 5, scenarios: ['baseline'] });
    await resource.listTestRuns('storefront', 20);
    await resource.getTestRun('tr_1');
    await resource.getSessionThread('storefront', 'session-123');

    expect(mockAdapter.request).toHaveBeenNthCalledWith(1, 'POST', '/storefront/sandbox', {
      advertiser_name: 'Test Advertiser',
    });
    expect(mockAdapter.request).toHaveBeenNthCalledWith(2, 'POST', '/storefront/test', {
      max_briefs: 5,
      scenarios: ['baseline'],
    });
    expect(mockAdapter.request).toHaveBeenNthCalledWith(
      3,
      'GET',
      '/storefront/test-runs',
      undefined,
      { params: { limit: 20 } }
    );
    expect(mockAdapter.request).toHaveBeenNthCalledWith(4, 'GET', '/storefront/test-runs/tr_1');
    expect(mockAdapter.request).toHaveBeenNthCalledWith(
      5,
      'GET',
      '/storefront/sessions',
      undefined,
      { params: { session_id: 'session-123' } }
    );
  });

  it('tasks() should return StorefrontTasksResource', () => {
    const tasks = resource.tasks('storefront');
    expect(tasks).toBeInstanceOf(StorefrontTasksResource);
  });

  it('evals should use /storefront/evals* endpoints', async () => {
    mockAdapter.request.mockResolvedValue({});

    await resource.evals.run('storefront', [{ brief: 'Find podcast sponsorships' }]);
    await resource.evals.get('ev_123');
    await resource.evals.compare('ev_a', 'ev_b');

    expect(mockAdapter.request).toHaveBeenNthCalledWith(1, 'POST', '/storefront/evals', {
      briefs: [{ brief: 'Find podcast sponsorships' }],
    });
    expect(mockAdapter.request).toHaveBeenNthCalledWith(2, 'GET', '/storefront/evals/ev_123');
    expect(mockAdapter.request).toHaveBeenNthCalledWith(3, 'POST', '/storefront/evals/compare', {
      eval_id_a: 'ev_a',
      eval_id_b: 'ev_b',
    });
  });
});

describe('StorefrontTasksResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: StorefrontTasksResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'storefront' as const,
      debug: false,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new StorefrontTasksResource(mockAdapter, 'storefront');
  });

  it('list should call GET /storefront/tasks', async () => {
    mockAdapter.request.mockResolvedValue({ tasks: [] });

    await resource.list({ status: 'pending', capability: 'get_products', limit: 5 });

    expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/storefront/tasks', undefined, {
      params: { status: 'pending', capability: 'get_products', limit: 5 },
    });
  });

  it('get should call GET /storefront/tasks/{id}', async () => {
    mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'pending' });

    await resource.get('task-1');

    expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/storefront/tasks/task-1');
  });

  it('claim should call POST /storefront/tasks/{id}/claim', async () => {
    mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'claimed' });

    await resource.claim('task-1', { claimed_by: 'reviewer' });

    expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/storefront/tasks/task-1/claim', {
      claimed_by: 'reviewer',
    });
  });

  it('complete should call POST /storefront/tasks/{id}/complete', async () => {
    mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'completed' });

    await resource.complete('task-1', {
      result: { approved: true },
      correction: {
        original: { budget: 1000 },
        corrected: { budget: 500 },
        reason: 'Budget cap exceeded',
      },
    });

    expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/storefront/tasks/task-1/complete', {
      result: { approved: true },
      correction: {
        original: { budget: 1000 },
        corrected: { budget: 500 },
        reason: 'Budget cap exceeded',
      },
    });
  });
});
