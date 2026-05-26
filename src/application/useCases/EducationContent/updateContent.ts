import type {
  EducationContent,
  EducationContentPayload,
} from "../../../domain/entities/EducationContent"
import type { EducationContentRepository } from "../../../domain/repositories/EducationContentRepository"

export class UpdateContentUseCase {
  constructor(private repository: EducationContentRepository) {}

  async execute(
    id: string,
    payload: Partial<EducationContentPayload>
  ): Promise<EducationContent> {
    return this.repository.updateContent(id, payload)
  }
}
