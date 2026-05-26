import type { Activity } from "../entities/Activity"

export interface ActivityRepository {
  listRecent(limit?: number): Promise<Activity[]>
}
