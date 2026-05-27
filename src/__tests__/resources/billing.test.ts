/**
 * Tests for BuyerBillingResource
 */

import { BuyerBillingResource } from '../../resources/billing';
import type { BaseAdapter } from '../../adapters/base';

describe('BuyerBillingResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: BuyerBillingResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'buyer' as const,
      debug: false,
      validate: false,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new BuyerBillingResource(mockAdapter);
  });

  describe('listInvoices', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ data: [] });
      await resource.listInvoices();
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/billing/invoices');
    });
  });

  describe('listPendingItems', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ data: [] });
      await resource.listPendingItems();
      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/billing/pending-invoice-items');
    });
  });
});
