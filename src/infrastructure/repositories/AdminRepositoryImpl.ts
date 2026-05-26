import type { Admin, CreateAdminPayload } from "../../domain/entities/Admin"
import type { AdminRepository } from "../../domain/repositories/AdminRepository"
import { axiosClient } from "../api/axiosClient"

export class AdminRepositoryImpl implements AdminRepository {
  async listAdmins(): Promise<Admin[]> {
    const response = await axiosClient.get(`/admin/auth/admins`)
    return response.data
  }

  async createAdmin(payload: CreateAdminPayload): Promise<Admin> {
    const response = await axiosClient.post(`/admin/auth/admins`, payload)
    return response.data.admin ?? response.data
  }
}
