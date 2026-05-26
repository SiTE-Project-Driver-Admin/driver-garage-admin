export type SystemAlertSeverity = "INFO" | "WARNING" | "ERROR" | "SUCCESS"

export interface SystemAlert {
  id: string
  title: string
  severity: SystemAlertSeverity
  actionLabel?: string
  actionUrl?: string
  createdAt?: string
}
