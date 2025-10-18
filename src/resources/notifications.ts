import { Scope3Client } from '../client';
import { ToolResponse } from '../types';

export interface NotificationsListRequest {
  unreadOnly?: boolean;
  limit?: number;
}

export interface NotificationMarkReadRequest {
  notificationId: string;
}

export interface NotificationMarkAcknowledgedRequest {
  notificationId: string;
}

export class NotificationsResource {
  constructor(private client: Scope3Client) {}

  async list(request: NotificationsListRequest = {}): Promise<ToolResponse> {
    return this.client['post']('/notifications-list', request);
  }

  async markRead(request: NotificationMarkReadRequest): Promise<ToolResponse> {
    return this.client['post']('/notifications-mark-read', request);
  }

  async markAcknowledged(request: NotificationMarkAcknowledgedRequest): Promise<ToolResponse> {
    return this.client['post']('/notifications-mark-acknowledged', request);
  }

  async markAllRead(): Promise<ToolResponse> {
    return this.client['post']('/notifications-mark-all-read', {});
  }
}
