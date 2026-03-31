/**
 * Tests for AgentsResource
 */

import { AgentsResource } from '../../resources/agents';
import type { BaseAdapter } from '../../adapters/base';

describe('AgentsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: AgentsResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'storefront' as const,
      debug: false,
      validate: false,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new AgentsResource(mockAdapter);
  });

  describe('list', () => {
    it('should call adapter with correct path and no params', async () => {
      mockAdapter.request.mockResolvedValue({ items: [] });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents', undefined, {
        params: {
          type: undefined,
          status: undefined,
          relationship: undefined,
        },
      });
    });

    it('should pass filter params when provided', async () => {
      mockAdapter.request.mockResolvedValue({ items: [] });

      await resource.list({
        type: 'SALES',
        status: 'ACTIVE',
        relationship: 'CONNECTED',
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents', undefined, {
        params: {
          type: 'SALES',
          status: 'ACTIVE',
          relationship: 'CONNECTED',
        },
      });
    });
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ id: 'agent-1', name: 'Test Agent' });

      await resource.get('agent-1');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/agents/agent-1');
    });
  });

  describe('update', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { name: 'Updated Agent' };
      mockAdapter.request.mockResolvedValue({ id: 'agent-1', name: 'Updated Agent' });

      await resource.update('agent-1', input);

      expect(mockAdapter.request).toHaveBeenCalledWith('PATCH', '/agents/agent-1', input);
    });
  });

  describe('authorizeOAuth', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ authorizationUrl: 'https://oauth.example.com' });

      await resource.authorizeOAuth('agent-1');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/agents/agent-1/oauth/authorize',
        {}
      );
    });
  });

  describe('authorizeAccountOAuth', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ authorizationUrl: 'https://oauth.example.com' });

      await resource.authorizeAccountOAuth('agent-1');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/agents/agent-1/accounts/oauth/authorize',
        {}
      );
    });
  });

  describe('exchangeOAuthCode', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { code: 'auth-code-123', state: 'state-456' };
      mockAdapter.request.mockResolvedValue({ success: true });

      await resource.exchangeOAuthCode('agent-1', input);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/agents/agent-1/oauth/callback',
        input
      );
    });
  });
});
