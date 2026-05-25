import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle,
  Bell,
} from "lucide-react"

import Button from "../components/button/button"
import Card from "../components/card/card"

import type { Notification } from "../../domain/entities/Notification"
import { NotificationRepositoryImpl } from "../../infrastructure/repositories/NotificationRepositoryImpl"

export default function NotificationsPage() {
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

  const handleMarkAsRead = async (id: string) => {
    try {
      const updated = await repository.markAsRead(id)

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === updated.id
            ? updated
            : notification
        )
      )
    } catch (err: any) {
      setError(err.message ?? "Failed to update notification")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await repository.markAllAsRead()

      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          isRead: true,
        }))
      )
    } catch (err: any) {
      setError(err.message ?? "Failed to update notifications")
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "WARNING":
        return (
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
        )

      case "SUCCESS":
        return (
          <CheckCircle className="w-5 h-5 text-green-500" />
        )

      default:
        return (
          <Bell className="w-5 h-5 text-blue-500" />
        )
    }
  }

  if (loading) return <p>Loading notifications...</p>

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Notifications
        </h1>

        <p className="text-gray-500">
          System notifications and admin updates
        </p>
      </div>

      {/* Unread Card */}
      <Card
        title="Unread Notifications"
        value={unreadCount}
        icon={<Bell className="w-6 h-6 text-yellow-500" />}
      />

      {/* Actions */}
      <div className="flex justify-end">
        <Button
          variant="secondary"
          onClick={handleMarkAllAsRead}
        >
          Mark all as read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border divide-y">

        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 flex items-start justify-between ${
              !notification.isRead
                ? "bg-yellow-50"
                : ""
            }`}
          >

            <div className="flex gap-3">

              <div className="mt-1">
                {getIcon(notification.type)}
              </div>

              <div>
                <h3 className="font-medium">
                  {notification.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {notification.message}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            {!notification.isRead && (
              <Button
                variant="link"
                onClick={() =>
                  handleMarkAsRead(notification.id)
                }
              >
                Mark as read
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}