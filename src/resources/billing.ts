import { type BaseAdapter } from '../adapters/base';
import type { BuyerInvoice, BuyerPendingInvoiceItem, ApiResponse } from '../types';

/**
 * Resource for buyer billing and invoices
 */
export class BuyerBillingResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List invoices for the current buyer
   * @returns List of invoices
   */
  async listInvoices(): Promise<ApiResponse<BuyerInvoice[]>> {
    return this.adapter.request<ApiResponse<BuyerInvoice[]>>('GET', '/billing/invoices');
  }

  /**
   * List pending invoice items that have not yet been billed
   * @returns List of pending invoice items
   */
  async listPendingItems(): Promise<ApiResponse<BuyerPendingInvoiceItem[]>> {
    return this.adapter.request<ApiResponse<BuyerPendingInvoiceItem[]>>(
      'GET',
      '/billing/pending-invoice-items'
    );
  }
}
