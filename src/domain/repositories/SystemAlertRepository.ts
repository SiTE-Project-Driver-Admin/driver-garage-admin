import type { SystemAlert } from "../entities/SystemAlert"

export interface SystemAlertRepository {
  listSystemAlerts(limit?: number): Promise<SystemAlert[]>
}
