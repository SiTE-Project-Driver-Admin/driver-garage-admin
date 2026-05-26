import type { Admin, CreateAdminPayload } from "../../../domain/entities/Admin"
import type { AdminRepository } from "../../../domain/repositories/AdminRepository"

export class CreateAdminUseCase {
  constructor(private repository: AdminRepository) {}

  async execute(payload: CreateAdminPayload): Promise<Admin> {
    return this.repository.createAdmin(payload)
  }
}
