import { type Garage, type GarageStatus } from "../../domain/entities/GarageApproval"
import { type GarageRepository } from "../../domain/repositories/GarageRepository"
import { axiosClient } from "../api/axiosClient"

export class GarageRepositoryImpl implements GarageRepository {
  async findAll(): Promise<Garage[]> {
    const response = await axiosClient.get(`/admin/garages-approval`)
    return response.data
  }

  async findById(id: string): Promise<Garage | null> {
    const response = await axiosClient.get(`/admin/garages-approval/${id}`)
    return response.data ?? null
  }

  async approveGarage(id: string, status: GarageStatus): Promise<Garage> {
    const response = await axiosClient.post(`/admin/garages-approval/${id}/approve`, { status })
    return response.data
  }

  async rejectGarage(id: string, status: GarageStatus): Promise<Garage> {
    const response = await axiosClient.post(`/admin/garages-approval/${id}/reject`, { status })
    return response.data
  }

  async searchGarages(term: string): Promise<Garage[]> {
    const response = await axiosClient.get(`/admin/garages-approval/search`, {
      params: { q: term }
    })
    return response.data
  }

  async getBusinessDocument(id: string): Promise<string> {
    const response = await axiosClient.get(
      `/admin/garages-approval/${id}/business-document`,
      {
        responseType: "blob",
      }
    )

    return URL.createObjectURL(response.data)
  }
}