/**
 * Tests for BillingResource
 */

import { BillingResource } from '../../resources/billing';
import type { BaseAdapter } from '../../adapters/base';

describe('BillingResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: BillingResource;

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
    resource = new BillingResource(mockAdapter);
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ billing: null });
      await resource.get();
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/billing');
    });
  });

  describe('connect', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ onboardingUrl: 'https://stripe.com/...' });
      await resource.connect();
      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/billing/connect');
    });
  });

  describe('status', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ verified: true });
      await resource.status();
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/billing/status');
    });
  });

  describe('transactions', () => {
    it('should call adapter with correct path and params', async () => {
      mockAdapter.request.mockResolvedValue({ data: [] });
      await resource.transactions({ limit: 10, starting_after: 'txn_abc' });
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/billing/transactions', undefined, {
        params: { limit: 10, starting_after: 'txn_abc' },
      });
    });
  });

  describe('payouts', () => {
    it('should call adapter with correct path and params', async () => {
      mockAdapter.request.mockResolvedValue({ data: [] });
      await resource.payouts({ limit: 25 });
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/billing/payouts', undefined, {
        params: { limit: 25, starting_after: undefined },
      });
    });
  });

  describe('onboardingUrl', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ url: 'https://stripe.com/...' });
      await resource.onboardingUrl();
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/billing/onboard');
    });
  });
});
