import type { CommunityReport } from "../../domain/entities/CommunityReport"
import type { CommunityReportRepository } from "../../domain/repositories/CommunityReportRepository"
import { axiosClient } from "../api/axiosClient"

export class CommunityReportRepositoryImpl implements CommunityReportRepository {

  async listAll(status?: string): Promise<CommunityReport[]> {
    const response = await axiosClient.get("/admin/community/reports", {
      params: status ? { status } : undefined,
    })
    return response.data
  }

  async getById(id: string): Promise<CommunityReport | null> {
    const response = await axiosClient.get(`/admin/community/reports/${id}`)
    return response.data ?? null
  }

  async dismissReport(id: string): Promise<CommunityReport> {
    const response = await axiosClient.patch(
      `/admin/community/reports/${id}/dismiss`
    )

    return response.data
  }

  async takeDownPost(id: string): Promise<CommunityReport> {
    const response = await axiosClient.patch(
      `/admin/community/reports/${id}/take-down-post`
    )

    return response.data
  }
}