import { type BaseAdapter } from '../adapters/base';
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
  ApiResponse,
} from '../types';

/**
 * Resource for managing notification preferences
 */
export class NotificationPreferencesResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * Get current notification preferences
   * @returns Notification preferences
   */
  async get(): Promise<ApiResponse<NotificationPreferences>> {
    return this.adapter.request<ApiResponse<NotificationPreferences>>(
      'GET',
      '/notification-preferences'
    );
  }

  /**
   * Update notification preferences
   * @param data Updated preferences
   * @returns Updated notification preferences
   */
  async update(
    data: UpdateNotificationPreferencesInput
  ): Promise<ApiResponse<NotificationPreferences>> {
    return this.adapter.request<ApiResponse<NotificationPreferences>>(
      'PUT',
      '/notification-preferences',
      data
    );
  }
}
