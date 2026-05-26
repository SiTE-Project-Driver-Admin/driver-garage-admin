import type { CommunityReportRepository } from "../../../domain/repositories/CommunityReportRepository";

export class TakeDownPostUseCase {
  constructor(private repository: CommunityReportRepository) {}

  async execute(id: string) {
    return this.repository.takeDownPost(id)
  }
}