import { Scope3Client } from '../../client';
import type { operations } from '../../types/partner-api';

export class NotificationsResource {
  constructor(private client: Scope3Client) {}

  /**
   * List notifications
   * List notifications for the authenticated user with optional filtering by status.
   */
  async notificationsList(
    params: operations['notifications_list']['requestBody']['content']['application/json']
  ): Promise<operations['notifications_list']['responses'][200]['content']['application/json']> {
    return this.client['callTool']('notifications_list', params);
  }

  /**
   * Mark notification as read
   * Mark a specific notification as read.
   */
  async notificationsMarkRead(
    params: operations['notifications_mark_read']['requestBody']['content']['application/json']
  ): Promise<
    operations['notifications_mark_read']['responses'][200]['content']['application/json']
  > {
    return this.client['callTool']('notifications_mark_read', params);
  }

  /**
   * Mark notification as acknowledged
   * Mark a specific notification as acknowledged.
   */
  async notificationsMarkAcknowledged(
    params: operations['notifications_mark_acknowledged']['requestBody']['content']['application/json']
  ): Promise<
    operations['notifications_mark_acknowledged']['responses'][200]['content']['application/json']
  > {
    return this.client['callTool']('notifications_mark_acknowledged', params);
  }

  /**
   * Mark all notifications as read
   * Mark all notifications for the authenticated user as read.
   */
  async notificationsMarkAllRead(
    params: operations['notifications_mark_all_read']['requestBody']['content']['application/json']
  ): Promise<
    operations['notifications_mark_all_read']['responses'][200]['content']['application/json']
  > {
    return this.client['callTool']('notifications_mark_all_read', params);
  }
}
