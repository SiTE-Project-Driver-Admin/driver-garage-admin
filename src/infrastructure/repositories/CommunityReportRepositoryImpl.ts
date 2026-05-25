import type { CommunityReport } from "../../domain/entities/CommunityReport"
import type { ICommunityReportRepository } from "../../domain/repositories/CommunityReportRepository"
import { axiosClient } from "../api/axiosClient"

export class CommunityReportRepositoryImpl implements ICommunityReportRepository {

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

  async updateStatus(id: string, status: string): Promise<CommunityReport> {
    const response = await axiosClient.patch(
      `/admin/community/reports/${id}/status`,
      { status }
    )
    return response.data
  }
}