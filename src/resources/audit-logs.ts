import { type BaseAdapter } from '../adapters/base';
import type { AuditLog, ListAuditLogsParams, PaginatedApiResponse } from '../types';

/**
 * Resource for accessing audit logs
 */
export class AuditLogsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List audit log entries
   * @param params Filter and pagination parameters
   * @returns Paginated list of audit log entries
   */
  async list(params?: ListAuditLogsParams): Promise<PaginatedApiResponse<AuditLog>> {
    return this.adapter.request<PaginatedApiResponse<AuditLog>>('GET', '/audit-logs', undefined, {
      params: {
        take: params?.take,
        skip: params?.skip,
        resourceType: params?.resourceType,
        action: params?.action,
      },
    });
  }
}
