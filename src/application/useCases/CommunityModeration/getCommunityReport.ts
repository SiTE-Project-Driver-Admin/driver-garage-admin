import type { CommunityReportRepository } from "../../../domain/repositories/CommunityReportRepository";
export class GetCommunityReportUseCase {
  constructor(private repository: CommunityReportRepository) {}

  async execute(id: string) {
    return this.repository.getById(id)
  }
}