/**
 * Tests for StorefrontAgentsResource and StorefrontTasksResource
 */

import { StorefrontAgentsResource } from '../../resources/storefront-agents';
import { StorefrontTasksResource } from '../../resources/storefront-tasks';
import type { BaseAdapter } from '../../adapters/base';

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

  describe('list', () => {
    it('should call GET /agents', async () => {
      mockAdapter.request.mockResolvedValue({ agents: [] });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents');
    });
  });

  describe('get', () => {
    it('should call GET /agents/{id}', async () => {
      mockAdapter.request.mockResolvedValue({ platformId: 'my-network' });

      await resource.get('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents/my-network');
    });
  });

  describe('create', () => {
    it('should call POST /agents with body', async () => {
      mockAdapter.request.mockResolvedValue({ platformId: 'my-network' });

      await resource.create({
        platformId: 'my-network',
        platformName: 'My Network',
        publisherDomain: 'mynetwork.com',
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/agents', {
        platformId: 'my-network',
        platformName: 'My Network',
        publisherDomain: 'mynetwork.com',
      });
    });
  });

  describe('update', () => {
    it('should call PUT /agents/{id} with body', async () => {
      mockAdapter.request.mockResolvedValue({ platformId: 'my-network' });

      await resource.update('my-network', { platformName: 'Updated Name' });

      expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '/agents/my-network', {
        platformName: 'Updated Name',
      });
    });
  });

  describe('delete', () => {
    it('should call DELETE /agents/{id}', async () => {
      mockAdapter.request.mockResolvedValue(undefined);

      await resource.delete('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith('DELETE', '/agents/my-network');
    });
  });

  describe('upload', () => {
    it('should call POST /agents/{id}/upload', async () => {
      mockAdapter.request.mockResolvedValue({ templatesAdded: 1 });

      await resource.upload('my-network', {
        content: 'name,description\nBanner,Display',
        file_type: 'csv',
        replace: true,
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/agents/my-network/upload', {
        content: 'name,description\nBanner,Display',
        file_type: 'csv',
        replace: true,
      });
    });
  });

  describe('fileUploads', () => {
    it('should call GET /agents/{id}/file-uploads with limit', async () => {
      mockAdapter.request.mockResolvedValue({ uploads: [] });

      await resource.fileUploads('my-network', 10);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/agents/my-network/file-uploads',
        undefined,
        { params: { limit: 10 } }
      );
    });
  });

  describe('proposal templates', () => {
    it('should call GET /agents/{id}/proposal-templates', async () => {
      mockAdapter.request.mockResolvedValue({ proposalTemplates: [] });

      await resource.getProposalTemplates('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/agents/my-network/proposal-templates'
      );
    });

    it('should call PUT /agents/{id}/proposal-templates with body', async () => {
      mockAdapter.request.mockResolvedValue({ ok: true });

      await resource.setProposalTemplates('my-network', [
        {
          id: 'template-1',
          name: 'Q1 Standard',
          description: 'Standard package',
          lineItems: [{ templateId: 'prod-1' }],
          price: { amount: 1000 },
        },
      ]);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'PUT',
        '/agents/my-network/proposal-templates',
        {
          proposalTemplates: [
            {
              id: 'template-1',
              name: 'Q1 Standard',
              description: 'Standard package',
              lineItems: [{ templateId: 'prod-1' }],
              price: { amount: 1000 },
            },
          ],
        }
      );
    });
  });

  describe('diagnostics', () => {
    it('should call GET /agents/{id}/readiness', async () => {
      mockAdapter.request.mockResolvedValue({ ready: true });

      await resource.getReadiness('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents/my-network/readiness');
    });

    it('should call GET /agents/{id}/coverage', async () => {
      mockAdapter.request.mockResolvedValue({ sources: [] });

      await resource.getCoverage('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents/my-network/coverage');
    });

    it('should call GET /agents/{id}/health', async () => {
      mockAdapter.request.mockResolvedValue({ uptime: 1 });

      await resource.getHealth('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents/my-network/health');
    });
  });

  describe('resale program', () => {
    it('should call GET /agents/{id}/resale-program', async () => {
      mockAdapter.request.mockResolvedValue({ resaleProgram: { enabled: true } });

      await resource.getResaleProgram('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents/my-network/resale-program');
    });

    it('should call PUT /agents/{id}/resale-program with body', async () => {
      mockAdapter.request.mockResolvedValue({ ok: true });

      await resource.setResaleProgram('my-network', {
        enabled: true,
        accessPolicy: 'approval_required',
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '/agents/my-network/resale-program', {
        resaleProgram: {
          enabled: true,
          accessPolicy: 'approval_required',
        },
      });
    });
  });

  describe('billing', () => {
    it('should call POST /agents/{id}/billing/connect', async () => {
      mockAdapter.request.mockResolvedValue({ onboardingUrl: 'https://stripe.com/onboard' });

      await resource.connectBilling('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/agents/my-network/billing/connect'
      );
    });

    it('should call GET /agents/{id}/billing', async () => {
      mockAdapter.request.mockResolvedValue({ provider: 'stripe' });

      await resource.getBilling('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents/my-network/billing');
    });

    it('should call GET /agents/{id}/billing/status', async () => {
      mockAdapter.request.mockResolvedValue({ charges_enabled: true });

      await resource.getBillingStatus('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents/my-network/billing/status');
    });

    it('should call GET /agents/{id}/billing/transactions with params', async () => {
      mockAdapter.request.mockResolvedValue({ data: [] });

      await resource.listBillingTransactions('my-network', {
        limit: 25,
        starting_after: 'txn_123',
      });

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/agents/my-network/billing/transactions',
        undefined,
        { params: { limit: 25, starting_after: 'txn_123' } }
      );
    });

    it('should call GET /agents/{id}/billing/payouts with params', async () => {
      mockAdapter.request.mockResolvedValue({ data: [] });

      await resource.listBillingPayouts('my-network', {
        limit: 10,
        starting_after: 'po_123',
      });

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/agents/my-network/billing/payouts',
        undefined,
        { params: { limit: 10, starting_after: 'po_123' } }
      );
    });

    it('should call GET /agents/{id}/billing/onboard', async () => {
      mockAdapter.request.mockResolvedValue({ onboardingUrl: 'https://stripe.com/onboard' });

      await resource.getBillingOnboardingUrl('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents/my-network/billing/onboard');
    });
  });

  describe('hosted sales agent', () => {
    it('should call POST /agents/{id}/hosted-sales-agent', async () => {
      mockAdapter.request.mockResolvedValue({ mcpUrl: 'https://example.com/mcp' });

      await resource.provisionHostedSalesAgent('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/agents/my-network/hosted-sales-agent'
      );
    });

    it('should call GET /agents/{id}/hosted-sales-agent', async () => {
      mockAdapter.request.mockResolvedValue({ mcpUrl: 'https://example.com/mcp' });

      await resource.getHostedSalesAgent('my-network');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/agents/my-network/hosted-sales-agent'
      );
    });
  });

  describe('testing endpoints', () => {
    it('should call POST /agents/{id}/sandbox with body', async () => {
      mockAdapter.request.mockResolvedValue({ sandboxAccountId: 'acc_1' });

      await resource.provisionSandbox('my-network', { advertiser_name: 'Test Advertiser' });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/agents/my-network/sandbox', {
        advertiser_name: 'Test Advertiser',
      });
    });

    it('should call POST /agents/{id}/test with body', async () => {
      mockAdapter.request.mockResolvedValue({ testRunId: 'tr_1' });

      await resource.runTest('my-network', { max_briefs: 5, scenarios: ['baseline'] });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/agents/my-network/test', {
        max_briefs: 5,
        scenarios: ['baseline'],
      });
    });

    it('should call GET /agents/{id}/test-runs with limit', async () => {
      mockAdapter.request.mockResolvedValue({ items: [] });

      await resource.listTestRuns('my-network', 20);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/agents/my-network/test-runs',
        undefined,
        { params: { limit: 20 } }
      );
    });

    it('should call GET /test-runs/{id}', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'tr_1' });

      await resource.getTestRun('tr_1');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/test-runs/tr_1');
    });

    it('should call GET /agents/{id}/sessions with session_id query param', async () => {
      mockAdapter.request.mockResolvedValue({ events: [] });

      await resource.getSessionThread('my-network', 'session-123');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/agents/my-network/sessions',
        undefined,
        { params: { session_id: 'session-123' } }
      );
    });
  });

  describe('tasks', () => {
    it('should return a StorefrontTasksResource scoped to the agent', () => {
      const tasks = resource.tasks('my-network');
      expect(tasks).toBeInstanceOf(StorefrontTasksResource);
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
    resource = new StorefrontTasksResource(mockAdapter, 'my-network');
  });

  describe('list', () => {
    it('should call GET /agents/{agentId}/tasks', async () => {
      mockAdapter.request.mockResolvedValue({ tasks: [] });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/agents/my-network/tasks',
        undefined,
        { params: { status: undefined, capability: undefined, limit: undefined } }
      );
    });

    it('should pass filter params', async () => {
      mockAdapter.request.mockResolvedValue({ tasks: [] });

      await resource.list({ status: 'pending', capability: 'get_products', limit: 5 });

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/agents/my-network/tasks',
        undefined,
        { params: { status: 'pending', capability: 'get_products', limit: 5 } }
      );
    });
  });

  describe('get', () => {
    it('should call GET /tasks/{taskId}', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'pending' });

      await resource.get('task-1');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/tasks/task-1');
    });
  });

  describe('claim', () => {
    it('should call POST /tasks/{taskId}/claim', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'claimed' });

      await resource.claim('task-1', { claimed_by: 'reviewer' });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/tasks/task-1/claim', {
        claimed_by: 'reviewer',
      });
    });

    it('should default to empty body when no input provided', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'claimed' });

      await resource.claim('task-1');

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/tasks/task-1/claim', {});
    });
  });

  describe('complete', () => {
    it('should call POST /tasks/{taskId}/complete with result', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'completed' });

      await resource.complete('task-1', { result: { approved: true } });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/tasks/task-1/complete', {
        result: { approved: true },
      });
    });

    it('should include correction when provided', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'task-1', status: 'completed' });

      await resource.complete('task-1', {
        result: { approved: true },
        correction: {
          original: { budget: 1000 },
          corrected: { budget: 500 },
          reason: 'Budget cap exceeded',
        },
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/tasks/task-1/complete', {
        result: { approved: true },
        correction: {
          original: { budget: 1000 },
          corrected: { budget: 500 },
          reason: 'Budget cap exceeded',
        },
      });
    });
  });
});
