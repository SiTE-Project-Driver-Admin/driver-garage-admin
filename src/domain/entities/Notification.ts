export interface Notification {
  id: string
  title: string
  message: string
  type: "WARNING" | "SUCCESS" | "INFO"
  isRead: boolean
  createdAt: string
}