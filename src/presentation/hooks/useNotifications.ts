import { useEffect, useMemo, useState } from "react"
import type { Notification } from "../../domain/entities/Notification"
import { NotificationRepositoryImpl } from "../../infrastructure/repositories/NotificationRepositoryImpl"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const repository = new NotificationRepositoryImpl()

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const data = await repository.listAll()
        setNotifications(data)
      } catch (err: any) {
        setError(err.message ?? "Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length
  }, [notifications])

  return {
    notifications,
    setNotifications,
    unreadCount,
    loading,
    error,
    repository,
  }
}