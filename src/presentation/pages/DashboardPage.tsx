import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { UserManagementRepositoryImpl } from "../../infrastructure/repositories/UserManagementRepositoryImpl"
import { type User } from "../../domain/entities/UserManagement"
import type { Activity } from "../../domain/entities/Activity"
import { ActivityRepositoryImpl } from "../../infrastructure/repositories/ActivityRepositoryImpl"
import type { SystemAlert } from "../../domain/entities/SystemAlert"
import { SystemAlertRepositoryImpl } from "../../infrastructure/repositories/SystemAlertRepositoryImpl"
import { NotificationRepositoryImpl } from "../../infrastructure/repositories/NotificationRepositoryImpl"
import Card from "../components/card/card"
import { Users, CheckCircle, AlertTriangle } from "lucide-react"
import type { Garage } from "../../domain/entities/GarageApproval"
import { GarageRepositoryImpl } from "../../infrastructure/repositories/GarageRepositoryImpl"

const ALERT_ROUTES: Record<string, string> = {
  "review now": "/garage-approvals",
  "view reports": "/community-moderation",
  "view inbox": "/notifications",
  "view details": "/notifications",
}

const resolveAlertRoute = (alert: SystemAlert): string | undefined => {
  const labelKey = alert.actionLabel?.trim().toLowerCase()
  if (labelKey && ALERT_ROUTES[labelKey]) return ALERT_ROUTES[labelKey]

  const titleKey = alert.title.toLowerCase()
  if (titleKey.includes("garage application")) return "/garage-approvals"
  if (titleKey.includes("reported post")) return "/community-moderation"
  if (titleKey.includes("notification")) return "/notifications"

  return undefined
}

const isNotificationsAlert = (alert: SystemAlert): boolean => {
  const labelKey = alert.actionLabel?.trim().toLowerCase()
  if (labelKey === "view inbox") return true
  return alert.title.toLowerCase().includes("notification")
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [activitiesError, setActivitiesError] = useState<string | null>(null)
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [alertsError, setAlertsError] = useState<string | null>(null)
  const [garages, setGarages] = useState<Garage[]>([])

  useEffect(() => {
    const userRepository = new UserManagementRepositoryImpl()
    const activityRepository = new ActivityRepositoryImpl()
    const systemAlertRepository = new SystemAlertRepositoryImpl()
    const notificationRepository = new NotificationRepositoryImpl()
    const garageRepository = new GarageRepositoryImpl()
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const data = await userRepository.findAll()
        setUsers(data)
      } catch (err: any) {
        setError(err.message ?? "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    const fetchActivities = async () => {
      setActivitiesLoading(true)
      setActivitiesError(null)
      try {
        const data = await activityRepository.listRecent(7)
        setActivities(data.slice(0, 7))
      } catch (err: any) {
        setActivitiesError(
          err?.response?.data?.message ??
          err?.message ??
          "Failed to load recent activities"
        )
      } finally {
        setActivitiesLoading(false)
      }
    }

    const fetchSystemAlerts = async () => {
      setAlertsLoading(true)
      setAlertsError(null)
      try {
        const data = await systemAlertRepository.listSystemAlerts(4)
        setSystemAlerts(data.slice(0, 4))
      } catch (err: any) {
        setAlertsError(
          err?.response?.data?.message ??
          err?.message ??
          "Failed to load system alerts"
        )
      } finally {
        setAlertsLoading(false)
      }
    }

    const fetchGarages = async () => {
      try {
        const data = await garageRepository.findAll()
        setGarages(data)
      } catch {
        setGarages([])
      }
    }

    const fetchUnreadNotifications = async () => {
      try {
        const notifications = await notificationRepository.listAll()
        const unread = notifications.filter((n) => !n.isRead).length
        setUnreadNotifications(unread)
      } catch {
        setUnreadNotifications(null)
      }
    }

    fetchUsers()
    fetchActivities()
    fetchSystemAlerts()
    fetchUnreadNotifications()
    fetchGarages()
  }, [])

  const displayedAlerts = useMemo<SystemAlert[]>(() => {
    if (unreadNotifications === null) return systemAlerts

    return systemAlerts.map((alert) => {
      if (!isNotificationsAlert(alert)) return alert

      const hasUnread = unreadNotifications > 0
      return {
        ...alert,
        title: hasUnread
          ? `${unreadNotifications} unread notification${unreadNotifications > 1 ? "s" : ""
          }`
          : "No unread notifications",
        severity: hasUnread ? "WARNING" : "SUCCESS",
        actionLabel: alert.actionLabel ?? "View Inbox",
      }
    })
  }, [systemAlerts, unreadNotifications])

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      activeGarages: garages.filter(
        (g) => g.status === "ACTIVE"
      ).length,
      pendingGarages: garages.filter(
        (g) => g.status === "PENDING"
      ).length,
    }
  }, [users])

  const formatTimeAgo = (date: string) => {
    const now = Date.now()
    const activityTime = new Date(date).getTime()

    if (Number.isNaN(activityTime)) return "Just now"

    const diffMinutes = Math.floor((now - activityTime) / (1000 * 60))

    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes} min ago`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  }

  if (loading) return <p>Loading dashboard...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-500">
          Monitor system activity and key metrics
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6" />}
        />

        <Card
          title="Active Garages"
          value={stats.activeGarages}
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          color="text-green-600"
        />

        <Card
          title="Pending Garages Approvals"
          value={stats.pendingGarages}
          icon={<AlertTriangle className="w-6 h-6 text-yellow-500" />}
          color="text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <section className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>

          {activitiesLoading ? (
            <div className="px-6 py-5 text-sm text-gray-500 border-t border-gray-100">
              Loading recent activities...
            </div>
          ) : activitiesError ? (
            <div className="px-6 py-5 text-sm text-red-500 border-t border-gray-100">
              {activitiesError}
            </div>
          ) : activities.length === 0 ? (
            <div className="px-6 py-5 text-sm text-gray-500 border-t border-gray-100">
              No recent activities available.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 border-t border-gray-100">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="px-6 py-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.detail}
                    </p>
                  </div>

                  <span className="text-sm text-gray-400 whitespace-nowrap pt-0.5">
                    {formatTimeAgo(activity.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Alerts
          </h2>

          {alertsLoading ? (
            <div className="text-sm text-gray-500">Loading system alerts...</div>
          ) : alertsError ? (
            <div className="text-sm text-red-500">{alertsError}</div>
          ) : displayedAlerts.length === 0 ? (
            <div className="text-sm text-gray-500">No system alerts.</div>
          ) : (
            <div className="space-y-3">
              {displayedAlerts.map((alert) => {
                const styles = getAlertStyles(alert.severity)
                const route = resolveAlertRoute(alert)

                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl p-4 ${styles.container}`}
                  >
                    <p className={`font-medium ${styles.title}`}>
                      {alert.title}
                    </p>

                    {alert.actionLabel && route && (
                      <Link
                        to={route}
                        className={`mt-3 inline-block text-sm font-medium ${styles.action}`}
                      >
                        {alert.actionLabel}
                      </Link>
                    )}

                    {alert.actionLabel && !route && alert.actionUrl && (
                      <a
                        href={alert.actionUrl}
                        className={`mt-3 inline-block text-sm font-medium ${styles.action}`}
                      >
                        {alert.actionLabel}
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function getAlertStyles(severity: SystemAlert["severity"]) {
  switch (severity) {
    case "ERROR":
      return {
        container: "bg-red-50 border border-red-100",
        title: "text-red-700",
        action: "text-red-700 hover:text-red-800",
      }
    case "SUCCESS":
      return {
        container: "bg-green-50 border border-green-100",
        title: "text-green-800",
        action: "text-green-700 hover:text-green-800",
      }
    case "INFO":
      return {
        container: "bg-blue-50 border border-blue-100",
        title: "text-blue-800",
        action: "text-blue-700 hover:text-blue-800",
      }
    case "WARNING":
    default:
      return {
        container: "bg-yellow-50 border border-yellow-100",
        title: "text-yellow-900",
        action: "text-yellow-800 hover:text-yellow-900",
      }
  }
}