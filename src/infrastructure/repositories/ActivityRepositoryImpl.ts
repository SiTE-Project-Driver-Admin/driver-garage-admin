import type { Activity } from "../../domain/entities/Activity"
import type { ActivityRepository } from "../../domain/repositories/ActivityRepository"
import { axiosClient } from "../api/axiosClient"

type ApiActivity = {
  id?: string
  _id?: string
  title?: string
  action?: string
  type?: string
  detail?: string
  message?: string
  description?: string
  details?: string
  subtitle?: string
  meta?: {
    title?: string
    message?: string
    detail?: string
    description?: string
  }
  createdAt?: string
  timestamp?: string
  referenceId?: string
}

export class ActivityRepositoryImpl implements ActivityRepository {
  async listRecent(limit = 6): Promise<Activity[]> {
    const response = await axiosClient.get("/admin/activity/recent", {
      params: { limit },
    })

    const payload = response.data

    if (import.meta.env.DEV) {
      console.debug("[activity] raw response:", payload)
    }

    const items: ApiActivity[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.activities)
          ? payload.activities
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.result)
              ? payload.result
              : Array.isArray(payload?.results)
                ? payload.results
                : []

    return items.map((item, index) => ({
      id: item.id ?? item._id ?? `activity-${index}`,
      title:
        item.title ??
        item.action ??
        item.type ??
        item.meta?.title ??
        "Activity update",
      detail:
        item.detail ??
        item.message ??
        item.description ??
        item.details ??
        item.subtitle ??
        item.meta?.detail ??
        item.meta?.message ??
        item.meta?.description ??
        "No additional details",
      createdAt: item.createdAt ?? item.timestamp ?? new Date().toISOString(),
    }))
  }
}
