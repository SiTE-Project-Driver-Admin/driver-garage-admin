import type {
  SystemAlert,
  SystemAlertSeverity,
} from "../../domain/entities/SystemAlert"
import type { SystemAlertRepository } from "../../domain/repositories/SystemAlertRepository"
import { axiosClient } from "../api/axiosClient"

type ApiSystemAlert = {
  id?: string
  _id?: string
  title?: string
  message?: string
  description?: string
  severity?: string
  type?: string
  level?: string
  actionLabel?: string
  action?: string
  cta?: string
  actionUrl?: string
  url?: string
  link?: string
  href?: string
  createdAt?: string
  timestamp?: string
}

const SEVERITY_MAP: Record<string, SystemAlertSeverity> = {
  INFO: "INFO",
  WARN: "WARNING",
  WARNING: "WARNING",
  ERROR: "ERROR",
  CRITICAL: "ERROR",
  DANGER: "ERROR",
  SUCCESS: "SUCCESS",
}

const normalizeSeverity = (value?: string): SystemAlertSeverity => {
  if (!value) return "INFO"
  return SEVERITY_MAP[value.toUpperCase()] ?? "INFO"
}

export class SystemAlertRepositoryImpl implements SystemAlertRepository {
  async listSystemAlerts(limit = 4): Promise<SystemAlert[]> {
    const response = await axiosClient.get("/admin/alerts/system", {
      params: { limit },
    })

    const payload = response.data

    if (import.meta.env.DEV) {
      console.debug("[system-alerts] raw response:", payload)
    }

    const items: ApiSystemAlert[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.alerts)
          ? payload.alerts
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.result)
              ? payload.result
              : Array.isArray(payload?.results)
                ? payload.results
                : []

    return items.map((item, index) => ({
      id: item.id ?? item._id ?? `alert-${index}`,
      title: item.title ?? item.message ?? item.description ?? "System alert",
      severity: normalizeSeverity(item.severity ?? item.type ?? item.level),
      actionLabel: item.actionLabel ?? item.action ?? item.cta,
      actionUrl: item.actionUrl ?? item.url ?? item.link ?? item.href,
      createdAt: item.createdAt ?? item.timestamp,
    }))
  }
}
