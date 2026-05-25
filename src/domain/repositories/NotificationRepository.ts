import type { Notification } from "../entities/Notification"

export interface NotificationRepository {
  listAll(): Promise<Notification[]>

  markAsRead(id: string): Promise<Notification>

  markAllAsRead(): Promise<void>
}