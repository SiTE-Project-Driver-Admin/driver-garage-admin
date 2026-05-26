import type { CommunityReport } from "../entities/CommunityReport"

export interface ICommunityReportRepository {
  listAll(status?: string): Promise<CommunityReport[]>
  getById(id: string): Promise<CommunityReport | null>
  dismissReport(id: string): Promise<CommunityReport>
  takeDownPost(id: string): Promise<CommunityReport>
}