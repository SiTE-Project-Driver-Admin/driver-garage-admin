import { useEffect, useMemo, useState } from "react"
import { Bell, CheckCircle, AlertTriangle } from "lucide-react"

import Table from "../components/table/table"
import Button from "../components/button/button"
import Card from "../components/card/card"

import { type Column } from "../components/table/table.types"

import { NotificationRepositoryImpl } from "../../infrastructure/repositories/NotificationRepositoryImpl"
import { type Notification } from "../../domain/entities/Notification"

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

  const stats = useMemo(() => {
    return {
      unread: notifications.filter(n => !n.isRead).length,
      read: notifications.filter(n => n.isRead).length,
      total: notifications.length,
    }
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
      setError(err.message ?? "Failed to mark notification as read")
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
      setError(err.message ?? "Failed to mark all as read")
    }
  }

  const statusColors: Record<string, string> = {
    READ: "bg-green-100 text-green-700",
    UNREAD: "bg-yellow-100 text-yellow-700",
  }

  const columns: Column<Notification>[] = [
    {
      key: "title",
      title: "Title",
    },

    {
      key: "message",
      title: "Message",
    },

    {
      key: "type",
      title: "Type",
      render: (value) => {
        if (typeof value !== "string") return null

        return (
          <div className="flex items-center gap-2">
            {value === "WARNING" && (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}

            {value === "SUCCESS" && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}

            {value === "INFO" && (
              <Bell className="w-4 h-4 text-blue-500" />
            )}

            <span>{value}</span>
          </div>
        )
      },
    },

    {
      key: "isRead",
      title: "Status",
      render: (value) => {
        const status = value ? "READ" : "UNREAD"

        return (
          <span
            className={`px-2 py-1 rounded ${statusColors[status]}`}
          >
            {status}
          </span>
        )
      },
    },

    {
      key: "createdAt",
      title: "Date",
      render: (value) =>
        new Date(value as string).toLocaleDateString(),
    },

    {
      key: "id",
      title: "Actions",
      render: (_value, row) => (
        <div className="flex gap-2">
          {!row.isRead && (
            <Button
              variant="link"
              onClick={() => handleMarkAsRead(row.id)}
            >
              Mark as read
            </Button>
          )}
        </div>
      ),
    },
  ]

  if (loading) return <p>Loading notifications...</p>

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          Notifications
        </h1>

        <p className="text-gray-500">
          System notifications and admin updates
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">

        <Card
          title="Unread Notifications"
          value={stats.unread}
          icon={<Bell className="w-6 h-6 text-yellow-500" />}
          color="text-yellow-600"
        />

        <Card
          title="Read Notifications"
          value={stats.read}
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          color="text-green-600"
        />

        <Card
          title="Total Notifications"
          value={stats.total}
          icon={<Bell className="w-6 h-6 text-blue-500" />}
          color="text-blue-600"
        />
      </div>

      <div className="flex justify-end">
        <Button
          variant="secondary"
          onClick={handleMarkAllAsRead}
        >
          Mark all as read
        </Button>
      </div>

      <Table columns={columns} data={notifications} />
    </div>
  )
}