import type { CommunityReportRepository } from "../../../domain/repositories/CommunityReportRepository";

export class DismissCommunityReportUseCase {
  constructor(private repository: CommunityReportRepository) {}

  async execute(id: string) {
    return this.repository.dismissReport(id)
  }
}