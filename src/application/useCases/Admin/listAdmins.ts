import type { Admin } from "../../../domain/entities/Admin"
import type { AdminRepository } from "../../../domain/repositories/AdminRepository"

export class ListAdminsUseCase {
  constructor(private repository: AdminRepository) {}

  async execute(): Promise<Admin[]> {
    return this.repository.listAdmins()
  }
}
