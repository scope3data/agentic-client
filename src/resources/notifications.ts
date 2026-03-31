/**
 * Notifications resource for managing storefront notifications
 */

import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type { ListNotificationsParams } from '../types';

/**
 * Resource for managing notifications (Storefront persona)
 */
export class NotificationsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List notifications
   * @param params Filter and pagination parameters
   * @returns List of notifications
   */
  async list(params?: ListNotificationsParams): Promise<unknown> {
    return this.adapter.request<unknown>('GET', '/notifications', undefined, {
      params: {
        unreadOnly: params?.unreadOnly,
        brandAgentId: params?.brandAgentId,
        types: params?.types,
        limit: params?.limit,
        offset: params?.offset,
      },
    });
  }

  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   */
  async markAsRead(notificationId: string): Promise<void> {
    await this.adapter.request<void>(
      'POST',
      `/notifications/${validateResourceId(notificationId)}/read`
    );
  }

  /**
   * Acknowledge a notification
   * @param notificationId Notification ID
   */
  async acknowledge(notificationId: string): Promise<void> {
    await this.adapter.request<void>(
      'POST',
      `/notifications/${validateResourceId(notificationId)}/acknowledge`
    );
  }

  /**
   * Mark all notifications as read
   * @param brandAgentId Optional brand agent ID to scope the operation
   */
  async markAllAsRead(brandAgentId?: number): Promise<void> {
    await this.adapter.request<void>(
      'POST',
      '/notifications/read-all',
      brandAgentId ? { brandAgentId } : undefined
    );
  }
}
