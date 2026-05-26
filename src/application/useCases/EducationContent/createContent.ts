import type {
  EducationContent,
  EducationContentPayload,
} from "../../../domain/entities/EducationContent"
import type { EducationContentRepository } from "../../../domain/repositories/EducationContentRepository"

export class CreateContentUseCase {
  constructor(private repository: EducationContentRepository) {}

  async execute(payload: EducationContentPayload): Promise<EducationContent> {
    return this.repository.addContent(payload)
  }
}
