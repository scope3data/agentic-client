import { Scope3Client } from '../../client';
import type { operations } from '../../types/partner-api';

export class CustomersResource {
  constructor(private client: Scope3Client) {}

  /**
   * Get customer info
   * Get detailed information about a customer from the core database.
   */
  async get(
    params: operations['customer_get']['requestBody']['content']['application/json']
  ): Promise<operations['customer_get']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('customer_get', params);
  }

  /**
   * Get customer seats
   * Get all seats associated with a customer from the core database.
   */
  async getSeats(
    params: operations['customer_get_seats']['requestBody']['content']['application/json']
  ): Promise<operations['customer_get_seats']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('customer_get_seats', params);
  }
}
