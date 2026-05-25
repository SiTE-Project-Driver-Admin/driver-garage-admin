import type { Notification } from "../../domain/entities/Notification"
import type { NotificationRepository } from "../../domain/repositories/NotificationRepository"
import { axiosClient } from "../api/axiosClient"

export class NotificationRepositoryImpl
  implements NotificationRepository {

  async listAll(): Promise<Notification[]> {
    const response = await axiosClient.get("/admin/notifications")
    return response.data
  }

  async markAsRead(id: string): Promise<Notification> {
    const response = await axiosClient.patch(
      `/admin/notifications/${id}/read`
    )

    return response.data
  }

  async markAllAsRead(): Promise<void> {
    await axiosClient.patch("/admin/notifications/read-all")
  }
}