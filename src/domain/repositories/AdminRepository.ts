import type { Admin, CreateAdminPayload } from "../entities/Admin"

export interface AdminRepository {
  listAdmins(): Promise<Admin[]>
  createAdmin(payload: CreateAdminPayload): Promise<Admin>
}
